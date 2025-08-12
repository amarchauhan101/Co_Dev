import React, { useEffect, useRef } from "react";
import { MdCancel } from "react-icons/md";
import MessageRow from "./MessageRowWrapper";
import MessageRowWrapper from "./MessageRowWrapper";
import { useVirtualizer } from "@tanstack/react-virtual";
import Commit from "./Commit";
import { useState } from "react";
import FileExplorer from "./FileExplorer";
import ProofForm from "./ProofForm";
import Loader from "./Loader";
import { initializeSocket } from "../config/socket";
import { useNavigate } from "react-router-dom";
import { FaTasks } from "react-icons/fa";
import { FaLaptopCode } from "react-icons/fa";
import { CgMediaLive } from "react-icons/cg";
import { LuEyeClosed } from "react-icons/lu";
import Header from "./Header";

export default function ProjectDashboard({
  sidebarOpen,
  setSidebarOpen,
  getAllTask,
  projects,
  projectId,
  selectProject,
  user,
  userinproject,
  showtask,
  setshowtask,
  showEditor,
  setShowEditor,
  isMember,
  message,
  setMessage,
  handleTyping,
  send,
  setIsModalOpen,
  selectedFile,
  setSelectedFile,
  task,
  seletedtask,
  processedItems,
  typingUsers,
  isModalOpen,
  handleSubmit,
  onSubmit,
  register,
  assignedTo,
  handletoggle,
  CollaborativeEditor,
  moment,
  scrollToBottom,
  hljs,
  rowRefs,
  itemHeights,
  projetownerId,
}) {
  console.log("itemheight current", itemHeights.current);
  console.log("rowrefs", rowRefs);
  const navigate = useNavigate();
  const [activeProofTaskId, setActiveProofTaskId] = useState(null);
  const handleProofFormOpen = (taskId) => {
    setActiveProofTaskId(taskId);
  };
  console.log("userinrprojet in parojectdashboar=>", userinproject);

  useEffect(() => {
    initializeSocket(projectId, user?.token);
  }, [projectId, user?.token]);

  const handleToggleTask = () => {
  setshowtask(prev => {
    const newValue = !prev;
    if (newValue) setShowEditor(false);
    return newValue;
  });
};

  useEffect(() => {
    console.log("itemHeights now:", itemHeights.current);
  }, [processedItems.length]);

  //   const listRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rowVirtualizer && processedItems.length > 0) {
        rowVirtualizer.scrollToIndex(processedItems.length - 1);
      }
    }, 100); // gives time for layout/media to load

    return () => clearTimeout(timeout);
  }, [processedItems.length]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rowVirtualizer && processedItems.length > 0) {
        rowVirtualizer.scrollToIndex(processedItems.length - 1);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [processedItems.length, projectId]);

  const virtualizerRef = useRef();
  const [visibleCommitsProjectId, setVisibleCommitsProjectId] = useState(null);
  const [visibleFilesProjectId, setVisibleFilesProjectId] = useState(null);

  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: processedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // fallback estimate
    overscan: 5,
    ref: virtualizerRef,
  });
  const handleToggleEditor = () => {
    setShowEditor(!showEditor);
    if (!showEditor) setshowtask(false);
  };

  useEffect(() => {
    if (rowVirtualizer && processedItems.length > 0) {
      rowVirtualizer.scrollToIndex(processedItems.length - 1);
    }
  }, [processedItems.length, projectId]);

  useEffect(() => {
    // Recalculate heights when a new message is added
    if (rowVirtualizer) {
      rowVirtualizer.measure();
    }
  }, [processedItems.length]);

  return (
    <div className="h-screen flex w-full flex-col md:flex-row bg-[#0F1117] text-white font-[Inter] ">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 md:relative transform transition-transform duration-300 ease-in-out w-64 md:w-1/4 lg:w-1/5 bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#0F1117] backdrop-blur-md bg-opacity-90 shadow-2xl rounded-r-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <button
          className="absolute top-3 right-3 text-2xl md:hidden text-gray-400 hover:text-white transition"
          onClick={() => setSidebarOpen(false)}
        >
          <MdCancel />
        </button>

        <h2 className="text-2xl font-bold mb-6 tracking-wide text-white px-5">
          📁 Projects
        </h2>

        <div className="h-[calc(100vh-5rem)] overflow-y-auto px-5 space-y-5 pb-6 custom-scroll">
          {projects.map((project, idx) => (
            <div key={project._id || idx} className="space-y-1">
              {/* Project Select Button */}
              <button
                onClick={() => selectProject(project._id)}
                className={`block w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  projectId === project._id
                    ? "bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white shadow-md"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-100"
                }`}
              >
                {project.name}
              </button>

              {/* View Commits Toggle */}
              <button
                onClick={() =>
                  setVisibleCommitsProjectId((prev) =>
                    prev === project._id ? null : project._id
                  )
                }
                className="ml-2 text-xs text-violet-400 hover:text-violet-300 transition"
              >
                {visibleCommitsProjectId === project._id
                  ? "⬆ Hide Commits"
                  : "⬇ View Commits"}
              </button>

              <button
                onClick={() =>
                  setVisibleFilesProjectId((prev) =>
                    prev === project._id ? null : project._id
                  )
                }
                className="ml-2 text-xs text-violet-400 hover:text-violet-300 transition"
              >
                {visibleFilesProjectId === project._id
                  ? "⬆ Hide Files"
                  : "⬇ View Files "}
              </button>

              {/* Commit Viewer */}
              {visibleCommitsProjectId === project._id && (
                <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg p-2 max-h-64 overflow-y-auto custom-scroll text-sm text-gray-200 shadow-inner">
                  <Commit projectId={project._id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {visibleFilesProjectId && (
          <div className="fixed inset-0 z-40 bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
            <div className="relative w-[90%] max-w-6xl h-[90%] bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => setVisibleFilesProjectId(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl z-50"
              >
                ✕
              </button>

              {/* File Explorer Content */}
              <FileExplorer projectId={visibleFilesProjectId} />
            </div>
          </div>
        )}

        {/* Navbar */}
        {/* <header className="h-auto min-h-16 bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-lg border-b border-gray-700 shadow-lg flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          
          <button
            className="md:hidden text-2xl text-gray-300 hover:text-white transition-transform duration-200 hover:scale-110"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          
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

          
          <div className="flex flex-wrap gap-2 items-center justify-end w-full sm:w-auto">
            <button
              onClick={handleToggleTask}
              className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all duration-300 transform hover:scale-105 ${
                showtask
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {showtask ? (
                <LuEyeClosed />
              ) : (
                <FaTasks className="inline-block mr-1" />
              )}
            </button>

            <button
              onClick={handleToggleEditor}
              className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all duration-300 transform hover:scale-105 ${
                showEditor
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {showEditor ? (
                <LuEyeClosed />
              ) : (
                <FaLaptopCode className="inline-block mr-1" />
              )}
            </button>

            <button
              onClick={() => navigate(`/project/live/${projectId}`)}
              className="bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 px-4 py-2 rounded-full text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <span className="inline xs:hidden">
                <CgMediaLive className="inline-block mr-1" />
              </span>
            </button>
          </div>
        </header> */}
        <Header user={user} userinproject={userinproject} showEditor={showEditor} setSidebarOpen={setSidebarOpen} handleToggleTask ={handleToggleTask} handleToggleEditor={handleToggleEditor} projectId={projectId} showtask={showtask}/>

        
        <section
          ref={parentRef}
          className="flex-1 overflow-y-auto bg-[#0F1117] px-4 py-6 sm:px-6 lg:px-10 custom-scroll"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
              width: "100%",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const index = virtualRow.index;
              const item = processedItems[index];

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualRow.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <MessageRowWrapper
                    index={index}
                    style={{ width: "100%" }}
                    data={{
                      item,
                      user,
                      moment,
                      rowRefs,
                      itemHeights,
                      rowVirtualizer,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {typingUsers.length > 0 && (
          <div className="px-4 py-1 text-sm italic text-gray-300">
            {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"}{" "}
            typing...
          </div>
        )}

      
        {isMember && (
          <div className="bg-gray-800 p-4 flex flex-col gap-2 border-t">
            {/* Input + Send Row */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (message.trim() || selectedFile) send();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none"
              />

              {/* File Input */}
              <label className="cursor-pointer text-white bg-purple-600 px-3 py-2 rounded hover:bg-purple-700 transition text-sm">
                📎
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              {/* Send Button */}
              <button
                onClick={send}
                disabled={!message.trim() && !selectedFile}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm rounded-md text-white transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
              >
                Send
              </button>

              {/* Create Task Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 text-sm rounded-md text-white transition duration-300 ease-in-out transform hover:scale-105"
              >
                Create Task
              </button>
            </div>

            {/* File name preview */}
            {selectedFile && (
              <div className="text-xs text-gray-300 truncate">
                📎 Selected:{" "}
                <span className="font-medium">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  ✖
                </button>
              </div>
            )}
          </div>
        )}

        {/* Task Section */}

        {showtask && (
          <div className="p-4 border-t border-gray-800 bg-gray-900 overflow-y-auto custom-scroll">
            <h2 className="text-lg font-bold text-white mb-3">
              📋 Project Tasks
            </h2>

            <div className="max-h-[350px] overflow-y-auto pr-1">
              {task[projectId]?.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {task[projectId].map((t, i) => (
                    <div
                      key={t._id || i}
                      className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg hover:shadow-xl transition duration-300 relative"
                    >
                      {/* Title & Status */}
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-white">
                          {t.title}
                        </h3>
                        <select
                          className={`text-xs px-2 py-1 rounded font-semibold focus:outline-none ${
                            t.status === "Completed"
                              ? "bg-green-600 text-white"
                              : t.status === "In Progress"
                              ? "bg-yellow-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                          value={t.status}
                          onChange={(e) => {
                            if (e.target.value === "Completed") return;
                            seletedtask(t._id, e.target.value);
                          }}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                      </div>

                      <p className="text-gray-300 text-sm mb-2">
                        {t.description}
                      </p>

                      <p className="text-xs text-gray-400 mb-2">
                        Due:{" "}
                        <span className="font-semibold text-red-400">
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </p>

                      {/* Assigned Users */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 font-bold">
                          Assigned To:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.assignedTo.map((u) => (
                            <span
                              key={u._id}
                              className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-md"
                            >
                              {u.username}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Proof Submission */}
                      {t?.Proofsubmission?.zipFile && (
                        <div className="mt-3 text-xs text-gray-300 space-y-1 border-t pt-2 border-gray-600">
                          <p>
                            📎{" "}
                            <a
                              href={t.Proofsubmission.zipFile}
                              className="underline text-blue-300"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Submitted File
                            </a>
                          </p>
                          <p>📝 {t.Proofsubmission.note}</p>
                          <p>
                            🤖 AI Status:{" "}
                            <span
                              className={`font-bold ${
                                t.Proofsubmission.aiverified === "Approved"
                                  ? "text-green-400"
                                  : t.Proofsubmission.aiverified === "Rejected"
                                  ? "text-red-400"
                                  : "text-yellow-300"
                              }`}
                            >
                              {t.Proofsubmission.aiverified}
                            </span>
                          </p>
                          {t.Proofsubmission.aiFeedBack && (
                            <p>
                              💡 Feedback:{" "}
                              <span className="italic text-gray-400">
                                {t.Proofsubmission.aiFeedBack}
                              </span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Submit Proof Button */}
                      {t.Proofsubmission?.aiverified !== "Approved" &&
                        (t.Proofsubmission?.aiverified === "Rejected" ||
                          t.assignedTo.some((u) => u._id == user?._id)) && (
                          /* 3. Then—and only then—render your div/button block */
                          <div className="mt-3">
                            {activeProofTaskId !== t._id ? (
                              <button
                                onClick={() => setActiveProofTaskId(t._id)}
                                className="text-xs bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-800"
                              >
                                📤 Submit Proof
                              </button>
                            ) : (
                              <div className="space-y-2 mt-3">
                                <ProofForm
                                  taskId={activeProofTaskId}
                                  onSuccess={() => setActiveProofTaskId(null)}
                                  getAllTask={getAllTask}
                                  projectId={projectId}
                                />
                                <button
                                  onClick={() => setActiveProofTaskId(null)}
                                  className="text-xs text-red-400 hover:text-red-600 ml-2"
                                >
                                  cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Owner verification */}
                      {t.status === "Completed" && t.isVerifiedByOwner ? (
                        <p className="text-green-400 mt-3 text-sm">
                          ✅ Verified by Owner
                        </p>
                      ) : t.status === "Completed" &&
                        user._id === projetownerId &&
                        !t.isVerifiedByOwner ? (
                        <button
                          className="mt-3 text-xs bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition"
                          onClick={() => seletedtask(t._id, t.status, true)}
                        >
                          ✅ Verify Task
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">
                  No tasks for this project.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Code Editor */}
        {showEditor && (
          <div className="p-4 bg-gray-900 border-t">
            <h2 className="text-lg font-semibold text-white mb-2">
              Collaborative Code Editor
            </h2>
            <CollaborativeEditor projectId={projectId} user={user} />
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-[90%] max-w-xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                📝 Create a Task
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input
                  type="text"
                  {...register("title", { required: true })}
                  placeholder="Task title"
                  className="w-full px-4 py-2 bg-white/10 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />

                <input
                  type="text"
                  {...register("description", { required: true })}
                  placeholder="Description"
                  className="w-full px-4 py-2 bg-white/10 text-white placeholder-gray-300 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />

                <input
                  type="date"
                  {...register("dueDate", { required: true })}
                  className="w-full px-4 py-2 bg-white/10 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />

                <select
                  {...register("status", { required: true })}
                  className="w-full px-4 py-2 bg-white/10 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Assign to:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {userinproject.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handletoggle(u._id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                          assignedTo.includes(u._id)
                            ? "bg-violet-600 text-white shadow-md"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {u.username}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-violet-500 text-white font-semibold hover:bg-violet-600 shadow-md transition"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {visibleCommitsProjectId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#1E1E2F] w-[90%] max-w-4xl p-6 rounded-2xl shadow-2xl border border-violet-600 relative">
              <button
                className="absolute top-3 right-4 text-xl text-gray-300 hover:text-white"
                onClick={() => setVisibleCommitsProjectId(null)}
              >
                <MdCancel />
              </button>
              <h2 className="text-xl font-semibold text-white mb-4">
                📜 Project Commits
              </h2>
              <Commit projectId={visibleCommitsProjectId} />
            </div>
          </div>
        )}

        {/* Modal remains unchanged */}
        {/* Paste your modal code here */}
      </main>
    </div>
  );
}
