import createHttpError from "http-errors";

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Favorite from "../models/Favorite.js";

// Products
export const getProducts = async (req, res, next) => {
  try {
    const { query } = req;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const search = query.search?.trim();

    const filters = {};

    // Category filter
    if (query.category && query.category !== "all") {
      filters.category = query.category;
    }

    // Price range filter
    if (query.minPrice || query.maxPrice) {
      filters.price = {};
      const min = parseFloat(query.minPrice);
      const max = parseFloat(query.maxPrice);

      if (!isNaN(min) && min >= 0) {
        filters.price.$gte = min;
      }
      if (!isNaN(max) && max >= 0) {
        filters.price.$lte = max;
      }
    }

    // Add search filter
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
    };
    const sort = sortOptions[query.sort] || { createdAt: -1 };

    // Get paginated results
    const products = await Product.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "username profile.avatar createdAt")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "username profile.avatar" },
      })
      .lean();

    if (!product) throw createHttpError(404, "Product not found");

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "username profile.avatar")
      .sort("-createdAt");

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// Favorites
export const addToFavorites = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) throw createHttpError(404, "Product not found");

    // Check if already favored
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId,
    });
    if (existingFavorite)
      throw createHttpError(409, "Product already in favorites");

    // Create favorite
    const favorite = await Favorite.create({
      user: userId,
      product: productId,
    });
    await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: 1 } });

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const deleted = await Favorite.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!deleted) throw createHttpError(404, "Favorite not found");
    await Product.findByIdAndUpdate(productId, {
      $inc: { favoritesCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

export const getFavoriteProducts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: "product",
        select: "name price category images stock",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Favorite.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: favorites.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: favorites.map((fav) => fav.product),
    });
  } catch (error) {
    next(error);
  }
};

// Cart
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        select: "name price images stock",
      })
      .lean();

    res.status(200).json({
      success: true,
      data: cart || { items: [], total: 0 },
    });
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) throw createHttpError(404, "Product not found");
    if (product.stock < quantity)
      throw createHttpError(400, "Insufficient stock");

    // Update or create cart
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        $addToSet: {
          items: {
            product: productId,
            quantity: Math.min(quantity, product.stock),
          },
        },
      },
      { new: true, upsert: true }
    ).populate("items.product");

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQty = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { action } = req.body;

    // Validate action
    if (!["increment", "decrement"].includes(action))
      throw createHttpError(400, "Invalid quantity action");

    // Update quantity
    const update =
      action === "increment"
        ? { $inc: { "items.$.quantity": 1 } }
        : { $inc: { "items.$.quantity": -1 } };

    const cart = await Cart.findOneAndUpdate(
      {
        user: req.user._id,
        "items.product": productId,
      },
      update,
      { new: true }
    ).populate("items.product");

    if (!cart) throw createHttpError(404, "Cart item not found");

    // Remove item if quantity <= 0
    if (action === "decrement") {
      const item = cart.items.find((i) => i.product.equals(productId));
      if (item.quantity <= 0) return removeCartItem(req, res, next);
    }

    res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate("items.product");

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    next(error);
  }
};

// Order
export const getCustomerOrders = async (req, res, next) => {
  try {
    const { status, startDate, endDate, sort } = req.query;
    const filters = { user: req.user._id };

    // Status filter
    if (
      status &&
      status !== "all" &&
      ["processing", "completed"].includes(status)
    )
      filters.status = status;

    // Date range filter
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    // Sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "total-asc": { total: 1 },
      "total-desc": { total: -1 },
    };
    const sortOrder = sortOptions[sort] || { createdAt: -1 };

    const orders = await Order.find(filters)
      .populate({
        path: "items.product",
        select: "name price images seller",
        populate: {
          path: "seller",
          select: "username profile.avatar",
        },
      })
      .sort(sortOrder)
      .lean();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate({
        path: "items.product",
        select: "name price images description specs seller",
        populate: {
          path: "seller",
          select: "username profile.avatar email",
        },
      })
      .lean();

    if (!order) throw createHttpError(404, "Order not found");

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Review
export const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) throw createHttpError(404, "Product not found");

    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment,
    });

    await product.updateRating();

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) throw createHttpError(404, "Review not found");

    const product = await Product.findById(review.product);
    await product.updateRating();

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: userId,
    });

    if (!review) throw createHttpError(404, "Review not found");

    const product = await Product.findById(review.product);
    await product.updateRating();

    res.json({ success: true, data: null, productId: review.product });
  } catch (error) {
    next(error);
  }
};
