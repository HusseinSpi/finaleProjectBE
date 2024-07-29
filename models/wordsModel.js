const mongoose = require("mongoose");

const wordsSchema = new mongoose.Schema(
  {
    word_en: {
      type: String,
      required: true,
    },
    word_ar: {
      type: String,
      required: true,
    },
    word_he: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Words = mongoose.model("Words", wordsSchema);

module.exports = Words;
