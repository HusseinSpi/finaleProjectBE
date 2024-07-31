const express = require("express");
const booksController = require("../controllers/booksController");

const router = express.Router();

router
  .route("/")
  .get(booksController.getAllBooks)
  .post(booksController.addBook);

module.exports = router;
