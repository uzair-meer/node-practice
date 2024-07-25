import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import sanitize from "express-mongo-sanitize";
import "./config/connectDB.js";
import { configCloudinary } from "./config/cloudinaryConfig.js";
import { clientRoutes } from "./routes/user.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { CustomError } from "./utils/customError.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import { movieRoutes } from "./routes/movie.routes.js";

const app = express();
//  add securty headers to response
// app.use(helmet());
// retuns midllware
// const limiter = rateLimit({
//   max: 3,
//   windowMs: 60 * 60 * 1000,
//   message: "we have receive too many requests please try again after 1 hour",
// });

// making sure we dont get data more than 10kb
app.use(
  express.json({
    limit: "10kb",
  })
);
// sanitize look for no sql query
// in req byd, params or query
// app.use(sanitize({}));
// app.use("/api", limiter);
app.use(express.urlencoded({ extended: true }));
configCloudinary();
app.use(authRoutes);
app.use(clientRoutes);
app.use(movieRoutes);

app.all("*", (req, res, next) => {
  //   res.status(404).json({
  //     status: "fail",
  //     message: "cant fine route",
  //   });
  // passing message as string
  const err = new CustomError("cant find route");
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

// globar erro handler
app.use(globalErrorHandler);

app.listen(process.env.PORT, () =>
  console.log(`server is running on port ${process.env.PORT}`)
);
