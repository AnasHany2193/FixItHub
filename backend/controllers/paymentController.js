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

const validateRepairRequest = async (userId, repairId) => {
  const repair = await RepairRequest.findOne({
    _id: repairId,
    customer: userId,
    status: { $in: ["in_progress", "completed"] },
  }).populate("worker");

  if (!repair) throw createHttpError(404, "Repair request not found");
  if (!repair.paymentAmount)
    throw createHttpError(400, "Payment amount not set");
  return repair;
};

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
export const createRepairPaymentIntent = async (req, res, next) => {
  try {
    const repair = await validateRepairRequest(req.user._id, req.body.repairId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(repair.paymentAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: "repair",
        repairId: repair._id.toString(),
      },
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

export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return next(createHttpError(400, `Webhook Error: ${err.message}`));
  }

  try {
    const paymentIntent = event.data.object;
    const handlers =
      paymentIntent.metadata.type === "product"
        ? productPaymentHandlers
        : repairPaymentHandlers;

    switch (event.type) {
      case "payment_intent.succeeded":
        const entity = await handlers.getEntity(paymentIntent);
        if (entity) await handlers.handleSuccess(entity, paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedEntity = await handlers.getEntity(paymentIntent);
        if (failedEntity) await handlers.handleFailure(failedEntity);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    next(createHttpError(500, "Error processing webhook"));
  }
};
