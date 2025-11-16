const cloudinary = require("cloudinary").v2;
const chat = require("../models/chatmodel");
const project = require("../models/projectmodel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}


async function uploadFileToCloudinary(file, folder = "chat-files") {
  const ext = file.name.split(".").pop().toLowerCase();
  
  // Generate public_id with original filename and PDF extension
  const timestamp = Date.now();
  const originalName = file.name.split(".")[0].replace(/\s+/g, "-");
  const publicId = `${timestamp}-${originalName}`;

  const options = {
    folder,
    resource_type: 'auto',
    public_id: `${publicId}.${ext === 'pdf' ? 'pdf' : ext}`,
    use_filename: true,
    unique_filename: false,
    timeout: 120000
  };

  try {
    console.log("Uploading to Cloudinary:", publicId);
    const uploadRes = await cloudinary.uploader.upload(file.tempFilePath, options);
    return uploadRes.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
}

exports.createMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const { projectId } = req.params;

    if (
      !userId ||
      (!message?.trim() &&
        (!req.files || !req.files.file || req.files.file.size === 0))
    ) {
      return res.status(400).json({
        msg: "Please enter a message or upload a valid file",
      });
    }

    const projectExists = await project.findById(projectId);
    if (!projectExists) {
      return res.status(400).json({ msg: "Project does not exist" });
    }

    let fileUrl = "";
    let originalFilename = "";

    if (req.files?.file) {
      const supported = [
        "jpeg", "jpg", "png", "webp", "pdf", 
        "mp4", "webm", "mov"
      ];
      const ext = req.files.file.name.split(".").pop().toLowerCase();

      if (!supported.includes(ext)) {
        return res.status(400).json({ msg: "Unsupported file type" });
      }

      originalFilename = req.files.file.name;
      fileUrl = await uploadFileToCloudinary(req.files.file);
    }

    const newMessage = await chat.create({
      user: userId,
      message: message || "",
      file: fileUrl,
      originalFilename,
      project: projectId,
    });

    const populatedMessage = await chat
      .findById(newMessage._id)
      .populate("user", "username email");

    await project.findByIdAndUpdate(
      projectId,
      { $push: { messages: newMessage._id } },
      { new: true }
    );

    res.status(201).json({
      msg: "Message created successfully",
      newMessage: populatedMessage,
    });
  } catch (error) {
    console.error("❌ Error in createMessage:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// async function uploadFileToCloudinary(file, folder = "chat-files") {
//   const ext = file.name.split(".").pop().toLowerCase();

//   let resourceType = "auto";
//   if (["mp4", "webm", "mov"].includes(ext)) {
//     resourceType = "video";
//   } else if (["pdf"].includes(ext)) {
//     resourceType = "auto";  // Treat PDF as image for proper handling
//     context = `attachment=true|filename=${file.name}`;
//   }  else if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
//     resourceType = "image";
//   }

//   const timestamp = Date.now();
//   const originalName = file.name.split(".")[0].replace(/\s+/g, "-");
//   const publicId = `${timestamp}-${originalName}`;

//   console.log("Uploading to Cloudinary:", publicId);

//   const uploadRes = await cloudinary.uploader.upload(file.tempFilePath, {
//     folder,
//     resource_type: resourceType,
//     use_filename: true,
//     unique_filename: false,
//     public_id: publicId,
//     transformation:
//       resourceType === "image"
//         ? [{ quality: "auto", fetch_format: "auto" }]
//         : undefined,
//     timeout: 120000,
//     context
//   });

//    if (ext === "pdf") {
//     return uploadRes.secure_url.replace(/(\.jpg|\.jpeg|\.png)$/i, ".pdf");
//   }

//   return uploadRes.secure_url;
// }

// async function uploadFileToCloudinary(file, folder = "chat-files") {
//   const ext = file.name.split(".").pop().toLowerCase();

//   let resourceType = "auto";
//   let transformation = undefined;
//   let context = undefined;

//   if (["mp4", "webm", "mov"].includes(ext)) {
//     resourceType = "video";
//   } else if (["pdf"].includes(ext)) {
//     resourceType = "raw"; // Must use 'raw' for PDFs
//     context = `attachment=true|filename=${file.name}`;
//   } else if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
//     resourceType = "image";
//     transformation = [{ quality: "auto", fetch_format: "auto" }];
//   }

//   const timestamp = Date.now();
//   const originalName = file.name.split(".")[0].replace(/\s+/g, "-");
//   const publicId = `${timestamp}-${originalName}`;

//   console.log("Uploading to Cloudinary:", publicId);

//   const uploadOptions = {
//     folder,
//     resource_type: resourceType,
//     public_id: publicId,
//     timeout: 120000,
//     context
//   };

//   // Add transformation only if defined
//   if (transformation) {
//     uploadOptions.transformation = transformation;
//   }

//   try {
//     const uploadRes = await cloudinary.uploader.upload(
//       file.tempFilePath, 
//       uploadOptions
//     );

//     // Special handling for PDFs - force correct URL format
//     if (ext === "pdf") {
//       return uploadRes.secure_url.replace(
//         /(\/upload\/)(v\d+\/)/, 
//         '$1fl_attachment/$2'
//       );
//     }

//     return uploadRes.secure_url;
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     throw new Error("Failed to upload file to Cloudinary");
//   }
// }

// exports.createMessage = async (req, res) => {
//   try {
//     const { userId, message } = req.body;
//     const { projectId } = req.params;

//     if (
//       !userId ||
//       (!message?.trim() &&
//         (!req.files || !req.files.file || req.files.file.size === 0))
//     ) {
//       return res.status(400).json({
//         msg: "Please enter a message or upload a valid file",
//       });
//     }

//     const projectExists = await project.findById(projectId);
//     if (!projectExists) {
//       return res.status(400).json({ msg: "Project does not exist" });
//     }

//     let fileUrl = "";

//     if (req.files?.file) {
//       const supported = [
//         "jpeg",
//         "jpg",
//         "png",
//         "webp",
//         "pdf",
//         "mp4",
//         "webm",
//         "mov",
//       ];
//       const ext = req.files.file.name.split(".").pop().toLowerCase();

//       if (!supported.includes(ext)) {
//         return res.status(400).json({ msg: "Unsupported file type" });
//       }

//       fileUrl = await uploadFileToCloudinary(req.files.file);
//     }

//     const newMessage = await chat.create({
//       user: userId,
//       message: message || "",
//       file: fileUrl,
//       project: projectId,
//     });

//     const populatedMessage = await chat
//       .findById(newMessage._id)
//       .populate("user", "username email");

//     await project.findByIdAndUpdate(
//       projectId,
//       { $push: { messages: newMessage._id } },
//       { new: true }
//     );

//     res.status(201).json({
//       msg: "Message created successfully",
//       newMessage: populatedMessage,
//     });
//   } catch (error) {
//     console.error("❌ Error in createMessage:", error);
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };





// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// async function uploadFileToCloudinary(file, folder) {
//   const options = {
//     folder,
//     use_filename: true,
//     unique_filename: false,
//     resource_type: "auto", // 'auto' allows Cloudinary to infer the type, including PDFs
//     public_id: file.name.replace(/\.[^/.]+$/, "") + ".pdf", // Ensure PDF extension is present
//   };
//   return await cloudinary.uploader.upload(file.tempFilePath, options);
// }
// function isFileTypeSupported(type, supportedTypess) {
//   return supportedTypess.includes(type);
// }

// exports.createMessage = async (req, res) => {
//   try {
//     const { userId, message } = req.body;
//     const { projectId } = req.params;

//     const fileUrl = req.file?.path || ""; // 👈 file uploaded to Cloudinary

//     if (!userId || (!message?.trim() && !req.file)) {
//       return res
//         .status(400)
//         .json({ msg: "Please enter a message or upload a file" });
//     }

//     const projectExists = await project.findById(projectId);
//     if (!projectExists) {
//       return res.status(400).json({ msg: "Project does not exist" });
//     }

//     const newMessage = await chat.create({
//       user: userId,
//       message,
//       file: fileUrl,
//       project: projectId,
//     });
//     console.log("newmessge=>", newMessage);
//     await project.findByIdAndUpdate(
//       projectId,
//       { $push: { messages: newMessage } },
//       { new: true }
//     );

//     res.status(201).json({
//       msg: "Message created successfully",
//       newMessage,
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     res.status(500).json({ msg: "Server Error" });
//   }
// };

exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Step 1: Verify project exists
    const projectExists = await project.findById(projectId);
    if (!projectExists) {
      return res.status(400).json({ msg: "Project does not exist" });
    }

    // Step 2: Fetch ALL messages, sorted from oldest to newest
    const messages = await chat
      .find({ project: projectId })
      .sort({ createdAt: 1 }) // ascending order (oldest first)
      .populate("user", "username email");

    // Step 3: Return all messages
    res.status(200).json({
      msg: "All messages fetched successfully",
      messages,
    });
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.getuserinproject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const getuser = await project.findById(projectId).populate("user");
    if (!getuser) {
      return res.status(400).json({ msg: "Project does not exist" });
    }

    return res.status(200).json({
      msg: "Users fetched successfully",
      getuser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
