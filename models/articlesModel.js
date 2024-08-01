const mongoose = require("mongoose");

const ArticlesLanguageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

const articlesSchema = new mongoose.Schema({
  en: [ArticlesLanguageSchema],
  ar: [ArticlesLanguageSchema],
  he: [ArticlesLanguageSchema],
});

const Articles = mongoose.model("Articles", articlesSchema);

module.exports = Articles;
