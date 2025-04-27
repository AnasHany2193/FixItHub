import createHttpError from "http-errors";
import Product from "../models/Product.js";
import Favorite from "../models/Favorite.js";

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
      .populate("seller", "username profile.avatar")
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
