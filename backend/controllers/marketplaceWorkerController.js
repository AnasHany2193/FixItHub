import createHttpError from "http-errors";

import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const createProduct = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { name, description, price, category, stock, specs, imageUrls } =
      body;

    const productData = {
      seller: user._id,
      name,
      description,
      price,
      category,
      stock,
      specs,
      images: imageUrls.map(({ url, public_id }) => ({ url, public_id })),
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const {
      user: { _id },
      params: { id },
      body,
    } = req;
    const {
      name,
      description,
      price,
      stock,
      specs,
      imageUrls = [],
      removedImageIds = [],
    } = body;

    const product = await Product.findOne({ _id: id, seller: _id });
    if (!product) throw createHttpError(404, "Product not found");

    const updatedImages = [
      ...product.images.filter(
        (img) => !removedImageIds.includes(img.public_id)
      ),
      ...imageUrls.filter(
        (img) => !product.images.some((e) => e.public_id === img.public_id)
      ),
    ];

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, specs, images: updatedImages },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Product updated",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const {
      user: { _id },
      params: { id },
    } = req;

    const product = await Product.findOneAndDelete({ _id: id, seller: _id });
    if (!product) throw createHttpError(404, "Product not found");

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProducts = async (req, res, next) => {
  try {
    const { category, sort, stockStatus } = req.query;
    const filter = { seller: req.user._id };

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Stock status filter
    if (stockStatus && stockStatus !== "all") {
      switch (stockStatus) {
        case "in-stock":
          filter.stock = { $gt: 10 };
          break;
        case "low-stock":
          filter.stock = { $gt: 0, $lte: 10 };
          break;
        case "out-of-stock":
          filter.stock = { $lte: 0 };
          break;
      }
    }

    // Sorting
    const sortOptions = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const sortOrder = sortOptions[sort] || { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOrder).lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkerProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    })
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "username profile.avatar",
        },
      })
      .lean();

    if (!product) throw createHttpError(404, "Product not found");

    // Add calculated stats
    const stats = await Order.aggregate([
      { $match: { "items.product": product._id, status: "completed" } },
      { $unwind: "$items" },
      { $match: { "items.product": product._id } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        ...product,
        totalSales: stats[0]?.totalSales || 0,
        totalRevenue: stats[0]?.totalRevenue?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviewsForSeller = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const skip = (page - 1) * limit;

    const product = await Product.findOne({
      _id: req.params.productId,
      seller: req.user._id,
    });

    if (!product) throw createHttpError(404, "Product not found");

    const filters = { product: product._id };
    if (rating) filters.rating = parseInt(rating);

    const reviews = await Review.find(filters)
      .populate("user", "username profile.avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(filters);

    res.json({
      success: true,
      data: reviews,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
