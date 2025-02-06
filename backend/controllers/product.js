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

export const listProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      condition,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = { status: "available" }; // Only show available products

    // Category filter
    if (category) filter.category = category;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Condition filter
    if (condition) filter.condition = condition;

    // Text search (title/description)
    if (search) filter.$text = { $search: search };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch products with filters
    const products = await Product.find(filter)
      .populate("seller", "username profile.avatar")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Newest first

    // Count total matching products
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// controllers/product.js
export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "username profile.avatar") // Include seller details
      .lean(); // Convert to plain JS object

    if (!product) {
      throw createHttpError(404, "Product not found.");
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (err) {
    // Handle invalid ObjectId format (e.g., "123" instead of valid 24-character ID)
    if (err.name === "CastError") {
      return next(createHttpError(400, "Invalid product ID format."));
    }
    next(err);
  }
};
