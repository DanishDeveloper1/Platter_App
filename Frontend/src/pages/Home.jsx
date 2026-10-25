import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CITIES, MEALTYPES } from "../data.js";
import RestaurantCard from "../components/RestaurantCard.jsx";
import RestaurantBrowser from "../components/RestaurantBrowser.jsx";
import DishCard from "../components/DishCard.jsx";
import Loader from "../components/Loader.jsx";
import { Icon } from "../components/Icons.jsx";
import { useLocationCtx } from "../context/LocationContext.jsx";
import { api } from "../api.js";
import { plural } from "../lib.js";

const OFFERS = [
  { bg: "from-[#ff4b3e] to-[#ff8a65]", title: "50% OFF up to ₹100", sub: "On your first 3 orders", code: "PLATTER50" },
  { bg: "from-[#0caa6e] to-[#4fd69c]", title: "Free delivery", sub: "On orders above ₹299", code: "AUTO" },
  { bg: "from-[#1c1c1e] to-[#4a4a4f]", title: "Free delivery, any order", sub: "Limited-time code", code: "FREESHIP" },
];

// API dish (with its restaurant filled in) -> the shape DishCard and the cart use
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

export function SectionTitle({ title, sub, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-extrabold sm:text-2xl">{title}</h2>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  const { city, setCity, openPicker } = useLocationCtx();

  // All restaurants (one small request). Everything city-specific is worked out from this list.
  const [all, setAll] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get("/api/restaurants")
      .then((data) => {
        if (cancelled) return;
        setAll(Array.isArray(data) ? data : data.restaurants ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Dish count and popular dishes for the chosen city
  const [extras, setExtras] = useState(null); // null = still loading
  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setExtras(null);
    api
      .get(`/api/restaurants/home?city=${encodeURIComponent(city)}`)
      .then((data) => {
        if (!cancelled) setExtras(data);
      })
      .catch(() => {
        if (!cancelled) setExtras({ dishCount: null, popularDishes: [] }); // the section just stays hidden
      });
    return () => {
      cancelled = true;
    };
  }, [city, attempt]);

  const inCity = useMemo(() => (city ? all.filter((r) => r.city === city) : []), [all, city]);
  const topPicks = useMemo(() => [...inCity].sort((a, b) => b.rating - a.rating).slice(0, 3), [inCity]);

  // Trim to full rows of four, like before
  const dishes = useMemo(() => {
    const picks = (extras?.popularDishes ?? []).filter((d) => d.restaurant).map(toDish);
    return picks.length >= 4 ? picks.slice(0, Math.floor(picks.length / 4) * 4) : picks;
  }, [extras]);

  const ready = status === "ready";
  const minutesAvg = 32;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="anim-fade-up relative mt-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-primary via-[#ff6a55] to-[#ff9a76] px-6 py-10 text-white shadow-xl shadow-primary/20 sm:px-12 sm:py-14">
        <div className="relative z-10 max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
            <Icon name="bike" className="h-4 w-4" /> {ready ? `${all.length} restaurants across ${CITIES.length} cities` : `Delivering in ${CITIES.length} cities`}
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl">
            Hungry? Get great food from {city ? <span className="underline decoration-white/50 decoration-4 underline-offset-4">{city}</span> : "nearby"}.
          </h1>
          <p className="mt-4 text-white/90">
            Order from {ready ? plural(inCity.length, "local favourite") : "local favourites"} near you. Hot, fast and tracked to your door.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-dark shadow-lg transition hover:scale-105">
              Order now
            </button>
            <button onClick={openPicker} className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/30">
              <Icon name="pin" className="h-4 w-4" /> Change location
            </button>
          </div>
          <dl className="mt-8 flex gap-8 text-sm">
            <div><dt className="text-white/70">Restaurants</dt><dd className="font-display text-2xl font-extrabold">{ready ? inCity.length : "–"}</dd></div>
            <div><dt className="text-white/70">Dishes</dt><dd className="font-display text-2xl font-extrabold">{extras?.dishCount ?? "–"}</dd></div>
            <div><dt className="text-white/70">Avg. delivery</dt><dd className="font-display text-2xl font-extrabold">{minutesAvg} min</dd></div>
          </dl>
        </div>
        <div className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 gap-4 md:flex" aria-hidden="true">
          <div className="mt-16 flex flex-col gap-4">
            <img src="/assets/mealtypes/dinner.jpg" alt="" className="h-44 w-44 rotate-6 rounded-[28px] object-cover shadow-2xl ring-4 ring-white/40" />
            <img src="/assets/mealtypes/snacks.jpg" alt="" className="h-36 w-44 -rotate-3 rounded-[28px] object-cover shadow-2xl ring-4 ring-white/40" />
          </div>
          <div className="-mt-10 flex flex-col gap-4">
            <img src="/assets/mealtypes/breakfast.jpg" alt="" className="h-36 w-44 -rotate-6 rounded-[28px] object-cover shadow-2xl ring-4 ring-white/40" />
            <img src="/assets/mealtypes/lunch.jpg" alt="" className="h-44 w-44 rotate-3 rounded-[28px] object-cover shadow-2xl ring-4 ring-white/40" />
          </div>
        </div>
      </section>

      {/* Meal types */}
      <section className="mt-12">
        <SectionTitle title="What's on your mind?" sub="Pick a mood, we'll find the menu." />
        <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-7 sm:px-0">
          {MEALTYPES.map((m) => (
            <Link key={m.id} to={`/restaurants?meal=${m.id}`} className="group flex shrink-0 flex-col items-center gap-2.5">
              <img src={m.img} alt="" className="h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-white transition duration-300 group-hover:scale-110 group-hover:shadow-xl sm:h-28 sm:w-28" />
              <span className="text-sm font-bold">{m.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="mt-12">
        <SectionTitle title="Offers for you" sub="Apply codes at checkout." />
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {OFFERS.map((o) => (
            <div key={o.title} className={`min-w-[260px] shrink-0 rounded-card bg-gradient-to-br ${o.bg} p-5 text-white shadow-lg sm:min-w-0`}>
              <Icon name="tag" className="h-6 w-6 opacity-90" />
              <div className="mt-6 font-display text-xl font-extrabold">{o.title}</div>
              <div className="text-sm text-white/85">{o.sub}</div>
              <div className="mt-3 inline-block rounded-lg border border-dashed border-white/60 px-2.5 py-1 text-xs font-bold tracking-wider">
                {o.code === "AUTO" ? "AUTO APPLIED" : `USE ${o.code}`}
              </div>
            </div>
          ))}
        </div>
      </section>

      {status === "loading" && <Loader label="Finding restaurants near you…" className="py-20" />}

      {status === "error" && (
        <div role="alert" className="mt-12 rounded-card bg-white p-10 text-center ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Couldn't load restaurants</h2>
          <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
          <button onClick={() => setAttempt((a) => a + 1)} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Try again
          </button>
        </div>
      )}

      {ready && (
        <>
          {/* Top picks */}
          {topPicks.length > 0 && (
            <section className="mt-12">
              <SectionTitle title={`Top picks in ${city}`} sub="Highest rated near you." />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {topPicks.map((r) => <RestaurantCard key={r._id} r={r} />)}
              </div>
            </section>
          )}

          {/* Popular dishes */}
          {extras === null && city && <Loader label="Loading popular dishes…" className="py-10" />}
          {dishes.length > 0 && (
            <section className="mt-12">
              <SectionTitle title={`Popular dishes in ${city}`} sub="What everyone's ordering right now." />
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {dishes.map((m) => <DishCard key={m._id} dish={m} showRestaurant />)}
              </div>
            </section>
          )}

          {/* All restaurants in the city */}
          <section id="restaurants" className="mt-12 scroll-mt-28">
            <SectionTitle
              title={`${plural(inCity.length, "restaurant")} in ${city}`}
              sub="Filter by cuisine, rating or pure veg."
              action={<Link to="/restaurants" className="hidden items-center gap-1 text-sm font-bold text-primary sm:flex">See all <Icon name="arrow" className="h-4 w-4" /></Link>}
            />
            <RestaurantBrowser key={city} list={inCity} />
          </section>

          {/* Other cities */}
          <section className="mt-14">
            <SectionTitle title="Explore other cities" sub="Travelling? Switch your location in one tap." />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {CITIES.filter((c) => c !== city).map((c) => {
                const list = all.filter((r) => r.city === c);
                if (list.length === 0) return null;
                return (
                  <button
                    key={c}
                    onClick={() => { setCity(c); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="group relative overflow-hidden rounded-card text-left shadow-sm ring-1 ring-black/5"
                  >
                    <img src={list[0].image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <div className="font-display text-lg font-extrabold">{c}</div>
                      <div className="text-xs text-white/80">{plural(list.length, "restaurant")}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}