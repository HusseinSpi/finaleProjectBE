const VideoCall = require("../models/videoCallModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createRoom = catchAsync(async (req, res, next) => {
  try {
    const roomUrl =
      "https://psychologyvideocall.whereby.com/8aad5053-4a01-4649-83cf-144ca62ef6db";
    console.log("Generated room URL:", roomUrl);
    res.status(200).json({
      status: "success",
      data: { roomUrl },
    });
  } catch (error) {
    return next(new AppError("Error generating room URL", 500));
  }
});

exports.appointmentBooking = catchAsync(async (req, res, next) => {
  const newVideoCall = await VideoCall.create({
    date: req.body.date,
    user: req.body.user,
  });
  res.status(201).json({
    status: "success",
    data: newVideoCall,
  });
});

exports.getScheduledTime = catchAsync(async (req, res, next) => {
  const videoCall = await VideoCall.findOne().sort({ date: -1 });
  if (!videoCall) {
    return next(new AppError("No scheduled time found", 404));
  }
  res.status(200).json({
    status: "success",
    scheduledTime: videoCall.date,
  });
});

exports.getAllAppointment = catchAsync(async (req, res, next) => {
  const videoCalls = await VideoCall.find({});
  res.status(200).json({
    status: "success",
    data: videoCalls,
  });
});
