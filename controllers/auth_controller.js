import jwt from "jsonwebtoken";
import util from "util";
import crypto from "crypto";

import catchAsync from "../utils/catch_async.js";
import AppError from "../utils/app_error.js";
import User from "../models/user_model.js";
import sendMail from "../utils/email.js";

const createAndSendToken = (user, res) => {
  const token = jwt.sign({ id: user.id }, process.env.SECRETKEY);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
  });

  user.password = undefined;

  res.status(200).json({
    status: "ok",
    data: {
      token,
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  createAndSendToken(user, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please enter both email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError("wrong email or password", 400));
  }

  createAndSendToken(user, res);
});

export const logout = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    status: "ok",
  });
};

export const authenticateToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new AppError("please login to access this route", 401));
  }

  const promisify = util.promisify;
  const decoded = await promisify(jwt.verify)(token, process.env.SECRETKEY);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("this user does not exist anymore", 401));
  }

  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError("this user changed their password please login again", 401)
    );
  }

  req.user = currentUser;
  next();
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  if (!oldPassword || !newPassword) {
    return next(new AppError("please provide both old and new passwords", 400));
  }

  if (!(await user.isCorrectPassword(oldPassword, user.password))) {
    return next(new AppError("wrong password", 400));
  }

  user.password = newPassword;
  await user.save();

  createAndSendToken(user, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("please provide an email", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("no user was found with that email", 404));
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/reset-password/${resetToken}`;

  const message = `Forgot your password ? please send a patch request with the new password and passowrd confirm to this URL : ${resetURL}`;

  try {
    await sendMail({ email, subject: "password reset", message });

    res.status(200).json({
      status: "ok",
      message: "a URL is sent to your email to reset your password",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "something wrong happened while sending the email , please try again later",
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("invalid or expired token", 401));
  }

  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError("please enter both password and password confirm", 400)
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;

  await user.save();

  createAndSendToken(user, res);
});
