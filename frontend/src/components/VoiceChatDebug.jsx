import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const VoiceChatDebug = () => {
  const [logs, setLogs] = useState([]);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testMicrophone = async () => {
    try {
      addLog("🎤 Testing microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      addLog(`✅ Microphone OK - ${stream.getAudioTracks().length} tracks`);
      localStreamRef.current = stream;
      
      // Stop after test
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        addLog("🛑 Stopped test stream");
      }, 3000);
    } catch (err) {
      addLog(`❌ Microphone failed: ${err.message}`);
    }
  };

  const connectSocket = () => {
    if (socketRef.current) return;
    
    addLog("🔌 Connecting to socket...");
    const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL, {
      // No auth token for debug - backend allows anonymous users
      query: { projectId: "68a5acd4ba5173cb9c23616a" },
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      addLog("✅ Socket connected");
      socket.emit("voice-join", { projectId: "68a5acd4ba5173cb9c23616a" });
    });

    socket.on("voice-users-list", ({ users }) => {
      setUsers(users || []);
      addLog(`👥 Users in room: ${users?.length || 0}`);
    });

    socket.on("voice-user-joined", ({ users }) => {
      setUsers(users || []);
      addLog(`👥 User joined - Total: ${users?.length || 0}`);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      addLog("❌ Socket disconnected");
    });
  };

  const testWebRTC = async () => {
    try {
      addLog("🔗 Testing WebRTC...");
      
      // Get microphone
      if (!localStreamRef.current) {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: true 
        });
        addLog("🎤 Got local stream");
      }

      // Create peer connection
      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Add tracks
      localStreamRef.current.getTracks().forEach(track => {
        peerRef.current.addTrack(track, localStreamRef.current);
        addLog(`➕ Added ${track.kind} track`);
      });

      // Handle remote stream
      peerRef.current.ontrack = (event) => {
        addLog("🔊 Received remote track!");
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().then(() => {
            addLog("▶️ Playing remote audio");
          }).catch(err => {
            addLog(`❌ Play failed: ${err.message}`);
          });
        }
      };

      addLog("✅ WebRTC setup complete");
    } catch (err) {
      addLog(`❌ WebRTC failed: ${err.message}`);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setUsers([]);
    addLog("🧹 Cleaned up all resources");
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Voice Chat Debug</h1>
      
      <div className="mb-4 flex gap-2">
        <button 
          onClick={testMicrophone}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Test Microphone
        </button>
        <button 
          onClick={connectSocket}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          disabled={isConnected}
        >
          Connect Socket
        </button>
        <button 
          onClick={testWebRTC}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          Test WebRTC
        </button>
        <button 
          onClick={cleanup}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Cleanup
        </button>
      </div>

      <div className="mb-4">
        <p><strong>Socket:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
        <p><strong>Users:</strong> {users.length}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Debug Logs:</h3>
        <div className="bg-gray-800 p-4 rounded max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-sm mb-1">{log}</div>
          ))}
        </div>
      </div>

      <audio 
        ref={remoteAudioRef} 
        controls 
        autoPlay
        className="w-full mt-4"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default VoiceChatDebug;
