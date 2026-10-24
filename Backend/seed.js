import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import MenuItem from "./models/MenuItem.js";
import Restaurant from "./models/Restaurant.js";
import { RESTAURANTS, MENU } from "./data/data.js";

const seed = async () => {
  try {
    //connect to database
    await connectDB();

    //clear old data
    await MenuItem.deleteMany({});
    await Restaurant.deleteMany({});

    //inserts restaurants
    const savedRestaurants = await Restaurant.insertMany(
      RESTAURANTS.map(({ id, ...rest }) => ({
        ...rest,
        legacyId: id,
        image: `/assets/restaurants/${id}.jpg`,
      })),
    );

    // 4. Lookup: old restaurant id -> new MongoDB _id
    const idMap = {};
    savedRestaurants.forEach((r) => {
      idMap[r.legacyId] = r._id;
    });

    // 5. Insert menu items, translating the short field names
    const savedItems = await MenuItem.insertMany(
      MENU.map((m) => ({
        legacyId: m.i,
        restaurant: idMap[m.r],
        name: m.n,
        description: m.d,
        price: m.p,
        isVeg: m.v,
        image: `/assets/menu/${m.i}.jpg`,
      })),
    );

    // 6. Report and finish
    console.log(`Seeded ${savedRestaurants.length} restaurants`);
    console.log(`Seeded ${savedItems.length} menu items`);
    await mongoose.connection.close();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};


seed();