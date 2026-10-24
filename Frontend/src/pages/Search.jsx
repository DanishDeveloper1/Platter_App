import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard.jsx";
import DishCard from "../components/DishCard.jsx";
import Loader from "../components/Loader.jsx";
import { useLocationCtx } from "../context/LocationContext.jsx";
import { api } from "../api.js";

const EMPTY = { restaurants: [], dishes: [] };

// API dish -> the shape DishCard and the cart use
const toDish = (d) => ({
  _id: d._id,
  i: d.legacyId,
  n: d.name,
  d: d.description,
  p: d.price,
  v: d.isVeg,
  image: d.image,
  rest: {
    id: d.restaurant._id,
    name: d.restaurant.name,
    city: d.restaurant.city,
    rating: d.restaurant.rating,
  },
});

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const { city } = useLocationCtx();
  const [allCities, setAllCities] = useState(false);

  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!q) {
      setData(EMPTY);
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    // Short pause so a fast typist doesn't trigger a request for every letter
    const timer = setTimeout(() => {
      api
        .get(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => {
          if (cancelled) return;
          setData({
            restaurants: Array.isArray(res?.restaurants) ? res.restaurants : [],
            dishes: Array.isArray(res?.dishes) ? res.dishes : [],
          });
          setStatus("ready");
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, attempt]);

  const { restaurants, dishes, elsewhere } = useMemo(() => {
    const inScope = (c) => allCities || c === city;
    const dishList = data.dishes.filter((d) => d.restaurant);
    return {
      restaurants: data.restaurants.filter((r) => inScope(r.city)),
      dishes: dishList.filter((d) => inScope(d.restaurant.city)).map(toDish),
      elsewhere:
        data.restaurants.filter((r) => r.city !== city).length +
        dishList.filter((d) => d.restaurant.city !== city).length,
    };
  }, [data, city, allCities]);

  const empty = restaurants.length === 0 && dishes.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <h1 className="pt-8 font-display text-3xl font-extrabold">
        {q ? <>Results for “{params.get("q")}”</> : "Search"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {allCities ? "Across all cities" : `In ${city}`}
        {status === "ready" && elsewhere > 0 && !allCities && (
          <> · <button onClick={() => setAllCities(true)} className="font-bold text-primary hover:underline">Also show {elsewhere} from other cities</button></>
        )}
        {allCities && <> · <button onClick={() => setAllCities(false)} className="font-bold text-primary hover:underline">Only {city}</button></>}
      </p>

      {status === "idle" && <p className="mt-10 text-center text-muted">Type a restaurant, cuisine or dish in the search bar.</p>}

      {status === "loading" && <Loader label={`Searching for “${q}”…`} className="py-20" />}

      {status === "error" && (
        <div role="alert" className="mt-8 rounded-card bg-white p-10 text-center ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Couldn't search right now</h2>
          <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
          <button onClick={() => setAttempt((a) => a + 1)} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Try again
          </button>
        </div>
      )}

      {status === "ready" && empty && (
        <div className="mt-8 rounded-card bg-white p-10 text-center ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Nothing found for “{params.get("q")}”</h2>
          <p className="mt-1 text-sm text-muted">Check the spelling or try something like “biryani”, “dosa” or “momos”.</p>
          <Link to="/restaurants" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">Browse restaurants</Link>
        </div>
      )}

      {status === "ready" && restaurants.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-xl font-extrabold">Restaurants <span className="text-base font-semibold text-muted">({restaurants.length})</span></h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => <RestaurantCard key={r._id} r={r} />)}
          </div>
        </section>
      )}

      {status === "ready" && dishes.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-extrabold">Dishes <span className="text-base font-semibold text-muted">({dishes.length})</span></h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {dishes.map((m) => <DishCard key={m._id} dish={m} showRestaurant disabled={m.rest.city !== city} />)}
          </div>
        </section>
      )}
    </div>
  );
}