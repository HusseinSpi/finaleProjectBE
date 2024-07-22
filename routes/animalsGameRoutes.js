const express = require("express");
const animalsGameController = require("../controllers/animalsGameController");

const router = express.Router();

router
  .route("/")
  .get(animalsGameController.getAllAnimalsGame)
  .post(animalsGameController.addAnimalsGame);

module.exports = router;
