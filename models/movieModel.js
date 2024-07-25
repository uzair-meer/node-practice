import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "movie name is required!"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description is required !"],
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, "duration is required !"],
  },
  ratings: {
    type: Number,
  },
  totalRatings: {
    type: Number,
  },
  releaseYear: {
    type: Number,
    require: [true, "release year is required!"],
  },
  releaseDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  genre: {
    type: [String],
    require: [true, "genre is required"],
  },
  directors: {
    type: [String],
    require: [true, "directors required"],
  },
  coverImg: {
    type: String,
    require: [true, "cover img is required field"],
  },
  actors: {
    type: [String],
    require: [true, "actors required"],
  },
  price: {
    type: Number,
    require: [true, "price is required"],
  },
});

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
