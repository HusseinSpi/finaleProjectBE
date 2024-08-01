const Articles = require("../models/articlesModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await Articles.find();
  res.status(200).json({
    status: "success",
    data: articles,
  });
});

exports.addArticle = catchAsync(async (req, res, next) => {
  const newArticle = await Articles.create(req.body);
  res.status(201).json({
    status: "success",
    data: newArticle,
  });
});
