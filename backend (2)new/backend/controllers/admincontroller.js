const express = require("express");
const User = require("../models/usermodel");
const AdminInvite = require("../models/adminInvite");
const { sendInvitationEmail } = require("../services/nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Project = require("../models/projectmodel");
const ProjectRequest = require("../models/ProjectRequest");
const Task = require("../models/task");
const Profile = require("../models/profile");

exports.firstSuperAdmin = async (req, res) => {
  try {
    const { email, secretkey } = req.body;

    if (secretkey != process.env.SECRET_KEY) {
      console.log("these key is invalid");
      return res.status(400).json({ message: "these key is invalid" });
    }

    const isadmin = await User.findOne({ isAdmin: true });
    if (isadmin) {
      return res
        .status(400)
        .json({ message: "these admin is already exist in the system" });
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ message: "these user is already exist in the system" });
    }

    const invitationaToken = crypto.randomBytes(32).toString("hex");
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await AdminInvite.create({
      email: email,
      role: "super-admin",
      invitationToken: invitationaToken,
      inviteBy: null,
      expiredAt: expiredAt,
      used: false,
    });
    await sendInvitationEmail(email, invitationaToken, "super-admin");

    res.status(200).json({
      success: true,
      msg: "🎉 Super admin invitation sent successfully!",
      email,
      expiredAt,
    });
  } catch (err) {
    console.log("err in creating first super admin", err);
  }
};

exports.adminInvite = async (req, res) => {
  try {
    const { email, role } = req.body;
    const userExist = await User.findOne({ email });
    if (!req.user.isAdmin) {
      console.log("admin can only access these page");
    }
    if (userExist) {
      console.log("these user already exists");
      return res.status(400).json({
        msg: "these user already exists",
      });
    }

    if (!["admin", "super-admin"].includes(role)) {
      return res.status(400).json({
        msg: "these role is invalid",
      });
    }
    if (role === "super-admin") {
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({
          msg: "only super-admin can invite other super-admin",
        });
      }
    }

    const existingInvitation = await AdminInvite.findOne({
      email,
      used: false,
      expiredAt: { $gt: new Date() },
    });
    if (existingInvitation) {
      return res.status(400).json({
        msg: "❌ Active invitation already exists for this email",
      });
    }
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const inviteAdmin = await AdminInvite.create({
      email: email,
      role: role,
      invitationToken: invitationToken,
      inviteBy: req.user.id,
      expiredAt: expiredAt,
      used: false,
    });

    await sendInvitationEmail(email, invitationToken, role);
    return res.status(200).json({
      success: true,
      msg: "invitation sent successfully",
      inviteAdmin,
    });
  } catch (err) {
    console.log("eerr in invite the admin", err);
    res.status(500).json({
      msg: "server err",
    });
  }
};

exports.promoteAdmin = async (req, res) => {
  try {
    const { email, newRole } = req.body;

    if (newRole === "super-admin" && req.user.role != "super-admin") {
      return res.status(403).json({
        msg: "only super-admin can promote other admins",
      });
    }
    if (newRole === "admin" && req.user.role != "super-admin") {
      return res.status(403).json({
        msg: "only super-admin can promote other admins",
      });
    }

    if (!["user", "admin", "super-admin"].includes(newRole)) {
      return res.status(400).json({
        msg: "these role is invalid",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "user not found",
      });
    }

    if (user.role === newRole) {
      return res.status(400).json({
        msg: "user is already in this role",
      });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "user role updated successfully",
      user,
    });
  } catch (err) {
    console.log("error in promoting admin", err);
    res.status(500).json({
      msg: "server error",
    });
  }
};

