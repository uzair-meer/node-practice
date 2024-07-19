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

router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.delete("/users/:id", isAuthenticated, restrict("admin"), deleteUser);
router.patch("/updateMe", isAuthenticated, updateMe);
router.delete("/deleteMe", isAuthenticated, deleteMe);

export { router as clientRoutes };
