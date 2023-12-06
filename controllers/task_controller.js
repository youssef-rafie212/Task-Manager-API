import Task from "../models/task_model.js";
import * as handlerFactory from "./handler_factory.js";
import catchAsync from "../utils/catch_async.js";
import AppError from "../utils/app_error.js";

export const toggleDoneTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.id;
  const task = await Task.findById(taskId);

  if (!task) return next(new AppError("no task was found with this ID", 404));

  await task.toggleIsDone();

  res.status(200).json({
    status: "ok",
    data: {
      task,
    },
  });
});

export const insertUserID = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

export const getAllTasks = handlerFactory.getAll(Task);
export const getTask = handlerFactory.getOne(Task);
export const createTask = handlerFactory.createOne(Task);
export const deleteTask = handlerFactory.deleteOne(Task);
export const deleteAllTasks = handlerFactory.deleteAll(Task);
export const updateTask = handlerFactory.updateOne(Task);
