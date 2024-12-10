import express from "express";
import {
  createMovie,
  deleteMovie,
  getAllMovies,
  getHighestMovies,
  getMovie,
  getMovieByGenre,
  getMovieStats,
  updateMovie,
} from "../controllers/movieController.js";

const router = express.Router();

router.route("/movies").post(createMovie).get(getAllMovies);
router.route("/movies/highest-rated").get(getHighestMovies, getAllMovies);
router.route("/movies/movie-stats").get(getMovieStats);
router.route("/movies/movies-by-genre/:genre").get(getMovieByGenre);

router
  .route("/movies/:id")
  .get(getMovie)
  .patch(updateMovie)
  .delete(deleteMovie);
export { router as movieRoutes };
