import User from "../models/user_model.js";
import catchAsync from "../utils/catch_async.js";
import AppError from "../utils/app_error.js";

export const getMe = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);

  res.status(200).json({
    status: "ok",
    data: {
      currentUser,
    },
  });
});

const filterBody = (body, ...allowedFields) => {
  let filteredBody = {};

  Object.keys(body).forEach((field) => {
    if (allowedFields.includes(field)) {
      filteredBody[field] = body[field];
    }
  });

  return filteredBody;
};

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError("use this endpoint to update username and email only", 400)
    );
  }

  const filteredBody = filterBody(req.body, "username", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "ok",
    data: {
      updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    status: "ok",
    data: null,
  });
});
