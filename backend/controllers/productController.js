import createHttpError from "http-errors";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Reservation from "../models/Reservation.js";
import RepairRequest from "../models/RepairRequest.js";
import {
  addAvailableStock,
  createPagination,
  getSortCriteria,
  parseNumber,
  processImageUrls,
  processSingleImage,
  productProjection,
  validateAndFormatCoordinates,
  workerLookupPipeline,
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
      lng,
      lat,
      radius = 5000,
      page = 1,
      limit = 10,
      ...filters
    } = req.query;

    // Validate coordinates
    if (lng && lat) {
      const [longitude, latitude] = [parseFloat(lng), parseFloat(lat)];
      if (
        isNaN(longitude) ||
        isNaN(latitude) ||
        Math.abs(longitude) > 180 ||
        Math.abs(latitude) > 90
      )
        return next(createHttpError(400, "Invalid coordinates"));
    }

    // Build aggregation pipeline
    const pipeline = [];

    // Geo search
    if (lng && lat) {
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
    }

    // Text search
    if (filters.q) {
      pipeline.push({ $match: { $text: { $search: filters.q } } });
      delete filters.q;
    }

    // Numeric filters
    if (filters.minPrice || filters.maxPrice) {
      filters.price = {
        ...(filters.minPrice && { $gte: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { $lte: parseFloat(filters.maxPrice) }),
      };
      delete filters.minPrice;
      delete filters.maxPrice;
    }

    // Add remaining filters
    if (Object.keys(filters).length > 0) pipeline.push({ $match: filters });

    // Pagination and sorting
    const [result] = await Product.aggregate([
      ...pipeline,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: getSortCriteria(req.query.sort) },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            { $lookup: workerLookupPipeline },
            { $project: productProjection },
          ],
        },
      },
    ]);

    const { metadata, data } = result;
    const total = metadata[0]?.total || 0;

    res.json({
      success: true,
      data: data.map(addAvailableStock),
      pagination: createPagination(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const reserveStock = async (req, res, next) => {
  try {
    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || quantity <= 0)
      return next(createHttpError(400, "Invalid quantity"));

    const product = await Product.findById(req.params.id);
    if (!product || product.availableStock < quantity)
      return next(createHttpError(400, "Not enough available stock"));

    const [updatedProduct, reservation] = await Promise.all([
      Product.findByIdAndUpdate(
        {
          _id: productId,
          availableStock: { $gte: quantity },
        },
        { $inc: { reservedStock: quantity } },
        { new: true }
      ),
      Reservation.create({
        product: req.params.id,
        user: req.user._id,
        quantity,
        expiresAt: new Date(Date.now() + 900000), // 15 minutes
      }),
    ]);

    if (!updatedProduct) throw createHttpError(400, "Not enough stock");

    res.json({
      success: true,
      data: {
        reservationId: reservation._id,
        expiresAt: reservation.expiresAt,
        availableStock: updatedProduct.availableStock,
      },
      message: `Stock reserved for 15 minutes`,
    });
  } catch (error) {
    next(error);
  }
};

export const trackProductView = async (req, res, next) => {
  try {
    await Product.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });
    next();
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .select("-reservedStock")
      .populate("worker", "username profile.avatar rating.average")
      .populate("repairRequest", "title")
      .lean();

    if (!product) return next(createHttpError(404, "Product not found"));

    res.status(200).json({
      success: true,
      message: "Product details retrieved successfully 🔍",
      data: {
        ...product,
        availableStock: product.stock - product.reservedStock,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { action, quantity } = req.body;
    const numericQuantity = parseFloat(quantity);

    // Validate input
    if (!["restock", "adjust"].includes(action) || isNaN(numericQuantity))
      return next(createHttpError(400, "Invalid action or quantity"));

    // Prepare update operation
    const update = {
      $inc: {
        stock: action === "restock" ? numericQuantity : -numericQuantity,
      },
    };

    if (action === "adjust") update.$min = { stock: 0 };

    // Execute update
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, worker: req.user._id },
      update,
      { new: true, runValidators: true }
    );

    if (!product)
      return next(createHttpError(404, "Product not found or unauthorized"));

    res.status(200).json({
      success: true,
      message: `Stock ${action} successful. Current stock: ${product.stock}`,
      data: {
        stock: product.stock,
        actionPerformed: action,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSimilarProducts = async (req, res, next) => {
  try {
    const baseProduct = await Product.findById(req.params.id);
    if (!baseProduct)
      return next(createHttpError(404, "Base product not found"));

    const similarProducts = await Product.aggregate([
      {
        $match: {
          category: baseProduct.category,
          _id: { $ne: baseProduct._id },
          status: "active",
        },
      },
      { $sample: { size: 4 } },
      { $lookup: workerLookupPipeline },
      { $project: productProjection },
    ]);

    res.status(200).json({
      success: true,
      message: "Similar products you might like",
      data: similarProducts.map(addAvailableStock),
    });
  } catch (error) {
    next(error);
  }
};
