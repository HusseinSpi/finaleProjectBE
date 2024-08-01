const mongoose = require("mongoose");

const VideosLanguageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

const videosSchema = new mongoose.Schema({
  en: [VideosLanguageSchema],
  ar: [VideosLanguageSchema],
  he: [VideosLanguageSchema],
});

const Videos = mongoose.model("Videos", videosSchema);

module.exports = Videos;
