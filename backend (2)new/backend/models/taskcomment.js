const mongoose = require("mongoose");

const taskcomment = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    task:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    comment:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// taskcomment.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Comment", taskcomment);
