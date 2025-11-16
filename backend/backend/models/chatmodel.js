const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    // required: true,
  },
  file: {
    type: String,
    default: "", // this will store the Firebase file URL
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", chatSchema);
