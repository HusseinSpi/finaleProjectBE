const Words = require("../models/wordsModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllWords = catchAsync(async (req, res, next) => {
  const words = await Words.find({});
  res.status(200).json({
    status: "success",
    data: words,
  });
});

exports.addWords = catchAsync(async (req, res, next) => {
  const newWord = await Words.create(req.body);
  res.status(201).json({
    status: "success",
    data: newWord,
  });
});
