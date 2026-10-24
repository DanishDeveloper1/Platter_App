import React from "react";
import { Field } from "./AuthLayout.jsx";

const METHODS = [
  { id: "cod", label: "Cash on delivery", hint: "Pay when your order arrives" },
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm and more" },
  { id: "card", label: "Credit / Debit card", hint: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net banking", hint: "Pay from your bank account" },
];

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Yes Bank",
];

const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

function luhn(num) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function cardBrand(digits) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^(60|65|81|82|508)/.test(digits)) return "RuPay";
  return "";
}

// Returns an object of { fieldName: "message" }. Empty object = all good.
export function validatePayment(method, d) {
  const e = {};
  if (method === "upi" && !UPI_RE.test(d.upiId.trim())) {
    e.upiId = "Enter a valid UPI ID, like name@bank";
  }
  if (method === "card") {
    const digits = d.cardNumber.replace(/\s/g, "");
    if (digits.length < 13 || digits.length > 19 || !luhn(digits)) e.cardNumber = "Enter a valid card number";
    if (d.cardName.trim().length < 2) e.cardName = "Enter the name on the card";
    const m = /^(\d{2})\/(\d{2})$/.exec(d.expiry);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) e.expiry = "Enter expiry as MM/YY";
    else if (new Date(2000 + Number(m[2]), Number(m[1]), 1) <= new Date()) e.expiry = "This card has expired";
    if (!/^\d{3,4}$/.test(d.cvv)) e.cvv = "Enter the 3 or 4 digit CVV";
  }
  if (method === "netbanking" && !d.bank) e.bank = "Choose your bank";
  return e;
}

// method: "cod" | "upi" | "card" | "netbanking"
// details: { upiId, cardNumber, cardName, expiry, cvv, bank }
export default function PaymentMethods({ method, onMethod, details, onField, errors }) {
  const digits = details.cardNumber.replace(/\s/g, "");
  const brand = cardBrand(digits);

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <section className="rounded-card bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="font-display text-lg font-extrabold">Payment</h2>

      <div role="radiogroup" aria-label="Payment method" className="mt-4 grid gap-2 sm:grid-cols-2">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={method === m.id}
            onClick={() => onMethod(m.id)}
            className={`rounded-xl px-4 py-3 text-left ring-1 transition ${method === m.id ? "bg-primary-soft text-primary-dark ring-primary" : "bg-white ring-black/10 hover:ring-primary/40"}`}
          >
            <div className="text-sm font-semibold">{m.label}</div>
            <div className={`text-xs ${method === m.id ? "text-primary-dark/80" : "text-muted"}`}>{m.hint}</div>
          </button>
        ))}
      </div>

      {method === "upi" && (
        <div className="mt-5">
          <Field
            id="upiId"
            label="UPI ID"
            autoComplete="off"
            value={details.upiId}
            onChange={(e) => onField("upiId", e.target.value)}
            placeholder="yourname@bank"
            error={errors.upiId}
          />
        </div>
      )}

      {method === "card" && (
        <div className="mt-5">
          <Field
            id="cardNumber"
            label={`Card number${brand ? ` · ${brand}` : ""}`}
            inputMode="numeric"
            autoComplete="cc-number"
            value={details.cardNumber}
            onChange={(e) => onField("cardNumber", formatCard(e.target.value))}
            placeholder="1234 5678 9012 3456"
            error={errors.cardNumber}
          />
          <Field
            id="cardName"
            label="Name on card"
            autoComplete="cc-name"
            value={details.cardName}
            onChange={(e) => onField("cardName", e.target.value)}
            placeholder="As printed on the card"
            error={errors.cardName}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              id="expiry"
              label="Expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={details.expiry}
              onChange={(e) => onField("expiry", formatExpiry(e.target.value))}
              placeholder="MM/YY"
              error={errors.expiry}
            />
            <Field
              id="cvv"
              label="CVV"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              value={details.cvv}
              onChange={(e) => onField("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="•••"
              error={errors.cvv}
            />
          </div>
        </div>
      )}

      {method === "netbanking" && (
        <div className="mt-5">
          <div className="mb-2 text-xs font-bold text-muted">Choose your bank</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {BANKS.map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={details.bank === b}
                onClick={() => onField("bank", b)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ring-1 transition ${details.bank === b ? "bg-primary-soft text-primary-dark ring-primary" : "bg-white ring-black/10 hover:ring-primary/40"}`}
              >
                {b}
              </button>
            ))}
          </div>
          {errors.bank && <div role="alert" className="mt-2 text-xs text-primary-dark">{errors.bank}</div>}
        </div>
      )}

      <p className="mt-4 rounded-xl bg-chip px-4 py-3 text-xs text-muted">
        {method === "cod"
          ? "Pay in cash when your order arrives."
          : "Demo checkout: these details stay in your browser, are never sent or saved, and no money is charged."}
      </p>
    </section>
  );
}