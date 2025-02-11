import createHttpError from "http-errors";

import cloudinary from "../config/cloudinary.js";
import { sendEmail } from "../services/emailService.js";

import User from "../models/User.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import RepairRequest from "../models/RepairRequest.js";
import { banEmailTemplate, warningEmailTemplate } from "./emailTemplates.js";

export const handleContentRemoval = async (report) => {
  try {
    let model;
    let content;

    switch (report.contentType) {
      case "product":
        model = Product;
        break;
      case "repair":
        model = RepairRequest;
        break;
      case "review":
        model = Review;
        break;
      case "user":
        model = User;
        break;
      default:
        throw new Error("Invalid content type for removal");
    }

    // Soft delete with removal reason
    content = await model.findByIdAndUpdate(
      report.contentId,
      {
        status: "removed",
        removalReason: report.reason,
        removedAt: new Date(),
        removedBy: "SYSTEM", // Will be replaced with admin ID later
      },
      { new: true }
    );

    if (!content)
      throw createHttpError(404, `${report.contentType} content not found`);

    // Additional cleanup for Cloudinary assets
    if (report.contentType === "product" && content.photos?.length) {
      const publicIds = content.photos.map((photo) => photo.public_id);
      await cloudinary.api.delete_resources(publicIds);
    }

    return content;
  } catch (error) {
    console.error(`Content removal failed: ${error.message}`);
    throw error;
  }
};

export const sendUserWarning = async (report) => {
  try {
    let targetUser;

    // Get user based on content type
    switch (report.contentType) {
      case "product":
        targetUser = await User.findById(report.contentId.worker);
        break;
      case "repair":
        targetUser = await User.findById(report.contentId.customer);
        break;
      case "review":
        targetUser = await User.findById(report.contentId.author);
        break;
      case "user":
        targetUser = await User.findById(report.contentId);
        break;
      default:
        throw new Error("Invalid content type for warning");
    }

    if (!targetUser) throw createHttpError(404, "Associated user not found");

    await sendEmail({
      to: targetUser.email,
      subject: "⚠️ Content Policy Violation Warning",
      html: warningEmailTemplate(targetUser.username, report.reason),
    });

    // Add warning to user record
    await User.findByIdAndUpdate(targetUser._id, {
      $push: {
        warnings: {
          date: new Date(),
          reason: report.reason,
          contentId: report.contentId,
          contentType: report.contentType,
        },
      },
    });
  } catch (error) {
    console.error(`User warning failed: ${error.message}`);
    throw error;
  }
};

// utils/reportHandlers.js
export const banReportedUser = async (report) => {
  try {
    let targetUser;

    // Resolve user based on content type
    switch (report.contentType) {
      case "product":
        targetUser = await User.findById(report.contentId.worker);
        break;
      case "repair":
        targetUser = await User.findById(report.contentId.customer);
        break;
      case "review":
        targetUser = await User.findById(report.contentId.author);
        break;
      case "user":
        targetUser = await User.findById(report.contentId);
        break;
      default:
        throw new Error("Invalid content type for ban");
    }

    if (!targetUser)
      throw createHttpError(404, "User associated with content not found");

    // Perform ban with audit trail
    const bannedUser = await User.findByIdAndUpdate(
      targetUser._id,
      {
        status: "banned",
        banReason: report.reason,
        bannedAt: new Date(),
        $unset: { workerApplication: 1 }, // Remove worker status if applicable
      },
      { new: true }
    );

    // Notify user
    await sendEmail({
      to: bannedUser.email,
      subject: "🚫 Account Suspension Notice",
      html: banEmailTemplate(bannedUser.username, report.reason),
    });

    return bannedUser;
  } catch (error) {
    console.error(`User ban failed: ${error.message}`);
    throw error;
  }
};
