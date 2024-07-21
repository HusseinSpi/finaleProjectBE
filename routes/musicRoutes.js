const express = require("express");
const musicController = require("../controllers/musicController");

const router = express.Router();

router
  .route("/")
  .get(musicController.getAllMusic)
  .post(musicController.addMusic);

module.exports = router;
