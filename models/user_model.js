import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "a user must have a username"],
      minLength: [4, "a username must be atleast 4 characters"],
      maxLength: [25, "a username must be less than 25 characters"],
    },
    email: {
      type: String,
      required: [true, "a user must have an email"],
      unique: [true, "this email already exists "],
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "a user must have a password"],
      minLength: [8, "a password must be atleast 8 chars"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "please confirm your password"],
      validate: {
        validator: function (pass) {
          return pass === this.password;
        },
        message: "passwords do not match",
      },
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "user",
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.passwordChangedAfter = function (JWTTimeStamp) {
  if (!this.passwordChangedAt) {
    return false;
  }

  const passwordChangedTimeStamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );
  return passwordChangedTimeStamp > JWTTimeStamp;
};

userSchema.methods.isCorrectPassword = async function (
  enteredPassword,
  actualPassword
) {
  return await bcrypt.compare(enteredPassword, actualPassword);
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model("User", userSchema);

export default User;
