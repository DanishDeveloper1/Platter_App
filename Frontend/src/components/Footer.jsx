import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CITIES } from "../data.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocationCtx } from "../context/LocationContext.jsx";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const linkClass = "text-sm text-white/65 transition hover:text-white";
const headingClass = "mb-4 text-xs font-bold uppercase tracking-[0.14em] text-white/45";

export default function Footer() {
  const { setCity } = useLocationCtx();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <footer className="mt-20 rounded-t-[32px] bg-ink px-6 pb-8 pt-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Call-to-action banner */}
        <div className="mb-14 flex flex-col items-start justify-between gap-5 rounded-3xl bg-primary px-7 py-8 sm:flex-row sm:items-center sm:px-10">
          <div>
            <div className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">Hungry? Dinner is a few taps away.</div>
            <p className="mt-1.5 text-sm text-white/85">Pick your city and order from local favourites.</p>
          </div>
          <Link
            to="/restaurants"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-dark shadow-lg shadow-black/10 transition hover:bg-blush"
          >
            Browse restaurants
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-display text-lg font-extrabold text-white">P</span>
              <span className="font-display text-2xl font-extrabold">Platter</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              Find, order, repeat. Your favourite local restaurants, delivered hot.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Platter on Instagram"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-primary"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Platter on X"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-primary"
              >
                <XIcon />
              </a>
            </div>
          </div>

          {/* Cities as pills */}
          <div className="lg:col-span-5">
            <h4 className={headingClass}>Order in your city</h4>
            <ul className="flex flex-wrap gap-2.5">
              {CITIES.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => { setCity(c); navigate("/restaurants"); }}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-primary hover:text-white"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div className="lg:col-span-3">
            <h4 className={headingClass}>Platter</h4>
            <ul className="space-y-3">
              <li><Link to="/orders" className={linkClass}>My orders</Link></li>
              {!user && <li><Link to="/login" className={linkClass}>Log in</Link></li>}
              {!user && <li><Link to="/register" className={linkClass}>Create account</Link></li>}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <span>© Platter 2026. All rights reserved.</span>
          <span>Made with care for hungry people</span>
        </div>
      </div>
    </footer>
  );
}