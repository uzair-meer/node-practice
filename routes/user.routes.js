import express from "express";
import { isAuthenticated, restrict } from "../controllers/authController.js";
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getUser,
  updateMe,
} from "../controllers/userContoller.js";

const router = express.Router();
router.route("/users").get(getAllUsers);

export { router as clientRoutes };
