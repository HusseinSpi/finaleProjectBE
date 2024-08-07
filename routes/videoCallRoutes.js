const express = require("express");
const authController = require("../controllers/authController");
const videoCallController = require("../controllers/videoCallController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, videoCallController.getAllAppointment);

router
  .route("/generate-room-url")
  .get(authController.protect, videoCallController.createRoom)
  .post(authController.protect, videoCallController.appointmentBooking);

router
  .route("/scheduled-time")
  .get(authController.protect, videoCallController.getScheduledTime);

module.exports = router;
