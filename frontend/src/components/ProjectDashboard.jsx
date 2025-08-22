import React, { useEffect, useRef, useState, useCallback } from "react";
import { MdCancel } from "react-icons/md";
import MessageRow from "./MessageRowWrapper";
import MessageRowWrapper from "./MessageRowWrapper";
import { useVirtualizer } from "@tanstack/react-virtual";
import Commit from "./Commit";
import FileExplorer from "./FileExplorer";
import ProofForm from "./ProofForm";
import Loader from "./Loader";
import { initializeSocket } from "../config/socket";
import { useNavigate } from "react-router-dom";
import { IoGitCommitSharp } from "react-icons/io5";
import {
  FaTasks,
  FaLaptopCode,
  FaVideo,
  FaChevronUp,
  FaChevronDown,
  FaDownload,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { CgMediaLive } from "react-icons/cg";
import { LuEyeClosed } from "react-icons/lu";
import { BiCodeBlock } from "react-icons/bi";
import { HiOutlineDocumentText } from "react-icons/hi";
import Header from "./Header";

// File utility functions
const getFileType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) return 'video';
  if (['pdf'].includes(extension)) return 'pdf';
  if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) return 'audio';
  return 'other';
};

const getFileIcon = (fileType) => {
  const icons = {
    image: '🖼️',
    video: '🎥',
    pdf: '📄',
    document: '📝',
    audio: '🎵',
    other: '📎'
  };
  return icons[fileType] || icons.other;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File Preview Modal Component
const FilePreviewModal = ({ file, onClose }) => {
  const fileType = getFileType(file.name);
  
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon(fileType)}</span>
            <div>
              <h3 className="text-white font-semibold truncate">{file.name}</h3>
              <p className="text-gray-400 text-sm">{formatFileSize(file.size || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadFile}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 flex items-center gap-2"
            >
              <FaDownload className="text-sm" />
              <span className="hidden sm:inline text-sm">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-auto">
          {fileType === 'image' && (
            <div className="flex justify-center">
              <img 
                src={file.url} 
                alt={file.name}
                className="max-w-full max-h-full rounded-lg shadow-lg"
                style={{ maxHeight: '60vh' }}
              />
            </div>
          )}
          
          {fileType === 'video' && (
            <div className="flex justify-center">
              <video 
                controls 
                className="max-w-full max-h-full rounded-lg shadow-lg"
                style={{ maxHeight: '60vh' }}
              >
                <source src={file.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          {fileType === 'pdf' && (
            <div className="w-full h-96">
              <iframe 
                src={file.url} 
                className="w-full h-full rounded-lg border border-gray-600"
                title={file.name}
              />
            </div>
          )}
          
          {fileType === 'audio' && (
            <div className="flex justify-center p-8">
              <audio controls className="w-full max-w-md">
                <source src={file.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          
          {(fileType === 'document' || fileType === 'other') && (
            <div className="text-center p-8">
              <div className="text-6xl mb-4">{getFileIcon(fileType)}</div>
              <p className="text-gray-300 mb-4">Preview not available for this file type</p>
              <button
                onClick={downloadFile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <FaDownload />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced File Display Component for Messages
const FileDisplay = ({ file, isCompact = false }) => {
  const [showPreview, setShowPreview] = useState(false);
  const fileType = getFileType(file.name);
  
  const downloadFile = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const openPreview = () => {
    setShowPreview(true);
  };

  if (isCompact) {
    return (
      <>
        <div className="inline-flex items-center gap-2 bg-gray-700/50 rounded-lg p-2 border border-gray-600/50 cursor-pointer hover:bg-gray-600/50 transition-all duration-200">
          <span className="text-lg">{getFileIcon(fileType)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size || 0)}</p>
          </div>
          <div className="flex items-center gap-1">
            {['image', 'video', 'pdf'].includes(fileType) && (
              <button
                onClick={openPreview}
                className="p-1 rounded text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all"
                title="Preview"
              >
                <FaEye className="text-xs" />
              </button>
            )}
            <button
              onClick={downloadFile}
              className="p-1 rounded text-green-400 hover:text-green-300 hover:bg-green-500/20 transition-all"
              title="Download"
            >
              <FaDownload className="text-xs" />
            </button>
          </div>
        </div>
        
        {showPreview && (
          <FilePreviewModal 
            file={file} 
            onClose={() => setShowPreview(false)} 
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon(fileType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{formatFileSize(file.size || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['image', 'video', 'pdf'].includes(fileType) && (
              <button
                onClick={openPreview}
                className="p-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition-all duration-200 flex items-center gap-1"
              >
                <FaEye className="text-sm" />
                <span className="hidden sm:inline text-xs">Preview</span>
              </button>
            )}
            <button
              onClick={downloadFile}
              className="p-2 rounded-lg bg-green-600/80 hover:bg-green-600 text-white transition-all duration-200 flex items-center gap-1"
            >
              <FaDownload className="text-sm" />
              <span className="hidden sm:inline text-xs">Download</span>
            </button>
          </div>
        </div>
        
        {/* Inline preview for images */}
        {fileType === 'image' && (
          <div className="mt-3 cursor-pointer" onClick={openPreview}>
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full h-auto rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
      </div>
      
      {showPreview && (
        <FilePreviewModal 
          file={file} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
};
import {  BiTask } from "react-icons/bi";



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

  // Mobile-specific state management
  const [mobilePanel, setMobilePanel] = useState(null); // 'tasks', 'editor', 'files', null
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(true);

  const handleProofFormOpen = (taskId) => {
    setActiveProofTaskId(taskId);
  };
  console.log("userinrprojet in parojectdashboar=>", userinproject);

  useEffect(() => {
    initializeSocket(projectId, user?.token);
  }, [projectId, user?.token]);

  const handleToggleTask = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      if (mobilePanel === "tasks") {
        setMobilePanel(null);
        setIsPanelExpanded(false);
      } else {
        setMobilePanel("tasks");
        setIsPanelExpanded(true);
        setShowEditor(false);
      }
    } else {
      setshowtask((prev) => {
        const newValue = !prev;
        if (newValue) setShowEditor(false);
        return newValue;
      });
    }
  };

  const handleToggleEditor = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      if (mobilePanel === "editor") {
        setMobilePanel(null);
        setIsPanelExpanded(false);
      } else {
        setMobilePanel("editor");
        setIsPanelExpanded(true);
        setshowtask(false);
      }
    } else {
      setShowEditor(!showEditor);
      if (!showEditor) setshowtask(false);
    }
  };

  const handleMobileFileExplorer = () => {
    if (mobilePanel === "files") {
      setMobilePanel(null);
      setIsPanelExpanded(false);
    } else {
      setMobilePanel("files");
      setIsPanelExpanded(true);
    }
  };

  const handleMobileCommitExplorer = () => {
    if (mobilePanel === "commit") {
      setMobilePanel(null);
      setIsPanelExpanded(false);
    } else {
      setMobilePanel("commit");
      setIsPanelExpanded(true);
    }
  };

  useEffect(() => {
    console.log("itemHeights now:", itemHeights.current);
  }, [processedItems.length]);

  const virtualizerRef = useRef();
  const [visibleCommitsProjectId, setVisibleCommitsProjectId] = useState(null);
  const [visibleFilesProjectId, setVisibleFilesProjectId] = useState(null);

  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: processedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(
      (index) => {
        const item = processedItems[index];
        if (!item) return 100;

        // Estimate based on content type
        if (item.type === "date") return window.innerWidth < 640 ? 80 : 100;

        const msg = item.data || item;
        if (!msg) return 100;

        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth < 1024;

        let estimatedHeight = isMobile ? 80 : isTablet ? 85 : 90; // Base height responsive

        // Add height for message text with better calculation
        if (msg.message) {
          const messageLength = msg.message.length;
          const newlines = (msg.message.match(/\n/g) || []).length;

          // Adjust characters per line based on screen size
          const charsPerLine = isMobile ? 35 : isTablet ? 45 : 55;

          // Calculate based on both character count and newlines
          const estimatedLines = Math.max(
            Math.ceil(messageLength / charsPerLine),
            newlines + 1
          );

          // More generous height calculation for longer messages with mobile optimization
          const lineHeight = isMobile ? 18 : isTablet ? 20 : 22;

          if (estimatedLines > 50) {
            estimatedHeight += estimatedLines * (lineHeight + 2); // Extra spacing for very long messages
          } else if (estimatedLines > 10) {
            estimatedHeight += estimatedLines * lineHeight;
          } else {
            estimatedHeight += Math.max(
              estimatedLines * lineHeight,
              isMobile ? 30 : 40
            );
          }
        }

        // Add height for file attachments (responsive)
        if (msg.file || msg.isUploading) {
          estimatedHeight += isMobile ? 280 : isTablet ? 320 : 360;
        }

        // Add extra padding for very long messages to prevent overlap
        if (msg.message && msg.message.length > 1000) {
          estimatedHeight += isMobile ? 30 : 50;
        }

        return Math.max(estimatedHeight, isMobile ? 100 : 120);
      },
      [processedItems]
    ),
    overscan: 5,
    ref: virtualizerRef,
  });

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (rowVirtualizer && processedItems.length > 0) {
      const timeout = setTimeout(() => {
        rowVirtualizer.scrollToIndex(processedItems.length - 1, {
          align: "end",
          behavior: "smooth",
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [processedItems.length, rowVirtualizer]);

  useEffect(() => {
    // Remeasure items when new messages are added to ensure proper height calculation
    if (rowVirtualizer) {
      rowVirtualizer.measure();
    }
  }, [processedItems.length, rowVirtualizer]);

  return (
    <div className="h-screen flex w-full flex-col lg:flex-row bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] text-white font-[Inter] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 lg:relative transform transition-all duration-300 ease-in-out w-80 lg:w-1/4 xl:w-1/5 bg-gradient-to-br from-[#1C2128] via-[#21262D] to-[#161B22] backdrop-blur-xl shadow-2xl border-r border-gray-700/50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Mobile Close Button */}
        <button
          className="absolute top-4 right-4 text-2xl lg:hidden text-gray-400 hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-gray-700/30"
          onClick={() => setSidebarOpen(false)}
        >
          <MdCancel />
        </button>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold tracking-wide text-white flex items-center gap-3">
            <span className="text-3xl">📁</span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Manage your collaborations
          </p>
        </div>

        {/* Projects List */}
        <div className="h-[calc(100vh-8rem)] overflow-y-auto px-4 py-4 space-y-4 custom-scroll">
          {projects.map((project, idx) => (
            <div key={project._id || idx} className="space-y-3">
              {/* Project Select Button */}
              <button
                onClick={() => selectProject(project._id)}
                className={`block w-full text-left px-5 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] ${
                  projectId === project._id
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white shadow-lg shadow-purple-500/25 border border-purple-400/30"
                    : "bg-gray-800/50 hover:bg-gray-700/70 text-gray-100 border border-gray-700/50 hover:border-gray-600/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{project.name}</span>
                  {projectId === project._id && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </button>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-3">
                <button
                  onClick={() =>
                    setVisibleCommitsProjectId((prev) =>
                      prev === project._id ? null : project._id
                    )
                  }
                  className="text-xs text-left px-3 py-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <span>
                    {visibleCommitsProjectId === project._id ? "📁" : "📂"}
                  </span>
                  {visibleCommitsProjectId === project._id
                    ? "Hide Commits"
                    : "View Commits"}
                </button>

                <button
                  onClick={() =>
                    setVisibleFilesProjectId((prev) =>
                      prev === project._id ? null : project._id
                    )
                  }
                  className="text-xs text-left px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <span>
                    {visibleFilesProjectId === project._id ? "🗂️" : "📄"}
                  </span>
                  {visibleFilesProjectId === project._id
                    ? "Hide Files"
                    : "View Files"}
                </button>
              </div>

              {/* Commit Viewer */}
              {visibleCommitsProjectId === project._id && (
                <div className="mt-3 bg-gray-900/80 border border-gray-600/50 rounded-xl p-4 max-h-72 overflow-y-auto custom-scroll text-sm text-gray-200 shadow-inner backdrop-blur-sm">
                  <Commit projectId={project._id} />
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-400 text-sm">No projects yet</p>
              <p className="text-gray-500 text-xs mt-1">
                Create your first project to get started
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-hidden lg:ml-0">
        {/* File Explorer Modal */}
        {visibleFilesProjectId && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600/50 overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => setVisibleFilesProjectId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-50 p-2 rounded-full hover:bg-gray-700/50 transition-all"
              >
                ✕
              </button>

              {/* File Explorer Content */}
              <div className="h-full p-6 overflow-hidden">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📂</span>
                  Project Files
                </h3>
                <FileExplorer projectId={visibleFilesProjectId} />
              </div>
            </div>
          </div>
        )}

        {/* Header Component */}
        <Header
          user={user}
          userinproject={userinproject}
          showEditor={showEditor}
          setSidebarOpen={setSidebarOpen}
          handleToggleTask={handleToggleTask}
          handleToggleEditor={handleToggleEditor}
          projectId={projectId}
          showtask={showtask}
        />

        {/* Chat/Messages Section */}
        <section
          ref={parentRef}
          className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-[#0D1117] to-[#161B22] px-2 py-2 sm:px-4 sm:py-4 md:px-6 lg:px-8 chat-scrollbar relative"
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "thin",
            scrollbarColor: "#6366f1 transparent",
            maxHeight: "calc(100vh - 140px)", // Ensure it doesn't exceed viewport minus header/input
          }}
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

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm italic text-gray-400 bg-gray-800/50 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span>
                {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"}{" "}
                typing...
              </span>
            </div>
          </div>
        )}

        {/* Message Input Section */}
        {isMember && (
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-lg border-t border-gray-700/50 p-2 sm:p-4 md:p-6 pb-16 sm:pb-4 md:pb-6 relative">
            {/* File Preview */}
            {selectedFile && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-700/50 rounded-xl border border-gray-600/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-2xl">📎</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-500/10 transition-all"
                  >
                    ✖
                  </button>
                </div>
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-3">
              {/* Message Input */}
              <div className="flex-1">
                <textarea
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
                  placeholder="Type your message here..."
                  rows={1}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-200"
                />
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-2">
                {/* File Upload */}
                <label className="cursor-pointer group">
                  <div className="p-3 rounded-2xl bg-purple-600/80 hover:bg-purple-600 transition-all duration-200 group-hover:scale-105">
                    <span className="text-white text-lg">📎</span>
                  </div>
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
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  <span className="text-lg">🚀</span>
                </button>

                {/* Create Task Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="text-lg">📋</span>
                </button>
              </div>

              {/* Mobile Send Button */}
              <div className="sm:hidden">
                <button
                  onClick={send}
                  disabled={!message.trim() && !selectedFile}
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all duration-200 disabled:opacity-50"
                >
                  <span className="text-lg">🚀</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Floating Action Buttons */}
        <div className="sm:hidden hidden fixed bottom-20 right-4 z-40 flex flex-col gap-3">
          {showFloatingActions && (
            <>
              <label className="cursor-pointer group">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                  <span className="text-white text-lg">📎</span>
                </div>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              >
                <span className="text-white text-lg">📋</span>
              </button>

              <button
                onClick={handleMobileFileExplorer}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
                  mobilePanel === "files" ? "bg-blue-700" : "bg-blue-600"
                }`}
              >
                <HiOutlineDocumentText className="text-white text-lg" />
              </button>

              <button
                onClick={() => navigate(`/golive/${projectId}`)}
                className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              >
                <FaVideo className="text-white text-sm" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 z-30">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={handleToggleTask}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                mobilePanel === "tasks"
                  ? "text-purple-400 bg-purple-500/20"
                  : "text-gray-400"
              }`}
            >
              <FaTasks className="text-lg mb-1" />
              <span className="text-xs font-medium">Tasks</span>
            </button>

            <button
              onClick={handleToggleEditor}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                mobilePanel === "editor"
                  ? "text-blue-400 bg-blue-500/20"
                  : "text-gray-400"
              }`}
            >
              <BiCodeBlock className="text-lg mb-1" />
              <span className="text-xs font-medium">Code</span>
            </button>

            <button
              onClick={handleMobileFileExplorer}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                mobilePanel === "files"
                  ? "text-green-400 bg-green-500/20"
                  : "text-gray-400"
              }`}
            >
              <HiOutlineDocumentText className="text-lg mb-1" />
              <span className="text-xs font-medium">Files</span>
            </button>

            <button
              onClick={handleMobileCommitExplorer}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                mobilePanel === "commit"
                  ? "text-green-400 bg-green-500/20"
                  : "text-gray-400"
              }`}
            >
              <IoGitCommitSharp className="text-lg mb-1" />
              <span className="text-xs font-medium">commit</span>
            </button>
          </div>
        </div>

        {/* Mobile Bottom Panel */}
        {mobilePanel && (
          <div className="sm:hidden fixed inset-x-0 bottom-16 z-20 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 transition-all duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {mobilePanel === "tasks" && (
                  <>
                    <FaTasks className="text-purple-400" />
                    Project Tasks
                  </>
                )}
                {mobilePanel === "editor" && (
                  <>
                    <BiCodeBlock className="text-blue-400" />
                    Code Editor
                  </>
                )}
                {mobilePanel === "files" && (
                  <>
                    <HiOutlineDocumentText className="text-green-400" />
                    Project Files
                  </>
                )}
                {mobilePanel === "commit" && (
                  <>
                    <IoGitCommitSharp className="text-green-400" />
                    Project Commits
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                className="text-gray-400 hover:text-white p-1"
              >
                {isPanelExpanded ? <FaChevronDown /> : <FaChevronUp />}
              </button>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                isPanelExpanded ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="p-4 max-h-80 overflow-y-auto">
                {mobilePanel === "tasks" && (
                  <MobileTaskView
                    task={task}
                    projectId={projectId}
                    user={user}
                    activeProofTaskId={activeProofTaskId}
                    setActiveProofTaskId={setActiveProofTaskId}
                    seletedtask={seletedtask}
                    getAllTask={getAllTask}
                    projetownerId={projetownerId}
                    setIsModalOpen={setIsModalOpen}
                  />
                )}
                {mobilePanel === "editor" && (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden min-h-[200px]">
                      <CollaborativeEditor projectId={projectId} user={user} />
                    </div>
                  </div>
                )}
                {mobilePanel === "files" && (
                  <div className="h-[calc(100vh-200px)] sm:h-[500px]">
                    <FileExplorer
                      projectId={projectId}
                      isMobile={true}
                      containerHeight="100%"
                    />
                  </div>
                )}
                {mobilePanel === "commit" && (
                  <div className="space-y-4">
                    <Commit projectId={projectId} user={user} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task Management Section - Desktop Only */}
        {showtask && (
          <div className="hidden sm:block border-t border-gray-700/50 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Project Tasks
                  </span>
                </h2>
                <div className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                  {task[projectId]?.length || 0} tasks
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto pr-2 custom-scroll">
                {task[projectId]?.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {task[projectId].map((t, i) => (
                      <TaskCard
                        key={t._id || i}
                        task={t}
                        user={user}
                        activeProofTaskId={activeProofTaskId}
                        setActiveProofTaskId={setActiveProofTaskId}
                        seletedtask={seletedtask}
                        getAllTask={getAllTask}
                        projectId={projectId}
                        projetownerId={projetownerId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-gray-400 text-lg font-medium">
                      No tasks assigned yet
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Create your first task to get started
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Create First Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Code Editor Section - Desktop Only */}
        {showEditor && (
          <div className="hidden sm:block border-t border-gray-700/50 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-2xl">💻</span>
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Collaborative Code Editor
                </span>
              </h2>
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
                <CollaborativeEditor projectId={projectId} user={user} />
              </div>
            </div>
          </div>
        )}

        {/* Task Creation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-3xl shadow-2xl w-full max-w-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Create New Task
                  </span>
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  Set up a new task for your project team
                </p>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Task Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <span>🎯</span>
                    Task Title
                  </label>
                  <input
                    type="text"
                    {...register("title", { required: true })}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>

                {/* Task Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <span>📋</span>
                    Description
                  </label>
                  <textarea
                    {...register("description", { required: true })}
                    placeholder="Describe the task in detail..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                  />
                </div>

                {/* Due Date and Status */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                      <span>📅</span>
                      Due Date
                    </label>
                    <input
                      type="date"
                      {...register("dueDate", { required: true })}
                      className="w-full px-4 py-3 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                      <span>📊</span>
                      Status
                    </label>
                    <select
                      {...register("status", { required: true })}
                      className="w-full px-4 py-3 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Assign Members */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                    <span>👥</span>
                    Assign Team Members
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userinproject.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handletoggle(u._id)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                          assignedTo.includes(u._id)
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border-purple-500/50 scale-105"
                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-gray-600/50 hover:border-gray-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {assignedTo.includes(u._id) ? "✅" : "👤"}
                          </span>
                          <span className="truncate">{u.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700/50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold transition-all duration-200 border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Commits Modal */}
        {visibleCommitsProjectId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-600/50 overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">📜</span>
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Project Commits
                  </span>
                </h2>
                <button
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                  onClick={() => setVisibleCommitsProjectId(null)}
                >
                  <MdCancel className="text-2xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scroll">
                <Commit projectId={visibleCommitsProjectId} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Mobile Task View Component
const MobileTaskView = ({
  task,
  projectId,
  user,
  activeProofTaskId,
  setActiveProofTaskId,
  seletedtask,
  getAllTask,
  projetownerId,
  setIsModalOpen,
}) => {
  if (!task[projectId]?.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-gray-400 text-sm mb-3">No tasks yet</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Create First Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {task[projectId].map((t, i) => (
        <div
          key={t._id || i}
          className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-white text-sm flex-1 mr-2">
              {t.title}
            </h4>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                t.status === "Completed"
                  ? "bg-green-500/20 text-green-400"
                  : t.status === "In Progress"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {t.status}
            </span>
          </div>

          <p className="text-gray-300 text-xs mb-2 line-clamp-2">
            {t.description}
          </p>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
            <span>{t.assignedTo.length} assigned</span>
          </div>

          {t.assignedTo.some((u) => u._id == user?._id) &&
            t.Proofsubmission?.aiverified !== "Approved" && (
              <button
                onClick={() =>
                  setActiveProofTaskId(
                    activeProofTaskId === t._id ? null : t._id
                  )
                }
                className="w-full mt-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                {activeProofTaskId === t._id ? "Cancel" : "Submit Proof"}
              </button>
            )}

          {activeProofTaskId === t._id && (
            <div className="mt-2">
              <ProofForm
                taskId={activeProofTaskId}
                onSuccess={() => setActiveProofTaskId(null)}
                getAllTask={getAllTask}
                projectId={projectId}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Task Card Component (for desktop)
const TaskCard = ({
  task: t,
  user,
  activeProofTaskId,
  setActiveProofTaskId,
  seletedtask,
  getAllTask,
  projectId,
  projetownerId,
}) => (
  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-5 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
    {/* Task Header */}
    <div className="flex justify-between items-start mb-4">
      <h3 className="font-bold text-white text-sm leading-tight flex-1 mr-2">
        {t.title}
      </h3>
      <select
        className={`text-xs px-3 py-1 rounded-full font-semibold focus:outline-none transition-all cursor-pointer ${
          t.status === "Completed"
            ? "bg-green-500/80 text-white"
            : t.status === "In Progress"
            ? "bg-yellow-500/80 text-white"
            : "bg-red-500/80 text-white"
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

    {/* Task Description */}
    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
      {t.description}
    </p>

    {/* Due Date */}
    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
      <p className="text-xs text-red-400 font-medium flex items-center gap-2">
        <span>⏰</span>
        Due:{" "}
        {new Date(t.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>

    {/* Assigned Users */}
    <div className="mb-4">
      <p className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-2">
        <span>👥</span>
        Assigned To:
      </p>
      <div className="flex flex-wrap gap-2">
        {t.assignedTo.map((u) => (
          <span
            key={u._id}
            className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs px-3 py-1 rounded-full font-medium"
          >
            {u.username}
          </span>
        ))}
      </div>
    </div>

    {/* Proof Submission */}
    {t?.Proofsubmission?.zipFile && (
      <div className="mt-4 p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">📎</span>
          <a
            href={t.Proofsubmission.zipFile}
            className="text-blue-400 hover:text-blue-300 underline font-medium"
            target="_blank"
            rel="noreferrer"
          >
            View Submission
          </a>
        </div>

        {t.Proofsubmission.note && (
          <p className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded-lg">
            📝 {t.Proofsubmission.note}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm">🤖 AI Status:</span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              t.Proofsubmission.aiverified === "Approved"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : t.Proofsubmission.aiverified === "Rejected"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            }`}
          >
            {t.Proofsubmission.aiverified}
          </span>
        </div>

        {t.Proofsubmission.aiFeedBack && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
            <p className="text-xs text-blue-300 font-medium mb-1">
              💡 AI Feedback:
            </p>
            <p className="text-xs text-gray-300 italic leading-relaxed">
              {t.Proofsubmission.aiFeedBack}
            </p>
          </div>
        )}
      </div>
    )}

    {/* Submit Proof Button */}
    {t.Proofsubmission?.aiverified !== "Approved" &&
      (t.Proofsubmission?.aiverified === "Rejected" ||
        t.assignedTo.some((u) => u._id == user?._id)) && (
        <div className="mt-4">
          {activeProofTaskId !== t._id ? (
            <button
              onClick={() => setActiveProofTaskId(t._id)}
              className="w-full text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              📤 Submit Proof
            </button>
          ) : (
            <div className="space-y-3">
              <ProofForm
                taskId={activeProofTaskId}
                onSuccess={() => setActiveProofTaskId(null)}
                getAllTask={getAllTask}
                projectId={projectId}
              />
              <button
                onClick={() => setActiveProofTaskId(null)}
                className="text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

    {/* Owner Verification */}
    {t.status === "Completed" && t.isVerifiedByOwner ? (
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
        <p className="text-green-400 text-sm font-medium flex items-center gap-2">
          <span>✅</span>
          Verified by Owner
        </p>
      </div>
    ) : t.status === "Completed" &&
      user._id === projetownerId &&
      !t.isVerifiedByOwner ? (
      <button
        className="mt-4 w-full text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
        onClick={() => seletedtask(t._id, t.status, true)}
      >
        ✅ Verify Task Completion
      </button>
    ) : null}
  </div>
);
