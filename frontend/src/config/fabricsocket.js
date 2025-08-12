// // src/config/fabricSocket.js
// import { io } from "socket.io-client";

// let socket = null;

// /**
//  * Get (or create) a Socket.IO instance bound to
//  * the given auth token and roomId (projectId).
//  */
// export function getFabricSocket(token, projectId) {
//   if (!token || !projectId) return null;

//   if (!socket) {
//     socket = io("http://localhost:8000", {
//       transports: ["websocket"],
//       autoConnect: false,
//     });
//   }

//   const needsReconnect =
//     socket.auth?.token !== token ||
//     socket.io.opts.query?.projectId !== projectId;

//   if (needsReconnect) {
//     if (socket.connected) socket.disconnect();
//     socket.auth = { token };
//     socket.io.opts.query = { projectId }; // <- put projectId here
//     socket.connect();
//   }

//   return socket;
// }

// src/config/fabricSocket.js
// import { io } from "socket.io-client";

// let socket = null;

// /**
//  * Return a singleton Socket.IO client configured with JWT + projectId.
//  */
// export function getFabricSocket(token, projectId) {
//     console.log("token in fabrixc=>",token);
//     console.log("rpjectId in fabric=>",projectId);
//   if (!token || !projectId) return null;

//   /* 1 ─ first‑time creation */
//   if (!socket) {
//     socket = io("http://localhost:8000", {
//       transports: ["websocket"],
//       auth: { token },          // sent with the initial handshake
//       query: { projectId },     // key MUST be "projectId" (server expects it)
//     });

//     /* helpful diagnostics */
//     socket.on("connect", () =>
//       console.log("✅ socket connected:", socket.id)
//     );
//     socket.on("connect_error", (err) =>
//       console.error("❌ connect_error:", err.message)
//     );
//   }

//   /* 2 ─ token or projectId changed? reconnect with new creds */
//   const changed =
//     socket.auth?.token !== token ||
//     socket.io.opts.query?.projectId !== projectId;

//   if (changed) {
//     if (socket.connected) socket.disconnect(); // close cleanly
//     socket.auth = { token };
//     socket.io.opts.query = { projectId };
//     socket.connect();
//   }

//   return socket;
// }

// config/fabricSocket.js
import { io } from "socket.io-client";

let socket;
export function getFabricSocket(token, projectId) {
  if (!token || !projectId) return null;

  if (!socket) {
    socket = io("http://localhost:8000", {
      transports: ["websocket"],
      autoConnect: false,
    });
  }

  const changed =
    socket.auth?.token !== token ||
    socket.io.opts.query?.projectId !== projectId;

  if (changed) {
    socket.disconnect();
    socket.auth = { token };
    socket.io.opts.query = { projectId };
    socket.connect();
  }
  return socket;
}
