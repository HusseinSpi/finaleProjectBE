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
  en: [musicLanguageSchema],
  ar: [musicLanguageSchema],
  he: [musicLanguageSchema],
});

const Music = mongoose.model("Music", musicSchema);

module.exports = Music;
