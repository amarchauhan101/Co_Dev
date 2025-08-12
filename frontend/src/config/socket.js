// import { useSelector } from "react-redux";
// import { io } from "socket.io-client";

// let socketinstance = null;
// const SOCKET_URL = "http://localhost:8000";


// export const socket = io(SOCKET_URL, {
//   transports: ["websocket"],
//   autoConnect: false,
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
// });

// let isConnecting = false;

// export const connectSocket = () => {
//   console.log("inside connectsocket");
//   if (!socket.connected && !isConnecting) {
//     console.log("yes conectiong");
//     isConnecting = true;
//     socket.connect();
//     return true;
//   }
//   return false;
// };

// export const disconnectSocket = () => {
//   if (socket.connected) {
//     socket.disconnect();
//   }
//   isConnecting = false;
// };

// // Event emitter helpers
// export const emitEvent = (event, data) => {
//   if (socket.connected) {
//     socket.emit(event, data);
//   }
// };

// // Event listener helpers
// export const onEvent = (event, callback) => {
//   socket.on(event, callback);
// };

// export const offEvent = (event, callback) => {
//   socket.off(event, callback);
// };
// export const initializeSocket = (projectId, token) => {
//   if (socketinstance) return socketinstance; 
//   socketinstance = io("http://localhost:8000", {
//     auth: { token: token || "" },
//     query: { projectId },
//     transports: ["websocket"],
//     withCredentials: true,
//   });
//   socketinstance.on("connect_error", (err) => console.error("WS error:", err));
//   return socketinstance;
// };

// export const receivedMessage = (event, cb) => {
//   socketinstance?.on(event, cb);
// };

// export const sendMessage = (event, data) => {
//   socketinstance?.emit(event, data);
// };

// export const off = (event, cb) => {
//   socketinstance?.off(event, cb);
// };

// /* -----------------------------------------
//    Voice‑call signalling helpers
// ----------------------------------------- */
// export const joinVoice = (projectId) => {
//   socketinstance?.emit("voice-join", projectId);
// };

// export const leaveVoice = (projectId) => {
//   socketinstance?.emit("voice-leave", projectId);
// };

// /**
//  * Send SDP / ICE to a specific peer (targetId)
//  * `signal` comes from simple-peer's `peer.on("signal", data)`
//  */
// export const signalVoice = ({ roomId, targetId, signal }) => {
//   socketinstance?.emit("voice-signal", { roomId, targetId, signal });
// };


// import { useSelector } from "react-redux";
// import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:8000";
// let socket = null;


// const users = useSelector((state) => state.userauth?.user?.userWithToken);
// const token = users?.token;
// export const initializeSocket = (token = "") => {
//   if (socket) return socket;
  
//   socket = io(SOCKET_URL, {
//     auth: { token },
//     transports: ["websocket"],
//     autoConnect: false,
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     withCredentials: true,
//   });

//   socket.on("connect_error", (err) => {
//     console.error("Socket connection error:", err);
//   });

//   return socket;
// };

// export const connectSocket = () => {
//   if (!socket) {
//     // Get token from local storage or wherever you store it
//     const token = users?.token;
//     initializeSocket(token);
//   }
  
//   if (!socket.connected) {
//     socket.connect();
//     return true;
//   }
//   return false;
// };

// export const disconnectSocket = () => {
//   if (socket && socket.connected) {
//     socket.disconnect();
//   }
// };

// export const emitEvent = (event, data) => {
//   if (socket && socket.connected) {
//     socket.emit(event, data);
//   }
// };

// export const onEvent = (event, callback) => {
//   if (socket) {
//     socket.on(event, callback);
//   }
// };

// export const offEvent = (event, callback) => {
//   if (socket) {
//     socket.off(event, callback);
//   }
// };

// export const joinVoice = (projectId) => {
//   emitEvent("voice-join", projectId);
// };

// export const leaveVoice = (projectId) => {
//   emitEvent("voice-leave", projectId);
// };

// export const signalVoice = ({ roomId, targetId, signal }) => {
//   emitEvent("voice-signal", { roomId, targetId, signal });
// };

// export const receivedMessage = onEvent;
// export const sendMessage = emitEvent;
// export const off = offEvent;

// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";
let socket = null;

export const initializeSocket = (token = "") => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },          // <-- token gets set here
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
  });

  // socket.on("connect_error", (err) => {
  //   console.error("Socket connection error:", err.message);
  // });

  return socket;
};
export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  socket?.connected && socket.disconnect();
};

export const emitEvent = (event, data) => {
  socket?.connected && socket.emit(event, data);
};

export const onEvent = (event, cb) => socket?.on(event, cb);
export const offEvent = (event, cb) => socket?.off(event, cb);

/* ---------- voice helpers ---------- */
export const joinVoice   = (projectId) => emitEvent("voice-join",  projectId);
export const leaveVoice  = (projectId) => emitEvent("voice-leave", projectId);
export const signalVoice = (payload)   => emitEvent("voice-signal", payload);

export const receivedMessage = onEvent;
export const sendMessage     = emitEvent;
export const off             = offEvent;
