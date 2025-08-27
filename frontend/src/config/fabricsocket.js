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
