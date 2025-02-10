import createHttpError from "http-errors";

export const validateImageUrls = (req, res, next) => {
  const { imageUrls } = req.body;

  if (!imageUrls || !Array.isArray(imageUrls))
    return next(createHttpError(400, "Invalid image data format"));

  if (imageUrls.length < 1 || imageUrls.length > 5)
    return next(createHttpError(400, "1-5 images required"));

  next();
};
