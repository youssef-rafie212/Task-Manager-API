import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "a task must have a description"],
      minLength: [4, "a description must be atleast 4 characters"],
      maxLength: [500, "a description must be less than 500 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "a tasks must belong to an user"],
    },
    category: {
      type: String,
      enum: ["Education", "Entertainment", "Travel", "House", "Work", "Others"],
      required: [true, "a task must have a category"],
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

taskSchema.pre(/^find/, function (next) {
  this.populate("user");
  next();
});

taskSchema.methods.toggleIsDone = async function () {
  this.isDone = !this.isDone;
  await this.save();
  return this;
};

const Task = mongoose.model("Task", taskSchema);

export default Task;
