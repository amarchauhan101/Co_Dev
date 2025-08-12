// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Editor from "@monaco-editor/react";

// const FileExplorer = ({ projectId }) => {
//   const [files, setFiles] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileContent, setFileContent] = useState("");

// useEffect(() => {
//   const fetchFiles = async () => {
//     try {
//       const res = await axios.get(`http://localhost:8000/api/v1/project/${projectId}/files`);
//       const codeFiles = res.data.files.filter(
//         (f) =>
//           f.type === "blob" &&
//           !f.path.includes("node_modules/") &&
//           /\.(js|ts|jsx|tsx|json|html|css|md)$/.test(f.path)
//       );
//       setFiles(codeFiles);
//     } catch (err) {
//       console.error("Failed to load files", err);
//     }
//   };
//   fetchFiles();
// }, [projectId]);

//   const handleFileClick = async (filePath) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:8000/api/v1/project/${projectId}/file?path=${encodeURIComponent(filePath)}`
//       );
//       console.log("filecont=>",res.data);
//       setSelectedFile(filePath);
//       setFileContent(res.data.content);
//     } catch (err) {
//       console.error("Failed to load file content", err);
//     }
//   };

//   const getLanguageFromExtension = (filename) => {
//     const ext = filename.split(".").pop();
//     switch (ext) {
//       case "js":
//         return "javascript";
//       case "ts":
//         return "typescript";
//       case "jsx":
//         return "javascript";
//       case "tsx":
//         return "typescript";
//       case "json":
//         return "json";
//       case "html":
//         return "html";
//       case "css":
//         return "css";
//       case "md":
//         return "markdown";
//       default:
//         return "plaintext";
//     }
//   };

//   return (
//     <div className="flex h-[600px]">
//       {/* Sidebar */}
//       <div className="w-1/4 p-3 overflow-y-auto border-r border-gray-300 bg-[#1e1e1e] text-white">
//         <h3 className="text-sm font-semibold mb-2">📁 Repository Files</h3>
//         <ul className="space-y-1">
//           {files.map((file) => (
//             <li
//               key={file.path}
//               onClick={() => handleFileClick(file.path)}
//               className="cursor-pointer hover:bg-gray-700 px-2 py-1 rounded text-sm truncate"
//               title={file.path}
//             >
//               {file.path}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 bg-white">
//         {selectedFile ? (
//           <Editor
//             height="100%"
//             language={getLanguageFromExtension(selectedFile)}
//             value={fileContent}
//             options={{
//               readOnly: true,
//               fontSize: 14,
//               minimap: { enabled: false },
//               scrollBeyondLastLine: false,
//             }}
//           />
//         ) : (
//           <div className="p-4 text-gray-500 text-sm">
//             Select a file from the left panel to view its content
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FileExplorer;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

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
          },
        };
      }
      current = current[part];
    });
  });

  return root;
};

// Recursive Tree Renderer
const TreeNode = ({ node, onFileClick, selectedFile, path = "" }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  return (
    <ul className="ml-2 text-sm space-y-1">
      {Object.entries(node).map(([name, child]) => {
        if (name === "__meta") return null;
        const isFile = child.__meta?.isFile;
        const currentPath = path ? `${path}/${name}` : name;
        const isExpanded = expandedFolders[currentPath] ?? true;

        return (
          <li key={currentPath}>
            {isFile ? (
              <div
                className={`cursor-pointer truncate px-2 py-1 rounded ${
                  selectedFile === child.__meta.path
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700"
                }`}
                title={child.__meta.path}
                onClick={() => onFileClick(child.__meta.path)}
              >
                📄 {name}
              </div>
            ) : (
              <div>
                <div
                  className="cursor-pointer font-medium hover:text-yellow-400"
                  onClick={() => toggleExpand(currentPath)}
                >
                  {isExpanded ? "📂" : "📁"} {name}
                </div>
                {isExpanded && (
                  <TreeNode
                    node={child}
                    onFileClick={onFileClick}
                    selectedFile={selectedFile}
                    path={currentPath}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const FileExplorer = ({ projectId }) => {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/project/${projectId}/files`
        );

        const codeFiles = res.data.files.filter(
          (f) =>
            f.type === "blob" &&
            !f.path.includes("node_modules/") &&
            /\.(js|ts|jsx|tsx|json|html|css|md)$/.test(f.path)
        );

        const tree = buildTree(codeFiles);
        setFileTree(tree);
      } catch (err) {
        console.error("Failed to load files", err);
      }
    };

    fetchFiles();
  }, [projectId]);

  const handleFileClick = async (filePath) => {
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
    }
  };

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split(".").pop();
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
      default:
        return "plaintext";
    }
  };

  return (
    <div className="flex h-[600px] border border-gray-300 rounded overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 p-3 overflow-y-auto bg-[#1e1e1e] text-white">
        <h3 className="text-sm font-semibold mb-2">📁 Repository Files</h3>
        {Object.keys(fileTree).length > 0 ? (
          <TreeNode
            node={fileTree}
            onFileClick={handleFileClick}
            selectedFile={selectedFile}
          />
        ) : (
          <p className="text-gray-400 text-xs">No files available</p>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white">
        {selectedFile ? (
          <Editor
            height="100%"
            language={getLanguageFromExtension(selectedFile)}
            value={fileContent}
            options={{
              readOnly: true,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        ) : (
          <div className="p-4 text-gray-500 text-sm">
            Select a file from the sidebar to view its content
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
