import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout, Field, PasswordField } from "../components/AuthLayout.jsx";
import { Icon } from "../components/Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Password rules: shown as a live checklist under the field and enforced on submit.
const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  {
    id: "letter",
    label: "A letter (a-z or A-Z)",
    test: (p) => /[A-Za-z]/.test(p),
  },
  { id: "digit", label: "A number (0-9)", test: (p) => /\d/.test(p) },
  {
    id: "special",
    label: "A special character (like @ # $ % ! ?)",
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
];

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const pending = useLocation().state?.pending;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  if (user) return <Navigate to="/" replace />;

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {
      name: !form.name.trim() && "Enter your name",
      email:
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && "Enter a valid email",
      phone: !/^\d{10}$/.test(form.phone) && "Enter a 10-digit phone number",
      password:
        !PASSWORD_RULES.every((r) => r.test(form.password)) &&
        "Your password doesn't meet all the requirements below",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    try {
      await register(
        form.name.trim(),
        form.email.trim(),
        form.phone,
        form.password,
      );
      navigate("/login", { state: { pending }, replace: true });
    } catch (err) {
      if (err.data?.userExists) {
        navigate("/login", {
          state: {
            pending,
            email: form.email.trim(),
            notice: "You already have an account. Please log in.",
          },
          replace: true,
        });
        return;
      }
      setMsg(err.message);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already ordering with us?{" "}
          <Link
            to="/login"
            state={{ pending }}
            className="font-semibold text-primary"
          >
            Log in
          </Link>{" "}
          instead.
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {msg && (
          <div role="alert" className="mb-4 text-sm text-primary-dark">
            {msg}
          </div>
        )}
        <Field
          id="name"
          label="Name"
          autoComplete="name"
          value={form.name}
          onChange={set("name")}
          placeholder="Full name"
          error={errors.name}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          placeholder="Email address"
          error={errors.email}
        />
        <Field
          id="phone"
          label="Phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={form.phone}
          onChange={set("phone")}
          placeholder="10-digit mobile number"
          error={errors.phone}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          aria-describedby={
            errors.password ? "password-err password-rules" : "password-rules"
          }
          value={form.password}
          onChange={set("password")}
          placeholder="Create a strong password"
          error={errors.password}
        />

        <ul
          id="password-rules"
          className="-mt-1 mb-5 space-y-1.5"
          aria-live="polite"
        >
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(form.password);
            const failed = Boolean(errors.password) && !met;
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-2 text-xs ${met ? "font-semibold text-green" : failed ? "text-primary-dark" : "text-muted"}`}
              >
                {met ? (
                  <Icon name="check" className="h-4 w-4 shrink-0" />
                ) : (
                  <span
                    className={`ml-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${failed ? "border-primary-dark" : "border-muted/40"}`}
                  />
                )}
                <span>{rule.label}</span>
                <span className="sr-only">
                  {met ? "(done)" : "(not done yet)"}
                </span>
              </li>
            );
          })}
        </ul>

        <button
          type="submit"
          className="w-full rounded-full bg-primary py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
        >
          Sign up
        </button>
      </form>
    </AuthLayout>
  );
}
