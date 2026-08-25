import { createContext, useContext, useEffect, useMemo, useState } from "react";
const Ctx = createContext(null);
const KEY = "atelier-basket";
export function BasketProvider({
  children
}) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);
  const value = useMemo(() => ({
    items,
    add: item => setItems(prev => {
      const found = prev.find(i => i.id === item.id);
      if (found) return prev.map(i => i.id === item.id ? {
        ...i,
        qty: i.qty + 1
      } : i);
      return [...prev, {
        ...item,
        qty: 1
      }];
    }),
    remove: id => setItems(prev => prev.filter(i => i.id !== id)),
    setQty: (id, qty) => setItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? {
      ...i,
      qty
    } : i)),
    clear: () => setItems([]),
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.qty * i.price, 0)
  }), [items]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useBasket() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBasket must be used inside BasketProvider");
  return ctx;
}
