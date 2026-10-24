import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MEALTYPES } from "../data.js";
import RestaurantBrowser from "../components/RestaurantBrowser.jsx";
import { useLocationCtx } from "../context/LocationContext.jsx";
import { api } from "../api.js";
import Loader from "../components/Loader.jsx";

function SkeletonGrid() {
  return (
    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-card bg-white ring-1 ring-black/5">
          <div className="aspect-[16/10] bg-chip" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 rounded bg-chip" />
            <div className="h-3 w-full rounded bg-chip" />
            <div className="h-3 w-1/2 rounded bg-chip" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Restaurants() {
  const { city } = useLocationCtx();
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get("meal"));
  const mealType = MEALTYPES.find((m) => m.id === requested);
  const meal = mealType ? mealType.id : 0; // unknown ids fall back to "all meals"

  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!city) {
      setRestaurants([]);
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/api/restaurants?city=${encodeURIComponent(city)}`)
      .then((data) => {
        if (cancelled) return;
        setRestaurants(Array.isArray(data) ? data : data.restaurants ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [city, attempt]);

  const list = useMemo(
    () => restaurants.filter((r) => !meal || r.mealTypes.map(String).includes(String(meal))),
    [restaurants, meal]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <nav className="pt-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link> / <span className="text-ink">{city}</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-extrabold">
        {mealType ? `${mealType.name} in ${city}` : `Restaurants in ${city}`}
      </h1>
      {mealType && <p className="mt-1 text-muted">{mealType.desc}</p>}

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[{ id: 0, name: "All meals" }, ...MEALTYPES].map((m) => (
          <button
            key={m.id}
            onClick={() => setParams(m.id ? { meal: m.id } : {})}
            aria-pressed={meal === m.id}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              meal === m.id ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-white ring-1 ring-black/10 hover:ring-primary/50"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {status === "loading" && (
          <>
            <Loader label={`Finding restaurants in ${city}…`} />
            <SkeletonGrid />
          </>
        )}

        {status === "error" && (
          <div role="alert" className="rounded-card bg-white p-10 text-center ring-1 ring-black/5">
            <h3 className="font-display text-lg font-bold">Couldn't load restaurants</h3>
            <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && <RestaurantBrowser key={`${city}-${meal}`} list={list} />}
      </div>
    </div>
  );
}