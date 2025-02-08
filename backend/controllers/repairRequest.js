import createHttpError from "http-errors";
import RepairRequest from "../models/RepairRequest.js";
import cloudinary from "../config/cloudinary.js";

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

// GET: List all repair requests for the customer (with filters)
export const listRepairRequests = async (req, res, next) => {
  try {
    const {
      status,
      itemType,
      search,
      sortBy = "newest",
      page = 1,
      limit = 10,
    } = req.query;
    const filter = { customer: req.user._id };

    // Apply filters
    if (status) filter.status = status;
    if (itemType) filter.itemType = itemType;

    // Add text search for issue description
    if (search) filter.$text = { $search: search }; // MongoDB text search

    // Sorting logic
    let sortCriteria = { createdAt: -1 }; // Default: newest first
    if (sortBy === "oldest") sortCriteria = { createdAt: 1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const repairRequests = await RepairRequest.find(filter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await RepairRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Repair requests retrieved",
      data: repairRequests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT: Update repair request (customer can only update certain fields)
export const updateRepairRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemType, issueDescription, photos, shippingRequired } = req.body;

    // Find repair request and validate ownership
    const repairRequest = await RepairRequest.findById(id);
    if (!repairRequest) throw createHttpError(404, "Repair request not found");

    if (repairRequest.customer.toString() !== req.user._id.toString())
      throw createHttpError(403, "You can only update your own requests");

    // Validate updates
    const updates = {};
    if (itemType) updates.itemType = itemType;
    if (issueDescription) updates.issueDescription = issueDescription;
    if (photos) {
      // Validate photo structure
      const invalidPhotos = photos.some(
        (photo) => !photo.url || !photo.public_id
      );
      if (invalidPhotos)
        throw createHttpError(400, "Photo URLs and public IDs are required");

      updates.photos = photos;
    }

    if (shippingRequired !== undefined)
      updates.shippingRequired = shippingRequired;

    // Delete old photos if updated
    if (updates.photos) {
      const oldPublicIds = repairRequest.photos.map((p) => p.public_id);
      const newPublicIds = updates.photos.map((p) => p.public_id);
      const deletedPublicIds = oldPublicIds.filter(
        (id) => !newPublicIds.includes(id)
      );

      // Delete from Cloudinary
      await Promise.all(
        deletedPublicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId)
        )
      );
    }

    // Apply updates
    const updatedRequest = await RepairRequest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Repair request updated",
      data: updatedRequest,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE: Delete repair request
export const deleteRepairRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find repair request and validate ownership
    const repairRequest = await RepairRequest.findById(id);
    if (!repairRequest) throw createHttpError(404, "Repair request not found");
    if (repairRequest.customer.toString() !== req.user._id.toString())
      throw createHttpError(403, "You can only delete your own requests");

    // Delete photos from Cloudinary
    const publicIds = repairRequest.photos.map((p) => p.public_id);
    await Promise.all(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
    );

    // Delete from database
    await RepairRequest.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Repair request deleted",
    });
  } catch (err) {
    next(err);
  }
};
