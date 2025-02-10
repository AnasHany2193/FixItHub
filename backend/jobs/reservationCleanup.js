import cron from "node-cron";
import { restoreExpiredReservations } from "../services/reservationService.js";

export const startReservationCleanup = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("[CRON] Starting reservation cleanup...");
      await restoreExpiredReservations();
      console.log("[CRON] Reservation cleanup completed");
    } catch (error) {
      console.error("[CRON] Cleanup failed:", error.message);
    }
  });
};
