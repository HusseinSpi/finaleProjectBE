const express = require("express");
const recentActivityController = require("../controllers/recentActivityController");

const router = express.Router();

router
  .route("/")
  .get(recentActivityController.getRecentActivity)
  .post(recentActivityController.createRecentActivity);

module.exports = router;
