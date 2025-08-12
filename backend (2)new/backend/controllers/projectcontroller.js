const express = require("express");
const ProjectRequest = require("../models/ProjectRequest");
const project = require("../models/projectmodel");
const mongoose = require("mongoose");
const Profile = require("../models/profile");
const User = require("../models/usermodel");
const userproject = require("../models/userproject");
// const profile = require('../models/profile');
const axios = require("axios");
const atob = require("atob"); // for base64 decoding if needed in Node.js
const { calculateReliabilityScore } = require("./relaibilityScore");

exports.createproject = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if project name already exists
    const nameAlreadyExists = await project.findOne({ name });
    if (nameAlreadyExists) {
      return res.status(400).json({ msg: "Project name already exists" });
    }
    const user = User.findById(req.user.id);

    // Create new project with only name and user
    const newProject = await project.create({
      name,
      user: [req.user.id],
      description: "",
      technologies: "",
      githubLink: "",
      liveDemoLink: "",
      owner: req.user.id,
    });

    // Find user's profile ID
    const userProfile = await User.findById(req.user.id).populate("profile");
    if (!userProfile || !userProfile.profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }
    console.log("userprofile ", userProfile);

    const profileId = userProfile.profile._id;

    // Push project ID to user's profile
    const newprofile = await Profile.findByIdAndUpdate(
      profileId,
      { $push: { projects: newProject._id } },
      { new: true }
    );
    newprofile.points += 10;
    newprofile.pointHistory.push({
      date: new Date(),
      points: 10,
      reason: "Project created",
    });
    await newprofile.save();

    console.log("newprofile", newprofile);

    return res.status(200).json({
      msg: "Project created successfully",
      project: newProject,
      data: newprofile,
    });
  } catch (err) {
    console.error("Error in createproject catch block:", err);
    res.status(500).json({ msg: err.message });
  }
};

// exports.updateprojectinprofile = async(req,res)=>{
//     try{
//         const {projectId} = req.params;
//         const {description,technologies,githubLink,liveDemoLink} = req.body;
//         const userId = req.user.id;
//         const userexist = await User.findOne({_id:userId}).populate("profile");
//         const profileId = userexist.profile._id;
//         const projectid = await project.findById({_id:profileId}).populate("project");
//         if(!projectid){
//             return res.status(404).json({msg: 'Project not found'})
//         }

//     }
//     catch(err){
//         res.status(500).json({msg: err.message})
//         console.log("error in catch",err);
//     }
// }

// exports.updateprojectinprofile = async (req, res) => {
//     try {
//         const { projectId } = req.params;
//         const { description, technologies, githubLink, liveDemoLink } = req.body;
//         const userId = req.user.id;

//         // Find the user's profile
//         const user = await User.findById(userId).populate('profile');
//         if (!user || !user.profile) {
//             return res.status(404).json({ msg: 'Profile not found' });
//         }

//         const profileId = user.profile._id;

//         // Find the specific UserProject within the profile
//         const userProject = await userproject.findOne({
//             project: projectId
//         });
//         console.log("userproject=>",userProject);

//         if (!userProject) {
//             return res.status(404).json({ msg: 'Project not found in profile' });
//         }

//         // Update the project details
//         userProject.description = description || userProject.description;
//         userProject.technologies = technologies || userProject.technologies;
//         userProject.githubLink = githubLink || userProject.githubLink;
//         userProject.liveDemoLink = liveDemoLink || userProject.liveDemoLink;

//         await userProject.save();
//         console.log("userproject=>",userProject);
//         const populatedUserProject = await userProject.findById(userProject._id)
//             .populate('project');
//         console.log("populatedUserProject=>",populatedUserProject);

//         res.status(200).json({
//             msg: 'Project updated successfully',
//             updatedProject: userProject,

//         });
//     } catch (err) {
//         console.error("Error in updateprojectinprofile:", err);
//         res.status(500).json({ msg: err.message });
//     }
// };

// exports.profileprojectupdate = async (req, res) => {
//     try {
//         const { projectId } = req.params;
//         const { description, technologies, githubLink, liveDemoLink } = req.body;
//         const userId = req.user.id;

