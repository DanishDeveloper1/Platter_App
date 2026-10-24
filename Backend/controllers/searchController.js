import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";

// Makes user text safe to use inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/search?q=biryani&city=Pune
export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim().slice(0, 50);
    if (!q) return res.json({ restaurants: [], dishes: [] });

    const regex = new RegExp(escapeRegex(q), "i"); // "i" = ignore upper/lower case
    const { city } = req.query;

    // Restaurants: match by name OR any cuisine
    const restaurantFilter = { $or: [{ name: regex }, { cuisines: regex }] };
    if (city) restaurantFilter.city = city;
    const restaurants = await Restaurant.find(restaurantFilter).sort({ rating: -1 });

    // Dishes: match by name, optionally only from restaurants in this city
    const dishFilter = { name: regex };
    if (city) {
      const ids = await Restaurant.distinct("_id", { city });
      dishFilter.restaurant = { $in: ids };
    }
    const dishes = await MenuItem.find(dishFilter)
        .populate("restaurant", "name city rating")
      .limit(30);

    res.json({ restaurants, dishes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};