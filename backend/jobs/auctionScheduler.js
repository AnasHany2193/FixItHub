import cron from "node-cron";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";
import { sendEmail } from "../services/emailService.js";
import { auctionExpiredEmailTemplate } from "../utils/emailTemplates.js";

const closeExpiredAuctions = async () => {
  try {
    const now = new Date();

    // Find auctions that should be closed
    const expiredAuctions = await Auction.find({
      status: "open",
      expiresAt: { $lte: now },
    }).populate({
      path: "repairRequest",
      populate: { path: "customer", select: "email username" },
    });

    // Bypass validation when closing auctions
    await Auction.updateMany(
      { _id: { $in: expiredAuctions.map((a) => a._id) } },
      { $set: { status: "closed" } },
      { runValidators: false } // Disable validation for bulk update
    );

    // Process individual auctions
    await Promise.all(
      expiredAuctions.map(async (auction) => {
        try {
          // Refresh auction data after bulk update
          const updatedAuction = await Auction.findById(auction._id);

          // Handle bids and notifications
          if (updatedAuction.bids.length === 0)
            await RepairRequest.findByIdAndUpdate(
              updatedAuction.repairRequest._id,
              { status: "cancelled" }
            );

          // Send notifications
          if (updatedAuction.repairRequest?.customer?.email)
            await sendExpiryNotification(updatedAuction);
        } catch (err) {
          console.error(`Error processing auction ${auction._id}:`, err);
        }
      })
    );
  } catch (err) {
    console.error("Critical error in auction scheduler:", err);
  }
};

const sendExpiryNotification = async (auction) => {
  try {
    const { repairRequest } = auction;
    const hasBids = auction.bids.length > 0;

    await sendEmail({
      to: repairRequest.customer.email,
      subject: `⏰ Auction Expired - ${repairRequest.itemType}`,
      html: auctionExpiredEmailTemplate({
        itemType: repairRequest.itemType,
        auctionId: auction._id,
        userName: repairRequest.customer.username,
        hasBids,
        bidCount: auction.bids.length,
      }),
    });
  } catch (emailError) {
    console.error("Failed to send expiry email:", emailError);
  }
};

// Run every 5 minutes for better accuracy
cron.schedule("*/5 * * * *", closeExpiredAuctions);
