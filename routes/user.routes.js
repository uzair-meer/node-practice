import express from "express";
import { isAuthenticated, restrict } from "../controllers/authController.js";
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  GetPendingRequests,
  getUser,
  getUsersFeed,
  updateMe,
} from "../controllers/userContoller.js";

const router = express.Router();
router.route("/users/requests").get(isAuthenticated, GetPendingRequests);
router.route("/users/feed?page=1&limit=10").get(isAuthenticated, getUsersFeed);

export { router as clientRoutes };
