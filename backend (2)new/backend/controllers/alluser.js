const express = require("express");

const User = require("../models/usermodel");

exports.getallusers = async(req,res)=>{
    try {
        const users = await User.find({}, '-password -__v').populate({
            model: 'Profile',
            path: 'profile',
        })
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}