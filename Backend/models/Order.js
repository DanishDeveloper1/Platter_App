import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    isVeg: { type: Boolean, default: false },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    restaurantName: { type: String, required: true },
    city: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    payment: { type: String, enum: ["cod", "upi", "card","netbanking"], required: true },
    promoCode: { type: String, default: "" },
    bill: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, required: true },
      delivery: { type: Number, required: true },
      taxes: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);