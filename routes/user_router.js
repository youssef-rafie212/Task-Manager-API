import express from "express";

import * as userController from "../controllers/user_controller.js";
import * as authController from "../controllers/auth_controller.js";
import taskRouter from "./task_router.js";

const router = express.Router();

router.use("/:id/tasks/", taskRouter);

router.use(authController.authenticateToken);

router.get("/me", userController.getMe);

router.patch("/update-me", userController.updateMe);

router.delete("/delete-me", userController.deleteMe);

export default router;
