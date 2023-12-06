import AppError from "./app_error.js";

const handleCastError = (err) => {
  const message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `duplicate fields : ${value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errorMessages = Object.values(err.errors).map((err) => err.message);
  const message = `validation failed : ${errorMessages.join(" / ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // console.log(err);

    res.status(500).json({
      status: "error",
      message: "something went wrong on our side",
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.message.startsWith("Cast")) error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error._message === "User validation failed")
      error = handleValidationError(error);

    sendErrorProd(res, error);
  }
};

export default errorHandler;
