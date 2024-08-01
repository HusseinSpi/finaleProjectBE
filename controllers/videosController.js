const Videos = require("../models/videosModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllVideos = catchAsync(async (req, res, next) => {
  const videos = await Videos.find();
  res.status(200).json({
    status: "success",
    data: videos,
  });
});

exports.addVideo = catchAsync(async (req, res, next) => {
  const newVideos = await Videos.create(req.body);
  res.status(201).json({
    status: "success",
    data: newVideos,
  });
});
