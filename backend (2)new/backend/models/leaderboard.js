const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
    
});