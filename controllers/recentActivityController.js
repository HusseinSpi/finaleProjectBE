const RecentActivity = require("../models/recentActivityModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getRecentActivity = catchAsync(async (req, res, next) => {
  const recentActivity = await RecentActivity.find()
    .sort({ date: -1 })
    .limit(10);
  res.status(200).json({
    status: "success",
    results: recentActivity.length,
    data: recentActivity,
  });
});

exports.createRecentActivity = catchAsync(async (req, res, next) => {
  const newRecentActivity = await RecentActivity.create(req.body);
  res.status(201).json({
    status: "success",
    data: newRecentActivity,
  });
});
