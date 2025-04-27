import createHttpError from "http-errors";
import Product from "../models/Product.js";

const buildProductFilters = (query) => {
  const filters = {};
  if (query.category) filters.category = query.category;
  if (query.minPrice)
    filters.price = { ...filters.price, $gte: query.minPrice };
  if (query.maxPrice)
    filters.price = { ...filters.price, $lte: query.maxPrice };
  return filters;
};

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
