import { body, validationResult } from "express-validator";

export const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("username").notEmpty().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateWorkerRegistration = [
  body("documents")
    .if(body("role").equals("worker"))
    .isArray({ min: 1 })
    .withMessage("At least 1 document is required"),
  body("documents.*").isURL().withMessage("Invalid document URL format"),
];

export const validatePassword = [
  body("password")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
    .withMessage("Password must be 6+ chars with 1 uppercase, and 1 number"),
];
