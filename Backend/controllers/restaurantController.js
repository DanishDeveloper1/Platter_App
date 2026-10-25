import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";

// GET /api/restaurants?city=Pune
export const getRestaurants = async (req, res) => {
  try {
    const filter = {};
    if (req.query.city) filter.city = req.query.city;

    const restaurants = await Restaurant.find(filter).sort({ rating: -1 });

    // A restaurant is "pure veg" when none of its dishes is non-veg
    const nonVegIds = await MenuItem.distinct("restaurant", { isVeg: false });
    const nonVeg = new Set(nonVegIds.map(String));

    res.json(
      restaurants.map((r) => ({ ...r.toObject(), isPureVeg: !nonVeg.has(String(r._id)) }))
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/restaurants/cities
export const getCities = async (req, res) => {
  try {
    const cities = await Restaurant.distinct("city");
    res.json(cities);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/restaurants/:id/menu
export const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menu = await MenuItem.find({ restaurant: id });
    res.json(menu);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/restaurants/home?city=Pune
// Extra data for the home page: dish count and the popular dishes in a city
export const getHomeExtras = async (req, res) => {
  try {
    const { city } = req.query;

    let dishCount = 0;
    let popularDishes = [];

    if (city) {
      const ids = await Restaurant.distinct("_id", { city });
      dishCount = await MenuItem.countDocuments({ restaurant: { $in: ids } });

      const dishes = await MenuItem.find({ restaurant: { $in: ids } })
        .sort({ price: -1 })
        .populate("restaurant", "name city rating");

      // At most 2 dishes per restaurant, 8 in total
      const perRestaurant = {};
      popularDishes = dishes
        .filter((d) => {
          if (!d.restaurant) return false;
          const key = String(d.restaurant._id);
          perRestaurant[key] = (perRestaurant[key] || 0) + 1;
          return perRestaurant[key] <= 2;
        })
        .slice(0, 8);
    } else {
      dishCount = await MenuItem.countDocuments();
    }

    res.json({ dishCount, popularDishes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};