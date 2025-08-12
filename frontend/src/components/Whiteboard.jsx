// import { useEffect, useRef, useState } from "react";
// import {
//   connectSocket,
//   disconnectSocket,
//   emitEvent,
//   onEvent,
//   offEvent
// } from "../config/socket";
// import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
// import { debounce } from "lodash";
// import { FaSync, FaWifi, FaExpand, FaCompress, FaTrash } from "react-icons/fa";
// import { Tooltip } from "react-tooltip";

// // Import Excalidraw CSS - CRITICAL FIX
// import "@excalidraw/excalidraw/index.css";

// export default function Whiteboard({ projectId }) {
//   const excalidrawRef = useRef(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const lastSentRef = useRef(Date.now());
//   const containerRef = useRef(null);

//   // Initialize connection
//   useEffect(() => {

//     connectSocket();
//     console.log("connectssocket",connectSocket());
//     setIsConnected(true);

//     emitEvent("join-project", projectId);

//     // Handle initial drawing state
//     onEvent("drawing-init", (elements) => {
//       if (excalidrawRef.current && elements) {
//         excalidrawRef.current.updateScene({ elements });
//         setIsInitialized(true);
//       }
//     });

//     // Handle real-time updates
//     onEvent("drawing-update", ({ elements }) => {
//       if (excalidrawRef.current) {
//         excalidrawRef.current.updateScene({ elements });
//       }
//     });

//     return () => {
//       emitEvent("leave-project", projectId);
//       offEvent("drawing-init");
//       offEvent("drawing-update");
//       disconnectSocket();
//     };
//   }, [projectId]);

//   // Optimized change handler
//   const handleChange = debounce((elements) => {
//     if (!projectId || !isInitialized) return;

//     setIsSyncing(true);
//     emitEvent("drawing-update", { projectId, elements });
//     lastSentRef.current = Date.now();

//     // Reset syncing state after delay
//     setTimeout(() => setIsSyncing(false), 300);
//   }, 150);

//   // Toggle fullscreen
//   const toggleFullscreen = () => {
//     if (!containerRef.current) return;

//     if (!isFullscreen) {
//       if (containerRef.current.requestFullscreen) {
//         containerRef.current.requestFullscreen();
//       } else if (containerRef.current.webkitRequestFullscreen) {
//         containerRef.current.webkitRequestFullscreen();
//       }
//       setIsFullscreen(true);
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//       }
//       setIsFullscreen(false);
//     }
//   };

//   // Reset the whiteboard
//   const resetWhiteboard = async () => {
//     if (!excalidrawRef.current) return;

//     // Clear local scene
//     excalidrawRef.current.resetScene();

//     // Get empty scene
//     const elements = excalidrawRef.current.getSceneElements();

//     // Broadcast reset to all users
//     setIsSyncing(true);
//     emitEvent("drawing-update", { projectId, elements });

//     // Reset syncing state
//     setTimeout(() => setIsSyncing(false), 300);
//   };

//   // Render status bar
//   const renderStatusBar = () => (
//     <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-t">
//       <div className="flex items-center gap-2 text-sm">
//         <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//         <span>{isConnected ? "Connected" : "Disconnected"}</span>
//       </div>

//       <div className="flex items-center gap-3">
//         {isSyncing && (
//           <div
//             className="flex items-center gap-1 text-blue-500"
//             data-tooltip-id="sync-tooltip"
//           >
//             <FaSync className="animate-spin" />
//             <span>Syncing...</span>
//           </div>
//         )}

//         <button
//           className="p-2 rounded hover:bg-gray-200"
//           onClick={toggleFullscreen}
//           data-tooltip-id="fullscreen-tooltip"
//         >
//           {isFullscreen ? <FaCompress /> : <FaExpand />}
//         </button>

//         <button
//           className="p-2 rounded hover:bg-gray-200"
//           onClick={resetWhiteboard}
//           data-tooltip-id="reset-tooltip"
//         >
//           <FaTrash />
//         </button>
//       </div>
//     </div>
//   );

