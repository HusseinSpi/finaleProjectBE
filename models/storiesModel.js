const mongoose = require("mongoose");

const paragraphSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const storiesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    paragraphs: [paragraphSchema],
    img: {
      type: String,
      required: true,
    },
    sound: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Stories = mongoose.model("Stories", storiesSchema);

module.exports = Stories;
