import { useEffect, useRef, useState } from "react";
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
} from "react-icons/fi";
import { FaEraser, FaFillDrip } from "react-icons/fa";
import { MdTextFields } from "react-icons/md";

const FabricBoard = ({ projectId, username }) => {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const ctxRef = useRef(null);
  const mouseDownRef = useRef(false);
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
  const cursorRef = useRef(null);

  const drawingHistory = useRef([]);
  const isErasing = useRef(false);

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

    socketRef.current = io("http://localhost:8000", {
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


// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import jsPDF from "jspdf";
// import {
//   FiMoon,
//   FiSun,
//   FiDownload,
//   FiPenTool,
//   FiSquare,
//   FiCircle,
//   FiMinus,
//   FiTrash2,
//   FiType,
//   FiUser,
//   FiActivity,
//   FiPlus,
//   FiSave,
//   FiShare2,
// } from "react-icons/fi";
// import { FaEraser, FaFillDrip } from "react-icons/fa";
// import { MdTextFields } from "react-icons/md";

// const FabricBoard = ({ projectId, username }) => {
//   const canvasRef = useRef(null);
//   const socketRef = useRef(null);
//   const ctxRef = useRef(null);
//   const mouseDownRef = useRef(false);
//   const [tool, setTool] = useState("pen");
//   const [startPos, setStartPos] = useState(null);
//   const [color, setColor] = useState("#3b82f6");
//   const [fillColor, setFillColor] = useState("#ffffff");
//   const [lineWidth, setLineWidth] = useState(4);
//   const [darkMode, setDarkMode] = useState(false);
//   const [strokeCount, setStrokeCount] = useState(0);
//   const [cursorStyle, setCursorStyle] = useState("crosshair");
//   const [fontSize, setFontSize] = useState(24);
//   const [isFilled, setIsFilled] = useState(false);
//   const cursorRef = useRef(null);

//   const drawingHistory = useRef([]);
//   const isErasing = useRef(false);

//   // Set theme based on darkMode state
//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   // Custom cursor for tools
//   useEffect(() => {
//     if (tool === "eraser") {
//       setCursorStyle("none");
//       if (cursorRef.current) document.body.removeChild(cursorRef.current);

//       cursorRef.current = document.createElement("div");
//       cursorRef.current.style.position = "fixed";
//       cursorRef.current.style.pointerEvents = "none";
//       cursorRef.current.style.border = "1px dashed #666";
//       cursorRef.current.style.borderRadius = "50%";
//       cursorRef.current.style.zIndex = "10000";
//       cursorRef.current.style.transform = "translate(-50%, -50%)";
//       document.body.appendChild(cursorRef.current);
//     } else if (tool === "pen" || tool === "text") {
//       setCursorStyle("none");
//       if (cursorRef.current) document.body.removeChild(cursorRef.current);

//       cursorRef.current = document.createElement("div");
//       cursorRef.current.style.position = "fixed";
//       cursorRef.current.style.pointerEvents = "none";
//       cursorRef.current.style.borderRadius = "50%";
//       cursorRef.current.style.backgroundColor =
//         tool === "pen" ? color : "transparent";
//       cursorRef.current.style.border =
//         tool === "text" ? "1px dashed #3b82f6" : "none";
//       cursorRef.current.style.zIndex = "10000";
//       cursorRef.current.style.transform = "translate(-50%, -50%)";
//       document.body.appendChild(cursorRef.current);
//     } else {
//       setCursorStyle("crosshair");
//       if (cursorRef.current) {
//         document.body.removeChild(cursorRef.current);
//         cursorRef.current = null;
//       }
//     }

//     return () => {
//       if (cursorRef.current) {
//         document.body.removeChild(cursorRef.current);
//         cursorRef.current = null;
//       }
//     };
//   }, [tool, color, lineWidth]);

//   // Mouse move for custom cursor
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       if (!cursorRef.current) return;

//       cursorRef.current.style.left = `${e.clientX}px`;
//       cursorRef.current.style.top = `${e.clientY}px`;

//       if (tool === "eraser") {
//         const size = lineWidth * 2;
//         cursorRef.current.style.width = `${size}px`;
//         cursorRef.current.style.height = `${size}px`;
//       } else if (tool === "pen") {
//         cursorRef.current.style.width = `${lineWidth}px`;
//         cursorRef.current.style.height = `${lineWidth}px`;
//       } else if (tool === "text") {
//         cursorRef.current.style.width = "24px";
//         cursorRef.current.style.height = "24px";
//       }
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, [tool, lineWidth]);

//   // Initialize canvas and socket
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.lineWidth = lineWidth;
//     ctx.strokeStyle = color;
//     ctx.lineCap = "round";
//     ctxRef.current = ctx;

//     socketRef.current = io("http://localhost:8000", {
//       query: { projectId },
//     });

//     socketRef.current.emit("request-drawing-history", projectId);

//     socketRef.current.on("drawing-history", (history) => {
//       history.forEach((item) => drawFromHistory(item, false));
//       setStrokeCount(history.length);
//     });

//     socketRef.current.on("ondraw", (data) => {
//       drawFromHistory(data, false);
//       setStrokeCount((prev) => prev + 1);
//     });

//     socketRef.current.on("onbegin", ({ x, y }) => {
//       if (!ctxRef.current) return;
//       ctxRef.current.beginPath();
//       ctxRef.current.moveTo(x, y);
//     });

//     socketRef.current.on("erase", (data) => {
//       eraseAtPosition(data.x, data.y, data.radius, false);
//     });

//     socketRef.current.on("clear-canvas", () => {
//       clearCanvas(false);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [projectId, color, fillColor, lineWidth, isFilled]);

//   // Draw from history
//   const drawFromHistory = (data, save = true) => {
//     const ctx = ctxRef.current;
//     if (!ctx) return;

//     ctx.beginPath();
//     ctx.strokeStyle = data.color || color;
//     ctx.lineWidth = data.lineWidth || lineWidth;

//     if (data.fill) {
//       ctx.fillStyle = data.fillColor || fillColor;
//     }

//     if (data.tool === "pen") {
//       ctx.moveTo(data.startX, data.startY);
//       ctx.lineTo(data.endX, data.endY);
//       ctx.stroke();
//     } else if (data.tool === "rect") {
//       if (data.fill) {
//         ctx.fillRect(
//           data.startX,
//           data.startY,
//           data.endX - data.startX,
//           data.endY - data.startY
//         );
//       }
//       ctx.strokeRect(
//         data.startX,
//         data.startY,
//         data.endX - data.startX,
//         data.endY - data.startY
//       );
//     } else if (data.tool === "circle") {
//       const radius = Math.hypot(
//         data.endX - data.startX,
//         data.endY - data.startY
//       );
//       ctx.beginPath();
//       ctx.arc(data.startX, data.startY, radius, 0, Math.PI * 2);
//       if (data.fill) ctx.fill();
//       ctx.stroke();
//     } else if (data.tool === "line") {
//       ctx.beginPath();
//       ctx.moveTo(data.startX, data.startY);
//       ctx.lineTo(data.endX, data.endY);
//       ctx.stroke();
//     } else if (data.tool === "text") {
//       ctx.font = `${data.fontSize}px sans-serif`;
//       ctx.fillStyle = data.color || color;
//       ctx.fillText(data.text, data.startX, data.startY);
//     }

//     // Reset to current settings
//     ctx.strokeStyle = color;
//     ctx.fillStyle = fillColor;

//     if (save) {
//       drawingHistory.current.push({
//         ...data,
//         color,
//         lineWidth,
//         fillColor,
//         fill: isFilled,
//       });
//       socketRef.current.emit("draw", {
//         ...data,
//         color,
//         lineWidth,
//         fillColor,
//         fill: isFilled,
//       });
//       setStrokeCount((prev) => prev + 1);
//     }
//   };

//   // Erase elements
//   const eraseAtPosition = (x, y, radius = 40, emit = true) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     // Clear the area
//     ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2);

//     // Find and remove strokes that are within the erased area
//     const newHistory = drawingHistory.current.filter((stroke) => {
//       if (stroke.tool === "pen") {
//         const distance = Math.hypot(stroke.startX - x, stroke.startY - y);
//         return distance > radius;
//       } else if (stroke.tool === "text") {
//         // For text, check if the click is near the text position
//         return Math.hypot(stroke.startX - x, stroke.startY - y) > radius;
//       } else {
//         const centerX = (stroke.startX + stroke.endX) / 2;
//         const centerY = (stroke.startY + stroke.endY) / 2;
//         const distance = Math.hypot(centerX - x, centerY - y);
//         return distance > radius;
//       }
//     });

//     // Only update if something was erased
//     if (newHistory.length < drawingHistory.current.length) {
//       drawingHistory.current = newHistory;
//       setStrokeCount(newHistory.length);

//       // Redraw everything that wasn't erased
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       drawingHistory.current.forEach((stroke) => {
//         drawFromHistory(stroke, false);
//       });
//     }

//     if (emit) {
//       socketRef.current.emit("erase", {
//         projectId,
//         x,
//         y,
//         radius,
//       });
//     }
//   };

//   // Mouse event handlers
//   useEffect(() => {
//     const canvas = canvasRef.current;

//     // Get scaled coordinates
//     const getScaledCoords = (e) => {
//       const rect = canvas.getBoundingClientRect();
//       const scaleX = canvas.width / rect.width;
//       const scaleY = canvas.height / rect.height;
//       return {
//         x: (e.clientX - rect.left) * scaleX,
//         y: (e.clientY - rect.top) * scaleY,
//       };
//     };

//     const handleMouseDown = (e) => {
//       mouseDownRef.current = true;
//       const { x, y } = getScaledCoords(e);
//       setStartPos({ x, y });

//       if (tool === "pen") {
//         ctxRef.current.beginPath();
//         ctxRef.current.moveTo(x, y);
//         socketRef.current.emit("begin", { x, y });
//       } else if (tool === "eraser") {
//         isErasing.current = true;
//         eraseAtPosition(x, y, lineWidth);
//       } else if (tool === "text") {
//         const text = prompt("Enter text:", "Hello World");
//         if (text) {
//           drawFromHistory(
//             {
//               tool: "text",
//               startX: x,
//               startY: y,
//               text,
//               fontSize,
//             },
//             true
//           );
//         }
//       }
//     };

//     const handleMouseMove = (e) => {
//       if (!mouseDownRef.current) return;
//       const { x, y } = getScaledCoords(e);

//       if (tool === "pen") {
//         ctxRef.current.lineTo(x, y);
//         ctxRef.current.stroke();
//         drawFromHistory(
//           {
//             tool: "pen",
//             startX: startPos.x,
//             startY: startPos.y,
//             endX: x,
//             endY: y,
//           },
//           true
//         );
//         setStartPos({ x, y });
//       } else if (tool === "eraser" && isErasing.current) {
//         eraseAtPosition(x, y, lineWidth);
//       }
//     };

//     const handleMouseUp = (e) => {
//       if (!mouseDownRef.current) return;
//       mouseDownRef.current = false;
//       isErasing.current = false;

//       if (tool !== "pen" && tool !== "eraser" && tool !== "text") {
//         const { x, y } = getScaledCoords(e);
//         drawFromHistory(
//           {
//             tool,
//             startX: startPos.x,
//             startY: startPos.y,
//             endX: x,
//             endY: y,
//             fill: isFilled,
//           },
//           true
//         );
//       }
//     };

//     canvas.addEventListener("mousedown", handleMouseDown);
//     canvas.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseup", handleMouseUp);

//     return () => {
//       canvas.removeEventListener("mousedown", handleMouseDown);
//       canvas.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [tool, startPos, color, lineWidth, isFilled, fontSize]);

//   // Download as PDF
//   const downloadAsPDF = () => {
//     const canvas = canvasRef.current;
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);
//     pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
//     pdf.save(`${projectId}-design.pdf`);
//   };

//   // Clear canvas
//   const clearCanvas = (emit = true) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     drawingHistory.current = [];
//     setStrokeCount(0);

//     if (emit) {
//       socketRef.current.emit("clear-canvas", projectId);
//     }
//   };

//   // Tools
//   const tools = [
//     { id: "pen", icon: <FiPenTool size={20} />, label: "Pen" },
//     { id: "rect", icon: <FiSquare size={20} />, label: "Rectangle" },
//     { id: "circle", icon: <FiCircle size={20} />, label: "Circle" },
//     { id: "line", icon: <FiMinus size={20} />, label: "Line" },
//     { id: "text", icon: <FiType size={20} />, label: "Text" },
//     { id: "eraser", icon: <FaEraser size={20} />, label: "Eraser" },
//   ];

//   // Color options
//   const colors = [
//     "#ef4444", // red
//     "#3b82f6", // blue
//     "#10b981", // green
//     "#f59e0b", // amber
//     "#8b5cf6", // violet
//     "#ec4899", // pink
//     "#000000", // black
//     "#ffffff", // white
//   ];

//   // Fill colors
//   const fillColors = [
//     "#ffffff", // white
//     "#fef3c7", // light yellow
//     "#dbeafe", // light blue
//     "#dcfce7", // light green
//     "#fce7f3", // light pink
//     "#ede9fe", // light purple
//     "#ffedd5", // light orange
//     "#000000", // black
//   ];

//   return (
//     // <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-6 min-h-screen relative overflow-hidden">
//     //   {/* Animated Background */}
//     //   <div className="absolute inset-0 -z-10">
//     //     <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800"></div>
//     //     <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
//     //     <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
//     //     <div className="absolute bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
//     //   </div>

//     //   <style jsx>{`
//     //     @keyframes blob {
//     //       0% {
//     //         transform: translate(0px, 0px) scale(1);
//     //       }
//     //       33% {
//     //         transform: translate(30px, -50px) scale(1.1);
//     //       }
//     //       66% {
//     //         transform: translate(-20px, 20px) scale(0.9);
//     //       }
//     //       100% {
//     //         transform: translate(0px, 0px) scale(1);
//     //       }
//     //     }
//     //     .animate-blob {
//     //       animation: blob 7s infinite;
//     //     }
//     //     .animation-delay-2000 {
//     //       animation-delay: 2s;
//     //     }
//     //     .animation-delay-4000 {
//     //       animation-delay: 4s;
//     //     }
//     //   `}</style>

//     //   {/* Header with glassmorphism effect */}
//     //   <div className="w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 mb-8 shadow-2xl">
//     //     <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
//     //       <div className="flex items-center gap-4">
//     //         <div className="relative">
//     //           <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
//     //           <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl">
//     //             <span className="text-white font-bold text-2xl">✨</span>
//     //           </div>
//     //         </div>
//     //         <div>
//     //           <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
//     //             {username ? `${username}'s Canvas` : `Creative Studio`}
//     //           </h1>
//     //           <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
//     //             ✨ Real-time collaborative design board
//     //           </p>
//     //         </div>
//     //       </div>

//     //       <div className="flex items-center gap-4">
//     //         <button
//     //           onClick={() => setDarkMode(!darkMode)}
//     //           className="group relative p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-110"
//     //           aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//     //         >
//     //           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
//     //           <div className="relative">
//     //             {darkMode ? (
//     //               <FiSun className="text-yellow-300" size={24} />
//     //             ) : (
//     //               <FiMoon className="text-white" size={24} />
//     //             )}
//     //           </div>
//     //         </button>

//     //         <button
//     //           onClick={downloadAsPDF}
//     //           className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl flex items-center gap-3 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
//     //         >
//     //           <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
//     //           <div className="relative flex items-center gap-3">
//     //             <FiDownload size={20} />
//     //             <span className="font-bold">Export PDF</span>
//     //           </div>
//     //         </button>
//     //       </div>
//     //     </div>
//     //   </div>

//     //   {/* Main Content */}
//     //   <div className="w-full flex flex-col xl:flex-row gap-8">
//     //     {/* Enhanced Tools Panel */}
//     //     <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-2xl flex xl:flex-col gap-4 flex-wrap">
//     //       <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
//     //         {tools.map((t, index) => (
//     //           <button
//     //             key={t.id}
//     //             className={`group relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${
//     //               tool === t.id
//     //                 ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl scale-105"
//     //                 : "bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-600/70 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl"
//     //             }`}
//     //             onClick={() => setTool(t.id)}
//     //             title={t.label}
//     //             style={{ animationDelay: `${index * 100}ms` }}
//     //           >
//     //             {tool === t.id && (
//     //               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl blur opacity-75"></div>
//     //             )}
//     //             <div className="relative">
//     //               <span className="text-2xl">{t.icon}</span>
//     //               <span className="text-sm font-bold mt-1">{t.label}</span>
//     //             </div>
//     //           </button>
//     //         ))}
//     //       </div>

//     //       <div className="border-t border-white/20 pt-6 mt-6">
//     //         <div className="space-y-6">
//     //           <div className="bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-2xl p-4">
//     //             <div className="flex items-center justify-between mb-3">
//     //               <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
//     //                 {tool === "eraser" ? "🧹 Eraser Size" : "📏 Brush Size"}
//     //               </span>
//     //               <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
//     //                 {lineWidth}px
//     //               </span>
//     //             </div>
//     //             <input
//     //               type="range"
//     //               min="1"
//     //               max={tool === "eraser" ? "60" : "20"}
//     //               value={lineWidth}
//     //               onChange={(e) => setLineWidth(parseInt(e.target.value))}
//     //               className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-full appearance-none cursor-pointer slider"
//     //             />
//     //           </div>

//     //           {tool === "text" && (
//     //             <div className="bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-2xl p-4">
//     //               <div className="flex items-center justify-between mb-3">
//     //                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
//     //                   🔤 Font Size
//     //                 </span>
//     //                 <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
//     //                   {fontSize}px
//     //                 </span>
//     //               </div>
//     //               <input
//     //                 type="range"
//     //                 min="12"
//     //                 max="72"
//     //                 value={fontSize}
//     //                 onChange={(e) => setFontSize(parseInt(e.target.value))}
//     //                 className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 rounded-full appearance-none cursor-pointer slider"
//     //               />
//     //             </div>
//     //           )}

//     //           {tool !== "eraser" && tool !== "text" && (
//     //             <button
//     //               onClick={() => setIsFilled(!isFilled)}
//     //               className={`w-full p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 ${
//     //                 isFilled
//     //                   ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-xl"
//     //                   : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/70 shadow-lg hover:shadow-xl"
//     //               }`}
//     //             >
//     //               <FaFillDrip size={20} />
//     //               <span className="font-bold">{isFilled ? "🎨 Filled" : "Fill Mode"}</span>
//     //             </button>
//     //           )}
//     //         </div>
//     //       </div>
//     //     </div>

//     //     {/* Enhanced Canvas Area */}
//     //     <div className="flex-1 flex flex-col">
//     //       {/* Color Palette */}
//     //       <div className="flex flex-wrap gap-4 mb-6">
//     //         {tool !== "eraser" && (
//     //           <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl">
//     //             <div className="space-y-4">
//     //               <div className="flex flex-wrap items-center gap-4">
//     //                 <span className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
//     //                   🎨 Colors:
//     //                 </span>
//     //                 <div className="flex flex-wrap gap-2">
//     //                   {colors.map((c, index) => (
//     //                     <button
//     //                       key={c}
//     //                       onClick={() => setColor(c)}
//     //                       className={`w-10 h-10 rounded-2xl border-3 transition-all duration-300 transform hover:scale-125 ${
//     //                         color === c
//     //                           ? "border-gray-800 dark:border-gray-300 ring-4 ring-blue-500 ring-offset-2 scale-125 shadow-2xl"
//     //                           : "border-gray-300 dark:border-gray-600 hover:shadow-xl"
//     //                       }`}
//     //                       style={{ 
//     //                         backgroundColor: c,
//     //                         animationDelay: `${index * 50}ms`
//     //                       }}
//     //                       title={c}
//     //                     />
//     //                   ))}
//     //                 </div>
//     //               </div>

//     //               {isFilled && (
//     //                 <div className="flex flex-wrap items-center gap-4">
//     //                   <span className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
//     //                     🌈 Fill:
//     //                   </span>
//     //                   <div className="flex flex-wrap gap-2">
//     //                     {fillColors.map((c, index) => (
//     //                       <button
//     //                         key={c}
//     //                         onClick={() => setFillColor(c)}
//     //                         className={`w-10 h-10 rounded-2xl border-3 transition-all duration-300 transform hover:scale-125 ${
//     //                           fillColor === c
//     //                             ? "border-gray-800 dark:border-gray-300 ring-4 ring-purple-500 ring-offset-2 scale-125 shadow-2xl"
//     //                             : "border-gray-300 dark:border-gray-600 hover:shadow-xl"
//     //                         }`}
//     //                         style={{ 
//     //                           backgroundColor: c,
//     //                           animationDelay: `${index * 50}ms`
//     //                         }}
//     //                         title={c}
//     //                       />
//     //                     ))}
//     //                   </div>
//     //                 </div>
//     //               )}
//     //             </div>
//     //           </div>
//     //         )}

//     //         <button
//     //           onClick={clearCanvas}
//     //           className="group relative px-8 py-4 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-3xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
//     //         >
//     //           <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 rounded-3xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
//     //           <div className="relative flex items-center gap-3">
//     //             <FiTrash2 size={20} />
//     //             <span className="font-bold">🗑️ Clear All</span>
//     //           </div>
//     //         </button>
//     //       </div>

//     //       {/* Enhanced Canvas Container */}
//     //       <div className="relative bg-gradient-to-br from-indigo-100/50 via-purple-50/50 to-pink-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6 flex-1 border-2 border-white/40 overflow-hidden">
//     //         {/* Floating Tool Indicator */}
//     //         <div className="absolute top-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/30">
//     //           <div className="flex items-center gap-3">
//     //             <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
//     //             <span className="font-bold text-lg">
//     //               {tool === "eraser" ? "🧹" : tool === "pen" ? "✏️" : tool === "text" ? "📝" : "🎨"} 
//     //               {tool.charAt(0).toUpperCase() + tool.slice(1)} Mode
//     //             </span>
//     //           </div>
//     //         </div>

//     //         {/* Canvas with enhanced styling */}
//     //         <div className="relative h-full rounded-2xl overflow-hidden shadow-inner bg-white dark:bg-gray-800 border-4 border-gradient-to-r from-indigo-200 to-purple-200 dark:from-gray-600 dark:to-gray-500">
//     //           <canvas
//     //             ref={canvasRef}
//     //             width={1200}
//     //             height={700}
//     //             style={{ cursor: cursorStyle }}
//     //             className="w-full h-full transition-all duration-300 hover:shadow-2xl"
//     //           />
              
//     //           {/* Canvas Overlay Effects */}
//     //           <div className="absolute inset-0 pointer-events-none">
//     //             <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-blue-400 opacity-30"></div>
//     //             <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-purple-400 opacity-30"></div>
//     //             <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-400 opacity-30"></div>
//     //             <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-pink-400 opacity-30"></div>
//     //           </div>
//     //         </div>
//     //       </div>
//     //     </div>
//     //   </div>

//     //   {/* Enhanced Status Bar */}
//     //   <div className="w-full mt-8 text-center">
//     //     <div className="inline-flex items-center gap-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl border border-white/40">
//     //       <div className="flex items-center gap-3">
//     //         <div className="relative">
//     //           <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg"></div>
//     //           <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-ping opacity-75"></div>
//     //         </div>
//     //         <span className="font-bold text-gray-700 dark:text-gray-300">Live Sync Active</span>
//     //       </div>
          
//     //       <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-700/40 px-4 py-2 rounded-2xl">
//     //         <span className="text-2xl">🎨</span>
//     //         <span className="font-bold text-gray-700 dark:text-gray-300">{strokeCount} Strokes</span>
//     //       </div>
          
//     //       <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-2xl">
//     //         <span className="text-2xl">👥</span>
//     //         <span className="font-bold text-gray-700 dark:text-gray-300">Collaborative</span>
//     //       </div>
//     //     </div>
//     //   </div>

//     //   {/* Enhanced Footer */}
//     //   <footer className="mt-12 text-center max-w-2xl">
//     //     <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
//     //       <div className="flex items-center justify-center gap-3 mb-4">
//     //         <span className="text-3xl">✨</span>
//     //         <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//     //           Creative Collaboration
//     //         </h3>
//     //         <span className="text-3xl">🚀</span>
//     //       </div>
//     //       <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
//     //         Experience the magic of real-time collaboration. Every stroke, every idea, 
//     //         synchronized instantly across all connected users. Create, share, and inspire together! 🎨✨
//     //       </p>
          
//     //       <div className="flex flex-wrap justify-center gap-4 mt-6">
//     //         <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 rounded-2xl">
//     //           <span className="text-xl">⚡</span>
//     //           <span className="font-semibold text-gray-700 dark:text-gray-300">Real-time Sync</span>
//     //         </div>
//     //         <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-teal-500/10 px-4 py-2 rounded-2xl">
//     //           <span className="text-xl">🎯</span>
//     //           <span className="font-semibold text-gray-700 dark:text-gray-300">Precision Tools</span>
//     //         </div>
//     //         <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 px-4 py-2 rounded-2xl">
//     //           <span className="text-xl">🎨</span>
//     //           <span className="font-semibold text-gray-700 dark:text-gray-300">Unlimited Colors</span>
//     //         </div>
//     //       </div>
//     //     </div>
//     //   </footer>

//     //   {/* Additional CSS for enhanced slider styling */}
//     //   <style jsx>{`
//     //     .slider::-webkit-slider-thumb {
//     //       appearance: none;
//     //       height: 24px;
//     //       width: 24px;
//     //       border-radius: 50%;
//     //       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//     //       cursor: pointer;
//     //       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//     //       border: 3px solid white;
//     //       transition: all 0.3s ease;
//     //     }
        
//     //     .slider::-webkit-slider-thumb:hover {
//     //       transform: scale(1.2);
//     //       box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
//     //     }
        
//     //     .slider::-moz-range-thumb {
//     //       height: 24px;
//     //       width: 24px;
//     //       border-radius: 50%;
//     //       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//     //       cursor: pointer;
//     //       border: 3px solid white;
//     //       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//     //     }
//     //   `}</style>
//     // </div>
//     <div className="flex flex-col items-center w-full  p-4 md:p-6 min-h-screen relative overflow-hidden">
//   {/* Enhanced Animated Background with Mobile Optimization */}
//   <div className="absolute inset-0 -z-10 overflow-hidden">
//     <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800"></div>
//     <div className="absolute top-0 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
//     <div className="absolute top-0 right-1/4 w-48 h-48 md:w-72 md:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
//     <div className="absolute bottom-8 left-1/3 w-48 h-48 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
//   </div>

//   <style jsx>{`
//     @keyframes blob {
//       0%, 100% {
//         transform: translate(0px, 0px) scale(1);
//       }
//       33% {
//         transform: translate(20px, -30px) scale(1.1);
//       }
//       66% {
//         transform: translate(-15px, 15px) scale(0.9);
//       }
//     }
//     .animate-blob {
//       animation: blob 7s infinite ease-in-out;
//     }
//     .animation-delay-2000 {
//       animation-delay: 2s;
//     }
//     .animation-delay-4000 {
//       animation-delay: 4s;
//     }
//   `}</style>

//   {/* Mobile-Optimized Header with Floating Action Button */}
//   <div className="w-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/30 rounded-3xl p-4 md:p-6 mb-6 shadow-xl">
//     <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//       <div className="flex items-center gap-3 w-full sm:w-auto">
//         <div className="relative">
//           <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl md:rounded-2xl blur opacity-75 transition duration-300"></div>
//           <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
//             <span className="text-white font-bold text-xl md:text-2xl">✨</span>
//           </div>
//         </div>
//         <div className="flex-1 min-w-0">
//           <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
//             {username ? `${username}'s Canvas` : `Creative Studio`}
//           </h1>
//           <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 font-medium truncate">
//             ✨ Real-time collaborative design board
//           </p>
//         </div>
//       </div>

//       {/* Mobile Collapsible Actions */}
//       <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className="group relative p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
//           aria-label={darkMode ? "Light mode" : "Dark mode"}
//         >
//           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
//           <div className="relative">
//             {darkMode ? (
//               <FiSun className="text-yellow-300" size={20} />
//             ) : (
//               <FiMoon className="text-white" size={20} />
//             )}
//           </div>
//         </button>

//         <button
//           onClick={downloadAsPDF}
//           className="group relative flex-1 md:flex-none px-4 py-2 md:px-8 md:py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
//         >
//           <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
//           <div className="relative flex items-center gap-2 md:gap-3">
//             <FiDownload size={16} />
//             <span className="text-sm md:text-base font-bold">Export</span>
//           </div>
//         </button>
//       </div>
//     </div>
//   </div>

//   {/* Main Content - Mobile First Layout */}
//   <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-6">
//     {/* Mobile-Optimized Tools Panel (Horizontal Scroll on Mobile) */}
//     <div className="lg:w-20 xl:w-64 flex lg:flex-col gap-2 md:gap-4 overflow-x-auto lg:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
//       <div className="flex lg:flex-col gap-2 md:gap-4 min-w-max lg:min-w-0">
//         {tools.map((t) => (
//           <button
//             key={t.id}
//             className={`group relative p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 md:gap-2 transition-all duration-300 transform hover:scale-105 min-w-[70px] ${
//               tool === t.id
//                 ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-[1.02]"
//                 : "bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-600/70 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md"
//             }`}
//             onClick={() => setTool(t.id)}
//             title={t.label}
//           >
//             {tool === t.id && (
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl md:rounded-2xl blur opacity-75"></div>
//             )}
//             <div className="relative flex flex-col items-center">
//               <span className="text-xl md:text-2xl">{t.icon}</span>
//               <span className="text-xs md:text-sm font-medium">{t.label}</span>
//             </div>
//           </button>
//         ))}
//       </div>

//       {/* Settings Panel - Collapsible on Mobile */}
//       <div className="bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 flex lg:flex-col items-center gap-3 md:gap-4">
//         <div className="flex-1 min-w-[150px] md:min-w-0">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
//               {tool === "eraser" ? "🧹 Size" : "📏 Size"}
//             </span>
//             <span className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
//               {lineWidth}px
//             </span>
//           </div>
//           <input
//             type="range"
//             min="1"
//             max={tool === "eraser" ? "60" : "20"}
//             value={lineWidth}
//             onChange={(e) => setLineWidth(parseInt(e.target.value))}
//             className="w-full h-2 md:h-3 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-full appearance-none cursor-pointer slider"
//           />
//         </div>

//         {tool !== "eraser" && tool !== "text" && (
//           <button
//             onClick={() => setIsFilled(!isFilled)}
//             className={`p-2 md:p-3 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 ${
//               isFilled
//                 ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
//                 : "bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/70 shadow-sm hover:shadow-md"
//             }`}
//           >
//             <FaFillDrip size={16} className="md:size-5" />
//           </button>
//         )}
//       </div>
//     </div>

//     {/* Enhanced Canvas Area */}
//     <div className="flex-1 flex flex-col gap-3 md:gap-6">
//       {/* Mobile-Optimized Color Palette */}
//       {tool !== "eraser" && (
//         <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/40 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-md">
//           <div className="flex flex-col gap-3">
//             <div className="flex items-center gap-2">
//               <span className="text-sm md:text-base font-bold text-gray-700 dark:text-gray-300">
//                 🎨 Colors:
//               </span>
//               <div className="flex-1 overflow-x-auto scrollbar-hide">
//                 <div className="flex gap-1 md:gap-2 min-w-max">
//                   {colors.map((c) => (
//                     <button
//                       key={c}
//                       onClick={() => setColor(c)}
//                       className={`size-8 md:size-10 rounded-xl md:rounded-2xl border-2 transition-all duration-300 transform hover:scale-110 ${
//                         color === c
//                           ? "border-gray-800 dark:border-gray-300 ring-2 md:ring-4 ring-blue-500 scale-110 shadow-md"
//                           : "border-gray-300 dark:border-gray-600 hover:shadow-sm"
//                       }`}
//                       style={{ backgroundColor: c }}
//                       title={c}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {isFilled && (
//               <div className="flex items-center gap-2">
//                 <span className="text-sm md:text-base font-bold text-gray-700 dark:text-gray-300">
//                   🌈 Fill:
//                 </span>
//                 <div className="flex-1 overflow-x-auto scrollbar-hide">
//                   <div className="flex gap-1 md:gap-2 min-w-max">
//                     {fillColors.map((c) => (
//                       <button
//                         key={c}
//                         onClick={() => setFillColor(c)}
//                         className={`size-8 md:size-10 rounded-xl md:rounded-2xl border-2 transition-all duration-300 transform hover:scale-110 ${
//                           fillColor === c
//                             ? "border-gray-800 dark:border-gray-300 ring-2 md:ring-4 ring-purple-500 scale-110 shadow-md"
//                             : "border-gray-300 dark:border-gray-600 hover:shadow-sm"
//                         }`}
//                         style={{ backgroundColor: c }}
//                         title={c}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Canvas Container with Floating Actions */}
//       <div className="relative bg-gradient-to-br from-indigo-100/50 via-purple-50/50 to-pink-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-4 flex-1 border border-white/40 overflow-hidden">
//         {/* Floating Clear Button (Mobile) */}
//         <button
//           onClick={clearCanvas}
//           className="lg:hidden absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-rose-500 text-white p-2 rounded-xl shadow-lg transform hover:scale-110 transition-all"
//         >
//           <FiTrash2 size={18} />
//         </button>

//         {/* Floating Tool Indicator */}
//         <div className="hidden md:flex absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-white/30 z-10">
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
//             <span className="font-medium text-sm">
//               {tool === "eraser" ? "🧹" : tool === "pen" ? "✏️" : tool === "text" ? "📝" : "🎨"} 
//               {tool.charAt(0).toUpperCase() + tool.slice(1)}
//             </span>
//           </div>
//         </div>

//         {/* Canvas with Responsive Sizing */}
//         <div className="relative h-full rounded-xl md:rounded-2xl overflow-hidden shadow-inner bg-white dark:bg-gray-800 border-2 md:border-4 border-indigo-100 dark:border-gray-600">
//           <canvas
//             ref={canvasRef}
//             width={window.innerWidth > 768 ? 1200 : 600}
//             height={window.innerWidth > 768 ? 700 : 400}
//             style={{ cursor: cursorStyle }}
//             className="w-full h-full touch-none"
//           />
          
//           {/* Canvas Decorative Corners */}
//           <div className="absolute inset-0 pointer-events-none">
//             <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-blue-400 opacity-30"></div>
//             <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-400 opacity-30"></div>
//             <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-green-400 opacity-30"></div>
//             <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-pink-400 opacity-30"></div>
//           </div>
//         </div>
//       </div>

//       {/* Clear Button (Desktop) */}
//       <button
//         onClick={clearCanvas}
//         className="hidden lg:flex group relative px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl items-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] self-end"
//       >
//         <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
//         <div className="relative flex items-center gap-2">
//           <FiTrash2 size={18} />
//           <span className="font-bold text-sm">Clear Canvas</span>
//         </div>
//       </button>
//     </div>
//   </div>

//   {/* Mobile Bottom Navigation */}
//   <div className="lg:hidden fixed bottom-4 left-0 right-0 px-4 z-20">
//     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/30 flex justify-around items-center">
//       <div className="flex items-center gap-1 text-xs text-center flex-col">
//         <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
//           <FiUser size={16} className="text-blue-600 dark:text-blue-400" />
//         </div>
//         <span className="font-medium text-gray-700 dark:text-gray-300">12 Online</span>
//       </div>
//       <div className="flex items-center gap-1 text-xs text-center flex-col">
//         <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
//           <FiActivity size={16} className="text-green-600 dark:text-green-400" />
//         </div>
//         <span className="font-medium text-gray-700 dark:text-gray-300">{strokeCount} Strokes</span>
//       </div>
//       <button className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full shadow-lg transform hover:scale-110 transition-all">
//         <FiPlus size={20} className="text-white" />
//       </button>
//       <div className="flex items-center gap-1 text-xs text-center flex-col">
//         <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
//           <FiSave size={16} className="text-purple-600 dark:text-purple-400" />
//         </div>
//         <span className="font-medium text-gray-700 dark:text-gray-300">Save</span>
//       </div>
//       <div className="flex items-center gap-1 text-xs text-center flex-col">
//         <div className="bg-pink-100 dark:bg-pink-900/50 p-2 rounded-full">
//           <FiShare2 size={16} className="text-pink-600 dark:text-pink-400" />
//         </div>
//         <span className="font-medium text-gray-700 dark:text-gray-300">Share</span>
//       </div>
//     </div>
//   </div>

//   {/* Enhanced Status Bar (Desktop) */}
//   <div className="hidden lg:block w-full mt-6 text-center">
//     <div className="inline-flex items-center gap-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-white/40">
//       <div className="flex items-center gap-2">
//         <div className="relative">
//           <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow"></div>
//           <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75"></div>
//         </div>
//         <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Live Sync Active</span>
//       </div>
      
//       <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-700/40 px-3 py-1 rounded-xl">
//         <span className="text-lg">🎨</span>
//         <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{strokeCount} Strokes</span>
//       </div>
      
//       <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 rounded-xl">
//         <span className="text-lg">👥</span>
//         <span className="font-medium text-sm text-gray-700 dark:text-gray-300">12 Collaborators</span>
//       </div>
//     </div>
//   </div>

//   {/* Enhanced Footer (Desktop) */}
//   <footer className="hidden lg:block mt-8 text-center max-w-2xl mx-auto">
//     <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30">
//       <div className="flex items-center justify-center gap-2 mb-3">
//         <span className="text-2xl">✨</span>
//         <h3 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//           Creative Collaboration
//         </h3>
//         <span className="text-2xl">🚀</span>
//       </div>
//       <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
//         Experience the magic of real-time collaboration. Every stroke, every idea, 
//         synchronized instantly across all connected users.
//       </p>
//     </div>
//   </footer>

//   {/* Mobile Empty Space for Bottom Navigation */}
//   <div className="lg:hidden h-16"></div>

//   {/* Enhanced Slider Styling */}
//   <style jsx>{`
//     .slider::-webkit-slider-thumb {
//       appearance: none;
//       height: 18px;
//       width: 18px;
//       border-radius: 50%;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       cursor: pointer;
//       box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
//       border: 2px solid white;
//       transition: all 0.2s ease;
//     }
    
//     .slider::-webkit-slider-thumb:hover {
//       transform: scale(1.1);
//       box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
//     }
    
//     .slider::-moz-range-thumb {
//       height: 18px;
//       width: 18px;
//       border-radius: 50%;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       cursor: pointer;
//       border: 2px solid white;
//       box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
//     }

//     .scrollbar-hide::-webkit-scrollbar {
//       display: none;
//     }
//     .scrollbar-hide {
//       -ms-overflow-style: none;
//       scrollbar-width: none;
//     }
//   `}</style>
// </div>
//   );
// };

// export default FabricBoard;







// import { useEffect, useRef, useState } from "react";
// import { 
//   Palette, 
//   Pen, 
//   Square, 
//   Circle, 
//   Minus, 
//   Type, 
//   Eraser, 
//   Download, 
//   Trash2, 
//   Moon, 
//   Sun, 
//   Users, 
//   Wifi,
//   Settings,
//   Layers,
//   Undo,
//   Redo,
//   Move,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw
// } from "lucide-react";
// import { io } from "socket.io-client";
// import jsPDF from "jspdf";

// const FabricBoard = ({ projectId, username  }) => {
//   const canvasRef = useRef(null);
//   const ctxRef = useRef(null);
//   const mouseDownRef = useRef(false);
//   const [tool, setTool] = useState("pen");
//   const [startPos, setStartPos] = useState(null);
//   const [color, setColor] = useState("#6366f1");
//   const [fillColor, setFillColor] = useState("#f8fafc");
//   const [lineWidth, setLineWidth] = useState(3);
//   const [darkMode, setDarkMode] = useState(false);
//   const [strokeCount, setStrokeCount] = useState(0);
//   const [fontSize, setFontSize] = useState(24);
//   const [isFilled, setIsFilled] = useState(false);
//   const [isConnected, setIsConnected] = useState(true);
//   const [activeUsers, setActiveUsers] = useState(3);
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [canvasScale, setCanvasScale] = useState(1);
//   const [isPanning, setIsPanning] = useState(false);
//   const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
//   const drawingHistory = useRef([]);
//   const undoHistory = useRef([]);
//   const socketRef = useRef(null);

//   // Theme management
//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   // Initialize canvas
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.lineWidth = lineWidth;
//     ctx.strokeStyle = color;
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";
//     ctx.imageSmoothingEnabled = true;
//     ctxRef.current = ctx;

//     // Set canvas size based on container
//     const resizeCanvas = () => {
//       const container = canvas.parentElement;
//       const rect = container.getBoundingClientRect();
//       canvas.width = rect.width - 32; // Account for padding
//       canvas.height = Math.max(500, rect.height - 32);
//     };

//     resizeCanvas();
//     window.addEventListener('resize', resizeCanvas);
//     return () => window.removeEventListener('resize', resizeCanvas);
//   }, []);

//     useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.lineWidth = lineWidth;
//     ctx.strokeStyle = color;
//     ctx.lineCap = "round";
//     ctxRef.current = ctx;

//     socketRef.current = io("http://localhost:8000", {
//       query: { projectId },
//     });

//     socketRef.current.emit("request-drawing-history", projectId);

//     socketRef.current.on("drawing-history", (history) => {
//       history.forEach((item) => drawFromHistory(item, false));
//       setStrokeCount(history.length);
//     });

//     socketRef.current.on("ondraw", (data) => {
//       drawFromHistory(data, false);
//       setStrokeCount((prev) => prev + 1);
//     });

//     socketRef.current.on("onbegin", ({ x, y }) => {
//       if (!ctxRef.current) return;
//       ctxRef.current.beginPath();
//       ctxRef.current.moveTo(x, y);
//     });

//     socketRef.current.on("erase", (data) => {
//       eraseAtPosition(data.x, data.y, data.radius, false);
//     });

//     socketRef.current.on("clear-canvas", () => {
//       clearCanvas(false);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [projectId, color, fillColor, lineWidth, isFilled]);



  
//     // Mouse event handlers
//   useEffect(() => {
//     const canvas = canvasRef.current;

//     // Get scaled coordinates
//     const getScaledCoords = (e) => {
//       const rect = canvas.getBoundingClientRect();
//       const scaleX = canvas.width / rect.width;
//       const scaleY = canvas.height / rect.height;
//       return {
//         x: (e.clientX - rect.left) * scaleX,
//         y: (e.clientY - rect.top) * scaleY,
//       };
//     };

//     const handleMouseDown = (e) => {
//       mouseDownRef.current = true;
//       const { x, y } = getScaledCoords(e);
//       setStartPos({ x, y });

//       if (tool === "pen") {
//         ctxRef.current.beginPath();
//         ctxRef.current.moveTo(x, y);
//         socketRef.current.emit("begin", { x, y });
//       } else if (tool === "eraser") {
//         isErasing.current = true;
//         eraseAtPosition(x, y, lineWidth);
//       } else if (tool === "text") {
//         const text = prompt("Enter text:", "Hello World");
//         if (text) {
//           drawFromHistory(
//             {
//               tool: "text",
//               startX: x,
//               startY: y,
//               text,
//               fontSize,
//             },
//             true
//           );
//         }
//       }
//     };

//     const handleMouseMove = (e) => {
//       if (!mouseDownRef.current) return;
//       const { x, y } = getScaledCoords(e);

//       if (tool === "pen") {
//         ctxRef.current.lineTo(x, y);
//         ctxRef.current.stroke();
//         drawFromHistory(
//           {
//             tool: "pen",
//             startX: startPos.x,
//             startY: startPos.y,
//             endX: x,
//             endY: y,
//           },
//           true
//         );
//         setStartPos({ x, y });
//       } else if (tool === "eraser" && isErasing.current) {
//         eraseAtPosition(x, y, lineWidth);
//       }
//     };

//     const handleMouseUp = (e) => {
//       if (!mouseDownRef.current) return;
//       mouseDownRef.current = false;
//       isErasing.current = false;

//       if (tool !== "pen" && tool !== "eraser" && tool !== "text") {
//         const { x, y } = getScaledCoords(e);
//         drawFromHistory(
//           {
//             tool,
//             startX: startPos.x,
//             startY: startPos.y,
//             endX: x,
//             endY: y,
//             fill: isFilled,
//           },
//           true
//         );
//       }
//     };

//     canvas.addEventListener("mousedown", handleMouseDown);
//     canvas.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseup", handleMouseUp);

//     return () => {
//       canvas.removeEventListener("mousedown", handleMouseDown);
//       canvas.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [tool, startPos, color, lineWidth, isFilled, fontSize]);

//   // Tools configuration
//   const tools = [
//     { id: "select", icon: <Move size={18} />, label: "Select", shortcut: "V" },
//     { id: "pen", icon: <Pen size={18} />, label: "Brush", shortcut: "B" },
//     { id: "rect", icon: <Square size={18} />, label: "Rectangle", shortcut: "R" },
//     { id: "circle", icon: <Circle size={18} />, label: "Circle", shortcut: "C" },
//     { id: "line", icon: <Minus size={18} />, label: "Line", shortcut: "L" },
//     { id: "text", icon: <Type size={18} />, label: "Text", shortcut: "T" },
//     { id: "eraser", icon: <Eraser size={18} />, label: "Eraser", shortcut: "E" },
//   ];

//   // Enhanced color palette
//   const colorPalette = {
//     primary: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#e11d48"],
//     secondary: ["#fecaca", "#fed7aa", "#fef3c7", "#dcfce7", "#cffafe", "#dbeafe", "#e9d5ff", "#fce7f3"],
//     neutral: ["#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6", "#ffffff"]
//   };

//   // Get scaled coordinates for responsive canvas
//   const getScaledCoords = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const scaleX = canvas.width / rect.width;
//     const scaleY = canvas.height / rect.height;
//     return {
//       x: ((e.clientX - rect.left) * scaleX - panOffset.x) / canvasScale,
//       y: ((e.clientY - rect.top) * scaleY - panOffset.y) / canvasScale,
//     };
//   };

//   // Drawing functions
//   const drawFromHistory = (data) => {
//     const ctx = ctxRef.current;
//     if (!ctx) return;

//     ctx.save();
//     ctx.scale(canvasScale, canvasScale);
//     ctx.translate(panOffset.x, panOffset.y);
    
//     ctx.strokeStyle = data.color || color;
//     ctx.fillStyle = data.fillColor || fillColor;
//     ctx.lineWidth = data.lineWidth || lineWidth;
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";

//     if (data.tool === "pen") {
//       ctx.beginPath();
//       ctx.moveTo(data.startX, data.startY);
//       ctx.lineTo(data.endX, data.endY);
//       ctx.stroke();
//     } else if (data.tool === "rect") {
//       const width = data.endX - data.startX;
//       const height = data.endY - data.startY;
//       if (data.fill) {
//         ctx.fillRect(data.startX, data.startY, width, height);
//       }
//       ctx.strokeRect(data.startX, data.startY, width, height);
//     } else if (data.tool === "circle") {
//       const radius = Math.hypot(data.endX - data.startX, data.endY - data.startY);
//       ctx.beginPath();
//       ctx.arc(data.startX, data.startY, radius, 0, Math.PI * 2);
//       if (data.fill) ctx.fill();
//       ctx.stroke();
//     } else if (data.tool === "line") {
//       ctx.beginPath();
//       ctx.moveTo(data.startX, data.startY);
//       ctx.lineTo(data.endX, data.endY);
//       ctx.stroke();
//     } else if (data.tool === "text") {
//       ctx.font = `${data.fontSize || fontSize}px Inter, sans-serif`;
//       ctx.fillStyle = data.color;
//       ctx.fillText(data.text, data.startX, data.startY);
//     }

//     ctx.restore();

//     drawingHistory.current.push(data);
//     setStrokeCount(drawingHistory.current.length);
//   };

//   // Mouse event handlers
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const handleMouseDown = (e) => {
//       mouseDownRef.current = true;
//       const { x, y } = getScaledCoords(e);
//       setStartPos({ x, y });

//       if (tool === "select") {
//         setIsPanning(true);
//         canvas.style.cursor = "grabbing";
//       } else if (tool === "pen") {
//         ctxRef.current.beginPath();
//         ctxRef.current.moveTo(x, y);
//       } else if (tool === "eraser") {
//         eraseAtPosition(x, y);
//       } else if (tool === "text") {
//         const text = prompt("Enter text:", "Hello World");
//         if (text) {
//           drawFromHistory({
//             tool: "text",
//             startX: x,
//             startY: y,
//             text,
//             fontSize,
//             color
//           });
//         }
//       }
//     };

//     const handleMouseMove = (e) => {
//       if (!mouseDownRef.current) return;
//       const { x, y } = getScaledCoords(e);

//       if (tool === "select" && isPanning) {
//         const dx = x - startPos.x;
//         const dy = y - startPos.y;
//         setPanOffset(prev => ({
//           x: prev.x + dx,
//           y: prev.y + dy
//         }));
//         redrawCanvas();
//       } else if (tool === "pen") {
//         ctxRef.current.lineTo(x, y);
//         ctxRef.current.stroke();
//         drawFromHistory({
//           tool: "pen",
//           startX: startPos.x,
//           startY: startPos.y,
//           endX: x,
//           endY: y,
//           color,
//           lineWidth
//         });
//         setStartPos({ x, y });
//       } else if (tool === "eraser") {
//         eraseAtPosition(x, y);
//       }
//     };

//     const handleMouseUp = (e) => {
//       if (!mouseDownRef.current) return;
//       mouseDownRef.current = false;

//       if (tool === "select") {
//         setIsPanning(false);
//         canvas.style.cursor = "grab";
//       } else if (tool !== "pen" && tool !== "eraser" && tool !== "text" && tool !== "select") {
//         const { x, y } = getScaledCoords(e);
//         drawFromHistory({
//           tool,
//           startX: startPos.x,
//           startY: startPos.y,
//           endX: x,
//           endY: y,
//           color,
//           lineWidth,
//           fillColor,
//           fill: isFilled
//         });
//       }
//     };

//     canvas.addEventListener("mousedown", handleMouseDown);
//     canvas.addEventListener("mousemove", handleMouseMove);
//     canvas.addEventListener("mouseup", handleMouseUp);
//     canvas.addEventListener("mouseleave", () => {
//       mouseDownRef.current = false;
//       setIsPanning(false);
//     });

//     // Set cursor styles
//     if (tool === "select") {
//       canvas.style.cursor = "grab";
//     } else if (tool === "text") {
//       canvas.style.cursor = "text";
//     } else {
//       canvas.style.cursor = "crosshair";
//     }

//     return () => {
//       canvas.removeEventListener("mousedown", handleMouseDown);
//       canvas.removeEventListener("mousemove", handleMouseMove);
//       canvas.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [tool, startPos, color, lineWidth, isFilled, fontSize, canvasScale, panOffset, isPanning]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.ctrlKey || e.metaKey) {
//         switch (e.key) {
//           case 'z':
//             e.preventDefault();
//             if (e.shiftKey) {
//               redo();
//             } else {
//               undo();
//             }
//             break;
//           case 'y':
//             e.preventDefault();
//             redo();
//             break;
//         }
//       } else {
//         const toolMap = {
//           'v': 'select', 'b': 'pen', 'r': 'rect', 
//           'c': 'circle', 'l': 'line', 't': 'text', 'e': 'eraser'
//         };
//         if (toolMap[e.key.toLowerCase()]) {
//           setTool(toolMap[e.key.toLowerCase()]);
//         }
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   const eraseAtPosition = (x, y, radius = lineWidth * 2) => {
//     const ctx = ctxRef.current;
//     ctx.save();
//     ctx.globalCompositeOperation = "destination-out";
//     ctx.beginPath();
//     ctx.arc(x, y, radius, 0, Math.PI * 2);
//     ctx.fill();
//     ctx.restore();
//   };

//   const clearCanvas = () => {
//     const ctx = ctxRef.current;
//     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     drawingHistory.current = [];
//     setStrokeCount(0);
//   };

//   const undo = () => {
//     if (drawingHistory.current.length > 0) {
//       const lastAction = drawingHistory.current.pop();
//       undoHistory.current.push(lastAction);
//       redrawCanvas();
//     }
//   };

//   const redo = () => {
//     if (undoHistory.current.length > 0) {
//       const action = undoHistory.current.pop();
//       drawingHistory.current.push(action);
//       redrawCanvas();
//     }
//   };

//   const redrawCanvas = () => {
//     const ctx = ctxRef.current;
//     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     drawingHistory.current.forEach(item => drawFromHistory(item));
//   };

//   const zoomIn = () => setCanvasScale(prev => Math.min(prev * 1.2, 3));
//   const zoomOut = () => setCanvasScale(prev => Math.max(prev / 1.2, 0.5));
//   const resetZoom = () => {
//     setCanvasScale(1);
//     setPanOffset({ x: 0, y: 0 });
//   };

//   const downloadAsPNG = () => {
//     const canvas = canvasRef.current;
//     const link = document.createElement('a');
//     link.download = `${projectId}-artwork.png`;
//     link.href = canvas.toDataURL();
//     link.click();
//   };

//   return (
//     <div className={`min-h-screen transition-all duration-300 ${
//       darkMode 
//         ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900' 
//         : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
//     }`}>
//       {/* Header */}
//       <header className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-all ${
//         darkMode 
//           ? 'bg-gray-900/80 border-gray-700' 
//           : 'bg-white/80 border-gray-200'
//       }`}>
//         <div className="max-w-7xl mx-auto px-4 py-3">
//           <div className="flex items-center justify-between">
//             {/* Logo & Project Info */}
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//                   <Palette className="w-5 h-5 text-white" />
//                 </div>
//                 <div className="hidden sm:block">
//                   <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                     {username}'s Canvas
//                   </h1>
//                   <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//                     {projectId}
//                   </p>
//                 </div>
//               </div>

//               {/* Connection Status */}
//               <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
//                 isConnected 
//                   ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
//                   : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
//               }`}>
//                 <Wifi className="w-4 h-4" />
//                 <span className="hidden sm:inline">
//                   {isConnected ? 'Connected' : 'Offline'}
//                 </span>
//               </div>

//               {/* Active Users */}
//               <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
//                 darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
//               }`}>
//                 <Users className="w-4 h-4" />
//                 <span>{activeUsers}</span>
//               </div>
//             </div>

//             {/* Header Actions */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setDarkMode(!darkMode)}
//                 className={`p-2 rounded-lg transition-all ${
//                   darkMode 
//                     ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//                 title="Toggle theme"
//               >
//                 {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//               </button>

//               <button
//                 onClick={() => setShowSettings(!showSettings)}
//                 className={`p-2 rounded-lg transition-all ${
//                   darkMode 
//                     ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//                 title="Settings"
//               >
//                 <Settings className="w-5 h-5" />
//               </button>

//               <button
//                 onClick={downloadAsPNG}
//                 className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2 font-medium"
//               >
//                 <Download className="w-4 h-4" />
//                 <span className="hidden sm:inline">Export</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto p-4 flex gap-4 h-[calc(100vh-80px)]">
//         {/* Left Sidebar - Tools */}
//         <aside className={`w-16 lg:w-64 rounded-2xl shadow-xl transition-all ${
//           darkMode ? 'bg-gray-800/90' : 'bg-white/90'
//         } backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//           <div className="p-4 space-y-4">
//             {/* Tools */}
//             <div className="space-y-2">
//               <h3 className={`text-xs font-semibold uppercase tracking-wider hidden lg:block ${
//                 darkMode ? 'text-gray-400' : 'text-gray-600'
//               }`}>
//                 Tools
//               </h3>
//               <div className="space-y-1">
//                 {tools.map((t) => (
//                   <button
//                     key={t.id}
//                     onClick={() => setTool(t.id)}
//                     className={`w-full p-3 rounded-xl transition-all group relative ${
//                       tool === t.id
//                         ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
//                         : darkMode 
//                           ? 'hover:bg-gray-700 text-gray-300' 
//                           : 'hover:bg-gray-100 text-gray-700'
//                     }`}
//                     title={`${t.label} (${t.shortcut})`}
//                   >
//                     <div className="flex items-center gap-3">
//                       {t.icon}
//                       <span className="font-medium hidden lg:block">{t.label}</span>
//                       <kbd className={`hidden lg:block ml-auto text-xs px-1.5 py-0.5 rounded ${
//                         tool === t.id 
//                           ? 'bg-white/20' 
//                           : darkMode ? 'bg-gray-800' : 'bg-gray-200'
//                       }`}>
//                         {t.shortcut}
//                       </kbd>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Tool Settings */}
//             {tool !== "select" && (
//               <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <h3 className={`text-xs font-semibold uppercase tracking-wider hidden lg:block ${
//                   darkMode ? 'text-gray-400' : 'text-gray-600'
//                 }`}>
//                   Settings
//                 </h3>

//                 {/* Brush Size */}
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <label className={`text-sm font-medium hidden lg:block ${
//                       darkMode ? 'text-gray-300' : 'text-gray-700'
//                     }`}>
//                       {tool === "eraser" ? "Eraser" : "Brush"} Size
//                     </label>
//                     <span className={`text-sm font-mono ${
//                       darkMode ? 'text-indigo-400' : 'text-indigo-600'
//                     }`}>
//                       {lineWidth}px
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="1"
//                     max={tool === "eraser" ? "50" : "20"}
//                     value={lineWidth}
//                     onChange={(e) => setLineWidth(parseInt(e.target.value))}
//                     className="w-full accent-indigo-500"
//                   />
//                 </div>

//                 {/* Font Size for Text */}
//                 {tool === "text" && (
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <label className={`text-sm font-medium hidden lg:block ${
//                         darkMode ? 'text-gray-300' : 'text-gray-700'
//                       }`}>
//                         Font Size
//                       </label>
//                       <span className={`text-sm font-mono ${
//                         darkMode ? 'text-indigo-400' : 'text-indigo-600'
//                       }`}>
//                         {fontSize}px
//                       </span>
//                     </div>
//                     <input
//                       type="range"
//                       min="12"
//                       max="72"
//                       value={fontSize}
//                       onChange={(e) => setFontSize(parseInt(e.target.value))}
//                       className="w-full accent-indigo-500"
//                     />
//                   </div>
//                 )}

//                 {/* Fill Toggle */}
//                 {(tool === "rect" || tool === "circle") && (
//                   <button
//                     onClick={() => setIsFilled(!isFilled)}
//                     className={`w-full p-2 rounded-lg transition-all text-sm font-medium ${
//                       isFilled
//                         ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
//                         : darkMode 
//                           ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     <Layers className="w-4 h-4 mx-auto lg:mr-2 lg:inline" />
//                     <span className="hidden lg:inline">
//                       {isFilled ? "Filled" : "Outline"}
//                     </span>
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </aside>

//         {/* Canvas Area */}
//         <main className="flex-1 flex flex-col space-y-4">
//           {/* Canvas Toolbar */}
//           <div className={`flex flex-wrap items-center gap-2 p-3 rounded-xl shadow-lg ${
//             darkMode ? 'bg-gray-800/90' : 'bg-white/90'
//           } backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             {/* Color Picker */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setShowColorPicker(!showColorPicker)}
//                 className={`w-8 h-8 rounded-lg border-2 transition-all ${
//                   darkMode ? 'border-gray-600' : 'border-gray-300'
//                 } hover:scale-110`}
//                 style={{ backgroundColor: color }}
//                 title="Color picker"
//               />
//               {showColorPicker && (
//                 <div className={`absolute z-10 mt-2 p-3 rounded-xl shadow-xl ${
//                   darkMode ? 'bg-gray-800' : 'bg-white'
//                 } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//                   <div className="space-y-3">
//                     {Object.entries(colorPalette).map(([category, colors]) => (
//                       <div key={category} className="space-y-1">
//                         <p className={`text-xs font-medium capitalize ${
//                           darkMode ? 'text-gray-400' : 'text-gray-600'
//                         }`}>
//                           {category}
//                         </p>
//                         <div className="flex gap-1">
//                           {colors.map((c) => (
//                             <button
//                               key={c}
//                               onClick={() => {
//                                 setColor(c);
//                                 setShowColorPicker(false);
//                               }}
//                               className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
//                                 color === c 
//                                   ? 'border-gray-800 dark:border-gray-200 ring-2 ring-indigo-500' 
//                                   : 'border-gray-300 dark:border-gray-600'
//                               }`}
//                               style={{ backgroundColor: c }}
//                             />
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

//             {/* Action Buttons */}
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={undo}
//                 className={`p-2 rounded-lg transition-all ${
//                   darkMode 
//                     ? 'hover:bg-gray-700 text-gray-300' 
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//                 title="Undo (Ctrl+Z)"
//               >
//                 <Undo className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={redo}
//                 className={`p-2 rounded-lg transition-all ${
//                   darkMode 
//                     ? 'hover:bg-gray-700 text-gray-300' 
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//                 title="Redo (Ctrl+Y)"
//               >
//                 <Redo className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

//             {/* Zoom Controls */}
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={zoomOut}
//                 className={`p-2 rounded-lg transition-all ${
//                   darkMode 
//                     ? 'hover:bg-gray-700 text-gray-300' 
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//                 title="Zoom out"
//               >
//                 <ZoomOut className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={resetZoom}
//                 className={`px-3 py-1 rounded text-sm font-mono ${
//                   darkMode 
//                     ? 'hover:bg-gray-700 text-gray-300' 
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//                 title="Reset zoom"
//               >
//                 {Math.round(canvasScale * 100)}%
//               </button>
//               <button
//                 onClick={zoomIn}
//                 className={`p-2 rounded-lg transition-all ${
//                   darkMode 
//                     ? 'hover:bg-gray-700 text-gray-300' 
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//                 title="Zoom in"
//               >
//                 <ZoomIn className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="flex-1" />

//             {/* Clear Canvas */}
//             <button
//               onClick={clearCanvas}
//               className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
//             >
//               <Trash2 className="w-4 h-4" />
//               <span className="hidden sm:inline">Clear</span>
//             </button>
//           </div>

//           {/* Canvas Container */}
//           <div className={`flex-1 rounded-2xl shadow-xl overflow-hidden border-2 ${
//             darkMode 
//               ? 'border-gray-700 bg-gray-900' 
//               : 'border-gray-200 bg-white'
//           }`}>
//             <canvas
//               ref={canvasRef}
//               className="w-full h-full"
//               style={{
//                 background: darkMode 
//                   ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
//                   : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
//               }}
//             />
//           </div>
//         </main>
//       </div>

//       {/* Status Bar */}
//       <footer className={`sticky bottom-0 backdrop-blur-lg border-t ${
//         darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
//       }`}>
//         <div className="max-w-7xl mx-auto px-4 py-2">
//           <div className="flex items-center justify-between text-sm">
//             <div className="flex items-center gap-4">
//               <div className={`flex items-center gap-2 ${
//                 darkMode ? 'text-gray-400' : 'text-gray-600'
//               }`}>
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                 <span>Real-time sync active</span>
//               </div>
//               <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//                 {strokeCount} strokes
//               </div>
//             </div>
//             <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Press <kbd className={`px-1.5 py-0.5 rounded text-xs ${
//                 darkMode ? 'bg-gray-800' : 'bg-gray-200'
//               }`}>?</kbd> for shortcuts
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* Settings Panel */}
//       {showSettings && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className={`w-full max-w-md rounded-2xl shadow-xl ${
//             darkMode ? 'bg-gray-800' : 'bg-white'
//           } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className={`text-xl font-bold ${
//                   darkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Canvas Settings
//                 </h2>
//                 <button
//                   onClick={() => setShowSettings(false)}
//                   className={`p-1 rounded-lg ${
//                     darkMode 
//                       ? 'hover:bg-gray-700 text-gray-400' 
//                       : 'hover:bg-gray-100 text-gray-600'
//                   }`}
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${
//                     darkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>
//                     Canvas Quality
//                   </label>
//                   <select className={`w-full p-2 rounded-lg border ${
//                     darkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white' 
//                       : 'bg-white border-gray-300 text-gray-900'
//                   }`}>
//                     <option value="high">High (Recommended)</option>
//                     <option value="medium">Medium</option>
//                     <option value="low">Low (Performance)</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${
//                     darkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>
//                     Auto-save Interval
//                   </label>
//                   <select className={`w-full p-2 rounded-lg border ${
//                     darkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white' 
//                       : 'bg-white border-gray-300 text-gray-900'
//                   }`}>
//                     <option value="30">30 seconds</option>
//                     <option value="60">1 minute</option>
//                     <option value="300">5 minutes</option>
//                     <option value="0">Disabled</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className={`text-sm font-medium ${
//                     darkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>
//                     Show Grid
//                   </label>
//                   <button
//                     className={`relative w-11 h-6 rounded-full transition-colors ${
//                       false ? 'bg-indigo-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
//                     }`}
//                   >
//                     <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                       false ? 'translate-x-5' : 'translate-x-0'
//                     }`} />
//                   </button>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className={`text-sm font-medium ${
//                     darkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>
//                     Pressure Sensitivity
//                   </label>
//                   <button
//                     className={`relative w-11 h-6 rounded-full transition-colors ${
//                       true ? 'bg-indigo-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
//                     }`}
//                   >
//                     <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                       true ? 'translate-x-5' : 'translate-x-0'
//                     }`} />
//                   </button>
//                 </div>
//               </div>

//               <div className="flex gap-3 mt-6">
//                 <button
//                   onClick={() => setShowSettings(false)}
//                   className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
//                     darkMode 
//                       ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
//                       : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => setShowSettings(false)}
//                   className="flex-1 py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
//                 >
//                   Save Settings
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile Toolbar */}
//       <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
//         <div className={`flex items-center gap-2 p-2 rounded-2xl shadow-xl ${
//           darkMode ? 'bg-gray-800/95' : 'bg-white/95'
//         } backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//           {tools.slice(0, 6).map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setTool(t.id)}
//               className={`p-3 rounded-xl transition-all ${
//                 tool === t.id
//                   ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
//                   : darkMode 
//                     ? 'hover:bg-gray-700 text-gray-300' 
//                     : 'hover:bg-gray-100 text-gray-700'
//               }`}
//               title={t.label}
//             >
//               {t.icon}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Floating Action Button for Mobile Settings */}
//       <div className="lg:hidden fixed bottom-20 right-4 z-40">
//         <button
//           onClick={() => setShowColorPicker(!showColorPicker)}
//           className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all"
//         >
//           <Palette className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Keyboard Shortcuts Help */}
//       <div className="fixed top-1/2 left-4 transform -translate-y-1/2 hidden xl:block">
//         <div className={`p-3 rounded-xl text-xs space-y-1 ${
//           darkMode 
//             ? 'bg-gray-800/80 text-gray-400 border-gray-700' 
//             : 'bg-white/80 text-gray-600 border-gray-200'
//         } backdrop-blur-sm border`}>
//           <div className="font-semibold mb-2 text-center">Quick Keys</div>
//           <div className="space-y-0.5">
//             <div className="flex justify-between gap-2">
//               <span>Select</span>
//               <kbd className={`px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>V</kbd>
//             </div>
//             <div className="flex justify-between gap-2">
//               <span>Brush</span>
//               <kbd className={`px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>B</kbd>
//             </div>
//             <div className="flex justify-between gap-2">
//               <span>Eraser</span>
//               <kbd className={`px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>E</kbd>
//             </div>
//             <div className="flex justify-between gap-2">
//               <span>Text</span>
//               <kbd className={`px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>T</kbd>
//             </div>
//             <div className="border-t border-gray-300 dark:border-gray-600 my-1"></div>
//             <div className="flex justify-between gap-2">
//               <span>Undo</span>
//               <kbd className={`px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>⌘Z</kbd>
//             </div>
//             <div className="flex justify-between gap-2">
//               <span>Redo</span>
//               <kbd className={`px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>⌘Y</kbd>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Loading States & Animations */}
//       <style jsx global>{`
//         @keyframes draw {
//           to {
//             stroke-dashoffset: 0;
//           }
//         }
        
//         .animate-draw {
//           stroke-dasharray: 100;
//           stroke-dashoffset: 100;
//           animation: draw 0.5s ease-in-out forwards;
//         }
        
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .animate-fade-in-up {
//           animation: fadeInUp 0.3s ease-out;
//         }
        
//         /* Custom scrollbar */
//         ::-webkit-scrollbar {
//           width: 6px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: transparent;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: rgba(156, 163, 175, 0.5);
//           border-radius: 3px;
//         }
        
//         .dark ::-webkit-scrollbar-thumb {
//           background: rgba(75, 85, 99, 0.5);
//         }
        
//         /* Smooth transitions for theme switching */
//         * {
//           transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
//         }
        
//         /* Enhanced focus styles */
//         button:focus-visible,
//         input:focus-visible,
//         select:focus-visible {
//           outline: 2px solid #6366f1;
//           outline-offset: 2px;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default FabricBoard;









// import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
// import { Stage, Layer, Rect, Circle, Line, Transformer } from "react-konva";
// import { io } from "socket.io-client";
// import { v4 as uuidv4 } from "uuid";

// // Your icon imports
// import { FiTool, FiSquare, FiCircle } from "react-icons/fi";
// import { FaEraser } from "react-icons/fa";
// import { GrSelect } from "react-icons/gr";

// const FabricBoard = ({ projectId, username }) => {
//   const [tool, setTool] = useState("select");
//   const [color, setColor] = useState("#3b82f6");
//   const [lineWidth, setLineWidth] = useState(4);
//   const [shapes, setShapes] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

//   const isDrawing = useRef(false);
//   const stageRef = useRef(null);
//   const socketRef = useRef(null);
//   const containerRef = useRef(null);
//   const transformerRef = useRef(null);

//   // --- Responsive Canvas Size ---
//   useLayoutEffect(() => {
//     const updateSize = () => {
//       if (containerRef.current) {
//         setStageSize({
//           width: containerRef.current.offsetWidth,
//           height: containerRef.current.offsetHeight,
//         });
//       }
//     };
//     updateSize();
//     window.addEventListener('resize', updateSize);
//     return () => window.removeEventListener('resize', updateSize);
//   }, []);

//   // --- Socket.IO and Main Setup ---
//   useEffect(() => {
//     const socket = io("http://localhost:8000", { query: { projectId } });
//     socketRef.current = socket;

//     socket.emit("request-drawing-history", projectId);
//     socket.on("drawing-history", (history) => setShapes(history || []));
//     socket.on("add-shape", (newShape) => setShapes((prev) => [...prev, newShape]));
//     socket.on("update-shape", (updatedShape) => {
//       setShapes((prev) => prev.map(s => s.id === updatedShape.id ? updatedShape : s));
//     });
//     socket.on("delete-shape", (id) => setShapes((prev) => prev.filter(s => s.id !== id)));
//     socket.on("clear-canvas", () => setShapes([]));

//     return () => socket.disconnect();
//   }, [projectId]);
  
//   // --- Transformer Logic ---
//   useEffect(() => {
//     if (transformerRef.current) {
//       const selectedNode = stageRef.current.findOne('#' + selectedId);
//       if (selectedNode) {
//         transformerRef.current.nodes([selectedNode]);
//       } else {
//         transformerRef.current.nodes([]);
//       }
//       transformerRef.current.getLayer().batchDraw();
//     }
//   }, [selectedId]);

//   // --- Mouse Handlers for Drawing ---
//   const handleMouseDown = (e) => {
//     const clickedOnEmpty = e.target === e.target.getStage();
//     if (tool === 'select') {
//       if (clickedOnEmpty) setSelectedId(null);
//       return;
//     }

//     if (tool === 'eraser' || e.target !== e.target.getStage()) return;
    
//     isDrawing.current = true;
//     const pos = e.target.getStage().getPointerPosition();
//     const newShape = {
//       id: uuidv4(),
//       tool,
//       x: pos.x,
//       y: pos.y,
//       width: 0, height: 0, radius: 0,
//       points: [pos.x, pos.y],
//       stroke: color,
//       strokeWidth: lineWidth,
//       fill: 'transparent',
//     };
//     setShapes(prev => [...prev, newShape]);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing.current) return;

//     const pos = e.target.getStage().getPointerPosition();
//     setShapes(prev => {
//       let lastShape = { ...prev[prev.length - 1] };
//       if (lastShape.tool === 'pen') {
//         lastShape.points = lastShape.points.concat([pos.x, pos.y]);
//       } else if (lastShape.tool === 'rect') {
//         lastShape.width = pos.x - lastShape.x;
//         lastShape.height = pos.y - lastShape.y;
//       } else if (lastShape.tool === 'circle') {
//         lastShape.radius = Math.sqrt(Math.pow(pos.x - lastShape.x, 2) + Math.pow(pos.y - lastShape.y, 2));
//       }
//       return [...prev.slice(0, -1), lastShape];
//     });
//   };
  
//   const handleMouseUp = () => {
//     if (isDrawing.current) {
//       isDrawing.current = false;
//       const lastShape = shapes[shapes.length - 1];
//       if (lastShape) {
//         socketRef.current.emit("add-shape", lastShape);
//       }
//     }
//   };

//   const tools = [
//     { id: "select", icon: <GrSelect size={20} />, label: "Select" },
//     { id: "pen", icon: <FiTool size={20} />, label: "Pen" },
//     { id: "rect", icon: <FiSquare size={20} />, label: "Rectangle" },
//     { id: "circle", icon: <FiCircle size={20} />, label: "Circle" },
//     { id: "eraser", icon: <FaEraser size={20} />, label: "Eraser" },
//   ];

//   return (
//     <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-4 min-h-screen bg-gray-100">
//       <h1 className="text-2xl font-bold mb-4">{username ? `${username}'s Canvas` : `Project ${projectId}`}</h1>

//       <div className="w-full flex flex-col lg:flex-row gap-6" style={{height: '70vh'}}>
//         <div className="bg-white p-4 shadow-lg flex lg:flex-col gap-3">
//           {tools.map((t) => (
//             <button key={t.id} onClick={() => setTool(t.id)} className={`p-3 rounded-xl ${tool === t.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
//               <span>{t.icon}</span><span className="text-xs">{t.label}</span>
//             </button>
//           ))}
//         </div>

//         <div ref={containerRef} className="flex-1 bg-white shadow-inner overflow-hidden">
//           <Stage
//             width={stageSize.width}
//             height={stageSize.height}
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//             ref={stageRef}
//           >
//             <Layer>
//               <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="#ffffff" />
              
//               {shapes.map((shape) => {
//                 const isSelected = shape.id === selectedId;
//                 const commonProps = {
//                   ...shape,
//                   draggable: isSelected,
//                   onClick: () => {
//                     if (tool === 'select') {
//                       setSelectedId(shape.id);
//                     } else if (tool === 'eraser') {
//                       // ✅ Correct real-time eraser logic
//                       socketRef.current.emit("delete-shape", shape.id);
//                       setShapes(prev => prev.filter(s => s.id !== shape.id));
//                     }
//                   },
//                   onDragEnd: (e) => {
//                     const updatedAttrs = { ...shape, x: e.target.x(), y: e.target.y() };
//                     socketRef.current.emit("update-shape", updatedAttrs);
//                     setShapes(prev => prev.map(s => s.id === shape.id ? updatedAttrs : s));
//                   },
//                   onTransformEnd: (e) => {
//                     const node = e.target;
//                     const scaleX = node.scaleX();
//                     const scaleY = node.scaleY();
//                     node.scaleX(1);
//                     node.scaleY(1);
                    
//                     const updatedAttrs = {
//                       ...shape,
//                       x: node.x(),
//                       y: node.y(),
//                       width: Math.max(5, node.width() * scaleX),
//                       height: Math.max(5, node.height() * scaleY),
//                     };
//                     socketRef.current.emit("update-shape", updatedAttrs);
//                     setShapes(prev => prev.map(s => s.id === shape.id ? updatedAttrs : s));
//                   },
//                 };

//                 let renderedShape;
//                 if (shape.tool === 'rect') renderedShape = <Rect {...commonProps} />;
//                 if (shape.tool === 'circle') renderedShape = <Circle {...commonProps} />;
//                 if (shape.tool === 'pen') renderedShape = <Line {...commonProps} tension={0.5} />;
//                 return <React.Fragment key={shape.id}>{renderedShape}</React.Fragment>;
//               })}
              
//               <Transformer ref={transformerRef} />
//             </Layer>
//           </Stage>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FabricBoard;