exports.registerWithInvitation = async (req, res) => {
  try {
    console.log("📥 Received registration data:", req.body); // Debug log

    const { username, email, password, invitationToken } = req.body;

    // Validate required fields
    if (!username || username.trim() === "") {
      return res.status(400).json({
        msg: "Username is required",
      });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({
        msg: "Email is required",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters",
      });
    }

    if (!invitationToken || invitationToken.trim() === "") {
      return res.status(400).json({
        msg: "Invitation token is required",
      });
    }

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        msg: "User already exists with this email",
      });
    }

    // Check if username is taken
    const usernameExist = await User.findOne({ username });
    if (usernameExist) {
      return res.status(400).json({
        msg: "Username is already taken",
      });
    }

    let userRole = "user";
    let isAdmin = false;
    let isSuperAdmin = false;

    // Validate invitation token
    if (invitationToken) {
      console.log("🎫 Checking invitation token:", invitationToken);

      const invitation = await AdminInvite.findOne({
        invitationToken: invitationToken,
        used: false,
        expiredAt: { $gt: new Date() },
      });

      if (!invitation) {
        return res.status(400).json({
          msg: "Invalid or expired invitation token",
        });
      }

      console.log("✅ Valid invitation found:", invitation);

      userRole = invitation.role;
      isAdmin = true;
      isSuperAdmin = invitation.role === "super-admin";

      // Mark invitation as used
      invitation.used = true;
      invitation.usedAt = new Date();
      await invitation.save();
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate profile image
    const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${username}`;

    // Create profile
    const newprofile = await Profile.create({
      bio: "This is my bio",
      avatar: profileImage,
      skills: ["HTML", "CSS", "JS"],
      experience: "I have 5 years of experience",
      experienceLevel: "Intermediate",
      interests: ["Web Development", "Open Source"],
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
      status: "Active", // Set default status
      isactive: true,
      isAdmin: true,
      activeat: new Date(),
      weeklyLogins: [new Date()],
      responseTimes: [],
      taskCompletionRates: [],
      githubCommits: 0,
      reliabilityScore: 0,
    });

    // Create user
    const newuser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashPassword,
      role: userRole,
      isAdmin: isAdmin,
      isSuperAdmin: isSuperAdmin,
      profile: newprofile._id,
      profileImage,
    });

    const populateduser = await newuser.populate("profile");
    const responseUser = {
      ...populateduser.toObject(),
      password: undefined, // Remove password from response
    };

    console.log("✅ User created successfully:", responseUser.username);

    res.status(200).json({
      success: true,
      message: isAdmin
        ? `New ${userRole} created successfully! Welcome to the admin team.`
        : "New user created successfully",
      user: responseUser,
    });
  } catch (err) {
    console.error("❌ Error in register with invitation:", err);
    res.status(500).json({
      msg: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
exports.adminDashboard = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      console.log("only admin can accesss the pagge");
    }
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUser = await User.countDocuments();
    const userWithProfile = await User.find({}).populate("profile");
    const activeUser = userWithProfile.filter(
      (user) => user.profile && user.profile?.status == "Active"
    ).length;

    const inActiveUser = userWithProfile.filter(
      (user) => user.profile && user.profile?.status == "Inactive"
    ).length;

    const BannedUser = userWithProfile.filter(
      (user) => user.profile && user.profile?.status == "Banned"
    ).length;

    const recentActiveUsers = userWithProfile.filter(
      (user) =>
        user.profile &&
        user.profile.weeklyLogins &&
        user.profile.weeklyLogins.length > 0
    ).length;

    const newUserThisWeek = await User.countDocuments({
      createdAt: { $gte: lastWeek },
    });

    const newUserThisMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth },
    });

    const newUserTotal = newUserThisWeek + newUserThisMonth;

    const totalProjects = await Project.countDocuments();
    const newProjectthisWeek = await Project.countDocuments({
      createdAt: { $gte: lastWeek },
    });

    const totalTasks = await Task.countDocuments();
    const TaskCompleted = await Task.countDocuments({
      status: "Completed",
    });
    const TaskPending = await Task.countDocuments({
      status: "To Do",
    });
    const TaskInProgress = await Task.countDocuments({
      status: "In Progress",
    });

    const totalRequests = await ProjectRequest.countDocuments();
    const pendingRequests = await ProjectRequest.countDocuments({
      status: "pending",
    });
    const acceptedRequests = await ProjectRequest.countDocuments({
      status: "accepted",
    });

    let adminStats = {};
    if (req.user.role == "super-admin") {
      const totalAdmins = await User.countDocuments({ isAdmin: true });
      const Admins = await User.countDocuments({ role: "admin" });
      const SuperAdmin = await User.countDocuments({ role: "super-admin" });
      adminStats = {
        Admins,
        SuperAdmin,
        totalAdmins,
      };
    }
    const allProfiles = await Profile.find({});
    const totalPoints = allProfiles.reduce(
      (sum, profile) => sum + (profile.points || 0),
      0
    );
    const averagePoints =
      allProfiles.length > 0 ? Math.round(totalPoints / allProfiles.length) : 0;

    const dashboardStats = {
      users: {
        total: totalUser,
        active: activeUser,
        inactive: inActiveUser,
        banned: BannedUser,
        recendActive: recentActiveUsers,
        newUserThisWeek: newUserThisWeek,
        newUserThisMonth: newUserThisMonth,
        newUserTotal: newUserTotal,
        totalPoints,
        averagePoints,
      },
      projects: {
        total: totalProjects,
        newThisWeek: newProjectthisWeek,
      },
      tasks: {
        total: totalTasks,
        completed: TaskCompleted,
        pending: TaskPending,
        inProgress: TaskInProgress,
        completionRate:
          totalTasks > 0 ? Math.round((TaskCompleted / totalTasks) * 100) : 0,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        accepted: acceptedRequests,
        rejected: totalRequests - pendingRequests - acceptedRequests,
      },
      ...(req.user.role === "super-admin" && { admin: adminStats }),
    };

    res.status(200).json({
      success: true,
      msg: "Dashboard stats retrieved successfully",
      stats: dashboardStats,
      userRole: req.user.role,
    });
  } catch (err) {
    console.log("err in geting admin dashboard", err);
    return res.status(500).json({
      msg: "server err",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      role = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role !== "all") {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("profile")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });

    const total = await User.countDocuments(query);

    // Add activity stats for each user
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        const projectsOwned = await Project.countDocuments({ owner: user._id });
        const tasksAssigned = await Task.countDocuments({
          assignedTo: user._id,
        });
        const tasksCompleted = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        });
        const requestsSent = await ProjectRequest.countDocuments({
          sender: user._id,
        });

        return {
          ...user.toObject(),
          activity: {
            projectsOwned,
            tasksAssigned,
            tasksCompleted,
            requestsSent,
            lastActive: user.profile?.activeat || "Never",
            totalPoints: user.profile?.points || 0,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithActivity,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.log("Error in getting all users:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET SINGLE USER DETAILS
exports.getUserDetails = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password")
      .populate("profile");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get user's projects
    const ownedProjects = await Project.find({ owner: userId }).limit(10);
    const joinedProjects = await Project.find({ user: userId }).limit(10);

    // Get user's tasks
    const userTasks = await Task.find({ assignedTo: userId })
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's requests
    const sentRequests = await ProjectRequest.find({ sender: userId })
      .populate("receiver", "username email")
      .sort({ createdAt: -1 })
      .limit(5);

    const userDetails = {
      ...user.toObject(),
      projects: { owned: ownedProjects, joined: joinedProjects },
      tasks: userTasks,
      requests: { sent: sentRequests },
    };

    res.status(200).json({
      success: true,
      user: userDetails,
    });
  } catch (err) {
    console.log("Error in getting user details:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE USER STATUS (Ban/Suspend/Activate)
exports.updateUserStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!["Active", "Inactive", "Banned"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const user = await User.findById(userId).populate("profile");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent self-modification
    if (userId === req.user.id) {
      return res.status(400).json({ msg: "Cannot change your own status" });
    }

    // Only super admin can change admin status
    if (user.isAdmin && req.user.role !== "super-admin") {
      return res
        .status(403)
        .json({ msg: "Only super admin can change admin status" });
    }

    // Update status in profile model
    user.profile.status = status;
    await user.profile.save();

    res.status(200).json({
      success: true,
      msg: `User ${status} successfully`,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    console.log("Error in updating user status:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE USER POINTS
exports.updateUserPoints = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { userId } = req.params;
    const { points, reason } = req.body;

    const user = await User.findById(userId).populate("profile");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.profile.points += points;
    await user.profile.save();

    res.status(200).json({
      success: true,
      msg: "User points updated successfully",
      newPoints: user.profile.points,
    });
  } catch (err) {
    console.log("Error in updating user points:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL PROJECTS
exports.getAllProjects = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query)
      .populate("owner", "username email profileImage")
      .populate("user", "username email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });

    const total = await Project.countDocuments(query);

    // Add project statistics
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({
          projectId: project._id,
        });
        const completedTasks = await Task.countDocuments({
          projectId: project._id,
          status: "Completed",
        });
        const activeMembers = project.user?.length || 0;

        return {
          ...project.toObject(),
          stats: {
            totalTasks,
            completedTasks,
            taskCompletionRate:
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0,
            activeMembers,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      projects: projectsWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.log("Error in getting all projects:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET PROJECT DETAILS
exports.getProjectDetails = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("owner", "username email profileImage")
      .populate("user", "username email profileImage");

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Get project tasks
    const projectTasks = await Task.find({ projectId }).populate(
      "assignedTo",
      "username email"
    );

    // Get project requests
    const projectRequests = await ProjectRequest.find({ project: projectId })
      .populate("sender", "username email")
      .populate("receiver", "username email");

    const projectDetails = {
      ...project.toObject(),
      tasks: projectTasks,
      requests: projectRequests,
    };

    res.status(200).json({
      success: true,
      project: projectDetails,
    });
  } catch (err) {
    console.log("Error in getting project details:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { projectId } = req.params;
    const { reason } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Delete related data
    await Task.deleteMany({ projectId });
    await ProjectRequest.deleteMany({ project: projectId });

    // Remove from user profiles
    await Profile.updateMany(
      { projects: projectId },
      { $pull: { projects: projectId } }
    );

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
      success: true,
      msg: "Project and related data deleted successfully",
    });
  } catch (err) {
    console.log("Error in deleting project:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL TASKS
exports.getAllTasks = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const {
      page = 1,
      limit = 10,
      status = "all",
      verified = "all",
    } = req.query;

    let query = {};

    if (status !== "all") {
      query.status = status;
    }

    if (verified !== "all") {
      query.isVerifiedByOwner = verified === "true";
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "username email")
      .populate("projectId", "name owner")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.log("Error in getting all tasks:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// VERIFY TASK (Admin can manually verify tasks)
exports.verifyTask = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { taskId } = req.params;
    const { verified, reason } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    task.isVerifiedByOwner = verified;
    task.adminVerified = verified;
    task.adminVerificationReason = reason;
    await task.save();

    res.status(200).json({
      success: true,
      msg: `Task ${verified ? "verified" : "rejected"} successfully`,
      task,
    });
  } catch (err) {
    console.log("Error in verifying task:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL PROJECT REQUESTS
exports.getAllProjectRequests = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const { page = 1, limit = 10, status = "all" } = req.query;

    let query = {};

    if (status !== "all") {
      query.status = status;
    }

    const requests = await ProjectRequest.find(query)
      .populate("sender", "username email profileImage")
      .populate("receiver", "username email profileImage")
      .populate("project", "name description")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await ProjectRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.log("Error in getting all project requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// DEMOTE ADMIN (Super Admin Only)
exports.demoteAdmin = async (req, res) => {
  try {
    if (req.user.role !== "super-admin") {
      return res
        .status(403)
        .json({ msg: "Only super admin can access this page" });
    }

    const { adminId } = req.params;
    const { reason } = req.body;

    if (adminId === req.user.id) {
      return res.status(400).json({ msg: "Cannot demote yourself" });
    }

    const userdemote = await User.findById(adminId);
    if (!userdemote) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!userdemote.isAdmin) {
      return res.status(400).json({ msg: "User is not admin" });
    }

    userdemote.role = "user";
    userdemote.isAdmin = false;
    await userdemote.save();

    res.status(200).json({
      success: true,
      msg: "User demoted successfully",
      user: { ...userdemote.toObject(), password: undefined },
    });
  } catch (err) {
    console.log("Error in demoting admin:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL ADMINS (Super Admin Only)
exports.getAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ msg: "Only super admin can access this" });
    }

    const AllAdmin = await User.find({ isAdmin: true })
      .select("-password")
      .populate("profile");

    res.status(200).json({
      success: true,
      msg: "All admins fetched successfully",
      admins: AllAdmin,
    });
  } catch (err) {
    console.log("Error in getting all admins:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
