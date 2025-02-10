// Shared validation helpers
export const validateAndFormatCoordinates = (lng, lat) => {
  if ((lng && !lat) || (!lng && lat)) return null;
  if (!lng && !lat) return null;

  const longitude = parseFloat(lng);
  const latitude = parseFloat(lat);

  if (isNaN(longitude) || isNaN(latitude)) return null;
  if (Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return null;

  return {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

export const parseNumber = (value, fieldName) => {
  const parsed = Number(value);
  if (isNaN(parsed)) throw createHttpError(400, `Invalid ${fieldName} value`);
  return parsed;
};

export const processImageUrls = (urls) => {
  if (!urls?.length) throw createHttpError(400, "At least one image required");
  return urls.map(processSingleImage);
};

export const processSingleImage = (url) => ({
  url,
  public_id: url.split("/").pop().split(".")[0],
});

export const getSortCriteria = (sort = "-createdAt") => {
  const validSorts = new Map([
    ["price", 1],
    ["-price", -1],
    ["createdAt", 1],
    ["-createdAt", -1],
  ]);
  return { [sort.replace("-", "")]: validSorts.get(sort) || -1 };
};

export const workerLookupPipeline = {
  from: "users",
  localField: "worker",
  foreignField: "_id",
  as: "worker",
  pipeline: [{ $project: { username: 1, "profile.avatar": 1 } }],
};

export const productProjection = {
  reservedStock: 0,
  "worker.password": 0,
  "worker.email": 0,
};

export const addAvailableStock = (product) => ({
  ...product,
  availableStock: product.stock - (product.reservedStock || 0),
});

export const createPagination = (page, limit, total) => ({
  page: Number(page),
  limit: Number(limit),
  total,
  totalPages: Math.ceil(total / limit),
});
