import dotenv from "dotenv";
import Stripe from "stripe";

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import RepairRequest from "../models/RepairRequest.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createRepairPaymentSession = async (req, res) => {
  try {
    const { repairId } = req.body;
    const userId = req.user._id;

    // Validate repair ownership and status
    const repair = await RepairRequest.findOne({
      _id: repairId,
      customer: userId,
      paymentStatus: "pending",
    }).populate({
      path: "worker",
      select: "username profile.avatar", // Get worker details
    });

    if (!repair) {
      return res.status(400).json({
        success: false,
        message: "Repair not found or payment not required",
      });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Repair Service Fee",
              description: "Base service charge",
            },
            unit_amount: Math.round(repair.paymentAmount * 100 * 0.7),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Parts & Materials",
              description: "Replacement components",
            },
            unit_amount: Math.round(repair.paymentAmount * 100 * 0.3),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "repair",
        repairId: repairId.toString(),
        repairTitle: repair.title,
        workerName: repair.worker?.username || "",
        workerAvatar: repair.worker?.profile?.avatar.url || "",
        itemType: repair.itemType,
      },
      success_url: `${process.env.CLIENT_URL}/repairs/${repairId}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/repairs/${repairId}?payment=cancelled`,
    });

    // Save session ID to repair
    repair.paymentIntentId = session.id;
    await repair.save();

    res.status(200).json({
      success: true,
      url: session.url,
      repairId: repairId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment session creation failed",
      error: error.message,
    });
  }
};

const handleRepairWebhook = async (event) => {
  const session = event.data.object;

  try {
    const repair = await RepairRequest.findOneAndUpdate(
      { paymentIntentId: session.id, paymentStatus: "pending" },
      {
        paymentStatus: "paid",
        status: "in_progress",
        $push: {
          trackingUpdates: {
            status: "payment_received",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!repair) console.warn(`Repair not found for session ID: ${session.id}`);
  } catch (error) {
    console.error("Repair webhook processing error:", error);
  }
};

export const createOrderPaymentSession = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's cart with products
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .lean();

    if (!cart || cart.items.length === 0)
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });

    // Calculate total and validate stock
    let total = 0;
    const lineItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has insufficient stock`,
        });
      }

      total += product.price * item.quantity;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.category,
            image: product.images[0].url,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Create order in processing state
    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      total,
      paymentIntentId: "",
      status: "processing",
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        type: "order",
        orderId: order._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/marketplace/orders/${order._id}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/marketplace/cart?payment=cancelled`,
    });

    // Save payment intent to order
    order.paymentIntentId = session.id;
    await order.save();

    res.status(200).json({
      success: true,
      url: session.url,
      orderId: order._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment session creation failed",
      error: error.message,
    });
  }
};

// Handle order payment webhook
export const handleOrderWebhook = async (event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Update order status and stock
      const order = await Order.findOneAndUpdate(
        {
          paymentIntentId: session.id,
          status: "processing",
        },
        { status: "completed" },
        { new: true }
      ).populate("items.product");

      if (!order) {
        console.warn(`Order not found for session ID: ${session.id}`);
        return;
      }

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [] } }
      );
    } catch (error) {
      console.error("Order webhook processing error:", error);
    }
  }
};

// Unified webhook handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const session = event.data.object;
    const { type } = session.metadata;

    // Handle different payment types
    switch (type) {
      case "repair":
        await handleRepairWebhook(event);
        break;
      case "order":
        await handleOrderWebhook(event);
        break;
      default:
        console.warn("Unknown webhook type:", type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
