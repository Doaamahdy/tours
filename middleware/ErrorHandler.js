const AppError = require("../utilities/appError");

const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateValueError = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: "${value}" Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const msgs = Object.values(err.errors).map((err) => err.message);

  const message = `validation Errors: ${msgs.join(". ")}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) => {
  const message = `Invalid token. Please login again`;
  return new AppError(message, 401);
};
const handleJWTExpiredError = (err) =>
  new AppError("Your Token has been expired. Please log in again", 401);

sendErrorDev = (err, req, res) => {
  // originalUrl ---> request url without the hostname
  // API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }
  //  RENDERED WEBSITE
  console.log(err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } 
      return res.status(500).json({
        status: "error",
        message: "Something Went Very Wrong!",
      });
  }
  // Rendered Website
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  return res.status(500).render("error", {
    title: "Something went wrong!",
    msg: "Please Try again later",
  });
};
const ErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || "500";
  err.status = err.status || "error";
  if (process.env.NODE_ENV == "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV == "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "CastError") error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateValueError(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJsonWebTokenError(err);
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError(err);
    sendErrorProd(error, req, res);
  }
};

module.exports = ErrorHandler;
