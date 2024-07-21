const Music = require("../models/musicModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllMusic = catchAsync(async (req, res, next) => {
  const { type } = req.query;
  let query = {};

  if (type) {
    query.type = type;
  }

  const Musics = await Music.find(query);
  res.status(200).json({
    status: "success",
    data: Musics,
  });
});

exports.addMusic = catchAsync(async (req, res, next) => {
  const newMusic = await Music.create(req.body);
  res.status(201).json({
    status: "success",
    data: newMusic,
  });
});
