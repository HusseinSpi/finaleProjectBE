const RecentActivity = require("../models/recentActivityModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getRecentActivity = catchAsync(async (req, res, next) => {
  const activityTypes = ["game", "song", "story"];
  const recentActivityPromises = activityTypes.map((type) =>
    RecentActivity.find({ type }).sort({ date: -1 }).limit(10)
  );

  const recentActivities = await Promise.all(recentActivityPromises);

  const mergedActivities = recentActivities.flat();

  res.status(200).json({
    status: "success",
    results: mergedActivities.length,
    data: mergedActivities,
  });
});

exports.createRecentActivity = catchAsync(async (req, res, next) => {
  const newRecentActivity = await RecentActivity.create(req.body);
  res.status(201).json({
    status: "success",
    data: newRecentActivity,
  });
});
