import dotenv from "dotenv";
import Stripe from "stripe";
import RepairRequest from "../models/RepairRequest.js";

dotenv.config();
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