//   // Add fallback in case of initialization issues
//   const renderFallback = () => (
//     <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
//       <div className="text-center p-6 max-w-md">
//         <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           Loading Whiteboard
//         </h3>
//         <p className="text-gray-500 mb-4">
//           {isConnected
//             ? "Connecting to collaborative session..."
//             : "Trying to establish connection..."}
//         </p>
//         <div className="flex justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div
//       ref={containerRef}
//       className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden"
//     >
//       <div className="flex-1 relative">
//         {!isInitialized && renderFallback()}

//         <Excalidraw
//           ref={excalidrawRef}
//           onChange={handleChange}
//           theme="light"
//           UIOptions={{
//             canvasActions: {
//               saveToActiveFile: false,
//               loadScene: false,
//               export: false,
//               toggleTheme: false,
//             },
//             tools: {
//               image: true,
//               laser: true,
//             }
//           }}
//           renderTopRightUI={() => (
//             <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
//               <FaWifi className={`${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
//               <span className="text-xs font-medium">
//                 Live Whiteboard
//               </span>
//             </div>
//           )}
//           style={{ display: isInitialized ? "block" : "none" }}
//         />
//       </div>

//       {isInitialized && renderStatusBar()}

//       {/* Tooltips */}
//       <Tooltip id="sync-tooltip" place="top">
//         Syncing changes with other users
//       </Tooltip>
//       <Tooltip id="fullscreen-tooltip" place="top">
//         {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
//       </Tooltip>
//       <Tooltip id="reset-tooltip" place="top">
//         Clear whiteboard
//       </Tooltip>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import {
//   initializeSocket,
//   connectSocket,
//   disconnectSocket,
//   emitEvent,
//   onEvent,
//   offEvent
// } from "../config/socket";
// import { Excalidraw } from "@excalidraw/excalidraw";
// import { debounce } from "lodash";
// import { FaSync, FaWifi, FaExpand, FaCompress, FaTrash } from "react-icons/fa";
// import { Tooltip } from "react-tooltip";
// import "@excalidraw/excalidraw/index.css";

// export default function Whiteboard({ projectId }) {
//   const excalidrawRef = useRef(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const containerRef = useRef(null);
//   const socketInitialized = useRef(false);

//   // Initialize socket connection
//   useEffect(() => {
//     // Get token from storage
//     const token = localStorage.getItem("authToken") || "";

//     // Initialize socket once
//     if (!socketInitialized.current) {
//       initializeSocket(token);
//       socketInitialized.current = true;
//     }

//     // Connect to socket
//     const connected = connectSocket();
//     setIsConnected(connected);

//     // Handle connection events
//     const handleConnect = () => {
//       setIsConnected(true);
//       emitEvent("join-project", projectId);
//     };

//     const handleDisconnect = () => setIsConnected(false);

//     // Setup event listeners
//     onEvent("connect", handleConnect);
//     onEvent("disconnect", handleDisconnect);

//     // Join project room after connection
//     if (connected) {
//       emitEvent("join-project", projectId);
//     }

//     // Handle initial drawing state
//     onEvent("drawing-init", (elements) => {
//       if (excalidrawRef.current && elements) {
//         excalidrawRef.current.updateScene({ elements });
//         setIsInitialized(true);
//       }
//     });

//     // Handle real-time updates
//     onEvent("drawing-update", ({ elements }) => {
//       if (excalidrawRef.current) {
//         excalidrawRef.current.updateScene({ elements });
//       }
//     });

//     return () => {
//       offEvent("connect", handleConnect);
//       offEvent("disconnect", handleDisconnect);
//       offEvent("drawing-init");
//       offEvent("drawing-update");
//       emitEvent("leave-project", projectId);
//       disconnectSocket();
//     };
//   }, [projectId]);

//   // Optimized change handler
//   const handleChange = debounce((elements) => {
//     if (!projectId || !isInitialized) return;

//     setIsSyncing(true);
//     emitEvent("drawing-update", { projectId, elements });

//     // Reset syncing state after delay
//     setTimeout(() => setIsSyncing(false), 300);
//   }, 150);

//   // Toggle fullscreen
//   const toggleFullscreen = () => {
//     if (!containerRef.current) return;

//     if (!isFullscreen) {
//       if (containerRef.current.requestFullscreen) {
//         containerRef.current.requestFullscreen();
//       } else if (containerRef.current.webkitRequestFullscreen) {
//         containerRef.current.webkitRequestFullscreen();
//       }
//       setIsFullscreen(true);
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//       }
//       setIsFullscreen(false);
//     }
//   };

