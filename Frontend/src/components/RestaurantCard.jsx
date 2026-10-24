import React from "react";
import { Link } from "react-router-dom";
import { RatingBadge, Icon } from "./Icons.jsx";
import { distanceKm, eta, money } from "../lib.js";

export default function RestaurantCard({ r }) {
  const tag = r.cost <= 450 ? "Budget friendly" : r.rating >= 4.5 ? "Top rated" : "Free delivery above ₹299";

  return (
    <Link
      to={`/restaurant/${r._id}`}
      className="group block overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={r.image}
          alt={r.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-12 text-sm font-bold text-white">
          {tag}
        </div>
        {r.isPureVeg && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-green shadow">Pure veg</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold leading-snug">{r.name}</h3>
          <RatingBadge rating={r.rating} className="shrink-0" />
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-ink/80">
          <Icon name="clock" className="h-4 w-4 text-primary" /> {eta(r.legacyId)} min
          <span className="text-muted">·</span> {distanceKm(r.legacyId)} km
          <span className="text-muted">·</span> {money(r.cost)} for two
        </div>
        <div className="mt-1 truncate text-sm text-muted">{r.cuisines.join(", ")}</div>
        <div className="truncate text-sm text-muted">{r.address}</div>
      </div>
    </Link>
  );
}