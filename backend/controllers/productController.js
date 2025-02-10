import createHttpError from "http-errors";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Reservation from "../models/Reservation.js";
import RepairRequest from "../models/RepairRequest.js";
import {
  parseNumber,
  processImageUrls,
  processSingleImage,
  validateAndFormatCoordinates,
} from "../services/helperFunctions.js";

export const createProduct = async (req, res, next) => {
  try {
    // Destructure with location handling
    const { lng, lat, imageUrls, repairRequest, ...productData } = req.body;

    // 1. Validate Worker Status
    const worker = await User.findById(req.user._id);
    if (!worker?.isApprovedWorker())
      return next(
        createHttpError(
          403,
          "Account must be approved to list products. Complete your worker profile first."
        )
      );

    // 2. Validate Photos
    if (!imageUrls?.length || imageUrls.length > 5)
      return next(createHttpError(400, "1-5 product images required"));

    // 3. Validate Location
    const location = validateAndFormatCoordinates(lng, lat);
    if (lng || lat) {
      if (!location) return next(createHttpError(400, "Invalid coordinates"));
      productData.location = location;
    }

    // 4. Validate Repair Request
    if (repairRequest) {
      const validRepair = await RepairRequest.exists({
        _id: repairRequest,
        worker: req.user._id,
      });
      if (!validRepair)
        return next(createHttpError(403, "Invalid repair request"));
    }

    // 5. Create Product
    const product = await Product.create({
      ...productData,
      price: parseNumber(price, "Price"),
      stock: parseNumber(stock, "Stock"),
      photos: processImageUrls(imageUrls),
      worker: req.user._id,
      repairRequest,
      location,
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
    const { lng, lat, imageUrls, ...updateData } = req.body;

    // 1. Validate Photos
    if (imageUrls?.length > 5)
      return next(createHttpError(400, "Maximum 5 photos allowed"));

    // 2. Handle Location
    const location = validateAndFormatCoordinates(lng, lat);
    if (lng || lat) {
      if (!location) return next(createHttpError(400, "Invalid coordinates"));
      updateData.location = location;
    }

    // 3. Process Numeric Fields
    if (updateData.price)
      updateData.price = parseNumber(updateData.price, "Price");
    if (updateData.stock)
      updateData.stock = parseNumber(updateData.stock, "Stock");

    // 4. Update Product
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, worker: req.user._id },
      {
        ...updateData,
        photos: imageUrls?.map(processSingleImage),
      },
      { new: true, runValidators: true }
    );

    if (!product)
      return next(createHttpError(404, "Product not found or no permission"));

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
    // Validate and delete product
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      worker: req.user._id,
    });

    if (!product)
      return next(createHttpError(404, "Product not found or already removed"));

    // Verify cascade deletion
    const remainingReservations = await Reservation.countDocuments({
      product: req.params.id,
    });
    if (remainingReservations > 0)
      console.error(`Failed to delete ${remainingReservations} reservations`);

    res.status(200).json({
      success: true,
      message: "Product and associated reservations deleted 🗑️",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerProducts = async (req, res, next) => {
  try {
    // Validate worker exists
    const workerExists = await User.exists({ _id: req.user._id });
    if (!workerExists)
      return next(createHttpError(404, "Worker account not found"));

    // Get products with pagination
    const products = await Product.find({ worker: req.user._id })
      .select("-reservedStock")
      .sort("-createdAt")
      .populate("repairRequest", "title status")
      .lean();

    res.status(200).json({
      success: true,
      message: `Found ${products.length} product${products.length !== 1 ? "s" : ""} 📦`,
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
      radius = 5000,
    } = req.query;

    // Validate coordinates
    if (lng && lat && (isNaN(lng) || isNaN(lat)))
      return next(createHttpError(400, "Invalid coordinates format"));

    // Build base pipeline
    const pipeline = [];
    const filter = {};

    // Handle geospatial search
    if (lng && lat)
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          maxDistance: parseInt(radius),
          spherical: true,
        },
      });

    // Text search
    if (q)
      pipeline.push({
        $match: { $text: { $search: q } },
      });

    // Other filters
    ["type", "category", "condition"].forEach((field) => {
      if (req.query[field]) filter[field] = req.query[field];
    });

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (Object.keys(filter).length > 0) pipeline.push({ $match: filter });

    // Sorting
    const sortBy = {};
    const validSorts = ["price", "-price", "createdAt", "-createdAt"];
    const sortField = validSorts.includes(sort)
      ? sort.replace("-", "")
      : "createdAt";
    sortBy[sortField] = sort.startsWith("-") ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;
    const facetStages = {
      metadata: [{ $count: "total" }],
      data: [
        { $sort: sortBy },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "worker",
            foreignField: "_id",
            as: "worker",
            pipeline: [{ $project: { username: 1, profile: 1 } }],
          },
        },
        { $unwind: "$worker" },
        {
          $project: {
            reservedStock: 0,
            "worker.password": 0,
            "worker.email": 0,
          },
        },
      ],
    };

    const [result] = await Product.aggregate([
      ...pipeline,
      { $facet: facetStages },
    ]);

    const products = result.data;
    const total = result.metadata[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: products.length
        ? `Found ${products.length} items`
        : "No products found",
      data: products.map((p) => ({
        ...p,
        availableStock: p.stock - p.reservedStock,
      })),
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
      .populate("worker", "username profile.avatar rating.average")
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
    if (!["restock", "adjust"].includes(action))
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
      .populate("worker", "username profile.avatar rating.average");

    res.status(200).json({
      success: true,
      message: "Similar products you might like",
      data: similar,
    });
  } catch (error) {
    next(error);
  }
};
