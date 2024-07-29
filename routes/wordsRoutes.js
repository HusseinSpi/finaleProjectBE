const express = require("express");
const wordsController = require("../controllers/wordsControllers");

const router = express.Router();

router
  .route("/")
  .get(wordsController.getAllWords)
  .post(wordsController.addWords);

module.exports = router;
