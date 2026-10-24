import mongoose from "mongoose";
import { z } from "zod";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import { priceBill } from "../utils/priceBill.js";

const STATUS_STEPS = ["Pending", "Preparing", "Out for delivery", "Delivered"];
const STATUS_INTERVAL_MS = 12000; // demo speed, same as the frontend

const withStatus = (order) => {
  const idx = Math.floor((Date.now() - order.createdAt.getTime()) / STATUS_INTERVAL_MS);
  const statusIndex = Math.max(0, Math.min(idx, STATUS_STEPS.length - 1));
  return { ...order.toObject(), status: STATUS_STEPS[statusIndex], statusIndex };
};

const objectId = (message) =>
  z.string().refine((v) => mongoose.isValidObjectId(v), message);

const orderInputSchema = z.object({
  restaurantId: objectId("Invalid restaurant"),
  items: z
    .array(
      z.object({
        menuItemId: objectId("Invalid item"),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty")
    .max(30),
  address: z.string().trim().min(5, "Enter a full delivery address").max(300),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit phone number"),
  payment: z.enum(["cod", "upi", "card", "netbanking"]),
  promoCode: z.string().trim().max(20).optional().default(""),
});

// POST /api/orders   (protected)
export const createOrder = async (req, res) => {
  try {
    const parsed = orderInputSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { restaurantId, items, address, phone, payment, promoCode } = parsed.data;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    // Merge duplicate lines: the same dish listed twice becomes one quantity
    const qtyById = new Map();
    for (const item of items) {
      const key = item.menuItemId.toLowerCase();
      qtyById.set(key, (qtyById.get(key) || 0) + item.qty);
    }

    // Prices come from the DATABASE, never from the request
    const menuItems = await MenuItem.find({
      _id: { $in: [...qtyById.keys()] },
      restaurant: restaurant._id,
    });
    if (menuItems.length !== qtyById.size) {
      return res.status(400).json({ message: "Some items are not available from this restaurant" });
    }

    const orderItems = menuItems.map((m) => ({
      menuItem: m._id,
      name: m.name,
      price: m.price,
      qty: qtyById.get(String(m._id)),
      isVeg: m.isVeg,
    }));
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    const ordersCount = await Order.countDocuments({ user: req.user._id });
    const bill = priceBill(subtotal, promoCode, ordersCount);
    if (bill.promoError) return res.status(400).json({ message: bill.promoError });

    const order = await Order.create({
      user: req.user._id, // from the cookie, never from the request body
      restaurant: restaurant._id,
      restaurantName: restaurant.name,
      city: restaurant.city,
      items: orderItems,
      address,
      phone,
      payment,
      promoCode: bill.promoApplied ? promoCode.trim().toUpperCase() : "",
      bill: {
        subtotal: bill.subtotal,
        discount: bill.discount,
        delivery: bill.delivery,
        taxes: bill.taxes,
        total: bill.total,
      },
    });

    res.status(201).json(withStatus(order));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders   (protected): only MY orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders.map(withStatus));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/:id   (protected): only if it's MINE
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(withStatus(order));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};