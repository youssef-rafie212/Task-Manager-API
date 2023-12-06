import express from "express";

import * as taskController from "../controllers/task_controller.js";
import * as authController from "../controllers/auth_controller.js";

const router = express.Router({ mergeParams: true });

router.use(authController.authenticateToken);

router.patch("/toggle-done-task/:id", taskController.toggleDoneTask);

router
  .route("/")
  .get(taskController.getAllTasks)
  .post(taskController.insertUserID, taskController.createTask)
  .delete(taskController.deleteAllTasks);

router
  .route("/:id")
  .get(taskController.getTask)
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);

export default router;