//         // Find user's profile
//         if(!userId){
//             return res.status(404).json({msg: 'user not found'})
//         }
//         const userexist = await User.findOne({_id:userId}).populate("profile");
//         const profileId = userexist.profile._id;
//         if (!profileId) {
//             return res.status(404).json({ msg: 'Profile not found' });
//         }
//         const updateproject = await project.findByIdAndUpdate({_id:projectId},{$set:{description,technologies,githubLink,liveDemoLink}},{new:true});
//         console.log("updateproject=>",updateproject);
//         if(!updateproject){
//             return res.status(404).json({msg: 'Project not found'})
//         }

//         return res.status(200).json({
//             msg: 'Project updated successfully',
//             data:updateproject
//         });
//     } catch (err) {
//         console.error("Error in profileprojectupdate:", err);
//         res.status(500).json({ msg: err.message });
//     }
// };

exports.profileprojectupdate = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      description,
      technologies,
      liveDemoLink,
      repoName,
      owner,
      accessToken,
      defaultBranch,
    } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({ msg: "User not found" });
    }

    const user = await User.findById(userId).populate("profile");
    const profileId = user?.profile?._id;
    if (!profileId) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    // Build GitHub object only if at least one GitHub field is provided
    const github = {};
    if (repoName) github.repoName = repoName;
    if (owner) github.owner = owner;
    if (accessToken) github.accessToken = accessToken;
    if (defaultBranch) github.defaultBranch = defaultBranch;

    const updateFields = {
      description,
      technologies,
      liveDemoLink,
    };

    // Include github only if any GitHub-related field was passed
    if (Object.keys(github).length > 0) {
      updateFields.github = github;
    }

    const updatedProject = await project.findByIdAndUpdate(
      { _id: projectId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ msg: "Project not found" });
    }

    return res.status(200).json({
      msg: "Project updated successfully",
      data: updatedProject,
    });
  } catch (err) {
    console.error("Error in profileprojectupdate:", err);
    res.status(500).json({ msg: err.message });
  }
};

// controller/project.js
// exports.getProjectCommits = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const projects = await project.findById(projectId);
//     if (!projects) return res.status(404).json({ msg: "Project not found" });
//     console.log("project in the backned commit=>", projects);
//     const { repoName, owner, accessToken, defaultBranch } = projects.github;
//     if (!repoName || !owner || !accessToken) {
//       return res.status(400).json({ msg: "GitHub info incomplete" });
//     }

//     const commits = await axios.get(
//       `https://api.github.com/repos/${owner}/${repoName}/commits?sha=${defaultBranch}`,
//       {
//         headers: {
//           Authorization: `token ${accessToken}`,
//           Accept: "application/vnd.github+json",
//         },
//       }
//     );

//     res.status(200).json({ commits: commits.data });
//   } catch (err) {
//     console.error("Error fetching commits:", err.message);
//     res.status(500).json({ msg: "Failed to fetch commits" });
//   }
// };

exports.getProjectCommits = async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectData = await project.findById(projectId);
    if (!projectData) return res.status(404).json({ msg: "Project not found" });

    const { repoName, owner, accessToken, defaultBranch } = projectData.github;
    if (!repoName || !owner || !accessToken) {
      return res.status(400).json({ msg: "GitHub info incomplete" });
    }

    const commits = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/commits?sha=${defaultBranch}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const commitData = commits.data;

    // Track usernames already rewarded in this call to avoid double-counting
    const rewardedUsers = new Set();

    for (const commit of commitData) {
      const githubUsername = commit.author?.login;
      if (!githubUsername || rewardedUsers.has(githubUsername)) continue;

      // Find user with matching github username
      const user = await User.findOne({
        "profile.social.github": new RegExp(githubUsername, "i"),
      }).populate("profile");
      if (user && user.profile) {
        user.profile.points += 5;
        user.profile.pointHistory.push({
          date: new Date(),
          points: 5,
          reason: "GitHub commit reward",
        });
        await user.profile.save();
        rewardedUsers.add(githubUsername); // Prevent duplicate points in one fetch
      }
    }

    res.status(200).json({ commits: commitData });
  } catch (err) {
    console.error("Error fetching commits:", err.message);
    res.status(500).json({ msg: "Failed to fetch commits" });
  }
};

