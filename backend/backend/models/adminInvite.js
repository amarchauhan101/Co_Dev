const mongoose = require("mongoose");

const adminInvitationModel = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin","super-admin"],
      required: true,
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
    },
    inviteBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },
    expiredAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

adminInvitationModel.index({ expiredAt:1},{expireAfterSeconds:0});

module.exports = mongoose.model("AdminInvite", adminInvitationModel);
