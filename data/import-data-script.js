import "dotenv/config";
import fs from "fs";
import Movie from "../models/movieModel.js";
import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URI);

mongoose.set("strictQuery", true);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// coz we gonna run it from command line thats why passing path like this with root direcotry
// it retuns data into string json data
const movies = JSON.parse(fs.readFileSync("./data/movies.json", "utf-8"));

// delete exsiting movies from db
const deleteMovies = async () => {
  try {
    await Movie.deleteMany();
    console.log("data deeted");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

// importin data from file to mongo collection
const insertData = async () => {
  try {
    await Movie.insertMany(movies);
    console.log("movies inserted successfullly");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

if (process.argv[2] === "--insert") {
  insertData();
}
if (process.argv[2] === "--delete") {
  deleteMovies();
}
