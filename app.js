import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";

import taskRouter from "./routes/task_router.js";
import userRouter from "./routes/user_router.js";
import authRouter from "./routes/auth_router.js";
import AppError from "./utils/app_error.js";
import errorHandler from "./utils/error_handler.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(mongoSanitize());

app.use(cors());

const limiter = rateLimit({
  limit: 60,
  windowMs: 60 * 1000,
  message: "too many requests from this IP please try again in a min",
});

app.use("/api", limiter);

app.use("/api/v1/tasks", taskRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/auth", authRouter);

app.use(hpp());

app.all("*", (req, res, next) => {
  next(new AppError("can not find this URL on this server", 404));
});

app.use(errorHandler);

export default app;
