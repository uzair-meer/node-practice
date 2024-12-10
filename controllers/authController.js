import jwt from "jsonwebtoken";
import User, { signToken } from "../models/userModel.js";
import { aysncHandler } from "../utils/aysncHandler.js";
import { CustomError } from "../utils/customError.js";
import util from "util";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";
// ass soon as user created logged in
export const signUp = aysncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  // sign takes payload and signature/ secret key/string
  // epiration also added to payload

  // letting user login with creation
  createSendResponse(newUser, 201, res);
});

// jwt token consits of three parts
// header payload signature/ secret key
// signature made of header and patload

export const logIn = aysncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new CustomError("plese provide email and password", 404);
    return next(error);
  }
  const user = await User.findOne({ email }).select("+password");
  // const isMatch = await user.comparePassword(password, user.password);

  // if user exists and pass matches

  if (!user || !(await user.comparePassword(password, user.password))) {
    const error = new CustomError("incorrect mail or password", 400);
    return next(error);
  }
  createSendResponse(user, 200, res);
});

export const isAuthenticated = aysncHandler(async (req, res, next) => {
  // read the token if it exits
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new CustomError("you arent logged in", 401));
  }
  // validate the token
  // CAL ALSO TAKE callback

  // it dont reutn promise so we gotta promisy it
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STRING
  );

  const user = await User.findById(decodedToken.id);
  // if user exists in db

  if (!user) {
    const error = new CustomError("the user with given token dont exist");
    next(error);
  }
  // if user changed the password
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    const error = new CustomError(
      "password been changed login with new token",
      401
    );
    return next(error);
  }

  // for authorization purposes
  // to check roles
  req.user = user;
  next();
});

export const restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError(
        "you dont have access to perform this action",
        403
      );
      next(error);
    }
    next();
  };
};

export const forgotPasword = aysncHandler(async (req, res, next) => {
  // 1 gotta get user with given email
  console.log(req.body);
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    const error = new CustomError("we couldnot find with given email", 404);
    next(error);
  }
  // genrate a random token
  const resetToken = user.createResetPasswordToken();
  console.log(resetToken);
  //  instance method

  // send email to user with token
  await user.save({ validateBeforeSave: false });

  // send mail
  // protocol -> http /https
  //host/ --> ip localhost and ip => 127
  // then api
  // gotta send this url to user mail
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;
  const message = `we received a password reset request. please use the link below\n\n${resetUrl}\n\n the link will be valid for 10 minutes.`;
  // might reutn rejected

  try {
    // mail not sent // prmis rejecte
    await sendEmail({
      email: user.email,
      subject: "password change request received",
      message,
    });
    res.status(200).json({
      status: "succes",
      message: "password reset link sent to mail",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new CustomError("there was some eroor sending reset password email ")
    );
  }
});

export const resetPsssword = aysncHandler(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // matching passwor
  // it checks both if user exists or its token been expires
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("token is invalid", 404);
    next(error);
  }
  // reseting password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  // once password reset the token fields goona be expire

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();

  user.save();

  // letting user login
  const access_token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token: access_token,
  });
});

export const updatePassword = aysncHandler(async (req, res, next) => {
  // geeting current user from database thts on req.user thas been assigned to req during auth middleware

  const user = await User.findById(req.user._id).select("+password");
  // check if the current password and db pass same
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(
      new CustomError("current passwor dyour provided is wroing"),
      401
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();
  createSendResponse(user, 200, res);
});

const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    maxAge: process.env.LOGIN_EXPIRES,
    // makes sure cookie cant be accessed and modifoe by browser
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    // makes sure cookie is ent on only secure http / https

    options.secure = true;
  }
  user.password = undefined;
  res.cookie("jwt", token, options);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// for multiple roles to havew same access
// export const restrict = (...role) => {
//   return (req, res, next) => {
//     if (!role.includes(req.user.role)) {
//       const error = new CustomError(
//         "you dont have access to perform this action",
//         403
//       );
//       next(error);
//     }
//     next();
//   };
// };
