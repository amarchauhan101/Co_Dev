// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL || "http://localhost:8000";
let socket = null;

export const initializeSocket = (token = "") => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token }, // <-- token gets set here
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
export const joinVoice = (projectId) => emitEvent("voice-join", projectId);
export const leaveVoice = (projectId) => emitEvent("voice-leave", projectId);
export const signalVoice = (payload) => emitEvent("voice-signal", payload);

export const receivedMessage = onEvent;
export const sendMessage = emitEvent;
export const off = offEvent;
