const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: "string",
    required: true,
  },
  description: {
    type: "string",
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: "string",
    enum: ["To Do", "In Progress", "Completed"],
    required: true,
  },
  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: [],
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
  isVerifiedByOwner: {
    type: Boolean,
    default: false,
  },
  Proofsubmission:{
    submitBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    note:{
      type: "string",
      required: false,
    },
    zipFile:{
      type: "string",
      required: false,
    },
    aiverified:{
      type:String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    aiFeedBack:{
      type: "string",
      required: false,
    }
  }
});

TaskSchema.index({ title: 1, projectId: 1 }, { unique: false });

module.exports = mongoose.model("Task", TaskSchema);
