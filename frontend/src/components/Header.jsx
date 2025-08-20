import React from "react";
import { LuEyeClosed } from "react-icons/lu";
import { FaTasks, FaLaptopCode } from "react-icons/fa";
import { CgMediaLive } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

function Header({
  user,
  userinproject,
  showtask,
  showEditor,
  setSidebarOpen,
  handleToggleTask,
  handleToggleEditor,
  projectId,
}) {
  const navigate = useNavigate();
  console.log("showtask", showtask);
  return (
    <header className="h-auto min-h-16 bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-lg border-b border-gray-700 shadow-lg flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
      {/* Sidebar toggle (mobile only) */}
      <button
        className="md:hidden text-2xl text-gray-300 hover:text-white transition-transform duration-200 hover:scale-110"
        onClick={() => setSidebarOpen(true)}
        title="Open Sidebar"
      >
        ☰
      </button>

      {/* Welcome & Team Info */}
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
          👋 Welcome {user?.username}
        </h1>
        {userinproject.length > 0 && (
          <div className="text-xs sm:text-sm text-gray-400 truncate max-w-full sm:max-w-xs">
            <span className="font-medium text-gray-300">Team:</span>{" "}
            {userinproject.map((u) => u.username).join(", ")}
          </div>
        )}
      </div>

      {/* Action Buttons - Desktop Only */}
      <div className="sm:flex hidden flex-wrap gap-4 items-center justify-end w-full sm:w-auto">
        {/* Show / Close Task */}
        <button
          onClick={handleToggleTask}
          className={`p-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-110 ${
            showtask
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          title={showtask ? "Close Task Panel" : "Show Task Panel"}
        >
          {showtask ? <LuEyeClosed size={18} /> : <FaTasks size={18} />}
        </button>

        {/* Show / Close Editor */}
        <button
          onClick={handleToggleEditor}
          className={`p-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-110 ${
            showEditor
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
          title={showEditor ? "Close Editor" : "Show Editor"}
        >
          {showEditor ? <LuEyeClosed size={18} /> : <FaLaptopCode size={18} />}
        </button>

        {/* Start Live Coding */}
        <button
          onClick={() => navigate(`/project/live/${projectId}`)}
          className="p-3 rounded-full bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 text-white shadow-lg transition-all duration-300 transform hover:scale-110"
          title="Start Live Coding Session"
        >
          <CgMediaLive size={18} />
        </button>
      </div>
      <button
          onClick={() => navigate(`/project/live/${projectId}`)}
          className="flex sm:hidden p-3 rounded-full bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 text-white shadow-lg transition-all duration-300 transform hover:scale-110"
          title="Start Live Coding Session"
        >
          <CgMediaLive size={18} />
        </button>
    </header>
  );
}

export default Header;