//   // Reset the whiteboard
//   const resetWhiteboard = async () => {
//     if (!excalidrawRef.current) return;

//     // Clear local scene
//     excalidrawRef.current.resetScene();

//     // Get empty scene
//     const elements = excalidrawRef.current.getSceneElements();

//     // Broadcast reset to all users
//     setIsSyncing(true);
//     emitEvent("drawing-update", { projectId, elements });

//     // Reset syncing state
//     setTimeout(() => setIsSyncing(false), 300);
//   };

//   // Render status bar
//   const renderStatusBar = () => (
//     <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-t">
//       <div className="flex items-center gap-2 text-sm">
//         <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//         <span>{isConnected ? "Connected" : "Disconnected"}</span>
//       </div>

//       <div className="flex items-center gap-3">
//         {isSyncing && (
//           <div
//             className="flex items-center gap-1 text-blue-500"
//             data-tooltip-id="sync-tooltip"
//           >
//             <FaSync className="animate-spin" />
//             <span>Syncing...</span>
//           </div>
//         )}

//         <button
//           className="p-2 rounded hover:bg-gray-200"
//           onClick={toggleFullscreen}
//           data-tooltip-id="fullscreen-tooltip"
//         >
//           {isFullscreen ? <FaCompress /> : <FaExpand />}
//         </button>

//         <button
//           className="p-2 rounded hover:bg-gray-200"
//           onClick={resetWhiteboard}
//           data-tooltip-id="reset-tooltip"
//         >
//           <FaTrash />
//         </button>
//       </div>
//     </div>
//   );

//   // Add fallback in case of initialization issues
//   const renderFallback = () => (
//     <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
//       <div className="text-center p-6 max-w-md">
//         <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           Loading Whiteboard
//         </h3>
//         <p className="text-gray-500 mb-4">
//           {isConnected
//             ? "Connecting to collaborative session..."
//             : "Trying to establish connection..."}
//         </p>
//         <div className="flex justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div
//       ref={containerRef}
//       className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden"
//     >
//       <div className="flex-1 relative">
//         {!isInitialized && renderFallback()}

//         <Excalidraw
//           ref={excalidrawRef}
//           onChange={handleChange}
//           theme="light"
//           UIOptions={{
//             canvasActions: {
//               saveToActiveFile: false,
//               loadScene: false,
//               export: false,
//               toggleTheme: false,
//             },
//             tools: {
//               image: true,
//               laser: true,
//             }
//           }}
//           renderTopRightUI={() => (
//             <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
//               <FaWifi className={`${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
//               <span className="text-xs font-medium">
//                 Live Whiteboard
//               </span>
//             </div>
//           )}
//           style={{
//             display: isInitialized ? "block" : "none",
//             height: "100%",
//             width: "100%"
//           }}
//         />
//       </div>

//       {isInitialized && renderStatusBar()}

//       {/* Tooltips */}
//       <Tooltip id="sync-tooltip" place="top">
//         Syncing changes with other users
//       </Tooltip>
//       <Tooltip id="fullscreen-tooltip" place="top">
//         {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
//       </Tooltip>
//       <Tooltip id="reset-tooltip" place="top">
//         Clear whiteboard
//       </Tooltip>
//     </div>
//   );
// }

// components/Whiteboard.jsx
// import { useEffect, useRef, useState } from "react";
// import useSocket from "../config/useSocket";
// import { debounce } from "lodash";
// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";

// export default function Whiteboard({ projectId, token }) {
//   console.log("token=>",token);
//   const socket = useSocket(token);
//   const excalidrawRef = useRef(null);
//   const [connected, setConnected] = useState(false);
//   const isRemote = useRef(false);
//   const joinedRoom = useRef(false);

//   // Connect and join project
//   useEffect(() => {
//     console.log("socket in useEffect=<",socket);
//     if (!socket || !projectId) return;

//     const onConnect = () => {
//       setConnected(true);
//       socket.emit("join-project", projectId);
//       joinedRoom.current = true;
//     };
//     console.log("project is joined");

//     const onDisconnect = () => setConnected(false);

//     socket.on("connect", onConnect);
//     socket.on("disconnect", onDisconnect);

