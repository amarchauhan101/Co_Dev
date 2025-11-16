import React, { useEffect, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";

const SOCKET_SERVER_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL; // Your backend

function CollaborativeEditor({ projectId, user }) {
  const [code, setCode] = useState("// Start coding...");
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  // const {user} = useAuth();
  console.log("user in collaborative editor", user);
  const token = user?.token;

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL, {
      query: { projectId },
      auth: {
        token: token, // or your auth context token
      },
      transports: ["websocket"],
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Request latest code from server
    socketRef.current.emit("request-code");

    // Receive code updates
    socketRef.current.on("code-update", (newCode) => {
      isRemoteChange.current = true;
      console.log(`objectReceived code update: ${newCode}`);
      setCode(newCode);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [projectId, user._id]);

  const onChange = (value) => {
    console.log("Code changed:", value);
    setCode(value);
    if (!isRemoteChange.current) {
      socketRef.current.emit("code-change", { projectId, code: value });
    }
    isRemoteChange.current = false;
  };

  return (
    <div style={{ height: "500px", border: "1px solid #ccc" }}>
      <MonacoEditor
        height="100%"
        defaultLanguage="javascript"
        value={code}
        onChange={onChange}
        onMount={(editor) => (editorRef.current = editor)}
        theme="vs-dark"
      />
    </div>
  );
}

export default CollaborativeEditor;
