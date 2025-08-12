// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const app = require("./index")

// const app = express();
// const PORT = process.env.PORT || 8000;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Create HTTP server
// const server = http.createServer(app);

// // Setup Socket.io with CORS
// const io = new Server(server, {
//     cors: {
//         origin: "*", // Allow all origins (update this in production)
//         methods: ["GET", "POST"]
//     }
// });

// // WebSocket Connection Event
// io.on("connection", (socket) => {
//     console.log(`🟢 New client connected: ${socket.id}`);

//     // Handle message event
//     socket.on("message", (data) => {
//         console.log(`📩 Message received: ${data}`);
//         io.emit("message", data); // Broadcast to all clients
//     });

//     // Handle disconnect event
//     socket.on("disconnect", () => {
//         console.log(`🔴 Client disconnected: ${socket.id}`);
//     });
// });

// // Start server
// server.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
// });


import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;
const API_KEY = "FJrJz5TApdLuxpkP4krx";
app.use(cors());

app.get("/location", async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Latitude and longitude required" });

    try {
        // Fetch User's CO₂ Data
        const carbonResponse = await fetch(`https://api-access.electricitymaps.com/free-tier/carbon-intensity/latest?lat=${lat}&lon=${lon}`, {
            headers: { "auth-token": API_KEY }
        });
        const carbonData = await carbonResponse.json();
        console.log(carbonData.carbonIntensity)
        const userCarbon = carbonData.carbonIntensity || "Data not available";

        // Overpass API Query for Cities within 500 km
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];
            node["place"="city"](around:500000,${lat},${lon});
            out center;`;

        const cityResponse = await fetch(overpassUrl);
        const cityData = await cityResponse.json();

        // Fetch CO₂ data for cities
        const cities = await Promise.all(cityData.elements.map(async city => {
            try {
                const cityCarbonResponse = await fetch(`https://api-access.electricitymaps.com/free-tier/carbon-intensity/latest?lat=${city.lat}&lon=${city.lon}`, {
                    headers: { "auth-token": API_KEY }
                });
                const cityCarbonData = await cityCarbonResponse.json();
                return { name: city.tags.name, lat: city.lat, lon: city.lon, carbonIntensity: cityCarbonData.carbonIntensity || "N/A" };
            } catch {
                return { name: city.tags.name, lat: city.lat, lon: city.lon, carbonIntensity: "Error fetching data" };
            }
        }));
        console.log(userCarbon)
        res.json({ userCarbon, cities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



//  socket.on("start-standup", (data) => {
//     const projectId = socket.project?._id.toString();
//     const users = data.users; // this should be an array of user IDs

//     if (!projectId || !Array.isArray(users) || users.length === 0) {
//       return socket.emit("standup-error", "Invalid standup request");
//     }

//     if (standup[projectId]) {
//       return socket.emit("standup-error", "Standup already in progress");
//     }

//     standup[projectId] = { users, currentIndex: 0 };

//     startTurn(projectId);
//   });

//   socket.on("next-speaker", () => {
//     const projectId = socket.project?._id.toString();
//     const stand = standup[projectId];
//     if (!stand) return;

//     clearTimeout(stand.timer); // clear current timeout
//     stand.currentIndex++;
//     startTurn(projectId);
//   });

//   socket.on("end-standup", () => {
//     const projectId = socket.project?._id.toString();
//     if (standup[projectId]) {
//       clearTimeout(standup[projectId].timer);
//       delete standup[projectId];
//       io.to(projectId).emit("standup-ended");
//     }
//   });

//   socket.on("start-voice", ({ projectId }) => {
//     socket.join(projectId);
//     socket.to(projectId).emit("voice-user-joined", socket.id);
//   });

//   socket.on("offer", ({ offer, to }) => {
//     io.to(to).emit("offer", { offer, from: socket.id });
//   });

//   socket.on("answer", ({ answer, to }) => {
//     io.to(to).emit("answer", { answer, from: socket.id });
//   });

//   socket.on("ice-candidate", ({ candidate, to }) => {
//     io.to(to).emit("ice-candidate", { candidate, from: socket.id });
//   });

//   socket.on("disconnect", () => {
//     socket.broadcast.emit("voice-user-left", socket.id);
//   });

//   function startTurn(projectId) {
//     const stand = standup[projectId];
//     if (!stand) return;

//     if (stand.currentIndex >= stand.users.length) {
//       io.to(projectId).emit("standup-ended");
//       delete standup[projectId];
//       return;
//     }

//     const currentUser = stand.users[stand.currentIndex];
//     io.to(projectId).emit("standup-turn", { userId: currentUser, time: 60 });

//     stand.timer = setTimeout(() => {
//       stand.currentIndex++;
//       startTurn(projectId);
//     }, 60000);
//   }