import cron from "node-cron";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";
import { sendEmail } from "../services/emailService.js";
import { auctionExpiredEmailTemplate } from "../utils/emailTemplates.js";

// Simplified Cron Job
cron.schedule("*/5 * * * *", async () => {
  try {
    const expiredAuctions = await Auction.find({
      status: "open",
      expiresAt: { $lte: new Date() },
    }).populate("repairRequest", "customer status");

    for (const auction of expiredAuctions) {
      auction.status = "closed";
      await auction.save();

      if (!auction.bids.length) {
        await RepairRequest.findByIdAndUpdate(auction.repairRequest._id, {
          status: "cancelled",
        });
      }

      if (auction.repairRequest.customer?.email) {
        await sendAuctionExpiryEmail(auction);
      }
    }
  } catch (error) {
    console.error("Auction closure error:", error.message);
  }
});

const sendAuctionExpiryEmail = async (auction) => {
  try {
    const { repairRequest } = auction;
    await sendEmail({
      to: repairRequest.customer.email,
      subject: `Auction Ended - ${repairRequest.itemType}`,
      html: auctionExpiredEmailTemplate(repairRequest, auction),
    });
  } catch (error) {
    console.error("Email failed:", error.message);
  }
};
