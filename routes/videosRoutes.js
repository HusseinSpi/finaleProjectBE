const express = require("express");
const videosController = require("../controllers/videosController");

const router = express.Router();

router
  .route("/")
  .get(videosController.getAllVideos)
  .post(videosController.addVideo);

module.exports = router;
