import express from "express";

import * as authController from "../controllers/auth_controller.js";

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);

router.patch("/reset-password/:token", authController.resetPassword);

router.use(authController.authenticateToken);

router.post("/logout", authController.logout);

router.patch("/update-password", authController.updatePassword);

export default router;
