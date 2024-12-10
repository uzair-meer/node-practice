import express from "express";
import { isAuthenticated } from "../controllers/authController.js";
import {
  connectionRequestHandler,
  connectionRequestReviewHanlder,
} from "../controllers/connectionController.js";
const router = express.Router();

router
  .route("/request/send/:status/:toUserId")
  .post(isAuthenticated, connectionRequestHandler);
router
  .route("/request/review/:status/:requestId")
  .post(isAuthenticated, connectionRequestReviewHanlder);

export { router as connectionRoutes };
