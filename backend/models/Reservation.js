import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-delete expired reservations after 1 hour
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
