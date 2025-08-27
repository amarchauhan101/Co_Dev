// src/pages/ProjectLiveSession.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import CollaborativeEditor from "./CollaborativeEditor";
import FabricBoard from "./FabricBoard";

import { FaCode, FaPalette, FaComments, FaTimes } from "react-icons/fa";
import VoiceChat from "./VoiceChat";
import { useAuth } from "../../context/AuthContext";

export default function ProjectLiveSession({ projectId }) {
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "whiteboard"
  const [showChat, setShowChat] = useState(false);
  const [voiceStats, setVoiceStats] = useState({ connected: 0, inCall: false });
  const navigate = useNavigate();

  // const users = useSelector((state) => state.userauth?.user?.userWithToken);
  const { user } = useAuth();
  const userWithToken = user?.userWithToken;
  const token = userWithToken?.token;
  
  /* --------------------------- tab renderer ----------------------- */
  const renderContent = () => {
    if (activeTab === "editor") {
      return <CollaborativeEditor user={userWithToken} projectId={projectId} />;
    }
    return (
      <FabricBoard roomId={projectId} username={userWithToken?.username} />
    );
  };

  /* --------------------------- component UI ----------------------- */
  return (
    <div className="h-screen flex flex-col bg-[#1e1e2f] text-white overflow-hidden">
      {/* ─────────── top bar ─────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#2d2d42] border-b border-violet-800">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-violet-300">
            <span className="bg-violet-700 px-3 py-1 rounded mr-2">PRO</span>
            Live Collaboration
          </h1>
          
          {/* Connected Users Display */}
          <div className="flex items-center gap-2 bg-[#3a3a52] px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">
              {voiceStats.connected} online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Voice Chat Component with enhanced styling */}
          <div className="flex items-center gap-2 bg-[#3a3a52] px-3 py-2 rounded-lg border border-violet-700">
            <span className="text-sm text-violet-300 font-medium">Voice:</span>
            <VoiceChat 
              projectId={projectId} 
              token={token} 
              onStatsChange={setVoiceStats}
            />
          </div>

          <button
            onClick={() => setShowChat((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              showChat 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <FaComments />
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>

          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded shadow transition-colors"
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
          <div className="flex items-center justify-between px-4 py-2 bg-[#2a2a3c] border-b border-violet-800">
            <div className="flex items-center gap-2">
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
            
            {/* Real-time Status & Voice Indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Real-time Active</span>
              </div>
              
              {voiceStats.inCall && (
                <div className="flex items-center gap-2 bg-green-600 px-2 py-1 rounded text-xs">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Voice Active</span>
                </div>
              )}
            </div>
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
      <footer className="px-4 py-2 bg-[#2a2a3c] border-t border-violet-800 text-sm text-gray-400 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span>
            Project ID: <code className="text-violet-300">{projectId}</code>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Real-time collaborative session
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Connected: {voiceStats.connected} users</span>
          <span className="text-violet-400">
            Mode: {activeTab === "editor" ? "Code" : "Design"}
          </span>
          {voiceStats.inCall && (
            <span className="text-green-400">🎤 Voice Active</span>
          )}
        </div>
      </footer>
    </div>
  );
}
