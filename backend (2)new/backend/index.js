require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const axios = require("axios");

/* ── local modules ── */
const db = require("./config/database");
const userrouter = require("./routes/userroute");
const projectroute = require("./routes/projectroute");
const chatroute = require("./routes/chatroute");
const airoute = require("./routes/airoute");
const taskrouter = require("./routes/taskroute");
const trafficroute = require("./routes/trafficroute");
const projectmodel = require("./models/projectmodel");
const { generateResponse } = require("./services/gemini");
const whiteboard = require("./socket/whiteboard"); // <─ your handler
const handleWhiteboard = require("./socket/whiteboard");


require("./auth/github"); // passport GitHub strategy

/* ── Express setup ── */
const app = express();
const PORT = process.env.PORT || 8000;

app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

/* ── REST routes ── */
app.use("/api/v1", userrouter);
app.use("/api/v1", projectroute);
app.use("/api/v1", chatroute);
app.use("/api/v1", airoute);
app.use("/api/v1", taskrouter);
app.use("/api/v1", trafficroute);

/* GitHub OAuth */
app.get("/auth/github", passport.authenticate("github"));
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    const { accessToken } = req.user;
    const username = req.user.profile.username;

    const { data: repos } = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: { Authorization: `token ${accessToken}` },
      }
    );

    const firstRepo = repos[0];
    res.redirect(
      `http://localhost:5173/github-auth-success?token=${accessToken}&owner=${username}&repo=${
        firstRepo.name
      }&branch=${firstRepo.default_branch || "main"}`
    );
  }
);

/* ── DB connection ── */
db.connection();

/* ── HTTP + Socket.io ── */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

/* make io accessible inside routes if you really need it */
app.use((req, _res, next) => {
  req.io = io;
  next();
});

/* ── Whiteboard handler attaches its own io.on('connection') ── */

/* ── In‑memory stores (move to Redis for production) ── */
// { [projectId]: code }
const liveProjectDrawings = {}; // { [projectId]: excalidraw elements }
// { [projectId]: Set(socketIds) }

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1] ||
      "";
    const projectId = socket.handshake.query.projectId;

    // Allow anonymous users (for things like whiteboard)
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    socket.user = decoded;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid project ID"));
    }

    const project = await projectmodel.findById(projectId);
    if (!project) return next(new Error("Project not found"));

    socket.project = project;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Authentication failed"));
  }
});

let connections = [];
const projectDrawings = {};
const projectClear = {};

const canvasStates = {};
const projectObjects = {};

const projectShapes = {}; // This is the only storage you need for the whiteboard
const liveProjectCode = {}; // Your existing variable for the code editor
const peersInRoom = {};

