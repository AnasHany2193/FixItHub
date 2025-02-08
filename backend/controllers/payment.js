import Stripe from "stripe";
import createHttpError from "http-errors";

import RepairRequest from "./../models/RepairRequest.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for a repair request
export const createRepairPaymentIntent = async (req, res) => {
  try {
    const { repairRequestId, amount } = req.body;

    // Validate repair request exists and belongs to customer
    const repairRequest = await RepairRequest.findOne({
      _id: repairRequestId,
      customer: req.user._id,
    });
    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: { repairRequestId: repairRequestId.toString() },
      automatic_payment_methods: { enabled: true },
    });

    // Link payment intent to repair request
    repairRequest.paymentIntentId = paymentIntent.id;
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
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
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
