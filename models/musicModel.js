const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema({
  type: {
    type: string,
    enum: ["general", "alphabet", "numbers"],
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

const Music = mongoose.model("Music", musicSchema);

module.exports = Music;
