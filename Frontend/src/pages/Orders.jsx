import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icons.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api.js";
import { PAYMENT_LABELS, money } from "../lib.js";

const STATUS_STEPS = ["Pending", "Preparing", "Out for delivery", "Delivered"];

function Tracker({ idx }) {
  return (
    <ol className="mt-5 grid grid-cols-4 gap-1" aria-label="Order progress">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} className="relative flex flex-col items-center text-center">
            {i > 0 && <span className={`absolute right-1/2 top-4 -z-0 h-0.5 w-full ${i <= idx ? "bg-green" : "bg-rule"}`} />}
            <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${done ? "bg-green text-white" : "bg-chip text-muted"} ${i === idx && idx < 3 ? "ring-4 ring-green/25" : ""}`}>
              {done ? <Icon name="check" className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`mt-2 text-[11px] font-semibold sm:text-xs ${done ? "text-ink" : "text-muted"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function Orders() {
  const { user, ready, logout } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const placed = useLocation().state?.placed;

  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let timer;

    async function load(silent) {
      if (!silent) setStatus("loading");
      try {
        const data = await api.get("/api/orders");
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setOrders(list);
        setStatus("ready");
        // While any order is still on its way, check again every few seconds
        if (list.some((o) => o.statusIndex < STATUS_STEPS.length - 1)) {
          timer = setTimeout(() => load(true), 4000);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          await logout();
          navigate("/login", { state: { pending: "/orders" }, replace: true });
          return;
        }
        if (!silent) setStatus("error");
        else timer = setTimeout(() => load(true), 8000); // keep showing the last list, try again later
      }
    }

    load(false);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, attempt]);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" state={{ pending: "/orders" }} replace />;

  function reorder(o) {
    cart.setAll(
      { id: o.restaurant, name: o.restaurantName, city: o.city },
      o.items.map((i) => ({ id: i.menuItem, name: i.name, price: i.price, isVeg: i.isVeg, qty: i.qty }))
    );
    cart.openDrawer();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
      <h1 className="pt-8 font-display text-3xl font-extrabold">
        My orders {status === "ready" && orders.length > 0 && <span className="text-base font-semibold text-muted">({orders.length})</span>}
      </h1>

      {placed && (
        <div role="status" className="anim-fade-up mt-5 flex items-center gap-3 rounded-2xl bg-green/10 p-4 text-green ring-1 ring-green/30">
          <Icon name="check" className="h-6 w-6" />
          <div>
            <div className="font-bold">Order placed!</div>
            <div className="text-sm">The restaurant is on it. Track it below.</div>
          </div>
        </div>
      )}

      {status === "loading" && <Loader label="Loading your orders…" className="py-24" />}

      {status === "error" && (
        <div role="alert" className="mt-8 rounded-card bg-white p-10 text-center ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Couldn't load your orders</h2>
          <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
          <button onClick={() => setAttempt((a) => a + 1)} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Try again
          </button>
        </div>
      )}

      {status === "ready" && orders.length === 0 && (
        <div className="mt-8 rounded-card bg-white p-12 text-center ring-1 ring-black/5">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><Icon name="receipt" className="h-7 w-7" /></div>
          <h2 className="mt-4 font-display text-xl font-bold">No orders yet</h2>
          <p className="mt-1 text-sm text-muted">When you order, it shows up here with live tracking.</p>
          <button onClick={() => navigate("/restaurants")} className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30">Find something to eat</button>
        </div>
      )}

      {status === "ready" && orders.length > 0 && (
        <ul className="mt-6 space-y-5">
          {orders.map((o) => {
            const delivered = o.statusIndex === STATUS_STEPS.length - 1;
            return (
              <li key={o._id} className={`rounded-card bg-white p-5 shadow-sm ring-1 sm:p-6 ${o._id === placed ? "ring-2 ring-green" : "ring-black/5"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={`/restaurant/${o.restaurant}`} className="font-display text-lg font-extrabold hover:text-primary">{o.restaurantName}</Link>
                    <div className="text-xs text-muted">
                      #{o._id.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${delivered ? "bg-green/10 text-green" : "bg-primary-soft text-primary-dark"}`}>{o.status}</span>
                </div>

                <Tracker idx={o.statusIndex} />

                <ul className="mt-5 space-y-1 border-t border-rule pt-4 text-sm">
                  {o.items.map((i) => (
                    <li key={i.menuItem} className="flex justify-between">
                      <span>{i.qty} × {i.name}</span>
                      <span className="text-muted">{money(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-3 space-y-1 border-t border-rule pt-3 text-xs text-muted">
                  <div className="flex justify-between"><dt>Item total</dt><dd>{money(o.bill.subtotal)}</dd></div>
                  {o.bill.discount > 0 && (
                    <div className="flex justify-between text-green"><dt>Discount{o.promoCode ? ` (${o.promoCode})` : ""}</dt><dd>− {money(o.bill.discount)}</dd></div>
                  )}
                  <div className="flex justify-between"><dt>Delivery</dt><dd>{o.bill.delivery === 0 ? "FREE" : money(o.bill.delivery)}</dd></div>
                  <div className="flex justify-between"><dt>GST (5%)</dt><dd>{money(o.bill.taxes)}</dd></div>
                </dl>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-rule pt-4">
                  <div className="text-xs text-muted">
                    <div>{o.address}</div>
                    <div>{PAYMENT_LABELS[o.payment] || "Cash on delivery"} · {o.phone}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold">{money(o.bill.total)}</span>
                    <button onClick={() => reorder(o)} className="rounded-full border border-primary/40 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary-soft">Reorder</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}