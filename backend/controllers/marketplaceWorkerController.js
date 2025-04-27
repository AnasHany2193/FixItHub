import createHttpError from "http-errors";
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
