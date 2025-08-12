// import { useEffect, useRef, useState } from "react";
// import SimplePeer from "simple-peer";
// import {
//   joinVoice,
//   leaveVoice,
//   signalVoice,
//   receivedMessage,
//   off,
// } from "../config/socket";

// export interface RemotePeer {
//   id: string;
//   stream: MediaStream;
// }

// export const useVoice = (projectId: string) => {
//   const [peers, setPeers] = useState<Record<string, RemotePeer>>({});
//   const localStream = useRef<MediaStream | null>(null);
//   const peerRefs = useRef<Record<string, SimplePeer.Instance>>({});

//   useEffect(() => {
//     if (!projectId) return;

//     const init = async () => {
//       // Mic access
//       localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
//       joinVoice(projectId);

//       // When another user joins voice room
//       receivedMessage("voice-user-joined", ({ id }) => {
//         const peer = new SimplePeer({ initiator: true, trickle: false, stream: localStream.current ?? undefined });
//         peer.on("signal", signal => signalVoice({ roomId: projectId, targetId: id, signal }));
//         peer.on("stream", stream => setPeers(prev => ({ ...prev, [id]: { id, stream } })));
//         peerRefs.current[id] = peer;
//       });

//       // When receiving WebRTC offer/answer
//       receivedMessage("voice-signal", ({ from, signal }) => {
//         let peer = peerRefs.current[from];
//         if (!peer) {
//           peer = new SimplePeer({ initiator: false, trickle: false, stream: localStream.current ?? undefined });
//           peer.on("signal", sig => signalVoice({ roomId: projectId, targetId: from, signal: sig }));
//           peer.on("stream", stream => setPeers(prev => ({ ...prev, [from]: { id: from, stream } })));
//           peerRefs.current[from] = peer;
//         }
//         peer.signal(signal);
//       });

//       // When a peer leaves
//       receivedMessage("voice-user-left", ({ id }) => {
//         peerRefs.current[id]?.destroy();
//         delete peerRefs.current[id];
//         setPeers(prev => {
//           const copy = { ...prev };
//           delete copy[id];
//           return copy;
//         });
//       });
//     };

//     init();

//     return () => {
//       leaveVoice(projectId);
//       off("voice-user-joined");
//       off("voice-signal");
//       off("voice-user-left");
//       Object.values(peerRefs.current).forEach(p => p.destroy());
//       peerRefs.current = {};
//       localStream.current?.getTracks().forEach(track => track.stop());
//     };
//   }, [projectId]);

//   return { localStream, peers };
// };


import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { 
  emitEvent,
  onEvent,
  offEvent
} from "../config/socket";

interface RemotePeer {
  id: string;
  stream: MediaStream;
  isMuted: boolean;
}

export const useVoice = (projectId: string) => {
  const [peers, setPeers] = useState<Record<string, RemotePeer>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [isHeadphonesOn, setIsHeadphonesOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const localStream = useRef<MediaStream | null>(null);
  const peerRefs = useRef<Record<string, SimplePeer.Instance>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize voice processing
  const initAudioProcessing = () => {
    if (!audioContextRef.current && localStream.current) {
      const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext))();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(localStream.current);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    }
  };

  // Detect speaking state
  useEffect(() => {
    if (!analyserRef.current) return;
    
    let animationFrame: number;
    const checkSpeaking = () => {
      if (!analyserRef.current) return;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const isCurrentlySpeaking = sum > bufferLength * 5;
      
      if (isCurrentlySpeaking !== isSpeaking) {
        setIsSpeaking(isCurrentlySpeaking);
      }
      
      animationFrame = requestAnimationFrame(checkSpeaking);
    };
    
    animationFrame = requestAnimationFrame(checkSpeaking);
    return () => cancelAnimationFrame(animationFrame);
  }, [isSpeaking]);

  useEffect(() => {
    if (!projectId) return;
    
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        localStream.current = stream;
        initAudioProcessing();
        emitEvent("voice-join", projectId);
      } catch (err) {
        console.error("Microphone access error:", err);
      }
    };

    init();

    // Event handlers
    const handleUserJoined = ({ id }: { id: string }) => {
      // Replace 'yourSocketInstance' with your actual socket instance variable
      // If you have a socket instance, import it and use its id property
      // Example: import { socket } from "../config/socket";
      // if (id === socket.id || peerRefs.current[id]) return;
      if (peerRefs.current[id]) return;

      const peer = new SimplePeer({
        initiator: true,
        trickle: true,
        stream: localStream.current || undefined,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      peer.on("signal", signal => {
        emitEvent("voice-signal", { targetId: id, signal });
      });

      peer.on("stream", stream => {
        setPeers(prev => ({
          ...prev,
          [id]: { id, stream, isMuted: false }
        }));
      });

      peer.on("error", err => {
        console.error(`Peer error with ${id}:`, err);
        cleanupPeer(id);
      });

      peerRefs.current[id] = peer;
    };

    const handleSignal = ({ from, signal }: { from: string; signal: any }) => {
      let peer = peerRefs.current[from];
      
      if (!peer) {
        peer = new SimplePeer({
          initiator: false,
          trickle: true,
          stream: localStream.current || undefined,
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on("signal", sig => {
          emitEvent("voice-signal", { targetId: from, signal: sig });
        });

        peer.on("stream", stream => {
          setPeers(prev => ({
            ...prev,
            [from]: { id: from, stream, isMuted: false }
          }));
        });

        peer.on("error", err => {
          console.error(`Peer error with ${from}:`, err);
          cleanupPeer(from);
        });

        peerRefs.current[from] = peer;
      }
      
      peer.signal(signal);
    };

    const handleUserLeft = ({ id }: { id: string }) => {
      cleanupPeer(id);
    };

    // Register listeners
    onEvent("voice-user-joined", handleUserJoined);
    onEvent("voice-signal", handleSignal);
    onEvent("voice-user-left", handleUserLeft);

    return () => {
      emitEvent("voice-leave", projectId);
      
      // Clean up peers
      Object.values(peerRefs.current).forEach(peer => peer.destroy());
      peerRefs.current = {};
      
      // Clean up local stream
      localStream.current?.getTracks().forEach(track => track.stop());
      localStream.current = null;
      
      // Remove listeners
      offEvent("voice-user-joined", handleUserJoined);
      offEvent("voice-signal", handleSignal);
      offEvent("voice-user-left", handleUserLeft);
    };
  }, [projectId]);

  const cleanupPeer = (id: string) => {
    peerRefs.current[id]?.destroy();
    delete peerRefs.current[id];
    
    setPeers(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = newMuteState;
      });
    }
  };

  const toggleHeadphones = () => {
    setIsHeadphonesOn(prev => !prev);
    // Implement actual headphone toggle logic
  };

  return { 
    localStream, 
    peers, 
    isMuted, 
    toggleMute, 
    isSpeaking,
    isHeadphonesOn,
    toggleHeadphones
  };
};