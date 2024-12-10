import Movie from "../models/movieModel.js";
import { ApiFeature } from "../utils/apiFeature.js";
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

export const getHighestMovies = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratings";
  next();
};
export const getAllMovies = aysncHandler(async (req, res, next) => {
  const features = new ApiFeature(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let movies = await features.query;
  // query always come in strings
  // but it also converts to automaticall to desired data type inernally

  // advance filtering
  // Advanced filtering for ratings, duration, and price
  //   Convert query object to a JSON string and replace operators (gte, gt, lte, lt) with MongoDB operators ($gte, $gt, $lte, $lt).
  // Parse the modified query string back to an object and pass it to Movie.find().
  // let queryStr = JSON.stringify(req.query);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  // sorting
  // sort method in monogoose is query method
  // it only works on query obj not on results array

  // thats why we remove await from Movie find
  //so it dont reuturn result array rather it reutns query object
  // let query = Movie.find(JSON.parse(queryStr));

  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //   query = query.sort(sortBy);
  //   // ned to sort on relese year and ratings
  // } else {
  //   // if no sorting query sorting provided in url
  //   query = query.sort("-createdAt");
  // }

  //LIMIMTING FIELDS
  // selecting some sleected foeds called projection
  // either you select fields or exclude fields cant do both
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(",").join(" ");
  //   query = query.select(fields);
  // } else {
  //   query = query.select("-__v");
  // }
  // // PAGINATION
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 10;
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numMovies = await Movie.countDocuments();
  //   if (skip >= numMovies) throw new Error("This page does not exist");
  // }
  // and here we wait results from query object
  // const movies = await query;

  // if no query given it will return all
  // but it will not work for evey case
  // wont work for pagination and sorting
  // coz t only goes for properties mentioned on movie model/obj

  // having siad htat its working for now
  // and it reutns a single movie coz we specifying the values agianst the query strings
  // movies/?duration=169&ratings=8.6
  // but if dont then we gotta follow the fields exclusion method/workn
  // like below

  // const excludeFields = ["sort", "page", "limit", "fields"];
  // // shollow copy
  // const queryObj = { ...req.query };

  // // deleting all irrelevent fields coming in req.query
  // excludeFields.forEach((el) => {
  //   delete queryObj[el];
  // });

  // const movies = await Movie.find(queryObj);

  // another way of making it like query .. mongo specialmethds
  // const movies = await Movie.find()
  //   .where("duration")
  //   .equals(req.query.duration)
  //   .where("ratings")
  //   .equals(req.query.ratings);

  res.status(200).json({
    staus: "success",
    length: movies.length,
    data: {
      movies,
    },
  });
});

export const getMovie = aysncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
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

export const getMovieStats = aysncHandler(async (req, res, next) => {
  // aggregate function takes array of stages which documents go through
  // match stage mathced filter/matches certain docs
  const stats = await Movie.aggregate([
    {
      $match: {
        ratings: {
          $gte: 7,
        },
      },
    },
    {
      $group: {
        _id: "$releaseYear",
        // ae specify field against id on whch bases we want to group by
        // bing applied on fieldname ratings
        // an the names ae specifying here act as fields in resutl
        avgRatings: {
          $avg: "$ratings",
        },
        avgPrice: {
          $avg: "$price",
        },
        maxPrice: {
          $max: "$price",
        },
        minPrice: {
          $min: "$price",
        },
        movieCount: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        minPrice: 1,
      },
    },
    {
      $match: {
        maxPrice: {
          $gte: 13,
        },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    count: stats.length,
    data: {
      stats,
    },
  });
});

export const getMovieByGenre = aysncHandler(async (req, res, next) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    // unwind is aplied on fields that have multiple values/arrray of values
    // unwind desturctre that documents with each genre seprately
    { $unwind: "$genre" },
    // then grouped by genre

    // now each group/genre docs will go through the below stage
    // like groupedwise
    // and each genre group represents a doc
    {
      $group: {
        _id: "$genre",
        movieCount: {
          $sum: 1,
        },
        // each movie with specific genre being pused to movies array
        movies: {
          $push: "$name",
        },
      },
    },
    // now adding fiedls
    // acutally replacing fiedls genre with _id to have custom fieldname

    {
      $addFields: {
        genre: "$_id",
      },
    },
    // project stage tells which fields to add
    // or drop from result
    {
      $project: {
        _id: 0,
      },
    },
    // sorting on bases of fields
    {
      $sort: {
        movieCount: -1,
      },
    },

    //limit to limit the results
    //   {
    //  $limit:5
    //   }
    {
      $match: {
        genre,
      },
    },
  ]);
  if (movies.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: `No movies found for the genre '${genre}'`,
    });
  }
  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies,
    },
  });
});
