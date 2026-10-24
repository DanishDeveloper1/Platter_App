import React from "react";

export default function Loader({ label = "Loading…", className = "" }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 py-10 ${className}`}>
      <svg
        viewBox="0 0 50 50"
        className="h-12 w-12 animate-spin text-primary motion-reduce:animate-none"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="25" cy="25" r="20" stroke="currentColor" strokeOpacity="0.2" strokeWidth="5" />
        <path d="M45 25a20 20 0 0 0-20-20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-semibold text-muted">{label}</p>
    </div>
  );
}