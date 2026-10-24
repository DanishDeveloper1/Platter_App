import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Icon, VegMark } from "../components/Icons.jsx";
import { Stepper } from "../components/CartDrawer.jsx";
import PaymentMethods, { validatePayment } from "../components/PaymentMethods.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLocationCtx } from "../context/LocationContext.jsx";
import { api } from "../api.js";
import { PROMOS, money, priceBill } from "../lib.js";

const ADDRESS_KEY = "platter_address";
const EMPTY_PAY = { upiId: "", cardNumber: "", cardName: "", expiry: "", cvv: "", bank: "" };

function readAddress() {
  try { return localStorage.getItem(ADDRESS_KEY) || ""; } catch { return ""; }
}

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useCart();
  const { user, ready, logout } = useAuth();
  const { city, setCity } = useLocationCtx();
  const r = cart.restaurant;

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(readAddress);
  const [payment, setPayment] = useState("cod");
  const [payDetails, setPayDetails] = useState(EMPTY_PAY);
  const [payErrors, setPayErrors] = useState({});
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [ordersCount, setOrdersCount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (user?.phone) setPhone((p) => p || user.phone);
  }, [user]);

  // How many orders this user has placed (the PLATTER50 offer is for the first 3).
  // This only drives the bill preview below. The server makes the final decision.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get("/api/orders")
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setOrdersCount(list.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" state={{ pending: "/checkout" }} replace />;
  if (!r || cart.count === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Go add something tasty first.</p>
        <Link to="/restaurants" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30">Browse restaurants</Link>
      </div>
    );
  }

  const bill = priceBill(cart.total, promo, ordersCount);
  const wrongCity = r.city !== city;

  function applyPromo(code) {
    const check = priceBill(cart.total, code, ordersCount);
    if (!code.trim()) return;
    if (check.promoError) {
      setPromo("");
      setPromoMsg(check.promoError);
    } else {
      setPromo(code.trim().toUpperCase());
      setPromoMsg("");
      setPromoInput("");
    }
  }

  function changeMethod(method) {
    setPayment(method);
    setPayErrors({});
  }

  function changePayField(field, value) {
    setPayDetails((d) => ({ ...d, [field]: value }));
    setPayErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function placeOrder() {
    const next = {
      phone: !/^\d{10}$/.test(phone) && "Enter a 10-digit phone number",
      address: address.trim().length < 6 && "Enter your full delivery address",
    };
    const payErr = validatePayment(payment, payDetails);
    setErrors(next);
    setPayErrors(payErr);
    if (Object.values(next).some(Boolean) || Object.keys(payErr).length > 0 || wrongCity || placing) return;

    setPlacing(true);
    setSubmitError("");
    try {
      // Only ids, quantities and the payment METHOD go to the server.
      // Card, UPI and bank details never leave the browser.
      const order = await api.post("/api/orders", {
        restaurantId: r.id,
        items: cart.lines.map((l) => ({ menuItemId: l.id, qty: l.qty })),
        address: address.trim(),
        phone,
        payment,
        promoCode: promo,
      });
      try { localStorage.setItem(ADDRESS_KEY, address.trim()); } catch { /* ignore */ }
      setPayDetails(EMPTY_PAY);
      cart.clear();
      navigate("/orders", { state: { placed: order._id } });
    } catch (err) {
      if (err.status === 401) {
        // Session expired: clear it and ask the person to log in again
        await logout();
        navigate("/login", { state: { pending: "/checkout" }, replace: true });
        return;
      }
      setSubmitError(err.message);
      setPlacing(false);
    }
  }

  const inputCls = (bad) =>
    `w-full rounded-xl bg-chip px-4 py-3 text-sm ring-1 transition focus:bg-white focus:ring-2 focus:ring-primary/50 ${bad ? "ring-primary-dark" : "ring-transparent"}`;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <Link to={`/restaurant/${r.id}`} className="inline-block pt-6 text-sm font-bold text-primary">← Back to {r.name}</Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Checkout</h1>

      {wrongCity && (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary-soft p-4 text-sm ring-1 ring-primary/20">
          <span>Your cart is from <b>{r.name}</b> in {r.city}, but you're browsing {city}.</span>
          <button onClick={() => setCity(r.city)} className="rounded-full bg-primary px-4 py-2 font-bold text-white">Deliver in {r.city}</button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-card bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold"><Icon name="pin" className="h-5 w-5 text-primary" /> Delivery details</h2>
            <p className="mb-5 mt-1 text-sm text-muted">Delivering to {r.city} for {user.name}.</p>

            <label htmlFor="address" className="mb-1.5 block text-xs font-bold text-muted">Address</label>
            <textarea id="address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / flat no., street, landmark" aria-invalid={Boolean(errors.address)} className={inputCls(errors.address)} />
            {errors.address && <div className="mt-1 text-xs text-primary-dark">{errors.address}</div>}

            <label htmlFor="phone" className="mb-1.5 mt-4 block text-xs font-bold text-muted">Phone</label>
            <input id="phone" type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" aria-invalid={Boolean(errors.phone)} className={inputCls(errors.phone)} />
            {errors.phone && <div className="mt-1 text-xs text-primary-dark">{errors.phone}</div>}
          </section>

          <PaymentMethods
            method={payment}
            onMethod={changeMethod}
            details={payDetails}
            onField={changePayField}
            errors={payErrors}
          />
        </div>

        <aside className="h-fit min-w-0 rounded-card bg-white p-6 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-extrabold">{r.name}</h2>
          <ul className="mt-4 divide-y divide-rule">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <VegMark veg={l.isVeg} />
                <span className="min-w-[8rem] flex-1 text-sm font-medium">{l.name}</span>
                <Stepper qty={l.qty} label={l.name} onDec={() => cart.decItem(l.id)} onInc={() => cart.incItem(l.id)} />
                <span className="w-14 text-right text-sm font-bold">{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            {promo ? (
              <div className="flex items-center justify-between rounded-xl bg-green/10 px-3 py-2 text-sm font-bold text-green">
                <span className="flex items-center gap-2"><Icon name="tag" className="h-4 w-4" /> {promo} applied</span>
                <button onClick={() => setPromo("")} className="text-xs underline">Remove</button>
              </div>
            ) : (
              <>
                <form onSubmit={(e) => { e.preventDefault(); applyPromo(promoInput); }} className="flex gap-2">
                  <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} aria-label="Promo code" placeholder="Promo code" className="min-w-0 flex-1 rounded-xl bg-chip px-3 py-2.5 text-sm uppercase placeholder:normal-case" />
                  <button type="submit" className="rounded-xl bg-ink px-4 text-sm font-bold text-white">Apply</button>
                </form>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.keys(PROMOS).map((c) => (
                    <button key={c} onClick={() => applyPromo(c)} title={PROMOS[c].label} className="rounded-full border border-dashed border-primary/50 px-3 py-1 text-xs font-bold text-primary hover:bg-primary-soft">{c}</button>
                  ))}
                </div>
              </>
            )}
            {promoMsg && <div role="alert" className="mt-2 text-xs text-primary-dark">{promoMsg}</div>}
          </div>

          <dl className="mt-5 space-y-2 border-t border-rule pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Item total</dt><dd>{money(bill.subtotal)}</dd></div>
            {bill.discount > 0 && <div className="flex justify-between text-green"><dt>Discount</dt><dd>− {money(bill.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{bill.delivery === 0 ? <span className="font-semibold text-green">FREE</span> : money(bill.delivery)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">GST (5%)</dt><dd>{money(bill.taxes)}</dd></div>
            <div className="flex justify-between border-t border-rule pt-3 text-base font-extrabold"><dt>To pay</dt><dd>{money(bill.total)}</dd></div>
          </dl>

          {submitError && (
            <div role="alert" className="mt-4 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">{submitError}</div>
          )}

          <button
            onClick={placeOrder}
            disabled={wrongCity || placing}
            className="mt-5 w-full rounded-full bg-primary py-3.5 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-50"
          >
            {placing ? "Placing your order…" : `Place order · ${money(bill.total)}`}
          </button>
        </aside>
      </div>
    </div>
  );
}