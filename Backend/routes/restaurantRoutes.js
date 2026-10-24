import express from "express";
import {getRestaurants,getCities,getRestaurantById,getRestaurantMenu, getHomeExtras} from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/", getRestaurants);
router.get("/cities", getCities);
router.get("/home", getHomeExtras);      // must be above "/:id"
router.get("/:id", getRestaurantById);
router.get("/:id/menu", getRestaurantMenu);

export default router;