/* ── Main real‑time logic (code, chat, voice, etc.) ── */
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);
  connections.push(socket);
  console.log(`${socket.id} is connected in editor`);
  let roomId = null;

  const joinRoom = (projectId) => {
    if (roomId) socket.leave(roomId);
    roomId = projectId;
    socket.join(roomId);
    console.log(`✅ ${socket.id} joined room: ${roomId}`);

    // Send drawing history to new user
    const history = projectShapes[roomId] || [];
    socket.emit("drawing-history", history);
  };

  // 1. Priority: project injected by auth middleware
  if (socket.project?._id) {
    roomId = socket.project?._id.toString();
    socket.join(roomId);
    console.log("✅ Joined room via socket.project:", roomId);

    // 2. Fallback: client passed projectId via query param
  } else if (socket.handshake.query.projectId) {
    roomId = socket.handshake.query.projectId;
    socket.join(roomId);
    console.log("✅ Joined room via query param:", roomId);

    // 3. Final fallback: wait for client to emit join manually
  } else {
    socket.on("join-project", (projectId) => {
      roomId = projectId;
      socket.join(roomId);
      console.log("📦 Joined room via join-project:", roomId);
    });
    
  }

  socket.on("request-drawing-history", () => {
    // Send the array of shapes for the room, or an empty array if none exists
    socket.emit("drawing-history", projectShapes[roomId] || []);
  });

  // socket.on("add-shape", (newShape) => {
  //   if (!projectShapes[roomId]) {
  //     projectShapes[roomId] = [];
  //   }
  //   projectShapes[roomId].push(newShape);
  //   socket.to(roomId).emit("add-shape", newShape);
  // });

  // socket.on("update-shape", (updatedShape) => {
  //   if (!projectShapes[roomId]) return;

  //   // Find and update the shape in the server's list
  //   projectShapes[roomId] = projectShapes[roomId].map(shape =>
  //     shape.id === updatedShape.id ? updatedShape : shape
  //   );
  //   socket.to(roomId).emit("update-shape", updatedShape);
  // });

  // socket.on("delete-shape", (id) => {
  //   if (!projectShapes[roomId]) return;
  //   projectShapes[roomId] = projectShapes[roomId].filter(shape => shape.id !== id);
  //   socket.to(roomId).emit("delete-shape", id);
  // });

  // socket.on("clear-canvas", () => {
  //   projectShapes[roomId] = [];
  //   io.to(roomId).emit("clear-canvas");
  // });

  

 
  

  // ✅ Use this updated handler for both new and in-progress shapes
  socket.on("add-shape", (shapeData) => {
    if (!projectShapes[roomId]) {
      projectShapes[roomId] = [];
    }
    // Remove previous version of the shape if it exists, then add the new one
    projectShapes[roomId] = [
      ...projectShapes[roomId].filter(s => s.id !== shapeData.id),
      shapeData
    ];
    // Broadcast the final shape to other clients
    socket.to(roomId).emit("add-shape", shapeData);
  });

  socket.on("update-shape", (updatedShape) => {
    if (!projectShapes[roomId]) return;
    projectShapes[roomId] = projectShapes[roomId].map(s =>
      s.id === updatedShape.id ? updatedShape : s
    );
    socket.to(roomId).emit("update-shape", updatedShape);
  });

  socket.on("clear-canvas", () => {
    projectShapes[roomId] = [];
    io.to(roomId).emit("clear-canvas");
  });

  socket.on("clear-canvas", () => {
    projectShapes[roomId] = [];
    io.to(roomId).emit("clear-canvas");
  });

  /* ---------- Code sync ---------- */
  socket.on("request-code", () => {
    socket.emit("code-update", liveProjectCode[roomId] || "// Start coding…");
  });

  socket.on("code-change", ({ code }) => {
    if (typeof code !== "string") return;
    liveProjectCode[roomId] = code;
    socket.to(roomId).emit("code-update", code);
  });

  /* ---------- Chat ---------- */
  socket.on("project-message", async (data) => {
    socket.to(roomId).emit("project-message", data);

    if (data.message.includes("@ai")) {
      const prompt = data.message.replace("@ai", "").trim();
      const aiText = await generateResponse(prompt);
      io.to(roomId).emit("project-message", {
        user: { _id: "ai", username: "AI", email: "ai@gemini.com" },
        message: aiText,
        project: roomId,
        createdAt: new Date().toISOString(),
      });
    }
  });

  socket.on("draw", ({ projectId, ...data }) => {
    if (!projectDrawings[roomId]) projectDrawings[roomId] = [];
    projectDrawings[roomId].push(data);

    projectClear[roomId] = false;
    socket.to(roomId).emit("ondraw", data);
  });

  socket.on("begin", (pos) => {
    socket.to(roomId).emit("onbegin", pos);
  });

  socket.on("request-drawing-history", () => {
    const history = projectDrawings[roomId] || [];
    socket.emit("drawing-history", history);
  });

  socket.on("addObject", (objData) => {
    if (!projectDrawings[roomId]) projectDrawings[roomId] = [];

    // Update existing if present, else add new
    const index = projectDrawings[roomId].findIndex((o) => o.id === objData.id);
    if (index !== -1) {
      projectDrawings[roomId][index] = objData;
    } else {
      projectDrawings[roomId].push(objData);
    }

    socket.to(roomId).emit("addObject", objData);
  });

  socket.on("modifyObject", (objData) => {
    if (!projectDrawings[roomId]) return;

    const index = projectDrawings[roomId].findIndex((o) => o.id === objData.id);
    if (index !== -1) {
      projectDrawings[roomId][index] = objData;
      socket.to(roomId).emit("modifyObject", objData);
    }
  });

  socket.on("deleteObject", (id) => {
    if (!projectDrawings[roomId]) return;

    projectDrawings[roomId] = projectDrawings[roomId].filter(
      (o) => o.id !== id
    );
    socket.to(roomId).emit("deleteObject", id);
  });

  socket.on("erase", (data) => {
    // Broadcast the erase action to other clients in the room
    socket.to(roomId).emit("erase", data);

    // Optionally update server-side projectDrawings to reflect erased strokes
    if (projectDrawings[roomId]) {
      // Remove strokes within the erased radius
      const { x, y, radius } = data;
      projectDrawings[roomId] = projectDrawings[roomId].filter((stroke) => {
        const dx = stroke.endX - x;
        const dy = stroke.endY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist > radius;
      });
    }
  });

  socket.on("clear-canvas", (projectId) => {
    const roomId = projectId;
    projectDrawings[roomId] = [];
    projectClear[roomId] = true;

    // Broadcast to ALL clients including sender
    io.to(roomId).emit("clear-canvas");
  });

  // Update join-project handler
  socket.on("join-project", (projectId) => {
    roomId = projectId;
    socket.join(roomId);

    // Send clear event first if needed
    if (projectClear[roomId]) {
      socket.emit("clear-canvas");
    }

    // Then send drawing history
    const history = projectDrawings[roomId] || [];
    socket.emit("drawing-history", history);
  });
  socket.on("get-canvas", () => {
    const roomCanvas = canvasStates[roomId]; // You should store canvas state per project
    if (roomCanvas) {
      socket.emit("canvas-state", roomCanvas);
    }
  });

  // Receive canvas updates
  socket.on("request-canvas", () => {
    const json = canvasStates[roomId] || null;
    if (json) {
      socket.emit("canvas-data", json);
    }
  });

  socket.on("canvas-update", ({ canvas }) => {
    canvasStates[roomId] = canvas;
    socket.to(roomId).emit("canvas-update", { canvas });
  });
  socket.on("usertyping", ({ username }) => {
    socket.to(roomId).emit("usertyping", { username });
  });
  socket.on("userStopTyping", ({ username }) => {
    socket.to(roomId).emit("userStopTyping", { username });
  });
  socket.on("userDrawing", ({ username }) => {
    socket.to(roomId).emit("userDrawing", { username });
  });

  /* ---------- Voice / WebRTC ---------- */
  socket.on("voice-join", () => {
    (peersInRoom[roomId] ??= new Set()).add(socket.id);
    socket.to(roomId).emit("voice-user-joined", { id: socket.id });
  });

  socket.on("voice-signal", ({ targetId, signal }) => {
    io.to(targetId).emit("voice-signal", { from: socket.id, signal });
  });

  socket.on("voice-offer", ({ offer, projectId }) => {
    socket.to(projectId).emit("voice-offer", { offer });
  });

  socket.on("voice-answer", ({ answer, projectId }) => {
    socket.to(projectId).emit("voice-answer", { answer });
  });

  socket.on("voice-candidate", ({ candidate, projectId }) => {
    socket.to(projectId).emit("voice-candidate", { candidate });
  });

  /* ---------- Disconnect cleanup ---------- */
  socket.on("disconnect", () => {
    /* voice */
    if (peersInRoom[roomId]?.has(socket.id)) {
      peersInRoom[roomId].delete(socket.id);
      socket.to(roomId).emit("voice-user-left", { id: socket.id });
    }

    console.log("🔴 Disconnected:", socket.id);
  });
});

/* ── simple test route ── */
app.get("/", (_req, res) => res.send("Express + Socket.io API running"));

/* ── start server ── */
server.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);
