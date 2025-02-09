import cron from "node-cron";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";
import { sendEmail } from "../services/emailService.js";
import { auctionExpiredEmailTemplate } from "./emailTemplates.js";

const closeExpiredAuctions = async () => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({
      status: "open",
      expiresAt: { $lte: now },
    }).populate({
      path: "repairRequest",
      populate: { path: "customer", select: "email username" },
    });

    let processedCount = 0;

    await Promise.all(
      expiredAuctions.map(async (auction) => {
        try {
          // Close auction
          auction.status = "closed";
          await auction.save();

          // Update repair request if no bids
          if (auction.bids.length === 0)
            await RepairRequest.findByIdAndUpdate(auction.repairRequest._id, {
              status: "cancelled",
            });

          // Send notification
          if (auction.repairRequest?.customer?.email)
            await sendExpiryNotification(auction);

          processedCount++;
        } catch (err) {
          console.error(`Error processing auction ${auction._id}:`, err);
        }
      })
    );

    console.log(
      `Successfully processed ${processedCount}/${expiredAuctions.length} expired auctions`
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
