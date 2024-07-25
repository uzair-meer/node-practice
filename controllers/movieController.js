import Movie from "../models/movieModel.js";
import { aysncHandler } from "../utils/aysncHandler.js";
import { CustomError } from "../utils/customError.js";

export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "400",
      message: error.message,
    });
  }
};

export const getAllMovies = aysncHandler(async (req, res, next) => {
  const movies = await Movie.find();
  res.status(200).json({
    staus: "success",
    data: {
      movies,
    },
  });
});

export const getMovie = aysncHandler(async (req, res, next) => {
  const movie = await Movie.findById({ _id: req.params.id });
  if (!movie) {
    const error = new CustomError("movie with given id not found", 404);
    return next(error);
  }
  res.status(200).json({
    staus: "success",
    data: {
      movie,
    },
  });
});

export const updateMovie = aysncHandler(async (req, res, next) => {
  const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    // after updation it also retuns updated doc
    new: true,
    // it runs validators that we passed/defined in model
    runValidators: true,
  });
  if (!updateMovie) {
    const error = new CustomError("given id dont exist !", 404);
    return next(error);
  }

  res.status(200).json({
    staus: "Success",
    data: {
      movie: updatedMovie,
    },
  });
});

export const deleteMovie = aysncHandler(async (req, res, next) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
  if (!deletedMovie) {
    const error = new CustomError("movie with folwing id dont exists !", 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
