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

    const filters = buildProductFilters(query);
    if (query.search) filters.name = { $regex: query.search, $options: "i" };

    const products = await Product.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
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
