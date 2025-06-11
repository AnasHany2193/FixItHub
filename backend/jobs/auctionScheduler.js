import cron from "node-cron";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import RepairRequest, { RepairStatus } from "../models/RepairRequest.js";
import { sendEmail } from "../services/emailService.js";
import { auctionExpiredEmailTemplate } from "../utils/emailTemplates.js";

// Simplified Cron Job
cron.schedule("* * * * */5", async () => {
  try {
    console.log("🔧 Running auction cleanup job...");

    const expiredAuctions = await Auction.find({
      status: "open",
      expiresAt: { $lte: new Date() },
    }).populate({
      path: "repairRequest",
      select: "customer status itemType",
      populate: { path: "customer", select: "email" },
    });

    for (const auction of expiredAuctions) {
      auction.status = "closed";
      await auction.save();

      // Delete associated bids
      await Bid.deleteMany({ auction: auction._id });

      // Update the related repair request
      const repair = await RepairRequest.findById(auction.repairRequest._id);

      repair.auction = null;
      repair.offers = [];
      repair.status = RepairStatus.AWAITING_ASSIGNMENT;
      await repair.save();

      console.log(`✅ Closed auction for repair request: ${repair._id}`);

      // Send email to the customer if email exists
      const email = auction.repairRequest.customer?.email;
      if (email) await sendAuctionExpiryEmail(auction);
    }
  } catch (error) {
    console.error("❌ Auction closure error:", error.message);
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
    console.error("❌ Email sending failed:", error.message);
  }
};
