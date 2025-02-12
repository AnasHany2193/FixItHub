import cron from "node-cron";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";
import { sendEmail } from "../services/emailService.js";
import { auctionExpiredEmailTemplate } from "../utils/emailTemplates.js";

/**
 * @desc    Closes expired auctions and updates related entities
 * @async
 * @returns {Promise<void>}
 */
const closeExpiredAuctions = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    console.log(
      `[CRON] Checking auctions expiring before ${now.toISOString()}`
    );

    // Find and lock expired auctions
    const expiredAuctions = await Auction.find({
      status: "open",
      expiresAt: { $lte: now },
    })
      .populate({
        path: "repairRequest",
        populate: { path: "customer", select: "email username" },
      })
      .session(session);

    if (!expiredAuctions.length) {
      console.log("[CRON] No expired auctions found");
      return;
    }

    // Bulk update auction status
    await Auction.updateMany(
      { _id: { $in: expiredAuctions.map((a) => a._id) } },
      { $set: { status: "closed" } },
      { session, runValidators: false }
    );

    // Process each auction's post-closure logic
    await Promise.all(
      expiredAuctions.map(async (auction) => {
        try {
          if (auction.bids.length === 0) {
            await RepairRequest.findByIdAndUpdate(
              auction.repairRequest._id,
              { status: "cancelled" },
              { session }
            );
          }

          if (auction.repairRequest?.customer?.email) {
            await sendExpiryNotification(auction, session);
          }
        } catch (error) {
          console.error(
            `[CRON] Error processing auction ${auction._id}:`,
            error
          );
          throw createHttpError.InternalServerError(
            `Auction processing failed: ${error.message}`
          );
        }
      })
    );
    await session.commitTransaction();
    console.log(
      `[CRON] Successfully closed ${expiredAuctions.length} auctions`
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("[CRON] Critical auction closure error:", error);
    throw createHttpError.InternalServerError(
      "Auction closure batch failed: " + error.message
    );
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Sends auction expiry notifications
 * @async
 * @param   {Auction} auction - Closed auction document
 * @param   {ClientSession} session - MongoDB session
 * @returns {Promise<void>}
 */
const sendExpiryNotification = async (auction) => {
  const MAX_RETRIES = 3;
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const { repairRequest } = auction;
      await sendEmail({
        to: repairRequest.customer.email,
        subject: `⏰ Auction Expired - ${repairRequest.itemType}`,
        html: auctionExpiredEmailTemplate({
          itemType: repairRequest.itemType,
          auctionId: auction._id,
          userName: repairRequest.customer.username,
          hasBids: auction.bids.length > 0,
          bidCount: auction.bids.length,
        }),
      });
      return;
    } catch (emailError) {
      attempts++;
      console.error(`[CRON] Email attempt ${attempts} failed:`, emailError);
      if (attempts === MAX_RETRIES)
        throw createHttpError.BadGateway(
          `Failed to send auction expiry email after ${MAX_RETRIES} attempts`
        );

      await new Promise((resolve) => setTimeout(resolve, 2000 * attempts));
    }
  }
};

// Schedule every 5 minutes with monitoring
cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Starting auction closure job...");
  try {
    await closeExpiredAuctions();
    console.log("[CRON] Auction closure job completed");
  } catch (error) {
    console.error("[CRON] Auction closure job failed:", error.message);
  }
});
