import Reservation from "../models/Reservation.js";
import Product from "../models/Product.js";

export const restoreExpiredReservations = async () => {
  const expiredReservations = await Reservation.find({
    status: "active",
    expiresAt: { $lte: new Date() },
  });

  for (const reservation of expiredReservations) {
    await Product.findByIdAndUpdate(reservation.product, {
      $inc: {
        stock: reservation.quantity,
        reservedStock: -reservation.quantity,
      },
    });

    reservation.status = "expired";
    await reservation.save();
  }
};
