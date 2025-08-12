// import React, { useEffect, useRef, useState } from "react";
// import { useVoice } from "../hooks/useVoice";

// const VoiceBar = ({ projectId }) => {
//   const { localStream, peers } = useVoice(projectId);
//   const [muted, setMuted] = useState(false);

//   useEffect(() => {
//     if (localStream.current) {
//       localStream.current.getAudioTracks().forEach(track => {
//         track.enabled = !muted;
//       });
//     }
//   }, [muted]);

//   return (
//     <div className="flex items-center justify-between bg-gray-900 p-2 text-white rounded-md">
//       <span>{Object.keys(peers).length + 1} in voice call</span>
//       <div className="flex gap-2">
//         {localStream.current && (
//           <audio
//             autoPlay
//             muted
//             ref={(el) => {
//               if (el) el.srcObject = localStream.current;
//             }}
//           />
//         )}
//         {Object.values(peers).map(({ id, stream }) => (
//           <audio
//             key={id}
//             autoPlay
//             ref={(el) => {
//               if (el) el.srcObject = stream;
//             }}
//           />
//         ))}
//       </div>
//       <button
//         onClick={() => setMuted(prev => !prev)}
//         className="bg-violet-600 px-3 py-1 rounded"
//       >
//         {muted ? "Unmute" : "Mute"}
//       </button>
//     </div>
//   );
// };

// export default VoiceBar;


import React, { useEffect } from "react";
import { useVoice } from "../hooks/useVoice";
import { FaMicrophone, FaMicrophoneSlash, FaUserFriends } from "react-icons/fa";
import { MdHeadset, MdHeadsetOff } from "react-icons/md";

const VoiceBar = ({ projectId }) => {
  const { 
    localStream, 
    peers, 
    isMuted, 
    toggleMute, 
    isSpeaking,
    toggleHeadphones,
    isHeadphonesOn
  } = useVoice(projectId);
  
  // Cleanup audio elements
  useEffect(() => {
    const audioElements = document.querySelectorAll("audio");
    return () => {
      audioElements.forEach(audio => {
        audio.srcObject = null;
      });
    };
  }, []);

  return (
    <div className="flex items-center gap-4 bg-[#2a2a3c] px-4 py-2 rounded-lg border border-violet-700">
      <div className="flex items-center gap-2">
        <FaUserFriends className="text-violet-400" />
        <span className="text-sm font-medium">
          {Object.keys(peers).length + 1} in voice
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-full flex items-center justify-center ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } transition-colors w-10 h-10`}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        
        <button
          onClick={toggleHeadphones}
          className={`p-2 rounded-full flex items-center justify-center ${
            isHeadphonesOn 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-gray-600 hover:bg-gray-700'
          } transition-colors w-10 h-10`}
          title={isHeadphonesOn ? "Disable headphones" : "Enable headphones"}
        >
          {isHeadphonesOn ? <MdHeadset /> : <MdHeadsetOff />}
        </button>
      </div>
      
      {isSpeaking && (
        <div className="flex items-center gap-2 ml-auto text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm">You're speaking</span>
        </div>
      )}
      
      {/* Hidden audio elements */}
      <div className="hidden">
        {localStream.current && (
          <audio autoPlay muted ref={el => el && (el.srcObject = localStream.current)} />
        )}
        {Object.values(peers).map(({ id, stream }) => (
          <audio 
            key={id} 
            autoPlay 
            ref={el => el && (el.srcObject = stream)} 
          />
        ))}
      </div>
    </div>
  );
};

export default VoiceBar;