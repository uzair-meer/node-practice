import User from "../models/userModel.js";
import { aysncHnadler } from "../utils/aysncHandler.js";
import { CustomError } from "../utils/customError.js";

export const getAllUsers = aysncHnadler(async (req, res, next) => {
  console.log('hi')
  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

export const getUser = aysncHnadler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new CustomError("user with given id not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const deleteUser = aysncHnadler(async (req, res, next) => {
  console.log(req.params.id);
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new CustomError("user with such id dont exists", 404);
    next(error);
  } else {
    await User.findByIdAndDelete(req.params.id);
  }
  res.status({
    status: "succsses",
    message: "user been deleted successfuly",
  });
});

export const updateMe = aysncHnadler(async (req, res, next) => {
  // only update user details other than password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new CustomError("you cant update password using this route", 400)
    );
  }
  //update rest details // only want to update name and email
  const filteredObj = filterReqObj(req.body, "name", "email");
  const updateUser = await User.findByIdAndUpdate(req.user_id, filterReqObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

export const deleteMe = aysncHnadler(async (req, res, next) => {
  console.log("user id",req.user.id)
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const filterReqObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
};
