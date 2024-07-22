const mongoose = require("mongoose");

const animalsGameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
});

const AnimalsGame = mongoose.model("AnimalsGame", animalsGameSchema);

module.exports = AnimalsGame;