//     return () => {
//       socket.off("connect", onConnect);
//       socket.off("disconnect", onDisconnect);
//       if (joinedRoom.current) socket.emit("leave-project", projectId);
//     };
//   }, [socket, projectId]);

//   // Listen to drawing events
//   useEffect(() => {
//     console.log("socket in useEffect=<",socket);
//     if (!socket) return;

//     const onInit = (elements) => {
//       console.log("Init received:", elements);
//       console.log("excalidrawRef.current?.updateScene",excalidrawRef.current?.updateScene);
//       excalidrawRef.current?.updateScene({ elements });
//     };

//     const onUpdate = ({ elements }) => {
//       console.log("element in onupdate=>",elements);
//       console.log("excalidrawRef.current?.updateScene",excalidrawRef.current?.updateScene);
//       isRemote.current = true;
//       excalidrawRef.current?.updateScene({ elements });
//     };

//     socket.on("drawing-init", onInit);
//     socket.on("drawing-update", onUpdate);

//     return () => {
//       socket.off("drawing-init", onInit);
//       socket.off("drawing-update", onUpdate);
//     };
//   }, [socket]);

//   // Send drawing changes
//   const handleChange = debounce((elements) => {
//     if (isRemote.current) {
//       isRemote.current = false;
//       return;
//     }

//     if (socket && projectId) {
//       socket.emit("drawing-update", { projectId, elements });
//     }
//   }, 100);

//   return (
//     <div className="h-full w-full bg-white relative">
//       <Excalidraw
//         ref={excalidrawRef}
//         onChange={handleChange}
//         theme="light"
//       />
//       <div
//         style={{
//           position: "absolute",
//           top: 10,
//           right: 10,
//           width: 12,
//           height: 12,
//           borderRadius: "50%",
//           backgroundColor: connected ? "limegreen" : "red",
//         }}
//       />
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";
// import { debounce } from "lodash";
// import useSocket from "../config/useSocket";

// export default function Whiteboard({ projectId, token }) {
//   const socket = useSocket(token, projectId);
//   const excalidraw = useRef(null);
//   const [live, setLive] = useState(false);
//   const isRemote = useRef(false);

//   /* join after connect */
//   useEffect(() => {
//     if (!socket) return;

//     const handleConnect = () => {
//       setLive(true);
//       socket.emit("join-project", projectId);
//     };
//     const handleDisconnect = () => setLive(false);

//     socket.on("connect", handleConnect);
//     socket.on("disconnect", handleDisconnect);
//     if (socket.connected) handleConnect();

//     return () => {
//       socket.off("connect", handleConnect);
//       socket.off("disconnect", handleDisconnect);
//       socket.emit("leave-project", projectId);
//     };
//   }, [socket, projectId]);

//   /* init + remote updates */
//   useEffect(() => {
//     if (!socket) return;

//     const init = (elements) => console.log("elements in init=>", elements);
//     console.log(
//       "excalidraw.current?.updateScene({ elements })",
//       excalidraw.current?.updateScene({ elements })
//     );
//     excalidraw.current?.updateScene({ elements });

//     const update = ({ elements }) => {
//       console.log("element in update", elements);
//       console.log(
//         "excalidraw.current?.updateScene",
//         excalidraw
//       );
//       isRemote.current = true;
//       excalidraw.current?.updateScene({ elements });
//     };

//     socket.on("drawing-init", init);
//     socket.on("drawing-update", update);
//     return () => {
//       socket.off("drawing-init", init);
//       socket.off("drawing-update", update);
//     };
//   }, [socket]);

//   /* local edits → server */
//   const push = debounce((elements) => {
//     if (isRemote.current) {
//       isRemote.current = false;
//       return;
//     }
//     socket?.emit("drawing-update", { projectId, elements });
//   }, 100);

//   return (
//     <div className="h-full w-full relative">
//       <Excalidraw ref={excalidraw} onChange={push} theme="light" />
//       <span
//         style={{
//           position: "absolute",
//           top: 8,
//           right: 8,
//           width: 12,
//           height: 12,
//           borderRadius: "50%",
//           background: live ? "limegreen" : "red",
//         }}
//       />
//     </div>
//   );
// }



