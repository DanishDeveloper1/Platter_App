import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout, Field, PasswordField } from "../components/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pending = location.state?.pending;
  const notice = location.state?.notice;
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  if (user) return <Navigate to={pending || "/"} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await login(email.trim(), password);
      navigate(pending || "/", { replace: true });
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        <>
          New here?{" "}
          <Link
            to="/register"
            state={{ pending }}
            className="font-semibold text-primary"
          >
            Create an account
          </Link>{" "}
          instead.
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {pending && (
          <div className="mb-4 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">
            Log in to continue to checkout.
          </div>
        )}
        {notice && (
          <div className="mb-4 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">
            {notice}
          </div>
        )}
        {msg && (
          <div role="alert" className="mb-4 text-sm text-primary-dark">
            {msg}
          </div>
        )}
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-primary py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
        >
          Log in
        </button>
      </form>
    </AuthLayout>
  );
}
