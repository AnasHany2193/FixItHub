import Stripe from "stripe";
import createHttpError from "http-errors";

import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

import {
  paymentFailedEmailTemplate,
  paymentSuccessEmailTemplate,
  workerPaymentReceivedEmailTemplate,
} from "../utils/emailTemplates.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for a repair request
export const createRepairPaymentIntent = async (req, res) => {
  try {
    const { repairRequestId } = req.body;

    // Validate repair request
    const repairRequest = await RepairRequest.findOne({
      _id: repairRequestId,
      customer: req.user._id,
      status: { $in: ["in_progress", "completed"] },
    }).populate("worker", "stripeAccountId");
    if (!repairRequest) throw createHttpError(404, "Repair request not found");
    if (!repairRequest.paymentAmount)
      throw createHttpError(400, "Payment amount not set");

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(repairRequest.paymentAmount * 100),
      currency: "usd",
      metadata: {
        repairRequestId: repairRequestId.toString(),
        customerId: req.user._id.toString(),
      },
      transfer_data: repairRequest.worker?.stripeAccountId
        ? {
            destination: repairRequest.worker.stripeAccountId,
          }
        : undefined,
      automatic_payment_methods: { enabled: true },
    });

    // Update repair request
    repairRequest.paymentIntentId = paymentIntent.id;
    await repairRequest.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: repairRequest.paymentAmount,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Handle Stripe webhooks
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
    return res.status(400).json({
      success: false,
      error: `Webhook Error: ${err.message}`,
    });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Helper: Update repair request on successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  const repairRequest = await RepairRequest.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    {
      paymentStatus: "paid",
      $push: {
        trackingUpdates: {
          status: "payment_received",
          details: `Payment ID: ${paymentIntent.id}`,
        },
      },
    },
    { new: true }
  ).populate("worker customer");

  if (!repairRequest) throw new Error("Repair request not found for payment");

  // Close associated auction
  await Auction.findOneAndUpdate(
    { repairRequest: repairRequest._id },
    { status: "closed" }
  );

  // Send notifications
  await Promise.all([
    sendEmail({
      to: repairRequest.customer.email,
      subject: "✅ Payment Confirmed",
      html: paymentSuccessEmailTemplate({
        itemType: repairRequest.itemType,
        amount: paymentIntent.amount / 100,
        repairId: repairRequest._id,
      }),
    }),
    repairRequest.worker?.email &&
      sendEmail({
        to: repairRequest.worker.email,
        subject: "💰 Payment Received",
        html: workerPaymentReceivedEmailTemplate({
          itemType: repairRequest.itemType,
          amount: paymentIntent.amount / 100,
          repairId: repairRequest._id,
        }),
      }),
  ]);
};

// Add these helper functions
const handlePaymentFailure = async (paymentIntent) => {
  const repairRequest = await RepairRequest.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    {
      paymentStatus: "failed",
      $push: {
        trackingUpdates: {
          status: "payment_failed",
          details: paymentIntent.last_payment_error?.message || "Unknown error",
        },
      },
    },
    { new: true }
  ).populate("customer");

  if (repairRequest?.customer?.email)
    await sendEmail({
      to: repairRequest.customer.email,
      subject: "⚠️ Payment Failed",
      html: paymentFailedEmailTemplate({
        itemType: repairRequest.itemType,
        amount: paymentIntent.amount / 100,
      }),
    });
};
