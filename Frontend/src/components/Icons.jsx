import React from "react";

const PATHS = {
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  bag: <><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  tag: <><path d="M3 12V4h8l10 10-8 8L3 12z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l4-8h5l3 8M10 9 8 6H6" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  locate: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
};

export function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export function StarIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </svg>
  );
}

// The standard Indian veg / non-veg marker.
export function VegMark({ veg, className = "" }) {
  const color = veg ? "border-green" : "border-primary-dark";
  const dot = veg ? "bg-green" : "bg-primary-dark";
  return (
    <span
      title={veg ? "Veg" : "Non-veg"}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 bg-white ${color} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="sr-only">{veg ? "Veg" : "Non-veg"}</span>
    </span>
  );
}

export function RatingBadge({ rating, className = "" }) {
  const bg = rating >= 4 ? "bg-green" : rating >= 3 ? "bg-gold" : "bg-primary-dark";
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold text-white shadow-sm ${bg} ${className}`}>
      <StarIcon className="h-3 w-3" />
      {Number(rating).toFixed(1)}
    </span>
  );
}
