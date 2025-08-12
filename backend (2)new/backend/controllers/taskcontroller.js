const User = require("../models/usermodel");
const Project = require("../models/projectmodel");
const Task = require("../models/task");
const tastComment = require("../models/taskcomment");
const task = require("../models/task");
const { calculateReliabilityScore } = require("./relaibilityScore");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { exec } = require("child_process");
const util = require("util");
const https = require("https");
const runWithOpenInterpreter = require("../utils/runwithinterpreter");
const execPromise = util.promisify(exec);
require("dotenv").config();
const { generateResponse } = require("../services/gemini");
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, assignedTo } = req.body;
    const { projectId } = req.params;

    // Check if the project exists
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      return res.status(400).json({ msg: "Project does not exist" });
    }
    const assigneduservalid = assignedTo.every((id) =>
      projectExists.user.some((user)=>user.equals(id))
    );
    console.log("assignedusevalid",assigneduservalid);
    if (!assigneduservalid) {
      return res.status(400).json({
        msg: "One or more assigned users do not exist or are not part of the project",
      });
    }

    
    // Create the task
    const newTask = await Task.create({
      title,
      description,
      dueDate,
      status,
      user: req.user.id,
      projectId,
      assignedTo,
    });

    // Add the task to the project
    projectExists.task.push(newTask);
    await projectExists.save();

    res.status(200).json({
      msg: "Task created successfully",
      newTask,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
    console.log("Error in task creation:", err);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, isVerifiedByOwner } = req.body;
    const loggedInUser = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const project = await Project.findById(task.projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // 🔐 Permissions
    const isUserAssigned = task.assignedTo.some(
      (id) => id.toString() === loggedInUser
    );
    const isOwner = project.owner?.toString() === loggedInUser;

    if (typeof isVerifiedByOwner === "boolean" && !isOwner) {
      return res
        .status(403)
        .json({ msg: "Only project owner can verify the task" });
    }

    // ✅ Update fields
    const updatedFields = {};
    if (status) updatedFields.status = status;
    if (typeof isVerifiedByOwner === "boolean") {
      updatedFields.isVerifiedByOwner = isVerifiedByOwner;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updatedFields, {
      new: true,
    });

    // 🎯 Award points + reliability update if task completed and verified
    if (
      updatedFields.status === "Completed" &&
      updatedFields.isVerifiedByOwner === true
    ) {
      for (const userId of task.assignedTo) {
        const user = await User.findById(userId).populate("profile");
        if (user?.profile) {
          const completedOnTime = new Date() <= new Date(task.dueDate);
          user.profile.taskCompletionRates.push(completedOnTime ? 1 : 0);

          // ⏱️ Recalculate reliability
          const newScore = calculateReliabilityScore(user.profile);
          user.profile.reliabilityScore = newScore;

          // ➕ Add to point & reliability history
          user.profile.points += 10;
          user.profile.pointHistory.push({
            date: new Date(),
            points: 10,
            reason: completedOnTime
              ? "Completed task on time and verified"
              : "Completed task late but verified",
          });

          user.profile.reliabilityHistory.push({
            date: new Date(),
            score: newScore,
            reason: completedOnTime
              ? "Task completed on time and verified"
              : "Task completed late and verified",
          });

          await user.profile.save();
        }
      }
    }

    return res.status(200).json({
      msg: "Task updated successfully",
      updatedTask,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
    console.log("error in updateTask catch:", err);
  }
};

// const extractZipAndReadFiles = async (zipPath) => {
//   const AdmZip = require("adm-zip");
//   const zip = new AdmZip(zipPath);
//   const zipEntries = zip.getEntries();

//   const fileDetails = zipEntries
//     .filter((e) => !e.isDirectory)
//     .map((entry) => ({
//       name: entry.entryName,
//       content: zip.readAsText(entry),
//     }));

//   fs.unlinkSync(zipPath); // Clean up after reading
//   return fileDetails;
// };

// async function verifyTaskWithAI(taskDesc, note, zipFileUrl) {
//   const tmpDir = path.join(__dirname, "..", "tmp");
//   if (!fs.existsSync(tmpDir)) {
//     fs.mkdirSync(tmpDir);
//   }

//   const zipPath = path.join(tmpDir, "proof.zip");

//   // ✅ Only fetch if it's a valid URL
//   if (!zipFileUrl.startsWith("http")) {
//     throw new Error("Invalid ZIP file URL");
//   }

//   const response = await axios.get(zipFileUrl, { responseType: "arraybuffer" });
//   fs.writeFileSync(zipPath, response.data);

//   const filesContent = await extractZipAndReadFiles(zipPath); // Now valid

//   const passed = filesContent.some((f) =>
//     f.content.toLowerCase().includes(taskDesc.toLowerCase())
//   );

//   return {
//     result: passed,
//     feedback: passed ? "Relevant content found" : "Task content not matched",
//   };
// }

// exports.submitProof = async (req, res) => {
//   const { taskId } = req.params;
//   const { note, zipFile } = req.body;
//   const submitBy = req.user.id;

//   const task = await Task.findById(taskId);
//   if (!task) return res.status(404).json({ msg: "Task not found" });

//   const { result, feedback } = await verifyTaskWithAI(task.description, note, zipFile);

//   task.Proofsubmission = {
//     submitBy,
//     note,
//     zipFile,
//     aiverified: result ? "Approved" : "Rejected",
//     aiFeedBack: feedback,
//   };
//   if (result) task.status = "Completed";

//   await task.save();
//   return res.status(200).json({ msg: "Proof submitted", task });
// };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("openai_api_key", OPENAI_API_KEY);
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID; // You must store this too!
console.log("assistant_id", ASSISTANT_ID);

// const extractZipAndReadFiles = async (zipPath) => {
//   const zip = new AdmZip(zipPath);
//   const zipEntries = zip.getEntries();
//   const fileDetails = zipEntries
//     .filter((e) => !e.isDirectory)
//     .map((entry) => ({
//       name: entry.entryName,
//       content: zip.readAsText(entry),
//     }));
//   fs.unlinkSync(zipPath);
//   return fileDetails;
// };

// const verifyTaskWithAI = async (taskDesc, note, zipFileUrl) => {
//   const tmpDir = path.join(__dirname, "..", "tmp");
//   if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

//   const zipPath = path.join(tmpDir, "proof.zip");
//   console.log("sipfileUrl", zipFileUrl);
//   const response = await axios.get(zipFileUrl, { responseType: "arraybuffer" });
//   console.log("response", response);
//   fs.writeFileSync(zipPath, response.data);

//   const files = await extractZipAndReadFiles(zipPath);
//   const allContent = files
//     .filter((f) =>
//       [
//         ".js",
//         ".jsx",
//         ".ts",
//         ".tsx",
//         ".html",
//         ".css",
//         ".py",
//         ".json",
//         ".md",
//       ].some((ext) => f.name.toLowerCase().endsWith(ext))
//     )
//     .map((f) => `--- ${f.name} ---\n${f.content}`)
//     .join("\n\n");

//   console.log("filecontent", allContent);

//   const headers = {
//     Authorization: `Bearer ${OPENAI_API_KEY}`,
//     "OpenAI-Beta": "assistants=v2",
//     "Content-Type": "application/json",
//   };

//   // Create thread
//   const threadRes = await axios.post(
//     "https://api.openai.com/v1/threads",
//     {},
//     { headers }
//   );
//   const threadId = threadRes.data.id;
//   console.log("threadResponse", threadRes.data);
//   console.log("threadId", threadId);

//   // Add message to thread
//   await axios.post(
//     `https://api.openai.com/v1/threads/${threadId}/messages`,
//     {
//       role: "user",
//       content: `Task: ${taskDesc}\n\nUser note: ${note}\n\nSubmitted Code:\n${allContent}`,
//     },
//     { headers }
//   );
//   console.log("after adding message to thread");

//   // Run the assistant
//   const runRes = await axios.post(
//     `https://api.openai.com/v1/threads/${threadId}/runs`,
//     { assistant_id: ASSISTANT_ID },
//     { headers }
//   );
//   console.log("runResponse", runRes.data);
//   console.log("runId", runRes.data.id);

//   const runId = runRes.data.id;

//   // Poll until run is completed
//   let runStatus;
//   let retries = 0;
//   const maxRetries = 20;

//   do {
//     await new Promise((res) => setTimeout(res, 1000));
//     const statusRes = await axios.get(
//       `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
//       { headers }
//     );
//     runStatus = statusRes.data.status;
//     retries++;
//     if (["failed", "cancelled"].includes(runStatus) || retries >= maxRetries) {
//       throw new Error(`Run failed or timed out. Status: ${runStatus}`);
//     }
//   } while (runStatus !== "completed");
//   console.log("Run completed");
//   // Get the final messages (response from assistant)
//   const messagesRes = await axios.get(
//     `https://api.openai.com/v1/threads/${threadId}/messages`,
//     { headers }
//   );
//   console.log("messagesResponse", messagesRes.data);

//   const reply = messagesRes.data.data[0].content[0].text.value;
//   const isApproved = reply.toLowerCase().includes("approved");
//   console.log("object", reply, isApproved);
//   return {
//     result: isApproved,
//     feedback: reply,
//   };
// };

const extractZipAndReadFiles = async (zipPath) => {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  const fileDetails = zipEntries
    .filter((e) => !e.isDirectory)
    .map((entry) => ({
      name: entry.entryName,
      content: zip.readAsText(entry),
    }));

  fs.unlinkSync(zipPath);
  return fileDetails;
};

const verifyTaskWithAI = async (taskDesc, note, zipFileUrl) => {
  const tmpDir = path.join(__dirname, "..", "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const zipPath = path.join(tmpDir, "proof.zip");
  const response = await axios.get(zipFileUrl, {
    responseType: "arraybuffer",
    timeout: 30_000, // bump to 30 seconds
    httpsAgent: new https.Agent({
      keepAlive: false, // don’t reuse stale sockets
    }),
  });
  fs.writeFileSync(zipPath, response.data);

  const files = await extractZipAndReadFiles(zipPath);
  const allContent = files
    .filter((f) =>
      [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".html",
        ".css",
        ".py",
        ".json",
        ".md",
      ].some((ext) => f.name.toLowerCase().endsWith(ext))
    )
    .map((f) => `--- ${f.name} ---\n${f.content.slice(0, 1000)}`)
    .join("\n\n");

  const prompt = `
You are a senior code reviewer for a team project.

Each user is assigned a *portion* of a bigger task (frontend or backend). Your job is to check if the submitted code **matches the task description**, even if some parts (like backend API or other files) are missing.

### Rules:
- ✅ APPROVE if the code fulfills the user's part, even if it's part of a larger app.
- ❌ REJECT only if the submission is incomplete or unrelated.
- 🔍 Focus on the described feature, not the entire app.

Now evaluate the submission below.

📌 Task:
"${taskDesc}"

📄 Note from user:
"${note}"

🧠 Submitted Code:
${allContent}

Reply ONLY with:
"Approved" or "Rejected", followed by a **brief reason**.
`;

  const reply = await generateResponse(prompt);
  console.log("reply=>", reply);
  const isApproved = reply.toLowerCase().includes("approved");
  console.log("isapproved=>", isApproved);

  return {
    result: isApproved,
    feedback: reply,
  };
};
exports.submitProof = async (req, res) => {
  const { taskId } = req.params;
  const { note, zipFile } = req.body;
  const submitBy = req.user.id;

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ msg: "Task not found" });

  const { result, feedback } = await verifyTaskWithAI(
    task.description,
    note,
    zipFile
  );
  console.log("result", result);
  console.log("feedback", feedback);

  task.Proofsubmission = {
    submitBy,
    note,
    zipFile,
    aiverified: result ? "Approved" : "Rejected",
    aiFeedBack: feedback,
  };
  if (result) task.status = "Completed";

  await task.save();
  console.log("task after save", task);
  return res.status(200).json({ msg: "Proof submitted", task });
};
