/* Order lifecycle access layer — shipping, delivery, returns.
 *
 * Complements createOrder() in index.js (which only inserts the row at
 * checkout time): everything past that point — marking a real shipment,
 * a real delivery, or a customer's return request — lives here, called by
 * the admin API (Megalomarket drives it after a genuine Sendcloud shipment
 * or a genuine carrier webhook) and by the public return-request route.
 *
 * `status` only ever advances on a REAL event. Nothing in this file derives
 * a status from elapsed time — that was the old /api/track behaviour, and
 * it's exactly what these columns replace.
 */

const { client } = require('./db');

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}
function notFound(message) {
  return Object.assign(new Error(message), { status: 404 });
}

function rowToOrder(row, items) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    zip: row.zip,
    city: row.city,
    total: Number(row.total),
    pointsEarned: Number(row.points_earned),
    createdAt: row.created_at,
    status: row.status,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    trackingUrl: row.tracking_url,
    labelUrl: row.label_url,
    shippedAt: row.shipped_at,
    deliveredAt: row.delivered_at,
    returnStatus: row.return_status,
    returnReason: row.return_reason,
    returnRequestedAt: row.return_requested_at,
    returnLabelUrl: row.return_label_url,
    returnHandledAt: row.return_handled_at,
    items: (items || []).map(item => ({
      productId: item.product_id,
      name: item.name || item.product_id,
      color: item.color,
      qty: Number(item.qty),
      price: Number(item.price)
    }))
  };
}

async function itemsFor(orderId) {
  const res = await client.execute({
    sql: 'SELECT product_id, color, qty, price, name FROM order_items WHERE order_id = ?',
    args: [orderId]
  });
  return res.rows;
}

/* `since` filters on created_at (ISO string, same format as the column) so
   Megalomarket's poller can ask for only what changed since its last cycle,
   the same pattern orderSync.js already uses for the marketplace connectors. */
async function listOrders({ since, status } = {}) {
  const clauses = [];
  const args = [];
  if (since) { clauses.push('created_at >= ?'); args.push(since); }
  if (status) { clauses.push('status = ?'); args.push(status); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const res = await client.execute({
    sql: `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 200`,
    args
  });
  const orders = [];
  for (const row of res.rows) {
    orders.push(rowToOrder(row, await itemsFor(row.id)));
  }
  return orders;
}

async function getOrderRow(id) {
  const res = await client.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] });
  return res.rows[0] || null;
}

async function getOrder(id) {
  const row = await getOrderRow(id);
  if (!row) return null;
  return rowToOrder(row, await itemsFor(id));
}

/* Marks a real shipment: carrier + tracking are required, because a
   "shipped" status with nothing to show the customer would be worse than no
   status at all — the whole point of this table is to replace a fake
   progression with real facts. Re-shipping (correcting a tracking number
   typo) is allowed; shipping something already delivered, or with a return
   in progress, is refused — those states shouldn't move backwards. */
async function markShipped(id, { carrier, trackingNumber, trackingUrl, labelUrl }) {
  const row = await getOrderRow(id);
  if (!row) throw notFound(`Order "${id}" not found.`);
  if (row.status === 'delivered') {
    throw badRequest(`Order "${id}" is already marked delivered — cannot mark it shipped again.`);
  }
  if (!carrier || !trackingNumber || !trackingUrl) {
    throw badRequest('carrier, trackingNumber and trackingUrl are all required to mark an order shipped.');
  }
  const now = new Date().toISOString();
  await client.execute({
    sql: `UPDATE orders SET status = 'shipped', carrier = ?, tracking_number = ?, tracking_url = ?, label_url = ?,
          shipped_at = COALESCE(shipped_at, ?) WHERE id = ?`,
    args: [carrier, trackingNumber, trackingUrl, labelUrl || null, now, id]
  });
  return getOrder(id);
}

/* Idempotent on purpose: a carrier webhook can fire more than once for the
   same delivery. `alreadyDelivered` lets the caller skip re-sending the
   thank-you email without treating the repeat as an error. */
async function markDelivered(id) {
  const row = await getOrderRow(id);
  if (!row) throw notFound(`Order "${id}" not found.`);
  if (row.status === 'delivered') {
    return { order: await getOrder(id), alreadyDelivered: true };
  }
  if (row.status !== 'shipped') {
    throw badRequest(`Order "${id}" cannot be marked delivered before it has been marked shipped (current status: "${row.status}").`);
  }
  const now = new Date().toISOString();
  await client.execute({ sql: "UPDATE orders SET status = 'delivered', delivered_at = ? WHERE id = ?", args: [now, id] });
  return { order: await getOrder(id), alreadyDelivered: false };
}

/* Public entry point (see /api/returns in index.js): a customer requesting a
   return on their own delivered order. email is compared the same way
   /api/track already does — case-insensitive, trimmed — so this reuses the
   exact same trust boundary rather than inventing a second one. */
async function requestReturn(id, email, reason) {
  const row = await getOrderRow(id);
  if (!row) throw notFound('No order matches this number and email.');
  if (String(row.email || '').trim().toLowerCase() !== String(email || '').trim().toLowerCase()) {
    throw notFound('No order matches this number and email.');
  }
  if (row.status !== 'delivered') {
    throw badRequest('A return can only be requested once the order has been delivered.');
  }
  if (row.return_status) {
    throw badRequest(`A return was already requested for this order (status: "${row.return_status}").`);
  }
  const now = new Date().toISOString();
  await client.execute({
    sql: "UPDATE orders SET return_status = 'requested', return_reason = ?, return_requested_at = ? WHERE id = ?",
    args: [reason || null, now, id]
  });
  return getOrder(id);
}

/* Called by Megalomarket once it has drafted the return instructions and
   (when possible) generated a real return label via Sendcloud — moves the
   return out of the "needs attention" queue so the scheduler's poll doesn't
   pick it up again. */
async function markReturnHandled(id, { returnStatus = 'label_sent', returnLabelUrl } = {}) {
  const row = await getOrderRow(id);
  if (!row) throw notFound(`Order "${id}" not found.`);
  if (!row.return_status) {
    throw badRequest(`Order "${id}" has no return in progress.`);
  }
  const now = new Date().toISOString();
  await client.execute({
    sql: 'UPDATE orders SET return_status = ?, return_label_url = COALESCE(?, return_label_url), return_handled_at = ? WHERE id = ?',
    args: [returnStatus, returnLabelUrl || null, now, id]
  });
  return getOrder(id);
}

module.exports = { listOrders, getOrder, markShipped, markDelivered, requestReturn, markReturnHandled };
