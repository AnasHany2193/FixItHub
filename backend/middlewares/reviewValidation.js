import createHttpError from "http-errors";

export const validateReview = (req, res, next) => {
  const { rating, comment = "" } = req.body;

  if (rating && ![1, 2, 3, 4, 5].includes(Number(rating)))
    return next(createHttpError(400, "Rating must be between 1-5"));

  if (comment.length > 500)
    return next(createHttpError(400, "Comment too long (max 500 chars)"));

  next();
};
