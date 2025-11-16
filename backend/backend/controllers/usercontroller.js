const express = require("express");
const User = require("../models/usermodel");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const redisClient = require("../services/redis.js");
const mongoose = require("mongoose");
const profile = require("../models/profile.js");
const userprojectss = require("../models/userproject.js");
const Project = require("../models/projectmodel.js");
// const profile = require('../models/profile.js');

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { use } = require("../routes/userroute.js");
// const { default: Profile } = require("../../frontend/src/components/Profile.jsx");

// Use /tmp directory for Vercel (only writable directory in serverless)
const uploadDir = "/tmp/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration with Renamed Path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in '/tmp/uploads/' directory
  },
  filename: (req, file, cb) => {
    const userId = req.user.id; // Get user ID
    const fileExt = path.extname(file.originalname); // Get file extension
    const newFilename = `profile_${userId}_${Date.now()}${fileExt}`; // Rename file
    cb(null, newFilename);
  },
});

// Multer Upload Middleware
const upload = multer({ storage }).single("avatar");

exports.createuser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const isalreadyexist = await User.findOne({ email });
    if (isalreadyexist) {
      return res.status(400).json({
        errors: [{ msg: "User already exists" }],
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${username}`;

    const newprofile = await profile.create({
      bio: "This is my bio",
      avatar: profileImage,
      skills: ["HTML", "CSS", "JS"],
      experience: "I have 5 years of experience",
      experienceLevel: "Intermediate", // default or customize later
      interests: ["Web Development", "Open Source"], // default interest tags
      education: "I have completed my graduation",
      social: {
        youtube: "https://www.youtube.com",
        facebook: "https://www.facebook.com",
        twitter: "https://www.twitter.com",
        linkedin: "https://www.linkedin.com",
        instagram: "https://www.instagram.com",
        github: "https://www.github.com",
      },
      projects: [],
      requests: [],
      points: 0,
      isactive: true,
      activeat: new Date(),
      weeklyLogins: [new Date()],
      responseTimes: [],
      taskCompletionRates: [],
      githubCommits: 0,
      reliabilityScore: 0,
    });

    const newuser = await User.create({
      username,
      email,
      password: hashPassword,
      profile: newprofile._id,
      profileImage,
    });

    const populateduser = await newuser.populate("profile");

    res.status(200).json({
      success: true,
      message: "New user is created successfully",
      data: populateduser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
exports.updateuserprofile = async (req, res) => {
  try {
    // Handle File Upload
    upload(req, res, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Error uploading file", error: err });
      }

      const {
        bio,
        skills,
        experience,
        education,
        social,
        experienceLevel,
        interests,
      } = req.body;
      const userId = req.user.id;

      // Fetch user and profile details
      const userData = await User.findOne({ _id: userId }).populate("profile");
      if (!userData) {
        return res.status(404).json({ msg: "User not found" });
      }

      const profileId = userData.profile?._id;
      if (!profileId) {
        return res.status(404).json({ msg: "Profile not found" });
      }

      // Prepare updated data
      const updatedData = {
        bio,
        skills,
        experience,
        education,
        social,
        experienceLevel,
        interests,
      };

      // If an avatar was uploaded, update it
      if (req.file) {
        updatedData.avatar = `/uploads/${req.file.filename}`; // Save file path
      }

      // Update Profile
      const existingProfile = await profile.findById(profileId);

      if (!existingProfile) {
        return res.status(404).json({ msg: "Profile not found" });
      }

      // Merge existing fields with new ones
      const mergedProfile = {
        bio: bio || existingProfile.bio,
        skills: skills
          ? skills.split(",").map((s) => s.trim())
          : existingProfile.skills,
        experience: experience || existingProfile.experience,
        education: education || existingProfile.education,
        social: {
          ...existingProfile.social.toObject(),
          ...social,
        },
        experienceLevel: experienceLevel || existingProfile.experienceLevel,
        interests: interests
          ? interests.split(",").map((i) => i.trim())
          : existingProfile.interests,
        avatar: req.file
          ? `/uploads/${req.file.filename}`
          : existingProfile.avatar,
      };

      const updatedProfile = await profile.findByIdAndUpdate(
        profileId,
        { $set: mergedProfile },
        { new: true }
      );

      // Populate updated user profile
      const updatedUserProfile = await User.findOne({ _id: userId }).populate(
        "profile"
      );

      return res.status(200).json({
        msg: "Profile updated successfully",
        data: updatedUserProfile,
      });
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("email", email);

    const user = await User.findOne({ email }).populate("profile");
    console.log("user in backend", user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.status(404).json({ msg: "Invalid password" });
    }
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
    };
    // Access token - shorter lifespan for security
    let token = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: "15m",
    });
    // Refresh token - longer lifespan for persistence
    let refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const today = new Date();
    const strtoday = today.toDateString();
    const profile = user.profile;
    const alreadyloggedintoday = profile.weeklyLogins.some(
      (d) => new Date(d).toDateString() === strtoday
    );

    if (!alreadyloggedintoday) {
      profile.weeklyLogins.push(today);
      profile.points += 1;
      profile.pointHistory.push({
        date: new Date(),
        points: 1,
        reason: "Daily Login bonus",
      });
    }
    profile.activeat = today;
    await profile.save();
    const userWithToken = {
      ...user._doc, // Spread the user's document to retain its fields
      token,
      refreshToken,
    };
    const options = { expires: new Date(Date.now() + 3600000), httpOnly: true };
    return res.cookie("token", token, options).status(200).json({
      message: "User logged in successfully",
      userWithToken,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    if (!redisClient.status === "ready") {
      return res
        .status(500)
        .json({ msg: "Redis client not initialized or ready" });
    }
    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    return res.status(200).json({ msg: "User logged out successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ msg: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET
    );

    // Get user from database
    const user = await User.findById(decoded.id).populate("profile");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate new access token
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const newToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: "15m",
    });

    // Return new token with user data
    const userWithToken = {
      ...user._doc,
      token: newToken,
      refreshToken, // Keep the same refresh token
    };

    return res.status(200).json({
      message: "Token refreshed successfully",
      userWithToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return res.status(401).json({ msg: "Invalid refresh token" });
  }
};
exports.getprofile = async (req, res) => {
  try {
    const userid = req.user.id;
    console.log("userId", userid);
    const userdata = await User.findById(userid)
      .select("-password") // Exclude password
      .populate({
        path: "profile",
        populate: [
          {
            path: "projects",
            model: "Project", // Ensure this matches your model name
            populate: [
              {
                path: "user",
                modal: "User",
              },
            ],
          },
          {
            path: "requests",
            model: "ProjectRequest", // Ensure this matches your model name
            populate: [
              {
                path: "sender",
                model: "User",
              },
              {
                path: "receiver",
                model: "User",
              },
              {
                path: "project",
                model: "Project",
              },
            ],
          },
        ],
      });

    console.log("userdata", userdata);

    return res.status(200).json({ userdata });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getalluser = async (req, res) => {
  try {
    console.log("Logged-in user ID:", req.user.id);

    // Validate if the user ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ msg: "Invalid user ID format" });
    }
    const alluser = await User.find({ _id: { $ne: req.user.id } }).populate({
      path: "profile", // Populate the profile field
      populate: {
        path: "projects", // Populate the projects inside profile
        model: "Project", // Ensure this matches your model name
      },
    });
    if (!alluser) {
      return res.status(404).json({ msg: "No users found" });
    }
    return res.status(200).json({
      msg: "All users fetched successfully",
      users: alluser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getdeveloperProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const user = await User.findOne({ _id: id }).populate({
      path: "profile",
      populate: [
        {
          path: "projects",
          model: "Project",
          populate: [
            {
              path: "user",
              model: "User",
              populate: {
                model: "Profile",
                path: "profile",
              },
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    console.log("user", user);
    return res.status(200).json({
      msg: "User profile fetched successfully",
      user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.updateguideline = async (req, res) => {
  try {
    // 1. Get the user ID from the authenticated request.
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId, // The ID of the document to find
      { $set: { hascompletedGuideline: true } }, // Use $set to update the boolean field
      { new: true } // This option returns the document *after* the update has been applied
    );
    const newupdateduser = await updatedUser.populate("profile");

    // 3. If no user was found with that ID, send a 404 "Not Found" response.
    if (!newupdateduser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. If the update was successful, send a 200 "OK" response with the updated user data.
    res.status(200).json({
      data: newupdateduser,
      message: "Guideline status updated successfully.",
    });
  } catch (err) {
    // 5. If any other error occurs, log it and send a 500 "Internal Server Error" response.
    console.error("Error in updateguideline controller:", err);
    res
      .status(500)
      .json({ message: "An error occurred while updating user data." });
  }
};
