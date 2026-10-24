import React from "react";
import { Link } from "react-router-dom";
import { RatingBadge, VegMark } from "./Icons.jsx";
import { Stepper } from "./CartDrawer.jsx";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../lib.js";

export function AddButton({ dish, disabled }) {
  const cart = useCart();

  if (disabled) {
    return <span className="rounded-xl bg-chip px-4 py-1.5 text-xs font-bold text-muted">Unavailable</span>;
  }

  const qty = cart.qtyOf(dish._id);

  if (qty === 0) {
    return (
      <button
        onClick={() => cart.addItem(dish.rest, { id: dish._id, name: dish.n, price: dish.p, isVeg: dish.v, image: dish.image })}
        aria-label={`Add ${dish.n} to cart`}
        className="rounded-xl border border-primary/30 bg-white px-6 py-1.5 text-sm font-extrabold text-primary shadow-sm transition hover:bg-primary-soft"
      >
        ADD
      </button>
    );
  }
  return <Stepper qty={qty} label={dish.n} onDec={() => cart.decItem(dish._id)} onInc={() => cart.incItem(dish._id)} />;
}

// showRestaurant: link to the restaurant instead of showing the description.
export default function DishCard({ dish, showRestaurant = false, disabled = false }) {
  const rest = dish.rest;

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={dish.image} alt={dish.n} loading="lazy" className="h-full w-full object-cover" />
        {rest?.rating != null && <RatingBadge rating={rest.rating} className="absolute left-3 top-3" />}
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-lg bg-white/95 shadow">
          <VegMark veg={dish.v} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug">{dish.n}</h3>
        {showRestaurant ? (
          <Link to={`/restaurant/${rest.id}`} className="mt-1 truncate text-sm text-muted hover:text-primary hover:underline">
            {rest.name} · {rest.city}
          </Link>
        ) : (
          <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{dish.d}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-extrabold">{money(dish.p)}</span>
          <AddButton dish={dish} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}