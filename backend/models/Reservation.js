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

// ✅ Fix: Delete exactly at expiration time
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

reservationSchema.pre("save", async function () {
  const product = await mongoose.model("Product").findById(this.product);
  if (product.availableStock < this.quantity)
    throw new Error("Not enough stock available");
});

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
