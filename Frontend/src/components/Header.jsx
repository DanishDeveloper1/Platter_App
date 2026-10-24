import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "./Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLocationCtx } from "../context/LocationContext.jsx";

function SearchBox({ className = "" }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    if (loc.pathname === "/search") setQ(params.get("q") || "");
  }, [loc.pathname, params]);

  function submit(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search restaurants and dishes"
        placeholder="Search for restaurants or dishes"
        className="w-full rounded-full bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm ring-1 ring-black/5 placeholder:text-muted focus:ring-2 focus:ring-primary/40"
      />
    </form>
  );
}

export default function Header() {
  const { city, openPicker } = useLocationCtx();
  const { count, openDrawer } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-rose-soft/70 bg-blush/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Platter home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-extrabold text-white shadow-md shadow-primary/30">P</span>
          <span className="hidden font-display text-xl font-extrabold tracking-tight sm:block">Platter</span>
        </Link>

        <button
          onClick={openPicker}
          className="flex min-w-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold shadow-sm ring-1 ring-black/5 transition hover:ring-primary/40"
          aria-label={`Delivering to ${city || "no city yet"}. Change location`}
        >
          <Icon name="pin" className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{city || "Select location"}</span>
          <Icon name="chevron" className="h-4 w-4 shrink-0 text-muted" />
        </button>

        <SearchBox className="ml-2 hidden max-w-md flex-1 md:block" />

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition hover:bg-white sm:flex ${isActive ? "bg-white" : ""}`
            }
          >
            <Icon name="receipt" className="h-4 w-4" /> Orders
          </NavLink>

          <button
            onClick={openDrawer}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition hover:ring-primary/40"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <Icon name="bag" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className="grid h-10 w-10 place-items-center rounded-full bg-ink font-display text-sm font-bold text-white"
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </button>
              {menuOpen && (
                <>
                  <div role="menu" className="anim-fade-in absolute right-0 z-20 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                    <div className="px-3 py-2">
                      <div className="truncate text-sm font-bold">{user.name}</div>
                      <div className="truncate text-xs text-muted">{user.email}</div>
                    </div>
                    <button role="menuitem" onClick={() => { setMenuOpen(false); navigate("/orders"); }} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-chip">
                      My orders
                    </button>
                    <button role="menuitem" onClick={() => { setMenuOpen(false); logout(); navigate("/"); }} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-primary-dark hover:bg-primary-soft">
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">
              Log in
            </Link>
          )}
        </nav>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
