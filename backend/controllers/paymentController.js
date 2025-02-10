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

// ===================== Middleware =====================
export const paymentResponseFormatter = (req, res, next) => {
  res.jsonPaymentIntent = function (paymentIntent) {
    this.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
      },
    });
  };
  next();
};

// ===================== Helpers =====================
const createPaymentUpdate = (status, paymentId) => ({
  status,
  location: "Payment Gateway",
  details: `Transaction ID: ${paymentId}`,
  timestamp: new Date(),
});

const validateRepairPayment = async (req) => {
  const { repairId } = req.body;
  const repair = await RepairRequest.findOne({
    _id: repairId,
    customer: req.user._id,
    status: { $in: ["in_progress", "completed"] },
  }).populate("worker");

  if (!repair) throw createHttpError(404, "Repair request not found");
  if (!repair.paymentAmount)
    throw createHttpError(400, "Payment amount not set");
  return repair;
};

const validateProductReservation = async (req) => {
  const { reservationId } = req.body;
  const reservation = await Reservation.findOne({
    _id: reservationId,
    user: req.user._id,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).populate("product");

  if (!reservation) throw createHttpError(400, "Invalid reservation");
  if (reservation.product.stock < reservation.quantity)
    throw createHttpError(400, "Insufficient stock");
  return reservation;
};

// ===================== Payment Handlers =====================
const createPaymentIntent = async (amount, metadata, updateFn) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata,
  });
};

const handlePaymentSuccess = async (paymentIntent, handlers) => {
  try {
    const entity = await handlers.getEntity(paymentIntent);
    if (!entity) return;

    await handlers.updateEntity(entity, paymentIntent);

    const emails = handlers
      .emailTemplates(entity, paymentIntent)
      .filter((template) => template)
      .map((template) => sendEmail(template));

    await Promise.all(emails);
  } catch (error) {
    console.error("Payment success handling failed:", error);
  }
};

const handleFailedPayment = async (paymentIntent, handlers) => {
  try {
    const entity = await handlers.getEntity(paymentIntent);
    if (!entity) return;

    await handlers.updateFailedEntity(entity, paymentIntent);

    const emails = handlers
      .failureTemplates(entity, paymentIntent)
      .filter((template) => template)
      .map((template) => sendEmail(template));

    await Promise.all(emails);
  } catch (error) {
    console.error("Payment failure handling failed:", error);
  }
};

// ===================== Controllers =====================
export const createRepairPaymentIntent = async (req, res, next) => {
  try {
    const repair = await validateRepairPayment(req);
    const paymentIntent = await createPaymentIntent(repair.paymentAmount, {
      type: "repair",
      repairId: repair._id.toString(),
    });

    await RepairRequest.findByIdAndUpdate(repair._id, {
      paymentIntentId: paymentIntent.id,
    });

    res.jsonPaymentIntent(paymentIntent);
  } catch (error) {
    next(error);
  }
};

export const createProductPaymentIntent = async (req, res, next) => {
  try {
    const reservation = await validateProductReservation(req);
    const paymentIntent = await createPaymentIntent(
      reservation.product.price * reservation.quantity,
      { type: "product", reservationId: reservation._id.toString() }
    );

    await Reservation.findByIdAndUpdate(reservation._id, {
      paymentIntentId: paymentIntent.id,
    });

    res.jsonPaymentIntent(paymentIntent);
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const paymentIntent = event.data.object;
    const handlers =
      paymentIntent.metadata.type === "product"
        ? productHandlers
        : repairHandlers;

    if (event.type === "payment_intent.succeeded") {
      await handlePaymentSuccess(paymentIntent, handlers);
    } else if (event.type === "payment_intent.payment_failed") {
      await handleFailedPayment(paymentIntent, handlers);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    next(createHttpError(400, `Webhook Error: ${error.message}`));
  }
};
