const DELIVERY_FEE = 30;
const FREE_DELIVERY_ABOVE = 299;
const GST_RATE = 0.05;

export function priceBill(subtotal, promoCode = "", ordersCount = 0) {
  let discount = 0;
  let freeDelivery = subtotal >= FREE_DELIVERY_ABOVE;
  let promoError = "";
  const code = promoCode.trim().toUpperCase();

  if (code) {
    if (code === "PLATTER50") {
      if (ordersCount >= 3) promoError = "This code is only for your first 3 orders.";
      else discount = Math.min(100, Math.round(subtotal * 0.5));
    } else if (code === "FREESHIP") {
      freeDelivery = true;
    } else {
      promoError = "That code isn't valid.";
    }
  }

  const delivery = freeDelivery ? 0 : DELIVERY_FEE;
  const taxes = Math.round((subtotal - discount) * GST_RATE);
  const total = subtotal - discount + delivery + taxes;
  return { subtotal, discount, delivery, taxes, total, promoError, promoApplied: Boolean(code) && !promoError };
}