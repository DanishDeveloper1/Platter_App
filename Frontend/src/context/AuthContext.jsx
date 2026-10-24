import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On page load, ask the server who we are (the cookie is sent automatically)
  useEffect(() => {
    api.get("/api/auth/me")
      .then((data) => setUser(data.user ?? data))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  async function login(email, password) {
    await api.post("/api/auth/login", { email, password });
    const data = await api.get("/api/auth/me");
    setUser(data.user ?? data);
  }

  async function register(name, email, phone, password) {
    await api.post("/api/auth/signup", { name, email, phone, password });
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}