import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter your name"],
  },
  email: {
    type: String,
    required: [true, "pleqse enter your email"],
    unique: true,
    validate: [validator.isEmail, "please enter your valid email"],
  },
  photo: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "please enter a password"],
    minlength: 4,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (val) {
        return val == this.password;
      },
      message: "password and confrm password aint not matced",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

// pre middlware/hooks
// executed before doc is saved save or create
// save dont happen on insert many
// only run if user updates. creates password

// in post scene we dont get doc automarticall loike in pre
// but we gotta recive i doc
// userSchema.post("save", async function (doc,next)

// BUT DATA IS NOT REALLY SAVED IN DB
// can run mutiple pre and post hooks on single
userSchema.pre("save", async function (next) {
  // tell on ehich field you
  // have axcess to current doc
  if (!this.isModified("password")) return next();

  // encrypt before saving
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

// comparing password with
// instance method availabe on all docs of given collection

userSchema.methods.comparePassword = async (password, passwordDB) => {
  return await bcrypt.compare(password, passwordDB);
};

userSchema.methods.isPasswordChanged = async function (jwtTimeStamp) {
  console.log("time stamp", jwtTimeStamp);
  if (this.passwordChangedAt) {
    const passwordChangeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimeStamp < passwordChangeTimeStamp;
    // convertin date to stamp
  }

  return false;
};

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STRING, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // just setting values not reaaly saved
  // unless.save()
  // ecrypted reset stored in db
  // simple tokensent to user
  // then when iser send token , we compare with encrypted on
  return resetToken;
};
// pre middle ware // before quer
// moiddleware function
userSchema.pre(/^find/, function (next) {
  // this keyword reprsenrs perenst running
  // it runs before any FIND query runs
  this.find({ active: true });
});
const User = mongoose.model("User", userSchema);
export default User;
