import React, { useMemo, useState } from "react";
import RestaurantCard from "./RestaurantCard.jsx";
import { CUISINES } from "../data.js";
import { eta } from "../lib.js";

const SORTS = [
  ["relevance", "Relevance"],
  ["rating", "Rating: high to low"],
  ["time", "Delivery time"],
  ["cost", "Cost: low to high"],
];

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
        active ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-black/10 hover:ring-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

// Filter + sort bar and the restaurant grid. `list` is already scoped to a city.
export default function RestaurantBrowser({ list }) {
  const [cuisine, setCuisine] = useState("All");
  const [veg, setVeg] = useState(false);
  const [top, setTop] = useState(false);
  const [sort, setSort] = useState("relevance");

  const cuisines = useMemo(() => ["All", ...CUISINES.filter((c) => list.some((r) => r.cuisines.includes(c)))], [list]);

  const shown = useMemo(() => {
    let out = list.filter(
      (r) => (cuisine === "All" || r.cuisines.includes(cuisine)) && (!veg || r.isPureVeg) && (!top || r.rating >= 4)
    );
    if (sort === "rating") out = [...out].sort((a, b) => b.rating - a.rating);
    if (sort === "time") out = [...out].sort((a, b) => eta(a.legacyId) - eta(b.legacyId));
    if (sort === "cost") out = [...out].sort((a, b) => a.cost - b.cost);
    return out;
  }, [list, cuisine, veg, top, sort]);

  const filtered = cuisine !== "All" || veg || top;

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {cuisines.map((c) => (
          <Chip key={c} active={cuisine === c} onClick={() => setCuisine(c)}>{c}</Chip>
        ))}
        <span className="mx-1 h-6 w-px shrink-0 bg-black/10" />
        <Chip active={veg} onClick={() => setVeg((v) => !v)}>Pure veg</Chip>
        <Chip active={top} onClick={() => setTop((v) => !v)}>Rating 4.0+</Chip>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted" aria-live="polite">
          {shown.length} restaurant{shown.length === 1 ? "" : "s"}
        </p>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-black/10"
          >
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-card bg-white p-10 text-center ring-1 ring-black/5">
          <h3 className="font-display text-lg font-bold">No restaurants match</h3>
          <p className="mt-1 text-sm text-muted">Try removing a filter.</p>
          {filtered && (
            <button onClick={() => { setCuisine("All"); setVeg(false); setTop(false); }} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => <RestaurantCard key={r._id} r={r} />)}
        </div>
      )}
    </div>
  );
}