
// import { useNavigate } from "react-router-dom";
// import VoiceBar from "./VoiceBar";
// import Whiteboard from "./Whiteboard";
// import CollaborativeEditor from "./CollaborativeEditor";

// const ProjectLiveSession = ({ projectId }) => {
//   const navigate = useNavigate();

//   return (
//     <div className="h-screen flex flex-col bg-[#1e1e2f] text-white">
//       {/* Voice Chat */}
//       <VoiceBar projectId={projectId} />

//       {/* Header row */}
//       <div className="flex items-center justify-between px-6 pt-4">
//         <h2 className="text-xl font-bold text-violet-400">
//           👨‍💻 Real‑Time Code Editor
//         </h2>
//         <h2 className="text-xl font-bold text-green-400">
//           🧠 Collaborative Whiteboard
//         </h2>
//         <button
//           onClick={() => navigate(`/project/${projectId}`)}
//           className="ml-auto bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded shadow"
//         >
//           Leave Session
//         </button>
//       </div>

//       {/* Split panes */}
//       <div className="flex-1 grid grid-cols-2 gap-4 px-6 py-4 overflow-hidden">
//         {/* Editor Pane */}
//         <div className="flex flex-col h-full border border-violet-700 bg-[#17171f] rounded-xl shadow-lg overflow-hidden">
//           <CollaborativeEditor projectId={projectId} />
//         </div>

//         {/* Whiteboard Pane */}
//         <div className="flex flex-col h-full border border-green-600 bg-white rounded-xl shadow-lg overflow-hidden">
//           <Whiteboard projectId={projectId} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectLiveSession;

// import { useNavigate } from "react-router-dom";
// import VoiceBar from "./VoiceBar";
// import Whiteboard from "./Whiteboard";
// import CollaborativeEditor from "./CollaborativeEditor";
// import { FaCode, FaPalette, FaComments, FaPhoneAlt, FaTimes } from "react-icons/fa";
// import { useState } from "react";
// import { useSelector } from "react-redux";
// import FabricBoard from "./FabricBoard";

// const ProjectLiveSession = ({ projectId }) => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("editor");
//   const [showChat, setShowChat] = useState(false);
//   const users = useSelector((state) => state.userauth?.user?.userWithToken);
//   const token = users?.token;
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "editor":
//         return <CollaborativeEditor projectId={projectId} />;
//       case "whiteboard":
//         return <FabricBoard roomId={projectId} />;
//       default:
//         return <div>Select a tool</div>;
//     }
//   };

//   return (
//     <div className="h-screen flex flex-col bg-[#1e1e2f] text-white overflow-hidden">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between px-6 py-3 bg-[#2d2d42] border-b border-violet-800">
//         <div className="flex items-center gap-4">
//           <h1 className="text-xl font-bold text-violet-300">
//             <span className="bg-violet-700 px-3 py-1 rounded mr-2">PRO</span>
//             Project Collaboration Session
//           </h1>
//         </div>
        
//         <div className="flex items-center gap-4">
//           <VoiceBar projectId={projectId} />
//           <button
//             onClick={() => setShowChat(!showChat)}
//             className={`flex items-center gap-2 px-4 py-2 rounded ${
//               showChat ? "bg-green-600" : "bg-blue-600"
//             }`}
//           >
//             <FaComments />
//             <span>{showChat ? "Hide Chat" : "Show Chat"}</span>
//           </button>
//           <button
//             onClick={() => navigate(`/project/${projectId}`)}
//             className="flex items-center gap-2 ml-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded shadow"
//           >
//             <FaTimes />
//             <span>End Session</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Tools Tabs */}
//         <div className="w-16 bg-[#2d2d42] flex flex-col items-center py-4 border-r border-violet-800">
//           <button
//             onClick={() => setActiveTab("editor")}
//             className={`p-3 rounded-lg mb-4 transition-all ${
//               activeTab === "editor" 
//                 ? "bg-violet-600 text-white" 
//                 : "text-gray-400 hover:bg-[#3a3a52]"
//             }`}
//             title="Code Editor"
//           >
//             <FaCode size={20} />
//           </button>
//           <button
//             onClick={() => setActiveTab("whiteboard")}
//             className={`p-3 rounded-lg transition-all ${
//               activeTab === "whiteboard" 
//                 ? "bg-green-600 text-white" 
//                 : "text-gray-400 hover:bg-[#3a3a52]"
//             }`}
//             title="Whiteboard"
//           >
//             <FaPalette size={20} />
//           </button>
//         </div>
        
//         {/* Main Content */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <div className="flex items-center px-4 py-2 bg-[#2a2a3c] border-b border-violet-800">
//             <div className="flex items-center gap-2">
//               {activeTab === "editor" ? (
//                 <>
//                   <FaCode className="text-violet-400" />
//                   <span className="font-medium text-violet-300">Collaborative Code Editor</span>
//                 </>
//               ) : (
//                 <>
//                   <FaPalette className="text-green-400" />
//                   <span className="font-medium text-green-300">Shared Whiteboard</span>
//                 </>
//               )}
//             </div>
//           </div>
          
//           <div className="flex-1 overflow-auto">
//             {renderTabContent()}
//           </div>
//         </div>
        
