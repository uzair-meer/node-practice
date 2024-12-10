import express from "express";
import {
  signUp,
  logIn,
  resetPsssword,
  forgotPasword,
  isAuthenticated,
  updatePassword,
} from "../controllers/authController.js";
import { singleUpload } from "../middleware/multer.js";
import { getAllUsers } from "../controllers/userContoller.js";
const router = express.Router();

router.route("/signup").post(singleUpload, signUp);
router.route("/login").post(logIn);
router.route("/forgotPassword").post(forgotPasword);
router.route("/resetPassword/:token").patch(resetPsssword);
router.route("/updatePassword").patch(isAuthenticated, updatePassword);

export { router as authRoutes };
