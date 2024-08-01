const express = require("express");
const articlesControllers = require("../controllers/articlesControllers");

const router = express.Router();

router
  .route("/")
  .get(articlesControllers.getAllArticles)
  .post(articlesControllers.addArticle);

module.exports = router;
