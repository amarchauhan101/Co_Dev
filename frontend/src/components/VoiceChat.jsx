// import React, { useEffect, useRef } from "react";
// import io from "socket.io-client";

// const VoiceChat = ({ projectId }) => {
//   const peerRef = useRef(null);
//   const localStream = useRef(null);
//   const remoteAudioRef = useRef(null);

//   const socket = io("http://localhost:8000");
//   useEffect(() => {
//     const startVoice = async () => {
//       localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
//       peerRef.current = new RTCPeerConnection();

//       // Send ICE
//       peerRef.current.onicecandidate = (e) => {
//         if (e.candidate) {
//           socket.emit("voice-candidate", { candidate: e.candidate, projectId });
//         }
//       };

//       // Remote stream
//       peerRef.current.ontrack = (event) => {
//         remoteAudioRef.current.srcObject = event.streams[0];
//       };

//       // Add local stream
//       localStream.current.getTracks().forEach((track) => {
//         peerRef.current.addTrack(track, localStream.current);
//       });

//       const offer = await peerRef.current.createOffer();
//       await peerRef.current.setLocalDescription(offer);

//       socket.emit("voice-offer", { offer, projectId });
//     };

//     // Listen for signaling
//     socket.on("voice-offer", async ({ offer }) => {
//       await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerRef.current.createAnswer();
//       await peerRef.current.setLocalDescription(answer);
//       socket.emit("voice-answer", { answer, projectId });
//     });

//     socket.on("voice-answer", async ({ answer }) => {
//       await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socket.on("voice-candidate", async ({ candidate }) => {
//       try {
//         await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//       } catch (err) {
//         console.error(err);
//       }
//     });

//     startVoice();

//     return () => {
//       socket.off("voice-offer");
//       socket.off("voice-answer");
//       socket.off("voice-candidate");
//     };
//   }, []);

//   return <audio ref={remoteAudioRef} autoPlay />;
// };

// export default VoiceChat;

import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const VoiceChat = ({ projectId, token }) => {
  const peerRef = useRef(null);
  const localStream = useRef(null);
  const remoteAudioRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:8000", {
      auth: { token },
      query: { projectId },
    });

    socketRef.current = socket;

    let isInitiator = false;

    socket.emit("voice-join");

    socket.on("voice-user-joined", async ({ id }) => {
      console.log("👥 Other user joined voice chat:", id);

      isInitiator = true;
      await startVoice(); // This user starts the call
    });

    const startVoice = async () => {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        peerRef.current = new RTCPeerConnection();

        // Add local stream tracks
        localStream.current.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, localStream.current);
        });

        // Handle ICE candidates
        peerRef.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("voice-candidate", {
              candidate: e.candidate,
              projectId,
            });
          }
        };

        // Handle remote stream
        peerRef.current.ontrack = (event) => {
          remoteAudioRef.current.srcObject = event.streams[0];
        };

        if (isInitiator) {
          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);
          socket.emit("voice-offer", { offer, projectId });
        }
      } catch (err) {
        console.error("❌ Failed to get local audio:", err);
      }
    };

    // Handle incoming offer
    socket.on("voice-offer", async ({ offer }) => {
      console.log("📩 Received offer");
      await startVoice(); // Start voice if not already started
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("voice-answer", { answer, projectId });
    });

    // Handle incoming answer
    socket.on("voice-answer", async ({ answer }) => {
      console.log("📩 Received answer");
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // Handle incoming ICE candidate
    socket.on("voice-candidate", async ({ candidate }) => {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("❌ ICE Candidate error:", err);
      }
    });

    // Optional: Auto start if user is alone in room
    startVoice();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    };
  }, [projectId, token]);

  return <audio ref={remoteAudioRef} autoPlay controls muted />;
};

export default VoiceChat;
