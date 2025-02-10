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
