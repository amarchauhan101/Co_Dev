const mongoose = require("mongoose");
const profile = require("../models/profile.js");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      requried: true,
      lowercase: true,
      minLength: [6, "email must be at least  6 characters"],
      maxLength: [50, "email must be at least 10 characters"],
    },
    password: {
      type: String,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    profileImage: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/5.x/initials/svg?seed=${this.username}`;
      },
    },
    hascompletedGuideline: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
