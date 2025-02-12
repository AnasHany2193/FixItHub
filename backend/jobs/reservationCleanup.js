import cron from "node-cron";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import Product from "../models/Product.js";
import Reservation from "../models/Reservation.js";

/**
 * @desc    Restores stock from expired reservations
 * @async
 * @returns {Promise<void>}
 */
const restoreExpiredReservations = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cutoffDate = new Date();
    console.log(
      `[CRON] Cleaning reservations expiring before ${cutoffDate.toISOString()}`
    );

    // Find expiring reservations with inventory impact
    const expiredReservations = await Reservation.find({
      status: "active",
      expiresAt: { $lte: cutoffDate },
    }).session(session);

    if (!expiredReservations.length) {
      console.log("[CRON] No expired reservations found");
      return;
    }

    // Bulk update products
    const bulkOps = expiredReservations.map((reservation) => ({
      updateOne: {
        filter: { _id: reservation.product },
        update: {
          $inc: {
            stock: reservation.quantity,
            reservedStock: -reservation.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(bulkOps, { session });

    // Bulk update reservations
    await Reservation.updateMany(
      { _id: { $in: expiredReservations.map((r) => r._id) } },
      { $set: { status: "expired" } },
      { session }
    );

    await session.commitTransaction();
    console.log(`[CRON] Updated ${expiredReservations.length} reservations`);
  } catch (error) {
    await session.abortTransaction();
    console.error("[CRON] Reservation cleanup failed:", error);
    throw createHttpError.InternalServerError(
      "Reservation cleanup failed: " + error.message
    );
  } finally {
    session.endSession();
  }
};

cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Starting reservation cleanup job...");
  try {
    await restoreExpiredReservations();
    console.log("[CRON] Reservation cleanup completed");
  } catch (error) {
    console.error("[CRON] Reservation cleanup failed:", error.message);
  }
});