exports.getRepoFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const projects = await project.findById(projectId);
    if (!projects) return res.status(404).json({ msg: "Project not found" });

    const { repoName, owner, accessToken, defaultBranch } = projects.github;
    const treeRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }
    );

    res.status(200).json({ files: treeRes.data.tree });
  } catch (err) {
    console.error("Error fetching repo files:", err.message);
    res.status(500).json({ msg: "Failed to fetch repository files" });
  }
};

exports.getFileContent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path } = req.query;
    const projects = await project.findById(projectId);
    if (!projects) return res.status(404).json({ msg: "Project not found" });

    const { repoName, owner, accessToken } = projects.github;
    const contentRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }
    );
    console.log("content of contentres=>", contentRes.data);
    const decodedContent = Buffer.from(
      contentRes.data.content,
      "base64"
    ).toString("utf-8");
    console.log("content res =>", decodedContent);
    res.status(200).json({ content: decodedContent });
  } catch (err) {
    console.error("Error fetching file content:", err.message);
    res.status(500).json({ msg: "Failed to fetch file content" });
  }
};

exports.getprojects = async (req, res) => {
  try {
    const newproject = await project.find().populate("user");
    return res.status(200).json({
      msg: "Projects fetched successfully",
      newproject,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
    console.log("error in catch", err);
  }
};

exports.getsingleuserproject = async (req, res) => {
  try {
    console.log("Received user ID:", req.user.id);
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ msg: "Invalid user ID format" });
    }
    // Pass `req.user.id` directly as the argument
    const newproject = await project
      .find({ user: req.user.id })
      .populate("user");

    console.log("user =>", newproject);

    if (!newproject) {
      return res.status(404).json({ msg: "Project not found" });
    }

    return res.status(200).json({
      msg: "Project fetched successfully",
      newproject,
    });
  } catch (err) {
    console.error("Error in catch:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.adduser = async (req, res) => {
  try {
    const { userId, projectId } = req.body;
    const userexist = await project.findById({
      _id: projectId,
      user: req.body.id,
    });
    if (!userexist) {
      return res.status(400).json({ msg: "User does not exist" });
    }
    const newproject = await project.findOneAndUpdate(
      { _id: projectId },
      { $push: { user: userId } },
      { new: true }
    );
    return res.status(200).json({
      msg: "User added successfully",
      newproject,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
    console.log("error in catch", err);
  }
};

exports.getprojectdetail = async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectdetail = await project.findById(projectId).populate("user");
    if (!projectdetail) {
      return res.status(404).json({ msg: "Project not found" });
    }
    return res.status(200).json({
      msg: "Project details fetched successfully",
      projectdetail,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
    console.log("error in catch", err);
  }
};

exports.gettaskfromproject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const projecttask = await project.findById(projectId).populate({
      path: "task", // Populating the tasks array
      populate: {
        path: "assignedTo", // Populating the user in each task
      },
    });
    if (!projecttask) {
      return res.status(404).json({ msg: "Project not found" });
    }
    return res.status(200).json({
      msg: "Project tasks fetched successfully",
      projecttask,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
    console.log("error in catch", err);
  }
};

// exports.sendProjectRequest = async (req, res) => {
//   try {
//     const { receiverId, projectId } = req.body;

//     const senderId = req.user.id;
//     console.log("receiver", receiverId);
//     console.log("sender", senderId);
//     console.log("projectId", projectId);
//     const receiverprofile = await User.findById({ _id: receiverId }).populate(
//       "profile"
//     );
//     console.log("receiverprofile", receiverprofile);
//     const receiverprofileId = receiverprofile?.profile?._id;
//     console.log("reveiverprofileId=>", receiverprofileId);
//     if (!receiverprofileId) {
//       console.log("not found the receiver profile id");
//     }
//     const existingRequest = await ProjectRequest.findOne({
//       sender: senderId,
//       receiver: receiverId,
//       project: projectId,
//     });
//     if (existingRequest) {
//       return res.status(400).json({ msg: "Request already sent" });
//     }

//     const newRequest = await ProjectRequest.create({
//       sender: senderId,
//       receiver: receiverId,
//       project: projectId,
//     });

//     const sender = User.findById(senderId).populate("profile");
//     let senderprofileupdate;
//     if (sender && sender.profile) {
//       senderprofileupdate.profile.points = (sender.profile.points || 0) + 5; // Add points for sending request
//       senderprofileupdate = await sender.profile.save();
//     }

//     const receiverprofileupdate = await Profile.findByIdAndUpdate(
//       receiverprofileId,
//       { $push: { requests: newRequest._id } },
//       { new: true }
//     ).populate({
//       path: "requests",
//       populate: [
//         { path: "sender", select: "username email" },
//         { path: "receiver", select: "username email" },
//         { path: "project", select: "name description technologies" },
//       ],
//     });
//     res.status(200).json({
//       msg: "Project request sent",
//       request: newRequest,
//       data: receiverprofileupdate,
//       senderProfile: senderprofileupdate,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

exports.sendProjectRequest = async (req, res) => {
  try {
    const { receiverId, projectId } = req.body;
    const senderId = req.user.id;

    // Validate required fields
    if (!receiverId || !projectId) {
      return res
        .status(400)
        .json({ msg: "receiverId and projectId are required" });
    }

    if (receiverId === senderId) {
      return res
        .status(400)
        .json({ msg: "You cannot send a request to yourself" });
    }

    const receiverUser = await User.findById(receiverId).populate("profile");
    if (!receiverUser || !receiverUser.profile) {
      return res
        .status(404)
        .json({ msg: "Receiver or receiver profile not found" });
    }

    const receiverProfileId = receiverUser.profile._id;

    // Check if request already exists
    const existingRequest = await ProjectRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      project: projectId,
    });

    if (
      existingRequest &&
      existingRequest.status?.toLowerCase() === "pending"
    ) {
      return res.status(400).json({ msg: "Request already sent and pending" });
    }

    // Optional: Delete old rejected/accepted request before creating new
    if (
      existingRequest &&
      existingRequest.status?.toLowerCase() !== "pending"
    ) {
      await ProjectRequest.findByIdAndDelete(existingRequest._id);
    }

    // Now create new pending request
    const newRequest = await ProjectRequest.create({
      sender: senderId,
      receiver: receiverId,
      project: projectId,
      status: "pending", // optional, schema default handles it
    });

    // Award sender +5 points
    const senderUser = await User.findById(senderId).populate("profile");
    let senderProfileUpdate = null;

    // Add request to receiver profile
    const receiverProfileUpdate = await Profile.findByIdAndUpdate(
      receiverProfileId,
      { $push: { requests: newRequest._id } },
      { new: true }
    ).populate({
      path: "requests",
      populate: [
        { path: "sender", select: "username email" },
        { path: "receiver", select: "username email" },
        { path: "project", select: "name description technologies" },
      ],
    });

    res.status(200).json({
      msg: "Project request sent",
      request: newRequest,
      receiverProfile: receiverProfileUpdate,
      senderProfile: senderProfileUpdate,
    });
  } catch (err) {
    console.error("Error in sendProjectRequest:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.respondToProjectRequest = async (req, res) => {
  try {
    const { requestId, response } = req.body;
    const userId = req.user.id;

    const request = await ProjectRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    const user = await User.findById(userId).populate("profile");
    const profile = user?.profile;
    console.log("profile in request=>", profile);

    const now = Date.now();
    const sentTime = new Date(request.createdAt).getTime();
    const timeToRespond = now - sentTime;

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ msg: `Request has already been ${request.status}` });
    }
    if (String(request.receiver) !== String(userId)) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to respond to this request" });
    }
    const receiver = await User.findById(request.receiver).populate("profile");
    if (!receiver || !receiver.profile) {
      return res.status(404).json({ msg: "Receiver profile not found" });
    }
    console.log("receiver in request=>", receiver.profile);
    const senderProfile = await User.findById(request.sender).populate(
      "profile"
    );
    if (!senderProfile || !senderProfile.profile) {
      return res.status(404).json({ msg: "Sender profile not found" });
    }
    console.log("senderProfile in request=>", senderProfile.profile);

    // Validate response type
    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({ msg: "Invalid response type" });
    }

    let updatedProfileOfUser;
    if (response === "accepted") {
      request.status = "accepted";

      // Add receiver to project
      await project.findByIdAndUpdate(
        request.project,
        {
          $push: { user: request.receiver },
        },
        { new: true }
      );

      console.log("profile in side accept request=>", profile);
      // +10 points for accepting the project
      if (profile) {
        profile.points += 5;
        profile.pointHistory.push({
          date: new Date(),
          points: 5,
          reason: `Project request accepted from ${senderProfile.username}`,
        });
      }
      if (senderProfile && senderProfile.profile) {
        senderProfile.profile.points += 5;
        senderProfile.profile.pointHistory.push({
          date: new Date(),
          points: 5,
          reason: `Project request accepted by ${receiver.username}`,
        });
      }
      await senderProfile.profile.save();
    } else {
      request.status = "rejected";
    }

    // Remove request from profile
    await Profile.findByIdAndUpdate(
      profile._id,
      { $pull: { requests: requestId } },
      { new: true }
    );

    console.log("profile in side reject request=>", profile);

    if (profile) {
      profile.responseTimes.push(timeToRespond);

      const seconds = Math.round(timeToRespond / 1000);
      const reason = `Responded to project request (${response}) in ${seconds} sec`;

      profile.reliabilityScore = calculateReliabilityScore(profile, reason);

      await profile.save();

      updatedProfileOfUser = await Profile.findById(profile._id); // fresh data
    }

    await request.save();
    res.status(200).json({
      msg: `Request ${response}`,
      request,
      data: updatedProfileOfUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// exports.respondToProjectRequest = async (req, res) => {
//   try {
//     const { requestId, response } = req.body;
//     const userId = req.user.id;

//     // Validate input
//     if (!requestId || !response) {
//       return res.status(400).json({ msg: "requestId and response are required" });
//     }

//     if (!["accepted", "rejected"].includes(response)) {
//       return res.status(400).json({ msg: "Invalid response type" });
//     }

//     const request = await ProjectRequest.findById(requestId);
//     if (!request) {
//       return res.status(404).json({ msg: "Request not found" });
//     }

//     if (String(request.receiver) !== String(userId)) {
//       return res.status(403).json({ msg: "You are not authorized to respond to this request" });
//     }

//     if (request.status !== "pending") {
//       return res.status(400).json({ msg: `Request has already been ${request.status}` });
//     }

//     const user = await User.findById(userId).populate("profile");
//     const profile = user?.profile;
//     if (!profile) {
//       return res.status(404).json({ msg: "User profile not found" });
//     }

//     const now = Date.now();
//     const sentTime = new Date(request.createdAt).getTime();
//     const timeToRespond = now - sentTime;

//     if (response === "Accepted") {
//       request.status = "Accepted";

//       // Add receiver to project
//       await project.findByIdAndUpdate(
//         request.project,
//         { $addToSet: { user: request.receiver } }, // prevents duplicates
//         { new: true }
//       );

//       profile.points = (profile.points || 0) + 10;
//     } else {
//       request.status = "rejected";
//     }

//     // Remove request from profile
//     await Profile.findByIdAndUpdate(
//       profile._id,
//       { $pull: { requests: requestId } },
//       { new: true }
//     );

//     // +5 points and log response time
//     profile.points = (profile.points || 0) + 5;
//     profile.responseTimes = profile.responseTimes || [];
//     profile.responseTimes.push(timeToRespond);
//     profile.reliabilityScore = calculateReliabilityScore(profile);
//     await profile.save();

//     await request.save();

//     const updatedProfileOfUser = await Profile.findById(profile._id);

//     res.status(200).json({
//       msg: `Request ${response}`,
//       request,
//       profile: updatedProfileOfUser,
//     });
//   } catch (err) {
//     console.error("Error in respondToProjectRequest:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

exports.getUserProjectRequests = async (req, res) => {
  try {
    const requests = await ProjectRequest.find({
      receiver: req.user.id,
      status: "pending",
    })
      .populate("sender", "username email")
      .populate("project", "name");
    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID and populate profile
    const user = await User.findOne({ _id: userId }).populate("profile");
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    // Find the profile and populate projects
    const profiles = await Profile.findById(user.profile._id).populate({
      path: "projects",
      model: userproject,
      populate: {
        path: "project", // Populate the base Project inside UserProject
        model: "Project",
      },
    });

    if (!profiles) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.status(200).json({
      msg: "Profile fetched successfully",
      data: profiles,
    });
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    res.status(500).json({ msg: err.message });
  }
};
