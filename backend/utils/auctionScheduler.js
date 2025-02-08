import cron from "node-cron";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";
import { sendEmail } from "./../services/emailService.js";
import { auctionExpiredEmailTemplate } from "./emailTemplates.js";

// Run every hour
cron.schedule("0 * * * *", async () => {
  try {
    const expiredAuctions = await Auction.find({
      status: "open",
      expiresAt: { $lte: new Date() },
    });

    for (const auction of expiredAuctions) {
      auction.status = "closed";
      await auction.save();

      // Notify customer via email
      const repairRequest = await RepairRequest.findById(
        auction.repairRequest
      ).populate("customer", "email username");

      if (repairRequest?.customer?.email) {
        await sendEmail({
          to: repairRequest.customer.email,
          subject: `⏰ Auction Expired - ${repairRequest.itemType}`,
          html: auctionExpiredEmailTemplate(
            repairRequest.itemType,
            auction._id,
            repairRequest.customer.username
          ),
        });
      }
    }

    console.log(`Closed ${expiredAuctions.length} expired auctions`);
  } catch (err) {
    console.error("Error closing expired auctions:", err);
  }
});
