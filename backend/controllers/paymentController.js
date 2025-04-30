import dotenv from "dotenv";
import Stripe from "stripe";

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import RepairRequest from "../models/RepairRequest.js";
import createHttpError from "http-errors";

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
    const { orderId } = req.body;

    let order, lineItems;

    if (orderId) {
      // Existing order flow
      order = await Order.findOne({
        _id: orderId,
        user: userId,
        status: "processing",
      }).populate("items.product");

      if (!order) throw createHttpError(404, "Order not found or completed");

      // Revalidate stock
      for (const item of order.items) {
        const product = await Product.findById(item.product._id);
        if (product.stock < item.quantity) {
          throw createHttpError(400, `${product.name} is out of stock`);
        }
      }

      lineItems = order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.category,
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      }));
    } else {
      // New order from cart flow
      const cart = await Cart.findOne({ user: userId })
        .populate("items.product")
        .lean();

      if (!cart?.items?.length) throw createHttpError(400, "Cart is empty");

      let total = 0;
      lineItems = [];

      for (const item of cart.items) {
        const product = item.product;
        if (product.stock < item.quantity) {
          throw createHttpError(400, `${product.name} is out of stock`);
        }
        total += product.price * item.quantity;
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { name: product.name, description: product.category },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        });
      }

      order = await Order.create({
        user: userId,
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        total,
        paymentIntentId: "",
        status: "processing",
      });

      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: { type: "order", orderId: order._id.toString() },
      success_url: `${process.env.CLIENT_URL}/marketplace/orders/${order._id}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/marketplace/orders/${order._id}?payment=cancelled`,
    });

    order.paymentIntentId = session.id;
    await order.save();

    res.status(200).json({
      success: true,
      url: session.url,
      orderId: order._id,
      message: "Please complete your payment in the new window",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Payment failed",
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
      await Promise.all(
        order.items.map(async (item) => {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: {
              stock: -item.quantity,
              purchasesCount: item.quantity,
            },
          });
        })
      );

      // Clear user's cart
      const cart = await Cart.findOneAndUpdate(
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

    const { type } = event.data.object.metadata;

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
