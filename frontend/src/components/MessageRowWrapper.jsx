import { useRef, useState } from "react";

export default function MessageRowWrapper({ index, style, data }) {
  const { item, user, moment, rowRefs } = data;
  console.log("user in messagerowwrapper", user);
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false); // changed to false initially

  const isDateType = item.type === "date";
  const msg = !isDateType ? item.data || item : null;

  const extension = msg?.file
    ? new URL(msg.file).pathname.split(".").pop().toLowerCase()
    : "";

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  const isVideo = ["mp4", "webm", "ogg"].includes(extension);
  const isPDF = extension === "pdf";

  const isCurrentUser = msg?.user?._id === user?._id;

  const handleMediaLoad = () => {
    setLoaded(true);
  };

  if (isDateType) {
    return (
      <div
        ref={ref}
        style={{ ...style, width: "100%" }}
        className="flex items-center justify-center py-4 sm:py-6 md:py-8 px-2 sm:px-4"
      >
        <div className="bg-gradient-to-r from-transparent via-indigo-200 to-transparent h-px flex-1"></div>
        <div className="relative px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200 shadow-lg mx-2 sm:mx-4">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 rounded-full blur-sm"></div>
          <span className="relative text-[10px] sm:text-xs font-bold text-indigo-700 tracking-wide flex items-center gap-1 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            <span className="whitespace-nowrap">
              {moment(item.date).calendar(null, {
                sameDay: "[Today]",
                lastDay: "[Yesterday]",
                lastWeek: "ddd",
                sameElse: "DD/MM",
              })}
            </span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse"></span>
          </span>
        </div>
        <div className="bg-gradient-to-r from-transparent via-purple-200 to-transparent h-px flex-1"></div>
      </div>
    );
  }

  return (
    <div
      ref={(el) => {
        ref.current = el;
        rowRefs.current[index] = el;
      }}
      style={{ ...style, width: "100%" }}
      className={`flex gap-2 sm:gap-3 px-2 sm:px-4 py-3 sm:py-4 items-end message-appear ${
        isCurrentUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* User Avatar */}
      <div className={`text-xs font-bold p-1.5 sm:p-2 min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] rounded-full flex items-center justify-center uppercase shadow-lg transition-all duration-200 ${
        isCurrentUser 
          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" 
          : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
      }`}>
        {msg?.user?.username?.[0] || "?"}
      </div>

      {/* Message Bubble */}
      <div className={`group relative p-3 sm:p-4 md:p-5 rounded-2xl shadow-lg max-w-[85%] sm:max-w-[80%] md:max-w-[75%] flex flex-col transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.01] ${
        isCurrentUser 
          ? "bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 text-white rounded-br-md" 
          : "bg-gradient-to-br from-white to-gray-50 text-gray-800 border border-gray-200 rounded-bl-md"
      } ${msg?.message && msg.message.length > 500 ? 'max-w-[90%] sm:max-w-[85%]' : ''}`}>
        {/* Username with typing indicator */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <small className={`text-xs font-semibold flex items-center gap-1.5 sm:gap-2 ${
            isCurrentUser ? "text-blue-100" : "text-gray-600"
          }`}>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isCurrentUser ? "bg-blue-300" : "bg-emerald-400"
            }`}></span>
            <span className="truncate max-w-[100px] sm:max-w-none">{msg?.user?.username}</span>
          </small>
          
          {/* Message length indicator for long messages */}
          {msg?.message && msg.message.length > 200 && (
            <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${
              isCurrentUser 
                ? "bg-blue-500/30 text-blue-200" 
                : "bg-gray-200 text-gray-500"
            }`}>
              {msg.message.length > 1000 ? `${Math.round(msg.message.length/1000)}k` : `${msg.message.length}`}
            </span>
          )}
        </div>

        {/* Text Message */}
        {msg?.message && (
          <div className={`relative ${
            msg.message.length > 500 ? 'max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto' : ''
          }`}>
            <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words mb-3 sm:mb-4 ${
              isCurrentUser ? "text-white" : "text-gray-800"
            } ${msg.message.length > 100 ? 'text-justify' : ''}`}>
              {msg.message}
            </div>
            
            {/* Scroll indicator for long messages */}
            {msg.message.length > 500 && (
              <div className={`absolute bottom-0 right-0 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-tl-lg font-medium ${
                isCurrentUser 
                  ? "bg-blue-500/20 text-blue-200" 
                  : "bg-gray-100 text-gray-500"
              }`}>
                Scroll ↓
              </div>
            )}
          </div>
        )}

        {/* File Uploading Spinner */}
        {msg?.isUploading ? (
          <div className="mt-3 sm:mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 h-[250px] sm:h-[300px] md:h-[320px] w-full flex items-center justify-center rounded-xl overflow-hidden">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-600 animate-spin rounded-full" />
                <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-r-purple-600 animate-spin rounded-full" style={{animationDirection: 'reverse', animationDuration: '1.5s'}} />
              </div>
              <div className="text-center px-4">
                <span className="text-xs sm:text-sm text-indigo-700 font-semibold block">Uploading your file...</span>
                <span className="text-[10px] sm:text-xs text-indigo-500 mt-1">Please wait while we process your content</span>
              </div>
            </div>
          </div>
        ) : msg?.file ? (
          // File: Image / Video / PDF
          <div className="relative mt-3 sm:mt-4 bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 shadow-lg rounded-xl overflow-hidden flex items-center justify-center p-2 sm:p-3 md:p-4 max-w-[280px] sm:max-w-[300px] max-h-[280px] sm:max-h-[320px] md:max-h-[340px] group hover:shadow-xl transition-all duration-300">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 z-10 rounded-xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-white/30 border-t-white animate-spin rounded-full" />
                    <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-3 border-transparent border-r-blue-400 animate-spin rounded-full" style={{animationDirection: 'reverse'}} />
                  </div>
                  <span className="text-[10px] sm:text-xs text-white font-medium">Loading content...</span>
                </div>
              </div>
            )}

            {isImage && (
              <img
                src={msg.file}
                onLoad={handleMediaLoad}
                className="rounded-lg object-cover max-w-[220px] sm:max-w-[240px] md:max-w-[260px] max-h-[250px] sm:max-h-[280px] md:max-h-[300px] border border-gray-200 shadow-sm transition-all duration-300 group-hover:scale-[1.02]"
                style={{ background: "#f8f9fa" }}
                alt="shared"
              />
            )}

            {isVideo && (
              <video
                src={msg.file}
                controls
                onLoadedData={handleMediaLoad}
                className="rounded-lg object-cover max-w-[220px] sm:max-w-[240px] md:max-w-[260px] max-h-[250px] sm:max-h-[280px] md:max-h-[300px] border border-gray-200 shadow-sm bg-black transition-all duration-300 group-hover:scale-[1.02]"
                style={{ background: "#000" }}
              />
            )}

            {isPDF && (
              <div className="relative">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                    msg.file
                  )}&embedded=true`}
                  onLoad={handleMediaLoad}
                  className="rounded-lg max-w-[220px] sm:max-w-[240px] md:max-w-[260px] max-h-[250px] sm:max-h-[280px] md:max-h-[300px] border border-gray-200 shadow-sm bg-white transition-all duration-300"
                  style={{ background: "#fff" }}
                  title="PDF Preview"
                />
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium shadow-lg">
                  PDF
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Timestamp with read status */}
        <div className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 md:right-4 flex items-center gap-1 sm:gap-2 ${
          isCurrentUser ? "text-blue-200" : "text-gray-500"
        }`}>
          <span className="text-[8px] sm:text-[10px] font-medium">
            {msg?.createdAt && moment(msg.createdAt).format("hh:mm A")}
          </span>
          {isCurrentUser && (
            <div className="flex gap-0.5 sm:gap-1">
              <div className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${
                msg?.isRead ? "bg-blue-300" : "bg-blue-400"
              }`}></div>
              <div className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${
                msg?.isRead ? "bg-blue-300" : "bg-blue-400"
              }`}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

