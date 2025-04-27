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
    const products = await Product.find({ seller: req.user._id })
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
