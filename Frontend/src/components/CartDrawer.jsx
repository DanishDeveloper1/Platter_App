import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon, VegMark } from "./Icons.jsx";
import { useCart } from "../context/CartContext.jsx";
import { FREE_DELIVERY_ABOVE, money } from "../lib.js";
import { useModal } from "../useModal.js";

export function Stepper({ qty, onDec, onInc, label }) {
  return (
    <div className="inline-flex items-center rounded-xl bg-primary-soft text-primary-dark">
      <button onClick={onDec} aria-label={`Remove one ${label}`} className="grid h-8 w-8 place-items-center rounded-l-xl hover:bg-primary/15">
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span className="min-w-6 text-center text-sm font-extrabold" aria-live="polite">{qty}</span>
      <button onClick={onInc} aria-label={`Add one more ${label}`} className="grid h-8 w-8 place-items-center rounded-r-xl hover:bg-primary/15">
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CartDrawer() {
  const cart = useCart();
  const navigate = useNavigate();
  const r = cart.restaurant;

  const dialogRef = useModal(cart.drawerOpen, cart.closeDrawer);

  if (!cart.drawerOpen) return null;

  const toFree = Math.max(0, FREE_DELIVERY_ABOVE - cart.total);

  return (
    <div className="anim-fade-in fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && cart.closeDrawer()}>
      <aside ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Your cart" className="anim-slide-in outline-none absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-extrabold">Your cart</h2>
            {r && <p className="text-sm text-muted">from {r.name}</p>}
          </div>
          <button onClick={cart.closeDrawer} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full hover:bg-chip">
            <Icon name="close" />
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><Icon name="bag" className="h-7 w-7" /></div>
              <h3 className="mt-4 font-display text-lg font-bold">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted">Good food is always cooking. Add something tasty.</p>
              <button onClick={() => { cart.closeDrawer(); navigate("/restaurants"); }} className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30">
                Browse restaurants
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-rule overflow-y-auto px-5">
              {cart.lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-4">
                  <VegMark veg={l.isVeg} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{l.name}</div>
                    <div className="text-xs text-muted">{money(l.price)}</div>
                  </div>
                  <Stepper qty={l.qty} label={l.name} onDec={() => cart.decItem(l.id)} onInc={() => cart.incItem(l.id)} />
                  <div className="w-16 text-right text-sm font-bold">{money(l.price * l.qty)}</div>
                </li>
              ))}
            </ul>

            <div className="border-t border-rule bg-chip/60 px-5 py-4">
              {toFree > 0 ? (
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted">
                  <Icon name="bike" className="h-4 w-4 text-primary" /> Add {money(toFree)} more for free delivery
                </p>
              ) : (
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-green">
                  <Icon name="check" className="h-4 w-4" /> You've unlocked free delivery
                </p>
              )}
              <div className="mb-4 flex items-center justify-between font-bold">
                <span>Subtotal</span>
                <span>{money(cart.total)}</span>
              </div>
              <button
                onClick={() => { cart.closeDrawer(); navigate("/checkout"); }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
              >
                Checkout <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// Shown when the user adds a dish from a different restaurant than the one in the cart.
export function CartConflictModal() {
  const cart = useCart();
  const dialogRef = useModal(Boolean(cart.conflict), cart.cancelSwitch);
  if (!cart.conflict) return null;
  const from = cart.restaurant;
  const to = cart.conflict.restaurant;
  return (
    <div className="anim-fade-in fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div ref={dialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="conflict-title" className="anim-fade-up w-full outline-none max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 id="conflict-title" className="font-display text-xl font-extrabold">Start a new cart?</h2>
        <p className="mt-2 text-sm text-muted">
          Your cart has items from <b className="text-ink">{from?.name}</b>. Adding from <b className="text-ink">{to?.name}</b> will clear it.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={cart.cancelSwitch} className="flex-1 rounded-full border border-rule py-3 text-sm font-bold hover:bg-chip">Keep current</button>
          <button onClick={cart.confirmSwitch} className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/30">Start new cart</button>
        </div>
      </div>
    </div>
  );
}