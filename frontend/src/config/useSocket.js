// import { useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:8000";

// export default function useSocket(token) {
//   /* 1️⃣  Create the socket once, synchronously */
//   const socketRef = useRef(
//     io(SOCKET_URL, { transports: ["websocket"], autoConnect: false })
//   );

//   /* 2️⃣  Authenticate / connect whenever the token changes */
//   useEffect(() => {
//     if (!token) return;

//     const socket = socketRef.current;
//     if (socket.auth?.token !== token) {
//       if (socket.connected) socket.disconnect();
//       socket.auth = { token };
//       socket.connect();
//     }
//   }, [token]);

//   /* 3️⃣  The instance is never null after the first render */
//   return socketRef.current;
// }

// hooks/useSocket.js
// hooks/useSocket.js
// import { useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:8000";

// export default function useSocket(token, projectId) {
//   // create once, even before token is set
//   const socketRef = useRef(
//     io(SOCKET_URL, { transports: ["websocket"], autoConnect: false, query: { projectId },  })
//   );

//   useEffect(() => {
//     if (!token || !projectId) return;

//     const s = socketRef.current;
//     if (s.auth?.token !== token || s.auth?.projectId !== projectId) {
//       if (s.connected) s.disconnect();
//       s.auth = { token, projectId };
//       s.connect();
//     }
//   }, [token, projectId]);

//   return socketRef.current; // never null after first render
// }

// hooks/useSocket.js
// hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(token, projectId) {
  const sock = useRef(io("http://localhost:8000", {
    transports: ["websocket"],
    autoConnect: false,
  }));

  useEffect(() => {
    if (!token || !projectId) return;
    const s = sock.current;

    const changed =
      s.auth?.token !== token ||
      s.io.opts.query?.projectId !== projectId;

    if (changed) {
      if (s.connected) s.disconnect();
      s.auth = { token };
      s.io.opts.query = { projectId };
      s.connect();
    }
  }, [token, projectId]);

  return sock.current;
}

