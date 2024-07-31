const Books = require("../models/booksModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllBooks = catchAsync(async (req, res, next) => {
  const books = await Books.find();
  res.status(200).json({
    status: "success",
    data: books,
  });
});

exports.addBook = catchAsync(async (req, res, next) => {
  const newBooks = await Books.create(req.body);
  res.status(201).json({
    status: "success",
    data: newBooks,
  });
});
