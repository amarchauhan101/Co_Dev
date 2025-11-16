import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash, FaUsers } from "react-icons/fa";

const VoiceChat = ({ projectId, token, onStatsChange }) => {
  const peerRef = useRef(null);
  const localStream = useRef(null);
  const remoteAudioRef = useRef(null);
  const socketRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [connectionState, setConnectionState] = useState('new');
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);

  // Update parent component with stats
  useEffect(() => {
    if (onStatsChange) {
      onStatsChange({
        connected: connectedUsers.length,
        inCall: isInCall,
        isConnected: isConnected,
        connectionState: connectionState
      });
    }
  }, [connectedUsers, isInCall, isConnected, connectionState, onStatsChange]);

  const createPeerConnection = () => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    peerRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    // Handle ICE candidates
    peerRef.current.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        console.log("🧊 Sending ICE candidate");
        socketRef.current.emit("voice-candidate", {
          candidate: e.candidate,
          projectId,
        });
      }
    };

    // Handle remote stream
    peerRef.current.ontrack = (event) => {
      console.log("🔊 Received remote track:", event.streams[0]);
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        // Ensure audio plays automatically
        remoteAudioRef.current.play().catch(console.error);
        console.log("🔊 Set remote audio source and playing");
      }
    };

    // Handle connection state changes
    peerRef.current.onconnectionstatechange = () => {
      const state = peerRef.current.connectionState;
      console.log("📡 Connection state:", state);
      setConnectionState(state);
      
      if (state === 'connected') {
        console.log("✅ Peer connection established!");
      } else if (state === 'failed' || state === 'disconnected') {
        console.log("❌ Peer connection failed/disconnected");
        // Attempt to restart connection
        setTimeout(() => {
          if (isInCall && connectedUsers.length > 1) {
            console.log("🔄 Attempting to restart connection...");
            initiatePeerConnection();
          }
        }, 2000);
      }
    };

    // Handle ICE connection state
    peerRef.current.oniceconnectionstatechange = () => {
      const iceState = peerRef.current.iceConnectionState;
      console.log("🧊 ICE connection state:", iceState);
      
      if (iceState === 'failed') {
        console.log("🔄 ICE connection failed, attempting restart...");
        peerRef.current.restartIce();
      }
    };

    return peerRef.current;
  };

  const addLocalStreamToPeer = () => {
    if (localStream.current && peerRef.current) {
      localStream.current.getTracks().forEach((track) => {
        console.log("🎤 Adding track to peer:", track.kind);
        peerRef.current.addTrack(track, localStream.current);
      });
    }
  };

  const processPendingCandidates = async () => {
    if (peerRef.current && peerRef.current.remoteDescription) {
      while (pendingCandidatesRef.current.length > 0) {
        const candidate = pendingCandidatesRef.current.shift();
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("🧊 Added queued ICE candidate");
        } catch (err) {
          console.error("❌ Error adding queued ICE candidate:", err);
        }
      }
    }
  };

  const initiatePeerConnection = async () => {
    try {
      if (!localStream.current) {
        console.error("❌ No local stream available");
        return;
      }

      createPeerConnection();
      addLocalStreamToPeer();

      if (isInitiator) {
        console.log("📞 Creating offer as initiator");
        const offer = await peerRef.current.createOffer({
          offerToReceiveAudio: true,
        });
        await peerRef.current.setLocalDescription(offer);
        console.log("📞 Sending offer");
        socketRef.current.emit("voice-offer", { offer, projectId });
      }
    } catch (err) {
      console.error("❌ Failed to initiate peer connection:", err);
    }
  };

  const startVoiceCall = async () => {
    try {
      if (!socketRef.current || !socketRef.current.connected) {
        console.error("❌ Socket not connected");
        return;
      }

      console.log("🎤 Starting voice call...");

      // Get user media first
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      console.log("🎤 Got local stream:", localStream.current);
      setIsInCall(true);

      // Initialize peer connection
      await initiatePeerConnection();

    } catch (err) {
      console.error("❌ Failed to start voice call:", err);
      setIsInCall(false);
      
      // Clean up on error
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
      }
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!projectId || !token) {
      console.log("❌ VoiceChat: Missing projectId or token", { projectId: !!projectId, token: !!token });
      return;
    }

    console.log("🎤 VoiceChat: Initializing with projectId:", projectId);

    const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL, {
      auth: { token },
      query: { projectId },
      forceNew: true, // Force new connection to prevent reuse
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("🔗 VoiceChat: Connected to voice server");
      // Only emit voice-join after successful connection
      socket.emit("voice-join", { projectId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔌 VoiceChat: Disconnected from voice server");
    });

    socket.on("voice-user-joined", async ({ id, users }) => {
      console.log("👥 Other user joined voice chat:", id);
      setConnectedUsers(users || []);
      
      // Only become initiator if we're the first user and someone joins
      if (!isInCall && users && users.length === 2) {
        // Find if we're the first user (lower socket ID typically means joined first)
        const currentUser = users.find(user => user.id === socket.id);
        const otherUser = users.find(user => user.id !== socket.id);
        
        if (currentUser && otherUser && currentUser.id < otherUser.id) {
          console.log("🎤 Becoming initiator for voice call");
          setIsInitiator(true);
        }
      }
    });

    socket.on("voice-users-list", ({ users }) => {
      setConnectedUsers(users || []);
    });

    socket.on("voice-user-left", ({ id, users }) => {
      console.log("👋 User left voice chat:", id);
      setConnectedUsers(users || []);
    });

    // Handle incoming offer
    socket.on("voice-offer", async ({ offer, from }) => {
      console.log("📩 Received offer from:", from);
      try {
        // Make sure we have a local stream
        if (!localStream.current) {
          console.log("🎤 Getting local stream for incoming offer");
          localStream.current = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          setIsInCall(true);
        }
        
        // Create peer connection if it doesn't exist
        if (!peerRef.current) {
          createPeerConnection();
          addLocalStreamToPeer();
        }
        
        console.log("📩 Setting remote description from offer");
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Process any pending ICE candidates
        await processPendingCandidates();
        
        console.log("📞 Creating answer");
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        
        console.log("📞 Sending answer");
        socket.emit("voice-answer", { answer, projectId });
      } catch (err) {
        console.error("❌ Error handling voice offer:", err);
      }
    });

    // Handle incoming answer
    socket.on("voice-answer", async ({ answer, from }) => {
      console.log("📩 Received answer from:", from);
      try {
        if (peerRef.current && peerRef.current.signalingState === "have-local-offer") {
          console.log("📩 Setting remote description from answer");
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          
          // Process any pending ICE candidates
          await processPendingCandidates();
        } else {
          console.warn("⚠️ Received answer but not in correct state:", peerRef.current?.signalingState);
        }
      } catch (err) {
        console.error("❌ Error handling voice answer:", err);
      }
    });

    // Handle incoming ICE candidate
    socket.on("voice-candidate", async ({ candidate, from }) => {
      try {
        if (peerRef.current && peerRef.current.remoteDescription) {
          console.log("🧊 Adding ICE candidate from:", from);
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log("🧊 Queuing ICE candidate from:", from);
          pendingCandidatesRef.current.push(candidate);
        }
      } catch (err) {
        console.error("❌ ICE Candidate error:", err);
      }
    });

    return () => {
      console.log("🧹 VoiceChat: Cleaning up for projectId:", projectId);
      cleanup();
    };
  }, [projectId, token]); // Remove dependencies that cause re-renders

  const cleanup = () => {
    console.log("🧹 VoiceChat: Cleaning up voice chat resources");
    
    // Clear pending candidates
    pendingCandidatesRef.current = [];
    
    if (socketRef.current && socketRef.current.connected) {
      console.log("🚪 VoiceChat: Leaving voice room");
      socketRef.current.emit("voice-leave", { projectId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (localStream.current) {
      console.log("🎤 VoiceChat: Stopping local stream");
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (peerRef.current) {
      console.log("🔌 VoiceChat: Closing peer connection");
      peerRef.current.close();
      peerRef.current = null;
    }

    // Clear remote audio
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setIsInCall(false);
    setIsConnected(false);
    setIsMuted(false);
    setConnectedUsers([]);
    setIsInitiator(false);
    setConnectionState('new');
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Notify other users about mute status
        if (socketRef.current) {
          socketRef.current.emit("voice-mute", { 
            projectId, 
            isMuted: !audioTrack.enabled 
          });
        }
        
        console.log(`🎤 ${audioTrack.enabled ? 'Unmuted' : 'Muted'} microphone`);
      }
    }
  };

  const endCall = () => {
    cleanup();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Voice Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isConnected 
            ? (connectionState === 'connected' ? 'bg-green-500' : 'bg-yellow-500')
            : 'bg-red-500'
        }`}></div>
        <FaUsers className="text-gray-300" size={14} />
        <span className="text-sm text-gray-300">
          {connectedUsers.length}
        </span>
        {connectionState !== 'new' && (
          <span className="text-xs text-gray-500">
            {connectionState}
          </span>
        )}
      </div>

      {/* Voice Controls */}
      {isInCall ? (
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
          </button>
          
          <button
            onClick={endCall}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
            title="End Call"
          >
            <FaPhoneSlash size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={startVoiceCall}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-600"
          title="Start Voice Chat"
          disabled={!isConnected || connectedUsers.length < 2}
        >
          <FaPhone size={16} />
        </button>
      )}

      {/* Hidden audio element for remote audio - CRITICAL: No muted attribute! */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline 
        controls={false}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default VoiceChat;
