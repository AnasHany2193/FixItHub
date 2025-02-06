import createHttpError from "http-errors";

import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

import {
  allowedCategories,
  allowedConditions,
  allowedStatuses,
} from "../utils/constants.js";

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
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const {
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
      status,
    } = req.body;

    // 1. Fetch product and validate ownership
    const product = await Product.findById(id);
    if (!product) throw createHttpError(404, "Product not found.");
    if (product.seller.toString() !== userId.toString())
      throw createHttpError(403, "You are not the seller of this product.");

    // 2. Destructure and validate updates
    const updates = {};

    if (title) {
      if (title.length < 3 || title.length > 100)
        throw createHttpError(400, "Title must be 3-100 characters.");

      updates.title = title;
    }

    if (description) {
      if (description.length > 1000)
        throw createHttpError(
          400,
          "Description cannot exceed 1000 characters."
        );

      updates.description = description;
    }

    if (price) {
      if (typeof price !== "number" || price <= 0)
        throw createHttpError(400, "Price must be a positive number.");

      updates.price = price;
    }

    if (category) {
      if (!allowedCategories.includes(category)) {
        throw createHttpError(400, "Invalid product category.");
      }
      updates.category = category;
    }

    if (condition) {
      if (!allowedConditions.includes(condition))
        throw createHttpError(400, "Invalid product condition.");

      updates.condition = condition;
    }

    if (images) {
      if (!Array.isArray(images) || images.length === 0)
        throw createHttpError(400, "Images must be a non-empty array.");

      // Validate image URLs and public_ids
      images.forEach((img) => {
        if (!img.url || !img.public_id)
          throw createHttpError(400, "Image URL and public_id are required.");
      });
      updates.images = images;
    }

    if (location) {
      if (
        !location.coordinates ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
      )
        throw createHttpError(400, "Invalid coordinates format.");

      updates.location = location;
    }

    if (status) {
      if (!allowedStatuses.includes(status))
        throw createHttpError(400, "Invalid product status.");

      updates.status = status;
    }

    // 3. Delete old images if updated
    if (updates.images) {
      const oldPublicIds = product.images.map((img) => img.public_id);
      const newPublicIds = updates.images.map((img) => img.public_id);
      const deletedPublicIds = oldPublicIds.filter(
        (id) => !newPublicIds.includes(id)
      );

      // Delete from Cloudinary
      await Promise.all(
        deletedPublicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId)
        )
      );
    }

    // 4. Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("seller", "username profile.avatar");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Find product and validate ownership
    const product = await Product.findById(id);
    if (!product) throw createHttpError(404, "Product not found.");
    if (product.seller.toString() !== userId.toString())
      throw createHttpError(403, "You are not the seller of this product.");

    // 2. Delete images from Cloudinary
    const publicIds = product.images.map((img) => img.public_id);
    await Promise.all(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
    );

    // 3. Delete product from database
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
