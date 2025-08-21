import React, { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { 
  FaFolder, 
  FaFolderOpen, 
  FaFile, 
  FaFileCode, 
  FaFilePdf, 
  FaFileImage, 
  FaFileAlt,
  FaSearch,
  FaExpandAlt,
  FaCompressAlt,
  FaCopy,
  FaDownload,
  FaEye,
  FaCode,
  FaBars,
  FaTimes,
  FaGithub,
  FaJsSquare,
  FaReact,
  FaHtml5,
  FaCss3Alt,
  FaMarkdown,
  FaFileWord,
  FaChevronRight,
  FaChevronDown,
  FaStar,
  FaHeart,
  FaShare
} from "react-icons/fa";
import { LuFileJson } from "react-icons/lu";

// Get file icon based on extension
const getFileIcon = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const size = "text-sm";
  
  switch (ext) {
    case "js":
      return <FaJsSquare className={`${size} text-yellow-500`} />;
    case "jsx":
      return <FaReact className={`${size} text-blue-400`} />;
    case "ts":
      return <FaFileCode className={`${size} text-blue-600`} />;
    case "tsx":
      return <FaReact className={`${size} text-blue-400`} />;
    case "html":
      return <FaHtml5 className={`${size} text-orange-500`} />;
    case "css":
      return <FaCss3Alt className={`${size} text-blue-500`} />;
    case "md":
      return <FaMarkdown className={`${size} text-gray-600`} />;
    case "json":
      return <LuFileJson className={`${size} text-green-500`} />;
    case "pdf":
      return <FaFilePdf className={`${size} text-red-500`} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return <FaFileImage className={`${size} text-purple-500`} />;
    case "doc":
    case "docx":
      return <FaFileWord className={`${size} text-blue-700`} />;
    default:
      return <FaFileAlt className={`${size} text-gray-500`} />;
  }
};

// Get file type badge
const getFileTypeBadge = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const colors = {
    js: "bg-yellow-100 text-yellow-800",
    jsx: "bg-blue-100 text-blue-800", 
    ts: "bg-blue-100 text-blue-800",
    tsx: "bg-blue-100 text-blue-800",
    html: "bg-orange-100 text-orange-800",
    css: "bg-blue-100 text-blue-800",
    md: "bg-gray-100 text-gray-800",
    json: "bg-green-100 text-green-800",
    pdf: "bg-red-100 text-red-800",
    png: "bg-purple-100 text-purple-800",
    jpg: "bg-purple-100 text-purple-800",
    jpeg: "bg-purple-100 text-purple-800",
    gif: "bg-purple-100 text-purple-800",
    svg: "bg-purple-100 text-purple-800",
  };
  
  return colors[ext] || "bg-gray-100 text-gray-800";
};
// Util: Convert file list to folder-tree structure
const buildTree = (files) => {
  const root = {};

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          __meta: {
            isFile: index === parts.length - 1,
            path: file.path,
            size: file.size || 0,
            lastModified: file.lastModified || new Date().toISOString(),
          },
        };
      }
      current = current[part];
    });
  });

  return root;
};

