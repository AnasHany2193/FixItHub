import createHttpError from "http-errors";
import mongoose from "mongoose";

/**
 * @typedef {Object} Reservation
 * @property {mongoose.Types.ObjectId} product - Reserved product reference
 * @property {mongoose.Types.ObjectId} user - User making reservation
 * @property {'active'|'completed'|'expired'} status - Reservation state
 * @property {number} quantity - Reserved item count
 * @property {Date} expiresAt - Auto-expiration timestamp
 */
const reservationSchema = new mongoose.Schema(
  {
    // Product and User References
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },

    // Reservation Details
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Minimum reservation quantity is 1"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL Index for automatic expiration
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Validate stock availability before saving
 * @throws {BadRequest} If insufficient stock
 */
reservationSchema.pre("save", async function () {
  const product = await mongoose.model("Product").findById(this.product);
  if (product.availableStock < this.quantity)
    throw createHttpError.BadRequest(
      `Only ${product.availableStock} items available for reservation`
    );
});

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