//         {/* Chat Panel */}
//         {showChat && (
//           <div className="w-80 border-l border-violet-800 bg-[#2d2d42] flex flex-col">
//             <div className="px-4 py-3 border-b border-violet-800 bg-[#2a2a3c]">
//               <h3 className="font-bold text-violet-300 flex items-center gap-2">
//                 <FaComments />
//                 <span>Team Chat</span>
//               </h3>
//             </div>
//             <div className="flex-1 p-4 overflow-auto">
//               {/* Chat messages would go here */}
//               <div className="text-center text-gray-500 py-8">
//                 <FaComments size={24} className="mx-auto mb-2" />
//                 <p>Team chat will appear here</p>
//               </div>
//             </div>
//             <div className="p-4 border-t border-violet-800">
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Type a message..."
//                   className="flex-1 bg-[#3a3a52] border border-violet-700 rounded px-3 py-2 text-sm"
//                 />
//                 <button className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded text-sm">
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
      
//       {/* Bottom Status Bar */}
//       <div className="px-4 py-2 bg-[#2a2a3c] border-t border-violet-800 text-sm text-gray-400 flex justify-between">
//         <div>
//           Project ID: <span className="font-mono text-violet-300">{projectId}</span>
//         </div>
//         <div>
//           <span className="text-green-400">●</span> Real-time collaboration active
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectLiveSession;



// src/pages/ProjectLiveSession.jsx
  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { useSelector } from "react-redux";

  import VoiceBar from "./VoiceBar";
  import CollaborativeEditor from "./CollaborativeEditor";
  import FabricBoard from "./FabricBoard";

  import {
    FaCode,
    FaPalette,
    FaComments,
    FaTimes,
  } from "react-icons/fa";
  import VoiceChat from "./VoiceChat";
import { useAuth } from "../../context/AuthContext";

  export default function ProjectLiveSession({ projectId }) {
    const [activeTab, setActiveTab] = useState("editor"); // "editor" | "whiteboard"
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();

    // const users = useSelector((state) => state.userauth?.user?.userWithToken);
    const {user} = useAuth();
    const userWithToken = user?.userWithToken;
    const token = userWithToken?.token;
    /* --------------------------- tab renderer ----------------------- */
    const renderContent = () => {
      if (activeTab === "editor") {
        return <CollaborativeEditor user = {userWithToken} projectId={projectId} />;
      }
      return <FabricBoard roomId={projectId} username={userWithToken?.username} />;
    };

    /* --------------------------- component UI ----------------------- */
    return (
      <div className="h-screen flex flex-col bg-[#1e1e2f] text-white overflow-hidden">
        {/* ─────────── top bar ─────────── */}
        <header className="flex items-center justify-between px-6 py-3 bg-[#2d2d42] border-b border-violet-800">
          <h1 className="text-xl font-bold text-violet-300">
            <span className="bg-violet-700 px-3 py-1 rounded mr-2">PRO</span>
            Project Collaboration Session
          </h1>

          <div className="flex items-center gap-4">
            <VoiceChat projectId={projectId} token={token} />

            <button
              onClick={() => setShowChat((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                showChat ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              <FaComments />
              {showChat ? "Hide Chat" : "Show Chat"}
            </button>

            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded shadow"
            >
              <FaTimes /> End Session
            </button>
          </div>
        </header>

        {/* ─────────── main area ─────────── */}
        <main className="flex-1 flex overflow-hidden">
          {/* left tool bar */}
          <aside className="w-16 bg-[#2d2d42] flex flex-col items-center py-4 border-r border-violet-800">
            <button
              title="Code Editor"
              onClick={() => setActiveTab("editor")}
              className={`p-3 mb-4 rounded-lg transition-all ${
                activeTab === "editor"
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-[#3a3a52]"
              }`}
            >
              <FaCode size={20} />
            </button>

            <button
              title="Whiteboard"
              onClick={() => setActiveTab("whiteboard")}
              className={`p-3 rounded-lg transition-all ${
                activeTab === "whiteboard"
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:bg-[#3a3a52]"
              }`}
            >
              <FaPalette size={20} />
            </button>
          </aside>

          {/* main content */}
          <section className="flex-1 flex flex-col overflow-hidden">
            {/* header for current tool */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#2a2a3c] border-b border-violet-800">
              {activeTab === "editor" ? (
                <>
                  <FaCode className="text-violet-400" />
                  <span className="font-medium text-violet-300">
                    Collaborative Code Editor
                  </span>
                </>
              ) : (
                <>
                  <FaPalette className="text-green-400" />
                  <span className="font-medium text-green-300">
                    Shared Whiteboard
                  </span>
                </>
              )}
            </div>

            <div className="flex-1 overflow-auto">{renderContent()}</div>
          </section>

          {/* optional chat drawer */}
          {showChat && (
            <aside className="w-80 border-l border-violet-800 bg-[#2d2d42] flex flex-col">
              <div className="px-4 py-3 border-b border-violet-800 bg-[#2a2a3c]">
                <h3 className="font-bold text-violet-300 flex items-center gap-2">
                  <FaComments /> Team Chat
                </h3>
              </div>
              <div className="flex-1 p-4 overflow-auto text-gray-400">
                {/* Chat log goes here */}
                <p className="text-center mt-8">No messages yet</p>
              </div>
              <div className="p-4 border-t border-violet-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-[#3a3a52] border border-violet-700 rounded px-3 py-2 text-sm"
                  />
                  <button className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded text-sm">
                    Send
                  </button>
                </div>
              </div>
            </aside>
          )}
        </main>

        {/* ─────────── footer ─────────── */}
        <footer className="px-4 py-2 bg-[#2a2a3c] border-t border-violet-800 text-sm text-gray-400 flex justify-between">
          <span>
            Project ID&nbsp;
            <code className="text-violet-300">{projectId}</code>
          </span>
          <span className="text-green-400">● real‑time active</span>
        </footer>
      </div>
    );
  }

