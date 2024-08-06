const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
});

const VideoCall = mongoose.model("VideoCall", videoCallSchema);

module.exports = VideoCall;
