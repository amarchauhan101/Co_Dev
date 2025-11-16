import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import {
  FiMoon,
  FiSun,
  FiDownload,
  FiPenTool,
  FiSquare,
  FiCircle,
  FiMinus,
  FiTrash2,
  FiType,
  FiUsers,
  FiActivity,
  FiPlus,
  FiSave,
  FiShare2,
  FiRotateCcw,
  FiRotateCw,
  FiMove,
  FiZoomIn,
  FiZoomOut,
  FiLayers,
  FiGrid,
  FiEye,
  FiEyeOff,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaEraser, FaFillDrip, FaHandPointer } from "react-icons/fa";
import { MdTextFields, MdGesture, MdAutoFixHigh } from "react-icons/md";

const FabricBoard = ({ projectId, username }) => {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const ctxRef = useRef(null);
  const mouseDownRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lastDrawTime = useRef(0);
  
  // Enhanced state management
  const [tool, setTool] = useState("pen");
  const [startPos, setStartPos] = useState(null);
  const [color, setColor] = useState("#3b82f6");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(4);
  const [darkMode, setDarkMode] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [cursorStyle, setCursorStyle] = useState("crosshair");
  const [fontSize, setFontSize] = useState(24);
  const [isFilled, setIsFilled] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [activeUsers, setActiveUsers] = useState([]);
  const [layers, setLayers] = useState([{ id: 'main', name: 'Main Layer', visible: true, locked: false }]);
  const [activeLayer, setActiveLayer] = useState('main');
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [shortcuts, setShortcuts] = useState({});
  const [pressureSupport, setPressureSupport] = useState(false);
  const [smoothing, setSmoothing] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  
  const cursorRef = useRef(null);
  const drawingHistory = useRef([]);
  const undoHistory = useRef([]);
  const redoHistory = useRef([]);
  const isErasing = useRef(false);
  const currentPath = useRef([]);
  const smoothingPoints = useRef([]);

  // Set theme based on darkMode state
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Custom cursor for tools
  useEffect(() => {
    if (tool === "eraser") {
      setCursorStyle("none");
      if (cursorRef.current) document.body.removeChild(cursorRef.current);

      cursorRef.current = document.createElement("div");
      cursorRef.current.style.position = "fixed";
      cursorRef.current.style.pointerEvents = "none";
      cursorRef.current.style.border = "1px dashed #666";
      cursorRef.current.style.borderRadius = "50%";
      cursorRef.current.style.zIndex = "10000";
      cursorRef.current.style.transform = "translate(-50%, -50%)";
      document.body.appendChild(cursorRef.current);
    } else if (tool === "pen" || tool === "text") {
      setCursorStyle("none");
      if (cursorRef.current) document.body.removeChild(cursorRef.current);

      cursorRef.current = document.createElement("div");
      cursorRef.current.style.position = "fixed";
      cursorRef.current.style.pointerEvents = "none";
      cursorRef.current.style.borderRadius = "50%";
      cursorRef.current.style.backgroundColor =
        tool === "pen" ? color : "transparent";
      cursorRef.current.style.border =
        tool === "text" ? "1px dashed #3b82f6" : "none";
      cursorRef.current.style.zIndex = "10000";
      cursorRef.current.style.transform = "translate(-50%, -50%)";
      document.body.appendChild(cursorRef.current);
    } else {
      setCursorStyle("crosshair");
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
        cursorRef.current = null;
      }
    }

    return () => {
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
        cursorRef.current = null;
      }
    };
  }, [tool, color, lineWidth]);

  // Mouse move for custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cursorRef.current) return;

      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;

      if (tool === "eraser") {
        const size = lineWidth * 2;
        cursorRef.current.style.width = `${size}px`;
        cursorRef.current.style.height = `${size}px`;
      } else if (tool === "pen") {
        cursorRef.current.style.width = `${lineWidth}px`;
        cursorRef.current.style.height = `${lineWidth}px`;
      } else if (tool === "text") {
        cursorRef.current.style.width = "24px";
        cursorRef.current.style.height = "24px";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [tool, lineWidth]);

  // Initialize canvas and socket
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    socketRef.current = io(`${import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL}`, {
      query: { projectId },
    });

    socketRef.current.emit("request-drawing-history", projectId);

    socketRef.current.on("drawing-history", (history) => {
      history.forEach((item) => drawFromHistory(item, false));
      setStrokeCount(history.length);
    });

    socketRef.current.on("ondraw", (data) => {
      drawFromHistory(data, false);
      setStrokeCount((prev) => prev + 1);
    });

    socketRef.current.on("onbegin", ({ x, y }) => {
      if (!ctxRef.current) return;
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
    });

    socketRef.current.on("erase", (data) => {
      eraseAtPosition(data.x, data.y, data.radius, false);
    });

    socketRef.current.on("clear-canvas", () => {
      clearCanvas(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [projectId, color, fillColor, lineWidth, isFilled]);

  // Draw from history
  const drawFromHistory = (data, save = true) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = data.color || color;
    ctx.lineWidth = data.lineWidth || lineWidth;

    if (data.fill) {
      ctx.fillStyle = data.fillColor || fillColor;
    }

    if (data.tool === "pen") {
      ctx.moveTo(data.startX, data.startY);
      ctx.lineTo(data.endX, data.endY);
      ctx.stroke();
    } else if (data.tool === "rect") {
      if (data.fill) {
        ctx.fillRect(
          data.startX,
          data.startY,
          data.endX - data.startX,
          data.endY - data.startY
        );
      }
      ctx.strokeRect(
        data.startX,
        data.startY,
        data.endX - data.startX,
        data.endY - data.startY
      );
    } else if (data.tool === "circle") {
      const radius = Math.hypot(
        data.endX - data.startX,
        data.endY - data.startY
      );
      ctx.beginPath();
      ctx.arc(data.startX, data.startY, radius, 0, Math.PI * 2);
      if (data.fill) ctx.fill();
      ctx.stroke();
    } else if (data.tool === "line") {
      ctx.beginPath();
      ctx.moveTo(data.startX, data.startY);
      ctx.lineTo(data.endX, data.endY);
      ctx.stroke();
    } else if (data.tool === "text") {
      ctx.font = `${data.fontSize}px sans-serif`;
      ctx.fillStyle = data.color || color;
      ctx.fillText(data.text, data.startX, data.startY);
    }

    // Reset to current settings
    ctx.strokeStyle = color;
    ctx.fillStyle = fillColor;

    if (save) {
      drawingHistory.current.push({
        ...data,
        color,
        lineWidth,
        fillColor,
        fill: isFilled,
      });
      socketRef.current.emit("draw", {
        ...data,
        color,
        lineWidth,
        fillColor,
        fill: isFilled,
      });
      setStrokeCount((prev) => prev + 1);
    }
  };

  // Erase elements
  const eraseAtPosition = (x, y, radius = 40, emit = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear the area
    ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2);

    // Find and remove strokes that are within the erased area
    const newHistory = drawingHistory.current.filter((stroke) => {
      if (stroke.tool === "pen") {
        const distance = Math.hypot(stroke.startX - x, stroke.startY - y);
        return distance > radius;
      } else if (stroke.tool === "text") {
        // For text, check if the click is near the text position
        return Math.hypot(stroke.startX - x, stroke.startY - y) > radius;
      } else {
        const centerX = (stroke.startX + stroke.endX) / 2;
        const centerY = (stroke.startY + stroke.endY) / 2;
        const distance = Math.hypot(centerX - x, centerY - y);
        return distance > radius;
      }
    });

    // Only update if something was erased
    if (newHistory.length < drawingHistory.current.length) {
      drawingHistory.current = newHistory;
      setStrokeCount(newHistory.length);

      // Redraw everything that wasn't erased
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawingHistory.current.forEach((stroke) => {
        drawFromHistory(stroke, false);
      });
    }

    if (emit) {
      socketRef.current.emit("erase", {
        projectId,
        x,
        y,
        radius,
      });
    }
  };

  // Mouse event handlers
  useEffect(() => {
    const canvas = canvasRef.current;

    // Get scaled coordinates
    const getScaledCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseDown = (e) => {
      mouseDownRef.current = true;
      const { x, y } = getScaledCoords(e);
      setStartPos({ x, y });

      if (tool === "pen") {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x, y);
        socketRef.current.emit("begin", { x, y });
      } else if (tool === "eraser") {
        isErasing.current = true;
        eraseAtPosition(x, y, lineWidth);
      } else if (tool === "text") {
        const text = prompt("Enter text:", "Hello World");
        if (text) {
          drawFromHistory(
            {
              tool: "text",
              startX: x,
              startY: y,
              text,
              fontSize,
            },
            true
          );
        }
      }
    };

    const handleMouseMove = (e) => {
      if (!mouseDownRef.current) return;
      const { x, y } = getScaledCoords(e);

      if (tool === "pen") {
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
        drawFromHistory(
          {
            tool: "pen",
            startX: startPos.x,
            startY: startPos.y,
            endX: x,
            endY: y,
          },
          true
        );
        setStartPos({ x, y });
      } else if (tool === "eraser" && isErasing.current) {
        eraseAtPosition(x, y, lineWidth);
      }
    };

    const handleMouseUp = (e) => {
      if (!mouseDownRef.current) return;
      mouseDownRef.current = false;
      isErasing.current = false;

      if (tool !== "pen" && tool !== "eraser" && tool !== "text") {
        const { x, y } = getScaledCoords(e);
        drawFromHistory(
          {
            tool,
            startX: startPos.x,
            startY: startPos.y,
            endX: x,
            endY: y,
            fill: isFilled,
          },
          true
        );
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [tool, startPos, color, lineWidth, isFilled, fontSize]);

  // Download as PDF
  const downloadAsPDF = () => {
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${projectId}-design.pdf`);
  };

  // Clear canvas
  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory.current = [];
    setStrokeCount(0);

    if (emit) {
      socketRef.current.emit("clear-canvas", projectId);
    }
  };

  // Tools
  const tools = [
    { id: "pen", icon: <FiPenTool size={20} />, label: "Pen" },
    { id: "rect", icon: <FiSquare size={20} />, label: "Rectangle" },
    { id: "circle", icon: <FiCircle size={20} />, label: "Circle" },
    { id: "line", icon: <FiMinus size={20} />, label: "Line" },
    { id: "text", icon: <FiType size={20} />, label: "Text" },
    { id: "eraser", icon: <FaEraser size={20} />, label: "Eraser" },
  ];

  // Color options
  const colors = [
    "#ef4444", // red
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#000000", // black
    "#ffffff", // white
  ];

  // Fill colors
  const fillColors = [
    "#ffffff", // white
    "#fef3c7", // light yellow
    "#dbeafe", // light blue
    "#dcfce7", // light green
    "#fce7f3", // light pink
    "#ede9fe", // light purple
    "#ffedd5", // light orange
    "#000000", // black
  ];

  return (
    <div className="flex flex-col items-center w-full  p-4 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {username ? `${username}'s Canvas` : `Project ${projectId}`}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time collaborative design board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <FiSun className="text-yellow-400" size={24} />
            ) : (
              <FiMoon className="text-indigo-700" size={24} />
            )}
          </button>

          <button
            onClick={downloadAsPDF}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            <FiDownload size={18} />
            <span className="font-medium">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Tools Panel */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg flex lg:flex-col gap-3 flex-wrap border border-white/30">
          {tools.map((t) => (
            <button
              key={t.id}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                tool === t.id
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-inner"
                  : "bg-white/70 dark:bg-gray-700/70 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 shadow"
              }`}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              <span>{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}

          <div className="flex lg:flex-col gap-3 mt-auto">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 px-1">
                  {tool === "eraser" ? "Eraser Size" : "Size"}
                </span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {lineWidth}px
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={tool === "eraser" ? "60" : "20"}
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />

              {tool === "text" && (
                <>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 px-1">
                      Font Size
                    </span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </>
              )}

              {tool !== "eraser" && tool !== "text" && (
                <button
                  onClick={() => setIsFilled(!isFilled)}
                  className={`p-2 rounded-lg flex items-center justify-center gap-1 mt-2 ${
                    isFilled
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <FaFillDrip size={16} />
                  <span className="text-xs">Fill</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap gap-3 mb-4">
            {tool !== "eraser" && (
              <div className="flex flex-col gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 shadow border border-white/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stroke:
                  </span>
                  <div className="flex gap-1">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          color === c
                            ? "border-gray-800 dark:border-gray-300 ring-2 ring-blue-500 ring-offset-2 scale-110"
                            : "border-gray-300 dark:border-gray-600 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {isFilled && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fill:
                    </span>
                    <div className="flex gap-1">
                      {fillColors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setFillColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            fillColor === c
                              ? "border-gray-800 dark:border-gray-300 ring-2 ring-blue-500 ring-offset-2 scale-110"
                              : "border-gray-300 dark:border-gray-600 hover:scale-105"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={clearCanvas}
              className="px-5 py-2.5 flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:opacity-90"
            >
              <FiTrash2 size={18} />
              <span className="font-medium">Clear Canvas</span>
            </button>
          </div>

          <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-4 flex-1 border border-indigo-200 dark:border-gray-700">
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 shadow">
              {tool === "eraser"
                ? "Eraser"
                : tool.charAt(0).toUpperCase() + tool.slice(1)}{" "}
              tool
            </div>

            <canvas
              ref={canvasRef}
              width={1200}
              height={700}
              style={{ cursor: cursorStyle }}
              className={`w-full h-full bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-200 dark:border-gray-700 shadow-inner transition-all`}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="w-full mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow border border-white/30">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {strokeCount} strokes • Real-time sync active
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>
          Collaborate in real-time with your team. All changes are synchronized
          instantly.
        </p>
      </footer>
    </div>
  );
};

export default FabricBoard;
