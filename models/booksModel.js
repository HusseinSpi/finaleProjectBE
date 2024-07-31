const mongoose = require("mongoose");

const BooksLanguageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const booksSchema = new mongoose.Schema({
  en: [BooksLanguageSchema],
  ar: [BooksLanguageSchema],
  he: [BooksLanguageSchema],
});

const Books = mongoose.model("Books", booksSchema);

module.exports = Books;
