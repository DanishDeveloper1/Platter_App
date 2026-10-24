import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import LocationModal from "./components/LocationModal.jsx";
import CartDrawer, { CartConflictModal } from "./components/CartDrawer.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <LocationModal />
      <CartDrawer />
      <CartConflictModal />
      <ScrollRestoration />
    </>
  );
}
