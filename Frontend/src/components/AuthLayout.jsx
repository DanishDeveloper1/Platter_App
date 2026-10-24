import React, { useState } from "react";

const COLLAGE = [
  "/assets/mealtypes/breakfast.jpg",
  "/assets/mealtypes/lunch.jpg",
  "/assets/mealtypes/snacks.jpg",
  "/assets/mealtypes/dinner.jpg",
  "/assets/mealtypes/drinks.jpg",
  "/assets/mealtypes/nightlife.jpg",
];

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="mx-auto grid max-w-5xl px-4 pb-10 pt-8 sm:px-6 md:grid-cols-2 md:gap-0">
      {/* Photo collage: six food photos, each shown smaller than its source file, so it stays sharp at any size */}
      <div className="relative hidden overflow-hidden rounded-l-[28px] bg-ink md:block">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-0.5" aria-hidden="true">
          {COLLAGE.map((src) => (
            <img key={src} src={src} alt="" width="480" height="320" className="h-full w-full object-cover" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <div className="font-display text-3xl font-extrabold leading-tight">Find, order, repeat.</div>
          <p className="mt-2 text-sm text-white/85">Sign in to track orders and check out in seconds.</p>
        </div>
      </div>
      <div className="rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-black/5 sm:p-10 md:rounded-l-none">
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function Field({ id, label, error, ...props }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-muted">{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-xl bg-chip px-4 py-3 text-sm ring-1 transition focus:bg-white focus:ring-2 focus:ring-primary/50 ${error ? "ring-primary-dark" : "ring-transparent"}`}
        {...props}
      />
      {error && <div id={`${id}-err`} className="mt-1 text-xs text-primary-dark">{error}</div>}
    </div>
  );
}

export function PasswordField({ id, label, error, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-muted">{label}</label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`w-full rounded-xl bg-chip py-3 pl-4 pr-12 text-sm ring-1 transition focus:bg-white focus:ring-2 focus:ring-primary/50 ${error ? "ring-primary-dark" : "ring-transparent"}`}
          {...props}
          type={show ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {show ? (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.6 6.1A10.5 10.5 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9" />
                <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 4-.8" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              </>
            ) : (
              <>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
      {error && <div id={`${id}-err`} className="mt-1 text-xs text-primary-dark">{error}</div>}
    </div>
  );
}