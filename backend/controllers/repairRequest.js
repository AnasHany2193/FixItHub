import createHttpError from "http-errors";
import RepairRequest from "../models/RepairRequest.js";

// POST: Create repair request
export const createRepairRequest = async (req, res, next) => {
  const { itemType, issueDescription, photos, shippingRequired } = req.body;

  try {
    // Validate required fields
    if (!itemType || !issueDescription)
      throw createHttpError(
        400,
        "Item type and issue description are required"
      );

    // Validate photos (at least 1 image)
    if (!photos?.length)
      throw createHttpError(400, "At least one photo is required");

    // Validate photo structure
    const invalidPhotos = photos.some(
      (photo) => !photo.url || !photo.public_id
    );
    if (invalidPhotos)
      throw createHttpError(400, "Photo URLs and public IDs are required");

    // Create repair request
    const repairRequest = await RepairRequest.create({
      customer: req.user._id,
      itemType,
      issueDescription,
      photos,
      shippingRequired,
      trackingUpdates: [{ status: "Request Submitted" }], // Initial tracking update
    });

    res.status(201).json({
      success: true,
      message: "Repair request submitted successfully",
      data: repairRequest,
    });
  } catch (err) {
    next(err);
  }
};

// GET: Fetch repair request by ID
export const getRepairRequest = async (req, res, next) => {
  try {
    const repairRequest = await RepairRequest.findById(req.params.id).populate(
      "customer",
      "username email profile"
    );

    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    // Authorize customer
    if (repairRequest.customer._id.toString() !== req.user._id.toString())
      throw createHttpError(403, "You can only view your own repair requests");

    res.status(200).json({
      success: true,
      message: "Repair request retrieved",
      data: repairRequest,
    });
  } catch (err) {
    next(err);
  }
};
