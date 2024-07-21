const Stories = require("../models/storiesModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllStories = catchAsync(async (req, res, next) => {
  const stories = await Stories.find({});
  res.status(200).json({
    status: "success",
    data: stories,
  });
});

exports.addStories = catchAsync(async (req, res, next) => {
  const newBook = await Stories.create(req.body);
  res.status(201).json({
    status: "success",
    data: newBook,
  });
});
