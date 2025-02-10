// middlewares/userValidation.js
export const validateProfileUpdate = (req, res, next) => {
  const validFields = [
    "profile.bio",
    "profile.phone",
    "profile.address.street",
    "profile.address.city",
    "profile.address.state",
    "profile.address.zip",
    "profile.address.country",
    "profile.socialMedia.website",
    "profile.socialMedia.linkedin",
    "profile.socialMedia.twitter",
    "avatar",
  ];

  const invalidFields = Object.keys(req.body).filter(
    (field) => !validFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return next(
      createHttpError(400, `Invalid fields: ${invalidFields.join(", ")}`)
    );
  }

  next();
};
