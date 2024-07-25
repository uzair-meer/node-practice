import express from "express";
import {
  createMovie,
  deleteMovie,
  getAllMovies,
  getMovie,
  updateMovie,
} from "../controllers/movieController.js";

const router = express.Router();

router.route("/movies").post(createMovie);
router.route("/movies").get(getAllMovies);
router
  .route("/movies/:id")
  .get(getMovie)
  .patch(updateMovie)
  .delete(deleteMovie);
export { router as movieRoutes };
