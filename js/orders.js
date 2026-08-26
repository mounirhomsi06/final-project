// Client-side order history: a localStorage-backed record of what was
// bought, created at checkout. There's no backend or courier here, so the
// "Preparing -> Shipped -> Delivered" status is simulated from how long
// ago the order was placed, rather than tracking a real shipment.

const KEY = "atelier-orders";

const STAGE_DURATIONS_MS = {
  preparing: 10 * 1000, // first 10s: at the bench
  shipped: 20 * 1000, // next 10s: on its way
  // after that: delivered
};

export const STAGES = [
  { id: "preparing", label: "Preparing", detail: "Your watch is being finished and cased at the bench." },
  { id: "shipped", label: "Shipped", detail: "Your watch has left the atelier and is on its way." },
  { id: "delivered", label: "Delivered", detail: "Delivered. Enjoy your Atelier Horo." },
];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(orders) {
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch {
    /* ignore */
  }
}

function generateOrderId() {
  return `AH-${Date.now().toString(36).toUpperCase()}`;
}

export function createOrder({ items, customer, subtotal, tax, total }) {
  const order = { id: generateOrderId(), createdAt: Date.now(), items, customer, subtotal, tax, total };
  const orders = load();
  orders.push(order);
  save(orders);
  return order;
}

export function getOrder(id) {
  const normalized = id.trim().toUpperCase();
  return load().find((o) => o.id === normalized) ?? null;
}

export function getOrders() {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

// Returns the index into STAGES for how far along this order is.
export function orderStageIndex(order) {
  const elapsed = Date.now() - order.createdAt;
  if (elapsed < STAGE_DURATIONS_MS.preparing) return 0;
  if (elapsed < STAGE_DURATIONS_MS.shipped) return 1;
  return 2;
}
