import Stripe from "stripe";
import createHttpError from "http-errors";

import RepairRequest from "../models/RepairRequest.js";

import {
  paymentFailedEmailTemplate,
  paymentSuccessEmailTemplate,
  workerPaymentReceivedEmailTemplate,
} from "../utils/emailTemplates.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for a repair request
export const createRepairPaymentIntent = async (req, res, next) => {
  try {
    const { repairId } = req.body;

    const repair = await RepairRequest.findOne({
      _id: repairId,
      customer: req.user._id,
      status: { $in: ["in_progress", "completed"] },
    }).populate("worker");

    if (!repair)
      throw createHttpError(
        404,
        "Repair request not found or not in payable state"
      );

    if (!repair.paymentAmount)
      throw createHttpError(
        400,
        "Payment amount not configured for this repair"
      );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(repair.paymentAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        repairId: repair._id.toString(),
        workerId: repair.worker._id.toString(),
      },
    });

    await RepairRequest.findByIdAndUpdate(repair._id, {
      paymentIntentId: paymentIntent.id,
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: repair.paymentAmount,
      },
      message: "Payment intent created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhooks
export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        await handleSuccessfulPayment(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handleFailedPayment(event.data.object);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    next(createHttpError(400, `Webhook Error: ${error.message}`));
  }
};

// Helper: Update repair request on successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const repair = await RepairRequest.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        paymentStatus: "paid",
        $push: {
          trackingUpdates: {
            status: "payment_received",
            location: "Payment Gateway",
            details: `Transaction ID: ${paymentIntent.id}`,
          },
        },
      },
      { new: true }
    ).populate("customer worker");

    if (!repair) {
      console.error("Repair not found for payment intent:", paymentIntent.id);
      return;
    }

    await Promise.all([
      sendEmail({
        to: repair.customer.email,
        subject: "Payment Confirmation",
        html: paymentSuccessEmailTemplate({
          itemType: repair.itemType,
          amount: paymentIntent.amount / 100,
          repairId: repair._id,
        }),
      }),
      repair.worker?.email &&
        sendEmail({
          to: repair.worker.email,
          subject: "Payment Received",
          html: workerPaymentReceivedEmailTemplate({
            itemType: repair.itemType,
            amount: paymentIntent.amount / 100,
            repairId: repair._id,
          }),
        }),
    ]);
  } catch (error) {
    console.error("Error processing successful payment:", error);
  }
};

// Add these helper functions
const handleFailedPayment = async (paymentIntent) => {
  try {
    const repair = await RepairRequest.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        paymentStatus: "failed",
        $push: {
          trackingUpdates: {
            status: "payment_failed",
            location: "Payment Gateway",
            details:
              paymentIntent.last_payment_error?.message ||
              "Unknown payment failure",
          },
        },
      },
      { new: true }
    ).populate("customer");

    if (repair?.customer?.email) {
      await sendEmail({
        to: repair.customer.email,
        subject: "Payment Failed",
        html: paymentFailedEmailTemplate({
          itemType: repair.itemType,
          amount: paymentIntent.amount / 100,
        }),
      });
    }
  } catch (error) {
    console.error("Error processing failed payment:", error);
  }
};
