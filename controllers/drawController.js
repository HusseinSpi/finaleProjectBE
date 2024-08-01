const Draw = require("../models/drawModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllDraws = catchAsync(async (req, res, next) => {
  const draws = await Draw.find();
  res.status(200).json({
    status: "success",
    data: draws,
  });
});

exports.addDraw = catchAsync(async (req, res, next) => {
  const newDraw = await Draw.create(req.body);
  res.status(201).json({
    status: "success",
    data: newDraw,
  });
});
