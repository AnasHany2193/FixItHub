import Stripe from "stripe";
import createHttpError from "http-errors";

import RepairRequest from "./../models/RepairRequest.js";
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

    // Validate repair request exists and belongs to customer
    const repairRequest = await RepairRequest.findOne({
      _id: repairRequestId,
      customer: req.user._id,
    });
    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    // Validate payment amount exists (set during bid acceptance)
    if (!repairRequest.paymentAmount) {
      throw createHttpError(400, "No accepted bid found for this repair");
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: repairRequest.paymentAmount * 100,
      currency: "usd",
      metadata: { repairRequestId: repairRequestId.toString() },
      automatic_payment_methods: { enabled: true },
      idempotencyKey: repairRequestId.toString() + Date.now(), // Prevent duplicates
    });

    // Link payment intent to repair request
    repairRequest.paymentIntentId = paymentIntent.id;
    repairRequest.paymentAmount = paymentIntent.amount / 100; // Store USD amount

    await repairRequest.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
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
    console.error("⚠️ Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case "payment_intent.payment_failed":
      const failedIntent = event.data.object;
      await handleFailedPayment(failedIntent);
      break;
  }

  res.json({ received: true });
};

// Helper: Update repair request on successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  const repairRequest = await RepairRequest.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    {
      paymentStatus: "paid",
      $push: { trackingUpdates: { status: "payment_received" } },
    },
    { new: true }
  ).populate("customer worker");

  // Send confirmation emails
  await sendPaymentConfirmationEmails(repairRequest);
};

// Add these helper functions
const handleFailedPayment = async (paymentIntent) => {
  const repairRequest = await RepairRequest.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    {
      paymentStatus: "failed",
      $push: { trackingUpdates: { status: "payment_failed" } },
    },
    { new: true }
  ).populate("customer");

  if (repairRequest?.customer?.email) {
    await sendEmail({
      to: repairRequest.customer.email,
      subject: "⚠️ Payment Failed - FixItHub",
      html: paymentFailedEmailTemplate(
        repairRequest.itemType,
        paymentIntent.amount / 100
      ),
    });
  }
};

const sendPaymentConfirmationEmails = async (repairRequest) => {
  // Customer confirmation
  await sendEmail({
    to: repairRequest.customer.email,
    subject: "✅ Payment Confirmed - FixItHub",
    html: paymentSuccessEmailTemplate(
      repairRequest.itemType,
      repairRequest.paymentAmount,
      repairRequest._id
    ),
  });

  // Worker notification
  if (repairRequest.worker?.email) {
    await sendEmail({
      to: repairRequest.worker.email,
      subject: "💰 Payment Received - FixItHub",
      html: workerPaymentReceivedEmailTemplate(
        repairRequest.itemType,
        repairRequest.paymentAmount
      ),
    });
  }
};
