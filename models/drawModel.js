const mongoose = require("mongoose");

const drawSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
});

const Draw = mongoose.model("Draw", drawSchema);

module.exports = Draw;
