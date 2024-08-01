const express = require("express");
const drawController = require("../controllers/drawController");

const router = express.Router();

router.route("/").get(drawController.getAllDraws).post(drawController.addDraw);

module.exports = router;
