// Client-side basket: a small localStorage-backed cart used by the
// collection grid, the customiser and the checkout page.

const KEY = "atelier-basket";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function getItems() {
  return load();
}

export function addItem(item) {
  const items = load();
  const found = items.find((i) => i.id === item.id);
  const next = found
    ? items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
    : [...items, { ...item, qty: 1 }];
  save(next);
  return next;
}

export function removeItem(id) {
  const next = load().filter((i) => i.id !== id);
  save(next);
  return next;
}

export function setQty(id, qty) {
  const items = load();
  const next = qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, qty } : i));
  save(next);
  return next;
}

export function clearBasket() {
  save([]);
  return [];
}

export function basketCount(items = load()) {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function basketTotal(items = load()) {
  return items.reduce((n, i) => n + i.qty * i.price, 0);
}
