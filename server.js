// data sanitization to clean our all data from the code that tryn to injext our data with melicious code
const path = require("path");
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
//Unhandled Eceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 shutting down ...");
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

//import routers
const tourRouter = require("./routes/tour");
const userRouter = require("./routes/user");
const reviewRouter = require("./routes/review");
const viewRouter = require("./routes/viewRoutes");
const ErrorHandler = require("./middleware/ErrorHandler");
const AppError = require("./utilities/appError");

// setting template engine which creates the templates and inject them with data

app.set("view engine", "pug");
// path.join make us not think if there is slash or not it will always generate correct path
app.set("views", path.join(__dirname, "views"));
// Serving Static Files
app.use(express.static(path.join(__dirname, "public")));

//Global Middlewares
//set security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "style-src": [
          "'self'",
          "https://fonts.googleapis.com",
          "'unsafe-inline'",
        ], // Allow Google Fonts and inline styles
        "font-src": ["'self'", "https://fonts.gstatic.com"], // Allow fonts from Google Fonts
      },
    },
  })
);
//limit request from the same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, Please try again after an hour",
});

app.use("/api", limiter);
// body barser reading data from req.body into json
//  limit ing the data size come in the body
app.use(express.json({ limit: "10kb" }));
// to parse the body of the form
app.use(express.urlencoded({ extended: true, limit: "1000kb" }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
//remove all dollar signs and dots that needed to make a query
app.use(mongoSanitize());
// Data Sanitization against XSS
// clean all user input from malicious html code
app.use(xss());
//Prevent Pramater Pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "difficulty",
      "maxGroupSize",
      "ratingsQuantity",
      "ratingsAverage",
      "price",
      "createdAt",
      "imageCover",
      "createdAt",
      "name",
    ],
  })
);

app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

//Handle Unvalid Routes
app.all("*", (req, res, next) => {
  next(new AppError(`Route Doesnot Exist ${req.originalUrl}`, 404));
});

//Global Error Middle Ware
app.use(ErrorHandler);

// console.log(process.env.MONGO_URL);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected Successfuly to the database");
  })
  .catch((err) => {
    // console.log(err);
    console.log("error connecting to the database");
  });

const port = 3000;
const server = app.listen(port, () => {
  console.log("Server Working ......");
});

//Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHNADLED REJECTION! 🔥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

if (process.env.NODE_ENV == "production") {
  console.log("production env");
} else if (process.env.NODE_ENV == "development") {
  console.log("development env");
} else {
  console.log("weird env");
}
