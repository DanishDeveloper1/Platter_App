export const money = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// City centres, used to pick the nearest city from the browser's GPS fix.
export const CITY_COORDS = {
  "New Delhi": [28.6139, 77.209],
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Pune: [18.5204, 73.8567],
  Chandigarh: [30.7333, 76.7794],
};

const SERVICE_RADIUS_KM = 80;

function distanceBetweenKm(lat1, lng1, lat2, lng2) {
  const rad = (d) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nearest city we deliver in, or null if the person is too far from all of them.
export function nearestCity(lat, lng) {
  let best = null;
  let bestKm = Infinity;
  for (const [city, [clat, clng]] of Object.entries(CITY_COORDS)) {
    const km = distanceBetweenKm(lat, lng, clat, clng);
    if (km < bestKm) { bestKm = km; best = city; }
  }
  return bestKm <= SERVICE_RADIUS_KM ? best : null;
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Deterministic "delivery" numbers so a card never changes between renders.
export const eta = (restId) => 20 + ((restId * 7) % 25); // minutes
export const distanceKm = (restId) => (1 + ((restId * 13) % 50) / 10).toFixed(1);

export const DELIVERY_FEE = 30;
export const FREE_DELIVERY_ABOVE = 299;
export const GST_RATE = 0.05;

export const PROMOS = {
  PLATTER50: { label: "50% off up to ₹100 (your first 3 orders)", firstOrdersOnly: true },
  FREESHIP: { label: "Free delivery on any order" },
};

// promo: a code string or "". ordersCount: how many orders the user placed so far.
export function priceBill(subtotal, promoCode = "", ordersCount = 0) {
  let discount = 0;
  let freeDelivery = subtotal >= FREE_DELIVERY_ABOVE;
  let promoError = "";
  const code = promoCode.trim().toUpperCase();

  if (code) {
    const promo = PROMOS[code];
    if (!promo) promoError = "That code isn't valid.";
    else if (promo.firstOrdersOnly && ordersCount >= 3) promoError = "This code is only for your first 3 orders.";
    else if (code === "PLATTER50") discount = Math.min(100, Math.round(subtotal * 0.5));
    else if (code === "FREESHIP") freeDelivery = true;
  }

  const delivery = freeDelivery ? 0 : DELIVERY_FEE;
  const taxes = Math.round((subtotal - discount) * GST_RATE);
  const total = subtotal - discount + delivery + taxes;
  return { subtotal, discount, delivery, taxes, total, promoError, promoApplied: Boolean(code) && !promoError };
}

export const PAYMENT_LABELS = { cod: "Cash on delivery", upi: "UPI", card: "Credit / Debit card", netbanking: "Net banking" };