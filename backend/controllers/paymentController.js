import Stripe from "stripe";
import createHttpError from "http-errors";
import { sendEmail } from "../services/emailService.js";

import Product from "../models/Product.js";
import Reservation from "../models/Reservation.js";
import RepairRequest from "../models/RepairRequest.js";

import {
  paymentFailedEmailTemplate,
  paymentSuccessEmailTemplate,
  productPaymentSuccessTemplate,
  workerNewOrderTemplate,
  workerPaymentReceivedEmailTemplate,
} from "../utils/emailTemplates.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Create Stripe payment session for repair
 * @route   POST /api/v1/payment/create-checkout-session
 * @access  Private (Customer)
 */
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
        repairId: repairId.toString(),
        repairTitle: repair.title,
        workerName: repair.worker?.username || "",
        workerAvatar: repair.worker?.profile?.avatar || "",
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
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment session creation failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/v1/payment/webhook
 * @access  Public (Stripe)
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment success
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const repair = await RepairRequest.findOneAndUpdate(
        {
          paymentIntentId: session.id,
          paymentStatus: "pending",
        },
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

      if (!repair) {
        console.warn(`Repair not found for session ID: ${session.id}`);
      }
    } catch (error) {
      console.error("Webhook processing error:", error);
    }
  }

  res.status(200).json({ success: true });
};

// ===================== Middleware =====================
export const paymentResponseFormatter = (req, res, next) => {
  res.jsonPaymentIntent = function (paymentIntent) {
    this.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      },
    });
  };
  next();
};

// ===================== Helpers =====================
const createPaymentRecord = (status, paymentId) => ({
  status,
  paymentId,
  timestamp: new Date(),
});

const validateProductReservation = async (userId, reservationId) => {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    user: userId,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).populate("product");

  if (!reservation) throw createHttpError(400, "Invalid reservation");
  if (reservation.product.stock < reservation.quantity) {
    throw createHttpError(400, "Insufficient stock");
  }
  return reservation;
};

// ===================== Payment Handlers =====================
const productPaymentHandlers = {
  getEntity: async (paymentIntent) => {
    return await Reservation.findById(
      paymentIntent.metadata.reservationId
    ).populate("product user");
  },

  handleSuccess: async (reservation, paymentIntent) => {
    await Promise.all([
      Reservation.findByIdAndUpdate(reservation._id, {
        status: "completed",
        payment: createPaymentRecord("succeeded", paymentIntent.id),
      }),
      Product.findByIdAndUpdate(reservation.product._id, {
        $inc: { stock: -reservation.quantity },
      }),
    ]);

    const emails = [
      sendEmail({
        to: reservation.user.email,
        subject: `Order Confirmation #${reservation._id}`,
        html: productPaymentSuccessTemplate(reservation),
      }),
      sendEmail({
        to: reservation.product.worker.email,
        subject: `New Order Received!`,
        html: workerNewOrderTemplate(reservation),
      }),
    ];

    await Promise.all(emails);
  },

  handleFailure: async (reservation) => {
    await Reservation.findByIdAndUpdate(reservation._id, {
      status: "payment_failed",
      payment: createPaymentRecord("failed", null),
    });

    await sendEmail({
      to: reservation.user.email,
      subject: "Product Payment Failed",
      html: paymentFailedEmailTemplate(
        "product",
        reservation.product.price * reservation.quantity
      ),
    });
  },
};

const repairPaymentHandlers = {
  getEntity: async (paymentIntent) => {
    return await RepairRequest.findById(
      paymentIntent.metadata.repairId
    ).populate("customer worker");
  },

  handleSuccess: async (repair, paymentIntent) => {
    await RepairRequest.findByIdAndUpdate(repair._id, {
      status: "completed",
      payment: createPaymentRecord("succeeded", paymentIntent.id),
    });

    const emails = [
      sendEmail({
        to: repair.customer.email,
        subject: `Repair Payment Confirmation #${repair._id}`,
        html: paymentSuccessEmailTemplate(
          "repair",
          paymentIntent.amount / 100,
          repair._id
        ),
      }),
      sendEmail({
        to: repair.worker.email,
        subject: `Payment Received for Repair #${repair._id}`,
        html: workerPaymentReceivedEmailTemplate(
          "repair",
          paymentIntent.amount / 100
        ),
      }),
    ];

    await Promise.all(emails);
  },

  handleFailure: async (repair) => {
    await RepairRequest.findByIdAndUpdate(repair._id, {
      status: "payment_failed",
      payment: createPaymentRecord("failed", null),
    });

    await sendEmail({
      to: repair.customer.email,
      subject: "Repair Payment Failed",
      html: paymentFailedEmailTemplate("repair", repair.paymentAmount),
    });
  },
};

// ===================== Controllers =====================

export const createProductPaymentIntent = async (req, res, next) => {
  try {
    const reservation = await validateProductReservation(
      req.user._id,
      req.body.reservationId
    );
    const amount = reservation.product.price * reservation.quantity;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: "product",
        reservationId: reservation._id.toString(),
      },
    });

    await Reservation.findByIdAndUpdate(reservation._id, {
      paymentIntentId: paymentIntent.id,
    });

    res.jsonPaymentIntent(paymentIntent);
  } catch (error) {
    next(error);
  }
};
