import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DishCard from "../components/DishCard.jsx";
import Loader from "../components/Loader.jsx";
import { Icon, RatingBadge, VegMark } from "../components/Icons.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLocationCtx } from "../context/LocationContext.jsx";
import { api } from "../api.js";
import { distanceKm, eta, FREE_DELIVERY_ABOVE, money } from "../lib.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;

// API restaurant -> the shape the page uses (id = legacyId, used for delivery time and distance)
const toRestaurant = (r) => ({ ...r, id: r.legacyId });

// API dish -> the shape DishCard uses. `_id` and `rest` are what the cart needs.
const toDish = (d, restaurant) => ({
  _id: d._id,
  i: d.legacyId,
  r: restaurant.id,
  n: d.name,
  d: d.description,
  p: d.price,
  v: d.isVeg,
  image: d.image,
  rest: { id: restaurant._id, name: restaurant.name, city: restaurant.city, rating: restaurant.rating },
});

function useRestaurantData(restId, attempt) {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", r: null, menu: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", r: null, menu: [] });

    // Old numeric links (from Home and Search): find the real id, then go to the proper address
    if (!OBJECT_ID.test(restId)) {
      api
        .get("/api/restaurants")
        .then((data) => {
          if (cancelled) return;
          const list = Array.isArray(data) ? data : data.restaurants ?? [];
          const found = list.find((x) => String(x.legacyId) === String(restId));
          if (found) navigate(`/restaurant/${found._id}`, { replace: true });
          else setState({ status: "notfound", r: null, menu: [] });
        })
        .catch(() => {
          if (!cancelled) setState({ status: "error", r: null, menu: [] });
        });
      return () => {
        cancelled = true;
      };
    }

    Promise.all([api.get(`/api/restaurants/${restId}`), api.get(`/api/restaurants/${restId}/menu`)])
      .then(([restData, menuData]) => {
        if (cancelled) return;
        const restaurant = toRestaurant(restData.restaurant ?? restData);
        const rawMenu = Array.isArray(menuData) ? menuData : menuData.menu ?? menuData.items ?? [];
        setState({
          status: "ready",
          r: restaurant,
          menu: rawMenu.map((d) => toDish(d, restaurant)),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const missing = err.status === 404 || err.status === 400;
        setState({ status: missing ? "notfound" : "error", r: null, menu: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [restId, attempt, navigate]);

  return state;
}

export default function Restaurant() {
  const { restId } = useParams();
  const [attempt, setAttempt] = useState(0);
  const { status, r, menu } = useRestaurantData(restId, attempt);
  const { city, setCity } = useLocationCtx();
  const cart = useCart();
  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState("menu");

  const items = useMemo(() => {
    let out = menu.filter(
      (m) => (!vegOnly || m.v) && ((m.n || "") + " " + (m.d || "")).toLowerCase().includes(q.trim().toLowerCase())
    );
    if (sort === "low") out = [...out].sort((a, b) => a.p - b.p);
    if (sort === "high") out = [...out].sort((a, b) => b.p - a.p);
    return out;
  }, [menu, q, vegOnly, sort]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Loader label="Loading the menu…" className="py-32" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">Couldn't load this restaurant</h1>
        <p className="mt-2 text-sm text-muted">Check your connection and try again.</p>
        <button onClick={() => setAttempt((a) => a + 1)} className="mt-5 rounded-full bg-primary px-6 py-3 font-bold text-white">
          Try again
        </button>
      </div>
    );
  }

  if (status === "notfound" || !r) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">That restaurant isn't on the menu</h1>
        <Link to="/restaurants" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-bold text-white">Browse restaurants</Link>
      </div>
    );
  }

  const pureVeg = menu.length > 0 && menu.every((m) => m.v);
  const outOfArea = r.city !== city;
  const inCart = cart.restaurant?.id === r._id ? cart.count : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 sm:px-6">
      <nav className="pt-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to="/restaurants" className="hover:text-primary">{r.city}</Link> / <span className="text-ink">{r.name}</span>
      </nav>

      {/* Header: the photo keeps its 16:9 shape (the source files are 480x270) */}
      <section className="anim-fade-up mt-4 grid gap-6 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6 md:grid-cols-[minmax(0,480px)_1fr] md:items-center">
        <img
          src={r.image}
          alt={r.name}
          width="480"
          height="270"
          className="aspect-video w-full rounded-2xl object-cover shadow-md"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RatingBadge rating={r.rating} className="px-3 py-1.5 text-sm" />
            <span className="text-sm font-semibold text-muted">{r.ratingText}</span>
            {pureVeg && <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-bold text-green">Pure veg</span>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{r.name}</h1>
          <p className="mt-1 text-muted">{r.cuisines.join(" · ")}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted"><Icon name="pin" className="h-4 w-4 shrink-0" /> {r.address}</p>

          <div className="mt-5 flex flex-wrap gap-2.5 text-sm font-semibold">
            <span className="flex items-center gap-2 rounded-full bg-chip px-4 py-2"><Icon name="clock" className="h-4 w-4 text-primary" /> {eta(r.id)} min · {distanceKm(r.id)} km</span>
            <span className="flex items-center gap-2 rounded-full bg-chip px-4 py-2">{money(r.cost)} for two</span>
            <span className="flex items-center gap-2 rounded-full bg-chip px-4 py-2"><Icon name="bike" className="h-4 w-4 text-green" /> Free delivery above {money(FREE_DELIVERY_ABOVE)}</span>
          </div>
        </div>
      </section>

      {outOfArea && (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary-soft p-4 text-sm ring-1 ring-primary/20">
          <span>
            <b>{r.name}</b> is in {r.city}. It doesn't deliver to {city}.
          </span>
          <button onClick={() => setCity(r.city)} className="rounded-full bg-primary px-4 py-2 font-bold text-white">
            Switch to {r.city}
          </button>
        </div>
      )}

      {/* Menu */}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold">Menu <span className="text-base font-semibold text-muted">({items.length})</span></h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label={`Search the ${r.name} menu`}
              placeholder="Search this menu"
              className="w-48 rounded-full bg-white py-2 pl-10 pr-3 text-sm ring-1 ring-black/10 focus:ring-2 focus:ring-primary/40 sm:w-56"
            />
          </div>
          <button
            onClick={() => setVegOnly((v) => !v)}
            aria-pressed={vegOnly}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${vegOnly ? "bg-green/10 text-green ring-green" : "bg-white ring-black/10"}`}
          >
            <VegMark veg /> Veg only
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort menu" className="rounded-full bg-white px-3 py-2 text-sm font-semibold ring-1 ring-black/10">
            <option value="menu">Recommended</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-card bg-white p-10 text-center text-muted ring-1 ring-black/5">Nothing on the menu matches that.</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m) => <DishCard key={m._id} dish={m} disabled={outOfArea} />)}
        </div>
      )}

      {/* Floating cart bar */}
      {inCart > 0 && (
        <div className="anim-fade-up fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-3xl items-center justify-between rounded-full bg-ink px-6 py-3.5 text-white shadow-2xl">
          <span className="font-semibold">{inCart} item{inCart === 1 ? "" : "s"} · {money(cart.total)}</span>
          <button onClick={cart.openDrawer} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold">
            View cart <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}