import { set } from "mongoose";
import ConnectionRequest from "../models/connectionModel.js";
import User from "../models/userModel.js";
import { aysncHandler } from "../utils/aysncHandler.js";
import { CustomError } from "../utils/customError.js";

// Get all users
export const getAllUsers = aysncHandler(async (req, res, next) => {
  console.log("getting users");
  const users = await User.find(); // Fetch all users
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

// Get a user by ID
export const getUser = aysncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log("getting single user");
  if (!user) {
    return next(new CustomError("User with given ID not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

// Delete a user by ID
export const deleteUser = aysncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new CustomError("User with such ID doesn't exist", 404));
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    message: "User has been deleted successfully",
  });
});

// Update the current user (not password)
export const updateMe = aysncHandler(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new CustomError("Cannot update password through this route", 400)
    );
  }

  const filteredObj = filterReqObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user_id, filteredObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Mark the current user as inactive (soft delete)
export const deleteMe = aysncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const GetPendingRequests = aysncHandler(async (req, res, next) => {
  const user = req.user;
  const connectionRequests = await ConnectionRequest.find({
    receiverId: user._id,
    status: "interested",
    // using populte to populat the refrence
    //["name"] wither pass araay or pass tring
  }).populate("senderId", "name ");
  console.log(connectionRequests);
  res.status(200).json({
    message: "all users",
    data: {
      connectionRequests,
    },
  });
});

export const getConnections = aysncHandler(async (req, res, next) => {
  const user = req.user;
  // wehre reciever or senderid is mine and status is accpeted
  const myConnections = await ConnectionRequest.find({
    $or: [
      { senderId: user._id, status: "accepted" },
      { receiverId: user._id, status: "accepted" },
    ],
  })
    .populate("senderId", "name")
    .populate("receiverId", "name");

  const data = myConnections.map((connection) => {
    if (
      connection.receiverId._id.toString() ===
      connection.senderId._id.toString()
    ) {
      return connection.receiverId;
    }
    return connection.senderId;
  });
  res.status.json({});
});
export const getUsersFeed = aysncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  // wha user should not see
  // its own card
  // connections
  // ignored
  // already sent the connection requests

  // first find all the connection requests(sent, received)

  const connectionRequests = await ConnectionRequest.find({
    $or: [
      // incoming requests
      { receiverId: req.user._id },
      { senderId: req.user._id },
    ],
  })
    .select("senderId receiverId")
    .skip(skip)
    .limit(limit);
  // .populate("senderId", "name")
  // .populate("receiverId", "name");
  const hideUsersFromFeed = new Set();
  connectionRequests.forEach((req) => {
    hideUsersFromFeed.add(req.senderId.toString());
    hideUsersFromFeed.add(req.receiverId.toString());
  });

  // users to be shown on feed
  const users = await User.find({
    $and: [
      // not int
      { _id: { $nin: Array.from(hideUsersFromFeed) } },
      // not equal
      { _id: { $ne: req.user._id } },
    ],
  }).select("name");
  res.status(200).json({
    message: "users feed",
    data: {
      users,
    },
  });
});

// Helper function to filter object properties
const filterReqObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