// Recursive Tree Renderer
const TreeNode = ({ node, onFileClick, selectedFile, path = "", level = 0, searchTerm = "" }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  // Filter entries based on search term
  const filteredEntries = Object.entries(node).filter(([name]) => {
    if (name === "__meta") return false;
    if (!searchTerm) return true;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort entries: folders first, then files
  const sortedEntries = filteredEntries.sort(([nameA, childA], [nameB, childB]) => {
    const isFileA = childA.__meta?.isFile;
    const isFileB = childB.__meta?.isFile;
    
    if (isFileA !== isFileB) {
      return isFileA ? 1 : -1; // Folders first
    }
    
    return nameA.localeCompare(nameB);
  });

  return (
    <div className={`${level > 0 ? 'ml-4 border-l border-gray-200 dark:border-gray-600 pl-2' : ''}`}>
      {sortedEntries.map(([name, child]) => {
        const isFile = child.__meta?.isFile;
        const currentPath = path ? `${path}/${name}` : name;
        const isExpanded = expandedFolders[currentPath] ?? (level < 2); // Auto-expand first 2 levels
        const isSelected = selectedFile === child.__meta?.path;

        return (
          <div key={currentPath} className="group relative">
            {isFile ? (
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]"
                    : "hover:shadow-md"
                }`}
                title={child.__meta.path}
                onClick={() => onFileClick(child.__meta.path)}
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(name)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                      {name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${isSelected ? 'bg-white/20 text-white' : getFileTypeBadge(name)}`}>
                      {name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* File Details */}
                  <div className={`flex items-center space-x-3 text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    <span>{formatFileSize(child.__meta.size)}</span>
                    <span>•</span>
                    <span>{getRelativeTime(child.__meta.lastModified)}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isSelected ? 'opacity-100' : ''}`}>
                  <button 
                    className={`p-1 rounded transition-colors duration-200 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400'}`}
                    title="Star file"
                  >
                    <FaStar className="text-xs" />
                  </button>
                  <button 
                    className={`p-1 rounded transition-colors duration-200 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400'}`}
                    title="Copy path"
                  >
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 group"
                  onClick={() => toggleExpand(currentPath)}
                >
                  {/* Folder Icon */}
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <FaChevronDown className="text-xs text-gray-400 transition-transform duration-200" />
                    ) : (
                      <FaChevronRight className="text-xs text-gray-400 transition-transform duration-200" />
                    )}
                    {isExpanded ? (
                      <FaFolderOpen className="text-sm text-blue-500" />
                    ) : (
                      <FaFolder className="text-sm text-blue-600" />
                    )}
                  </div>
                  
                  {/* Folder Name */}
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors duration-200">
                    {name}
                  </span>
                  
                  {/* Folder Stats */}
                  <span className="text-xs text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {Object.keys(child).filter(k => k !== '__meta').length} items
                  </span>
                </div>
                
                {/* Folder Contents */}
                {isExpanded && (
                  <div className="mt-1 animate-slideDown">
                    <TreeNode
                      node={child}
                      onFileClick={onFileClick}
                      selectedFile={selectedFile}
                      path={currentPath}
                      level={level + 1}
                      searchTerm={searchTerm}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FileExplorer = ({ projectId, isMobile = false, containerHeight = "600px" }) => {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Default closed on mobile when embedded
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likedFiles, setLikedFiles] = useState(new Set());
  const [starredFiles, setStarredFiles] = useState(new Set());

  const toggleLike = (filePath) => {
    const newLiked = new Set(likedFiles);
    if (newLiked.has(filePath)) {
      newLiked.delete(filePath);
    } else {
      newLiked.add(filePath);
    }
    setLikedFiles(newLiked);
  };

  const toggleStar = (filePath) => {
    const newStarred = new Set(starredFiles);
    if (newStarred.has(filePath)) {
      newStarred.delete(filePath);
    } else {
      newStarred.add(filePath);
    }
    setStarredFiles(newStarred);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/project/${projectId}/files`
        );

        const codeFiles = res.data.files.filter(
          (f) =>
            f.type === "blob" &&
            !f.path.includes("node_modules/") &&
            !f.path.includes(".git/") &&
            !f.path.includes("dist/") &&
            !f.path.includes("build/") &&
            /\.(js|ts|jsx|tsx|json|html|css|md|py|java|cpp|c|php|rb|go|rs|swift|kt)$/.test(f.path)
        );

        const tree = buildTree(codeFiles);
        setFileTree(tree);
      } catch (err) {
        console.error("Failed to load files", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [projectId]);

  const handleFileClick = async (filePath) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/project/${projectId}/file?path=${encodeURIComponent(
          filePath
        )}`
      );
      setSelectedFile(filePath);
      setFileContent(res.data.content);
    } catch (err) {
      console.error("Failed to load file content", err);
      setFileContent("// Error loading file content");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
        return "javascript";
      case "ts":
        return "typescript";
      case "jsx":
        return "javascript";
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      case "html":
        return "html";
      case "css":
        return "css";
      case "md":
        return "markdown";
      case "py":
        return "python";
      case "java":
        return "java";
      case "cpp":
      case "c":
        return "cpp";
      case "php":
        return "php";
      case "rb":
        return "ruby";
      case "go":
        return "go";
      case "rs":
        return "rust";
      case "swift":
        return "swift";
      case "kt":
        return "kotlin";
      default:
        return "plaintext";
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = () => {
    if (selectedFile && fileContent) {
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.split('/').pop();
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : `${isMobile ? 'h-full min-h-[500px]' : 'h-[600px]'} rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden`}`}>
      
      {/* Mobile Header - Always show on mobile */}
      <div className={`${isMobile ? 'block' : 'lg:hidden'} bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <div className="flex items-center space-x-2">
              <FaGithub className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">File Explorer</h2>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
            >
              {isFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} ${isMobile ? 'w-full' : 'lg:block w-full lg:w-80 xl:w-96'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${isMobile && sidebarOpen ? 'absolute inset-0 z-20' : ''}`}>
        
        {/* Sidebar Header */}
        <div className={`${isMobile ? 'hidden' : 'hidden lg:flex'} items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaCode className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Repository Files</h2>
              <p className="text-blue-100 text-xs">Browse and explore code</p>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
            >
              {isFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">Loading files...</p>
            </div>
          ) : Object.keys(fileTree).length > 0 ? (
            <div className="space-y-1">
              <TreeNode
                node={fileTree}
                onFileClick={(filePath) => {
                  handleFileClick(filePath);
                  if (isMobile) {
                    setSidebarOpen(false); // Auto-close sidebar on mobile after file selection
                  }
                }}
                selectedFile={selectedFile}
                searchTerm={searchTerm}
              />
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <FaFolder className="text-gray-300 text-3xl sm:text-4xl mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No files found</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{Object.keys(fileTree).length} folders</span>
            <span>{selectedFile ? '1 file selected' : 'No file selected'}</span>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${isMobile && sidebarOpen ? 'hidden' : ''} ${isMobile ? 'min-h-0' : ''}`}>
        
        {/* Editor Header */}
        {selectedFile && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
              <div className="flex-shrink-0">
                {getFileIcon(selectedFile.split('/').pop())}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {selectedFile.split('/').pop()}
                </h3>
                <p className="text-xs text-gray-500 truncate">{selectedFile}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeBadge(selectedFile)}`}>
                {selectedFile.split('.').pop()?.toUpperCase()}
              </span>
            </div>
            
            {/* File Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => toggleLike(selectedFile)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  likedFiles.has(selectedFile)
                    ? 'bg-red-100 text-red-600 scale-110'
                    : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                }`}
                title="Like file"
              >
                <FaHeart className="text-xs sm:text-sm" />
              </button>
              
              <button
                onClick={() => toggleStar(selectedFile)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  starredFiles.has(selectedFile)
                    ? 'bg-yellow-100 text-yellow-600 scale-110'
                    : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'
                }`}
                title="Star file"
              >
                <FaStar className="text-xs sm:text-sm" />
              </button>
              
              <button
                onClick={() => copyToClipboard(fileContent)}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200"
                title="Copy content"
              >
                <FaCopy className="text-xs sm:text-sm" />
              </button>
              
              <button
                onClick={downloadFile}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500 transition-all duration-200"
                title="Download file"
              >
                <FaDownload className="text-xs sm:text-sm" />
              </button>
              
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-purple-50 hover:text-purple-500 transition-all duration-200"
                title="Share file"
              >
                <FaShare className="text-xs sm:text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className={`flex-1 relative ${isMobile ? 'overflow-auto' : ''}`}>
          {loading && selectedFile ? (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">Loading file content...</p>
              </div>
            </div>
          ) : selectedFile ? (
            <Editor
              height="100%"
              language={getLanguageFromExtension(selectedFile)}
              value={fileContent}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: isMobile ? 12 : 14,
                fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                minimap: { enabled: !isMobile && window.innerWidth > 768 },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                automaticLayout: true,
                wordWrap: "on",
                folding: true,
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                contextmenu: !isMobile,
                mouseWheelZoom: !isMobile,
                scrollBeyondLastColumn: 5,
                smoothScrolling: true,
                mouseWheelScrollSensitivity: isMobile ? 3 : 1,
                fastScrollSensitivity: isMobile ? 8 : 5,
                overviewRulerLanes: isMobile ? 0 : 3,
                hideCursorInOverviewRuler: isMobile,
                overviewRulerBorder: !isMobile,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: isMobile ? 8 : 10,
                  horizontalScrollbarSize: isMobile ? 8 : 10,
                  verticalSliderSize: isMobile ? 8 : 10,
                  horizontalSliderSize: isMobile ? 8 : 10,
                  useShadows: true,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  alwaysConsumeMouseWheel: true,
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="text-center max-w-md mx-auto px-4 sm:px-6">
                <div className="mb-4 sm:mb-6">
                  <FaFileCode className="text-4xl sm:text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Welcome to File Explorer
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Select a file from the sidebar to view its content. You can search, filter, and explore your entire repository structure with ease.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center justify-center space-x-3 sm:space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FaEye />
                    <span>View files</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaSearch />
                    <span>Search code</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaDownload />
                    <span>Download</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
