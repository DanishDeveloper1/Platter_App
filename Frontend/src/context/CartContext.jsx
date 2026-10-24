import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "platter_cart_v2";
const EMPTY = { restaurant: null, lines: {} };
const CartContext = createContext(null);

// cart = { restaurant: { id, name, city } | null, lines: { [dishId]: { id, name, price, isVeg, image, qty } } }
// Prices here are only for display. The server always recalculates from the database.
function load() {
  try {
    localStorage.removeItem("platter_cart"); // old format, no longer used
    const c = JSON.parse(localStorage.getItem(KEY));
    if (!c || !c.restaurant?.id || typeof c.lines !== "object" || c.lines === null) return EMPTY;
    const lines = {};
    for (const [id, l] of Object.entries(c.lines)) {
      if (l && l.id === id && typeof l.name === "string" && Number.isFinite(l.price) && Number.isInteger(l.qty) && l.qty > 0) {
        lines[id] = l;
      }
    }
    return Object.keys(lines).length ? { restaurant: c.restaurant, lines } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(load);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conflict, setConflict] = useState(null); // { restaurant, item } waiting for confirmation

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  // item = { id, name, price, isVeg, image }
  function addItem(restaurant, item) {
    if (!item?.id || !restaurant?.id) return;
    if (cart.restaurant && cart.restaurant.id !== restaurant.id && Object.keys(cart.lines).length > 0) {
      setConflict({ restaurant, item }); // ask before throwing away the current cart
      return;
    }
    setCart((c) => {
      const line = c.lines[item.id];
      return {
        restaurant,
        lines: { ...c.lines, [item.id]: line ? { ...line, qty: line.qty + 1 } : { ...item, qty: 1 } },
      };
    });
  }

  function incItem(id) {
    setCart((c) => {
      const line = c.lines[id];
      if (!line) return c;
      return { ...c, lines: { ...c.lines, [id]: { ...line, qty: line.qty + 1 } } };
    });
  }

  function decItem(id) {
    setCart((c) => {
      const line = c.lines[id];
      if (!line) return c;
      const lines = { ...c.lines };
      if (line.qty <= 1) delete lines[id];
      else lines[id] = { ...line, qty: line.qty - 1 };
      return Object.keys(lines).length ? { ...c, lines } : EMPTY;
    });
  }

  function confirmSwitch() {
    if (conflict) {
      setCart({ restaurant: conflict.restaurant, lines: { [conflict.item.id]: { ...conflict.item, qty: 1 } } });
    }
    setConflict(null);
  }

  // Used by "Reorder": restaurant = { id, name, city }, list = [{ id, name, price, isVeg, image, qty }]
  function setAll(restaurant, list) {
    const lines = {};
    list.forEach((l) => { lines[l.id] = { ...l }; });
    setCart(Object.keys(lines).length ? { restaurant, lines } : EMPTY);
  }

  function clear() {
    setCart(EMPTY);
  }

  const lineList = useMemo(() => Object.values(cart.lines), [cart.lines]);
  const count = useMemo(() => lineList.reduce((s, l) => s + l.qty, 0), [lineList]);
  const total = useMemo(() => lineList.reduce((s, l) => s + l.price * l.qty, 0), [lineList]);
  const qtyOf = (id) => cart.lines[id]?.qty || 0;

  return (
    <CartContext.Provider
      value={{
        restaurant: cart.restaurant, lines: lineList, count, total, qtyOf,
        addItem, incItem, decItem, clear, setAll,
        drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
        conflict, confirmSwitch, cancelSwitch: () => setConflict(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}