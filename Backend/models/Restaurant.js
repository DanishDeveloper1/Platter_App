import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    cost: { type: Number, required: true },
    rating: { type: Number, required: true },
    ratingText: { type: String, required: true },
    mealTypes: { type: [String], default: [] },
    cuisines: { type: [String], default: [] },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

restaurantSchema.index({ city: 1 });

export default mongoose.model("Restaurant", restaurantSchema);