const mongoose = require("mongoose");

const musicLanguageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["general", "alphabet", "numbers"],
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

const musicSchema = new mongoose.Schema({
  En: [musicLanguageSchema],
  Ar: [musicLanguageSchema],
  He: [musicLanguageSchema],
});

const Music = mongoose.model("Music", musicSchema);

module.exports = Music;
