const express = require("express");
const storiesController = require("../controllers/storiesController");

const router = express.Router();

router
  .route("/")
  .get(storiesController.getAllStories)
  .post(storiesController.addStories);

module.exports = router;
