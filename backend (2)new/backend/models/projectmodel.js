const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        default: [],
      },
    ],
    task: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: [],
      },
    ],
    description: {
      type: String,
    },
    technologies: {
      type: String,
    },
    github: {
      repoName: { type: String },
      owner: { type: String },
      accessToken: { type: String }, // store encrypted or use short-lived tokens
      defaultBranch: { type: String, default: "main" },
      lastCommitFetched: { type: Date },
    },

    liveDemoLink: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// projectSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);
