import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Restaurants from "./pages/Restaurants.jsx";
import Restaurant from "./pages/Restaurant.jsx";
import Search from "./pages/Search.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "restaurants", element: <Restaurants /> },
      { path: "restaurant/:restId", element: <Restaurant /> },
      { path: "search", element: <Search /> },
      { path: "checkout", element: <Checkout /> },
      { path: "orders", element: <Orders /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  </React.StrictMode>
);
