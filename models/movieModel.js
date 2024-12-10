import fs from "fs";
import mongoose from "mongoose";
const movieSchema = new mongoose.Schema(
  {
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
    createdBy: {
      type: String,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});
// runs each time when create or save is run on monogose
// dont work for insert many

movieSchema.pre("save", function (next) {
  // got inserted data here
  // we can also modify data here
  // can add new fields // like user id after authnetication/autherization
  // but if we want it to be stored in data we also need to identify this in model
  //
  this.createdBy = "uzair";
  console.log(this);
  next();
});

movieSchema.post("save", function (doc, next) {
  const content = `a movie doc is with name ${doc.name} created by ${doc.createdBy}`;
  fs.writeFileSync("./logs/log.txt", content, { flag: "a" }, (err) => {
    console.log(err);
  });
  next();
});
// this is query middlewar only run for find
movieSchema.pre("find", function (next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  next();
});
// runs for all queries start with find
// movieSchema.pre(/^find/, function (next) {
//   this.find({ releaseDate: { $lte: Date.now() } });
//   next();
// });

movieSchema.pre("aggregate", function (next) {
  // this.pipeline reuturns array / ggregation stages array
  console.log(
    this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } })
  );
  next();
});
const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
