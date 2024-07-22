const AnimalsGame = require("../models/animalsGameModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllAnimalsGame = catchAsync(async (req, res, next) => {
  const animalsGames = await AnimalsGame.find();
  res.status(200).json({
    status: "success",
    data: animalsGames,
  });
});

exports.addAnimalsGame = catchAsync(async (req, res, next) => {
  const newAnimalsGame = await AnimalsGame.create(req.body);
  res.status(201).json({
    status: "success",
    data: newAnimalsGame,
  });
});
