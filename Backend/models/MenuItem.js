import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, required: true },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    isVeg: { type: Boolean, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurant: 1 });

export default mongoose.model("MenuItem", menuItemSchema);