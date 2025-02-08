import cron from "node-cron";
import Auction from "../models/Auction.js";
import RepairRequest from "../models/RepairRequest.js";

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

      // Notify customer via email (pseudo-code)
      const repairRequest = await RepairRequest.findById(
        auction.repairRequest
      ).populate("customer", "email");
      // sendEmail(
      //   repairRequest.customer.email,
      //   "Auction Expired",
      //   `Your auction for ${repairRequest.itemType} has expired.`
      // );
    }

    console.log(`Closed ${expiredAuctions.length} expired auctions`);
  } catch (err) {
    console.error("Error closing expired auctions:", err);
  }
});
