import createHttpError from "http-errors";

import User from "../models/User.js";
import Product from "../models/Product.js";
import RepairRequest from "../models/RepairRequest.js";

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      category,
      condition,
      price,
      imageUrls,
      stock,
      repairRequest,
    } = req.body;

    // Validate images
    if (!imageUrls?.length)
      throw createHttpError(400, "At least one image is required");

    // Verify worker status
    const worker = await User.findById(req.user._id);
    if (!worker.isApprovedWorker())
      return next(
        createHttpError(
          403,
          "Account must be approved to list products. Complete your worker profile first."
        )
      );

    // Validate repair request ownership if provided
    if (req.body.repairRequest) {
      const repair = await RepairRequest.findOne({
        _id: req.body.repairRequest,
        worker: req.user._id,
      });

      if (!repair) {
        return next(
          createHttpError(
            403,
            "You can only link products to your own repair requests"
          )
        );
      }
    }

    const product = await Product.create({
      title,
      description,
      type,
      category,
      condition,
      price,
      photos: imageUrls.map((url) => ({
        url,
        public_id: url.split("/").pop().split(".")[0],
      })),
      stock,
      repairRequest,
      worker: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product listed successfully! 🎉",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      category,
      condition,
      price,
      imageUrls,
      stock,
    } = req.body;

    // Validate images
    if (!imageUrls?.length)
      throw createHttpError(400, "At least one image is required");

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, worker: req.user._id },
      {
        title,
        description,
        type,
        category,
        condition,
        price,
        photos: imageUrls.map((url) => ({
          url,
          public_id: url.split("/").pop().split(".")[0],
        })),
        stock,
      },
      { new: true, runValidators: true }
    );

    if (!product)
      return next(
        createHttpError(
          404,
          "Product not found or you don't have permission to edit this listing"
        )
      );

    res.status(200).json({
      success: true,
      message: "Product updated successfully 🔄",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      worker: req.user._id,
    });

    if (!product)
      return next(createHttpError(404, "Product not found or already removed"));

    res.status(200).json({
      success: true,
      message: "Product permanently deleted 🗑️",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ worker: req.user._id })
      .sort("-createdAt")
      .populate("repairRequest", "title status");

    res.status(200).json({
      success: true,
      message: `Found ${products.length} of your listings 📦`,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const { q, type, category, minPrice, maxPrice, condition } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (condition) filter.condition = condition;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    const products = await Product.find(filter)
      .populate("worker", "username profile.avatar rating")
      .populate("repairRequest", "title")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      message: products.length
        ? `Found ${products.length} matching items 🔍`
        : "No products match your search criteria",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