// import { useEffect, useRef, useState } from "react";
// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";
// import { debounce } from "lodash";
// import useSocket from "../config/useSocket";

// export default function Whiteboard({ projectId, token }) {
//   const socket = useSocket(token, projectId);
//   const ref = useRef(null);

//   const [online, setOnline] = useState(false);
//   const remoteFlag = useRef(false);

//   /* --- join after socket connects --- */
//   useEffect(() => {
//     if (!socket) return;

//     const onConnect = () => {
//       setOnline(true);
//       socket.emit("join-project", projectId);
//     };
//     socket.on("connect", onConnect);
//     socket.on("disconnect", () => setOnline(false));
//     if (socket.connected) onConnect();

//     return () => socket.off("connect", onConnect);
//   }, [socket, projectId]);

  
//   const forceScene = (elements) => {
//     if (!ref.current) {
//       requestAnimationFrame(() => forceScene(elements));
//       return;
//     }
//     /* clone so Excalidraw detects change */
//     ref.current.updateScene(
//       { elements: elements.map((e) => ({ ...e })) },
//       { replaceAll: true }
//     );
//   };

  
//   useEffect(() => {
//     if (!socket) return;

//     socket.on("drawing-init", forceScene);
//     socket.on("drawing-update", ({ elements }) => {
//       console.log("element in update=>",elements);
//       remoteFlag.current = true;
//       forceScene(elements);
//     });

//     return () => {
//       socket.off("drawing-init", forceScene);
//       socket.off("drawing-update", forceScene);
//     };
//   }, [socket]);

  
//   const push = debounce((elements) => {
//     if (remoteFlag.current) {
//       remoteFlag.current = false;
//       return;
//     }
//     socket?.emit("drawing-update", { projectId, elements });
//   }, 150);

//   return (
//     <div className="h-full w-full relative">
//       <Excalidraw ref={ref} onChange={push} theme="light" />
//       <div
//         style={{
//           position: "absolute",
//           top: 8,
//           right: 8,
//           width: 12,
//           height: 12,
//           borderRadius: "50%",
//           background: online ? "limegreen" : "red",
//         }}
//       />
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { debounce } from "lodash";
import useSocket from "../config/useSocket";

export default function Whiteboard({ projectId, token }) {
  const socket = useSocket(token, projectId);  // singleton socket
  const canvasRef = useRef(null);              // Excalidraw instance

  const [online, setOnline] = useState(false);
  const remoteEdit = useRef(false);            // prevent echo loop

  /* ───────── Join / leave room ───────── */
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setOnline(true);
      socket.emit("join-project", projectId);
    };
    const onDisconnect = () => setOnline(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) onConnect();         // hot‑reload case

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.emit("leave-project", projectId);
    };
  }, [socket, projectId]);

  /* ───────── helper: render scene safely ───────── */
  const renderScene = (elements) => {
    if (!canvasRef.current) {
      requestAnimationFrame(() => renderScene(elements));
      return;
    }

    // reset, then push a deep‑cloned array
    canvasRef.current.resetScene();
    canvasRef.current.updateScene(
      { elements: elements.map((el) => ({ ...el })) },
      { replaceAll: true }
    );
    canvasRef.current.refresh();              // force paint
  };

  /* ───────── receive init + updates ───────── */
  useEffect(() => {
    if (!socket) return;

    socket.on("drawing-init", renderScene);
    socket.on("drawing-update", ({ elements }) => {
      remoteEdit.current = true;
      renderScene(elements);
    });

    return () => {
      socket.off("drawing-init", renderScene);
      socket.off("drawing-update", renderScene);
    };
  }, [socket]);

  /* ───────── send local edits (debounced) ───────── */
  const pushChanges = debounce((elements) => {
    if (!elements.length) return;             // ignore initial empty scene
    if (remoteEdit.current) {                 // skip echo
      remoteEdit.current = false;
      return;
    }
    socket?.emit("drawing-update", { projectId, elements });
  }, 120);

  /* ───────── render component ───────── */
  return (
    <div className="h-full w-full relative">
      <Excalidraw ref={canvasRef} onChange={pushChanges} theme="light" />
      {/* status dot */}
      <span
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: online ? "limegreen" : "red",
        }}
      />
    </div>
  );
}
