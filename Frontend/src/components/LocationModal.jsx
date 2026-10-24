import React, { useEffect, useState } from "react";
import { Icon } from "./Icons.jsx";
import { CITIES } from "../data.js";
import { plural } from "../lib.js";
import { api } from "../api.js";
import { useModal } from "../useModal.js";
import { useLocationCtx } from "../context/LocationContext.jsx";

export default function LocationModal() {
  const { city, setCity, pickerOpen, closePicker, detect, detecting, detectError } = useLocationCtx();
  const [counts, setCounts] = useState(null); // { city: number } once loaded

  const dialogRef = useModal(pickerOpen, closePicker);

  useEffect(() => {
    if (!pickerOpen) return;
    let cancelled = false;
    api
      .get("/api/restaurants")
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data.restaurants ?? [];
        const c = {};
        list.forEach((r) => { c[r.city] = (c[r.city] || 0) + 1; });
        setCounts(c);
      })
      .catch(() => {
        if (!cancelled) setCounts({});
      });
    return () => {
      cancelled = true;
    };
  }, [pickerOpen]);

  if (!pickerOpen) return null;

  return (
    <div className="anim-fade-in fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && closePicker()}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="loc-title" className="anim-fade-up w-full outline-none max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="loc-title" className="font-display text-2xl font-extrabold">Where should we deliver?</h2>
            <p className="mt-1 text-sm text-muted">Pick your city to see the restaurants that deliver to you.</p>
          </div>
          {city && (
            <button onClick={closePicker} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-chip">
              <Icon name="close" />
            </button>
          )}
        </div>

        <button
          onClick={detect}
          disabled={detecting}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-left font-semibold text-primary-dark transition hover:bg-primary/10 disabled:opacity-60"
        >
          <Icon name="locate" />
          {detecting ? "Finding you…" : "Use my current location"}
        </button>
        {detectError && <p role="alert" className="mt-2 text-sm text-primary-dark">{detectError}</p>}

        <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted">
          <span className="h-px flex-1 bg-rule" /> or choose a city <span className="h-px flex-1 bg-rule" />
        </div>

        <ul className="grid gap-2">
          {CITIES.map((c) => (
            <li key={c}>
              <button
                onClick={() => setCity(c)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  c === city ? "bg-ink text-white" : "bg-chip hover:bg-rose-soft"
                }`}
              >
                <span className="flex items-center gap-3 font-semibold">
                  <Icon name="pin" className="h-4 w-4" /> {c}
                </span>
                <span className={`text-xs ${c === city ? "text-white/70" : "text-muted"}`}>
                  {counts && counts[c] != null ? plural(counts[c], "restaurant") : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}