const mongoose = require("mongoose");

const RecentActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: String,
    required: true,
  },
});

const RecentActivity = mongoose.model("RecentActivity", RecentActivitySchema);

module.exports = RecentActivity;
