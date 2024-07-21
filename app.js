const express = require("express");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");

const booksRoutes = require("./routes/storiesRoutes");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());

app.use(express.json());
app.use(mongoSanitize());
app.use(xss());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/images", express.static("images"));
app.use("/sounds", express.static("sounds"));

app.use("/api/v1/stories", booksRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
