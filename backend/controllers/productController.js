import createHttpError from "http-errors";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Reservation from "../models/Reservation.js";
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
    const {
      q,
      type,
      category,
      minPrice,
      maxPrice,
      condition,
      page = 1,
      limit = 10,
      sort = "-createdAt",
      lng,
      lat,
      radius = 5000, // Radius in meters
    } = req.query;
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

    if (lng && lat)
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      };

    const validSorts = ["price", "-price", "createdAt", "-createdAt"];
    const sortBy = validSorts.includes(sort) ? sort : "-createdAt";

    const products = await Product.find(filter)
      .populate("worker", "username profile.avatar rating")
      .populate("repairRequest", "title")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortBy)
      .select("-reservedStock") // Exclude reserved stock from public view
      .lean();

    const results = products.map((p) => ({
      ...p,
      availableStock: p.stock - p.reservedStock,
    }));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: products.length
        ? `Found ${products.length} matching items 🔍`
        : "No products match your search criteria",
      data: { products, results },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reserveStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const reservationDuration = 15 * 60 * 1000; // 15 minutes

    const product = await Product.findById(req.params.id);

    if (product.stock - product.reservedStock < quantity)
      return next(createHttpError(400, "Not enough available stock"));

    // Atomic update
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { reservedStock: quantity } },
      { new: true }
    );

    const reservation = await Reservation.create({
      product: req.params.id,
      user: req.user._id,
      quantity,
      expiresAt: new Date(Date.now() + reservationDuration),
    });

    res.status(200).json({
      success: true,
      message: `Stock reserved for 15 minutes`,
      data: {
        reservationId: reservation._id,
        expiresAt: reservation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findOne({
      _id: reservationId,
      user: req.user._id,
      status: "active",
    });

    if (!reservation)
      return next(createHttpError(400, "Invalid or expired reservation"));

    // Finalize reservation
    await Product.findByIdAndUpdate(reservation.product, {
      $inc: {
        stock: -reservation.quantity,
        reservedStock: -reservation.quantity,
      },
    });

    reservation.status = "completed";
    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reservation confirmed and stock updated",
    });
  } catch (error) {
    next(error);
  }
};

export const trackProductView = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    next();
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("worker", "username profile.avatar rating")
      .populate("repairRequest", "title");

    if (!product) return next(createHttpError(404, "Product not found"));

    res.status(200).json({
      success: true,
      message: "Product details retrieved successfully 🔍",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { action, quantity } = req.body;

    // Validate action type
    if (!["restock", "reserve"].includes(action))
      return next(createHttpError(400, "Invalid stock action"));

    const update =
      action === "restock"
        ? { $inc: { stock: quantity } }
        : { $inc: { stock: -quantity }, $min: { stock: 0 } };

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        worker: req.user._id,
        ...(action === "reserve" && { stock: { $gte: quantity } }),
      },
      update,
      { new: true, runValidators: true }
    );

    if (!product)
      return next(
        createHttpError(
          404,
          action === "reserve"
            ? "Insufficient stock or product not found"
            : "Product not found"
        )
      );

    res.status(200).json({
      success: true,
      message: `Stock ${action} successful. Current stock: ${product.stock}`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getSimilarProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    const similar = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .populate("worker", "username rating");

    res.status(200).json({
      success: true,
      message: "Similar products you might like",
      data: similar,
    });
  } catch (error) {
    next(error);
  }
};
