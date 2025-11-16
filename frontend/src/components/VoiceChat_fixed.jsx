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

    console.log("🔗 Creating new RTCPeerConnection");
    peerRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    // Handle ICE candidates
    peerRef.current.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.connected) {
        console.log("🧊 Sending ICE candidate");
        socketRef.current.emit("voice-candidate", {
          candidate: event.candidate,
          projectId,
        });
      }
    };

    // Handle remote stream - MOST IMPORTANT FOR HEARING AUDIO
    peerRef.current.ontrack = (event) => {
      console.log("🔊 Received remote track:", event.track.kind);
      const [remoteStream] = event.streams;
      
      if (remoteStream && remoteAudioRef.current) {
        console.log("🔊 Setting remote audio stream with", remoteStream.getTracks().length, "tracks");
        remoteAudioRef.current.srcObject = remoteStream;
        setIsReceivingAudio(true);
        
        // CRITICAL: Ensure audio plays and is audible
        remoteAudioRef.current.volume = 1.0;
        remoteAudioRef.current.muted = false;
        
        // Handle autoplay restrictions
        const playAudio = async () => {
          try {
            await remoteAudioRef.current.play();
            console.log("✅ Remote audio is playing!");
          } catch (err) {
            console.error("❌ Autoplay failed:", err.message);
            console.log("🔊 Click the audio element to start playing");
          }
        };
        
        playAudio();
      }
    };

    // Handle connection state changes
    peerRef.current.onconnectionstatechange = () => {
      const state = peerRef.current.connectionState;
      console.log("📡 Connection state changed to:", state);
      setConnectionState(state);
      
      if (state === 'connected') {
        console.log("✅ WebRTC peer connection established!");
      } else if (state === 'failed' || state === 'disconnected') {
        console.log("❌ Connection failed/disconnected");
        setIsReceivingAudio(false);
      }
    };

    // Handle ICE connection state
    peerRef.current.oniceconnectionstatechange = () => {
      const iceState = peerRef.current.iceConnectionState;
      console.log("🧊 ICE connection state:", iceState);
      
      if (iceState === 'connected' || iceState === 'completed') {
        console.log("✅ ICE connection established");
      } else if (iceState === 'failed') {
        console.log("🔄 ICE failed - restarting");
        peerRef.current.restartIce();
      }
    };

    return peerRef.current;
  };

  const addLocalStreamToPeer = () => {
    if (localStream.current && peerRef.current) {
      console.log("🎤 Adding local tracks to peer connection");
      localStream.current.getTracks().forEach((track) => {
        console.log(`🎤 Adding ${track.kind} track:`, track.label);
        peerRef.current.addTrack(track, localStream.current);
      });
      console.log("✅ All local tracks added to peer connection");
    } else {
      console.error("❌ Cannot add tracks - missing stream or peer connection");
    }
  };

  const processPendingCandidates = async () => {
    if (peerRef.current?.remoteDescription && pendingCandidatesRef.current.length > 0) {
      console.log(`🧊 Processing ${pendingCandidatesRef.current.length} pending ICE candidates`);
      
      while (pendingCandidatesRef.current.length > 0) {
        const candidate = pendingCandidatesRef.current.shift();
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ Added queued ICE candidate");
        } catch (err) {
          console.error("❌ Error adding queued ICE candidate:", err);
        }
      }
    }
  };

  const createOffer = async () => {
    if (!peerRef.current || !socketRef.current?.connected) {
      console.error("❌ Cannot create offer - missing peer or socket");
      return;
    }

    try {
      console.log("📞 Creating offer...");
      const offer = await peerRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      
      await peerRef.current.setLocalDescription(offer);
      console.log("📞 Local description set, sending offer");
      
      socketRef.current.emit("voice-offer", { 
        offer: offer, 
        projectId 
      });
    } catch (err) {
      console.error("❌ Failed to create offer:", err);
    }
  };

  const createAnswer = async (offer) => {
    if (!peerRef.current || !socketRef.current?.connected) {
      console.error("❌ Cannot create answer - missing peer or socket");
      return;
    }

    try {
      console.log("📞 Setting remote description and creating answer...");
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      
      console.log("📞 Answer created, sending response");
      socketRef.current.emit("voice-answer", { 
        answer: answer, 
        projectId 
      });
      
      // Process any pending candidates
      await processPendingCandidates();
    } catch (err) {
      console.error("❌ Failed to create answer:", err);
    }
  };

  const startVoiceCall = async () => {
    try {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket not connected");
        return;
      }

      if (isInCall) {
        console.log("ℹ️ Already in call");
        return;
      }

      console.log("🎤 Starting voice call...");

      // Get user media with high-quality audio settings
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      });

      console.log("✅ Local stream obtained:", localStream.current.id);
      console.log("🎤 Local audio tracks:", localStream.current.getAudioTracks().length);
      setIsInCall(true);

      // Create peer connection and add tracks
      createPeerConnection();
      addLocalStreamToPeer();

      console.log("🎤 Voice call setup complete, waiting for peer...");

    } catch (err) {
      console.error("❌ Failed to start voice call:", err);
      alert(`Failed to access microphone: ${err.message}`);
      setIsInCall(false);
      cleanup();
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
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("🔗 VoiceChat: Connected to voice server");
      socket.emit("voice-join", { projectId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔌 VoiceChat: Disconnected from voice server");
    });

    socket.on("voice-user-joined", async ({ id, users }) => {
      console.log("👥 User joined voice room:", id, "Total users:", users?.length);
      setConnectedUsers(users || []);
      
      // If we're in a call and a new user joins, initiate connection
      if (isInCall && users && users.length >= 2) {
        console.log("🤝 Initiating connection with new user");
        await createOffer();
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
      console.log("📨 Received offer from:", from);
      
      try {
        // Ensure we have local stream
        if (!localStream.current) {
          console.log("🎤 Getting local stream for incoming call...");
          localStream.current = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          setIsInCall(true);
        }
        
        // Create peer connection if needed
        if (!peerRef.current) {
          createPeerConnection();
          addLocalStreamToPeer();
        }
        
        // Handle the offer
        await createAnswer(offer);
        
      } catch (err) {
        console.error("❌ Error handling voice offer:", err);
      }
    });

    // Handle incoming answer
    socket.on("voice-answer", async ({ answer, from }) => {
      console.log("📨 Received answer from:", from);
      
      try {
        if (peerRef.current && peerRef.current.signalingState === "have-local-offer") {
          console.log("✅ Setting remote description from answer");
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          await processPendingCandidates();
        } else {
          console.warn("⚠️ Unexpected answer - signaling state:", peerRef.current?.signalingState);
        }
      } catch (err) {
        console.error("❌ Error handling voice answer:", err);
      }
    });

    // Handle incoming ICE candidate
    socket.on("voice-candidate", async ({ candidate, from }) => {
      try {
        if (peerRef.current?.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("🧊 Added ICE candidate from:", from);
        } else {
          console.log("🧊 Queuing ICE candidate from:", from);
          pendingCandidatesRef.current.push(candidate);
        }
      } catch (err) {
        console.error("❌ ICE candidate error:", err);
      }
    });

    return () => {
      console.log("🧹 VoiceChat: Cleaning up for projectId:", projectId);
      cleanup();
    };
  }, [projectId, token]);

  const cleanup = () => {
    console.log("🧹 Cleaning up voice chat resources");
    
    pendingCandidatesRef.current = [];
    
    if (socketRef.current?.connected) {
      socketRef.current.emit("voice-leave", { projectId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
      localStream.current = null;
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setIsInCall(false);
    setIsConnected(false);
    setIsMuted(false);
    setConnectedUsers([]);
    setConnectionState('new');
    setIsReceivingAudio(false);
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        if (socketRef.current?.connected) {
          socketRef.current.emit("voice-mute", { 
            projectId, 
            isMuted: !audioTrack.enabled 
          });
        }
        
        console.log(`🎤 Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
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
        {isReceivingAudio && (
          <span className="text-xs text-green-400">🔊</span>
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
          disabled={!isConnected}
        >
          <FaPhone size={16} />
        </button>
      )}

      {/* Remote Audio Element - VISIBLE FOR DEBUGGING */}
      {isReceivingAudio && (
        <div className="ml-2">
          <audio 
            ref={remoteAudioRef} 
            autoPlay 
            playsInline 
            volume={1.0}
            controls={true}
            style={{ 
              width: '150px', 
              height: '30px'
            }}
          />
          <div className="text-xs text-green-400">Remote Audio</div>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
