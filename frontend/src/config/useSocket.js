// hooks/useSocket.js
// hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(token, projectId) {
  const sock = useRef(
    io(import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL, {
      transports: ["websocket"],
      autoConnect: false,
    })
  );

  useEffect(() => {
    if (!token || !projectId) return;
    const s = sock.current;

    const changed =
      s.auth?.token !== token || s.io.opts.query?.projectId !== projectId;

    if (changed) {
      if (s.connected) s.disconnect();
      s.auth = { token };
      s.io.opts.query = { projectId };
      s.connect();
    }
  }, [token, projectId]);

  return sock.current;
}
