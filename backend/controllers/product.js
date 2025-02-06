import createHttpError from "http-errors";
import Product from "../models/Product.js";

// POST /products - Create a new product (only customers allowed)
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, condition, images, location } =
      req.body;

    // Validate required fields
    if (!title || !description || !price || !category)
      throw createHttpError(400, "Missing required fields");

    // Ensure price is a positive number
    if (price <= 0)
      throw createHttpError(400, "Price must be a positive number.");

    // Ensure images are provided
    if (!images || images.length === 0)
      throw createHttpError(400, "At least one image is required.");

    // Create product
    const product = await Product.create({
      title,
      description,
      price,
      category,
      condition: condition || "used", // Default to "used" if not provided
      images,
      location,
      seller: req.user._id, // Seller = logged-in user
    });

    res.status(201).json({
      data: product,
      success: true,
      message: "Product created successfully",
    });
  } catch (err) {
    next(err);
  }
};
