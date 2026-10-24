import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <div className="font-display text-7xl font-extrabold text-primary">404</div>
      <h1 className="mt-2 font-display text-2xl font-extrabold">This page isn't on the menu</h1>
      <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30">Back to home</Link>
    </div>
  );
}
