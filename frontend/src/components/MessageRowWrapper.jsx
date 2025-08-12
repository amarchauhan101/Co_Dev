// import { useRef, useEffect, useState } from "react";
// import { FiDownload } from "react-icons/fi"; // Download icon

// export default function MessageRowWrapper({ index, style, data }) {
//   const { item, user, moment, measure } = data;
//   console.log("item=>", item);
//   console.log("user", user);
//   console.log("moment", moment);
//   console.log("measure", measure);

//   const ref = useRef(null);
//   const [loaded, setLoaded] = useState(true);

//   const isDateType = item.type === "date";
//   const msg = !isDateType ? item.data || item : null; // support both optimistic & real

//   const extension = msg?.file
//     ? new URL(msg.file).pathname.split(".").pop().toLowerCase()
//     : "";

//   const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
//   const isVideo = ["mp4", "webm", "ogg"].includes(extension);
//   const isPDF = extension === "pdf";

//   const isAI =
//     msg?.user?._id === "ai" ||
//     msg?.user?.username === "AI" ||
//     msg?.user?.email === "ai@gemini.com";

//   const isCurrentUser = msg?.user?._id === user?._id;

//   useEffect(() => {
//     if (ref.current && measure) measure(ref.current);
//   }, [measure]);

//   useEffect(() => {
//     if (!isDateType && msg?.file) {
//       setLoaded(false);
//     } else {
//       setLoaded(true);
//     }
//   }, [isDateType, msg?.file]);

//   const handleMediaLoad = () => {
//     setLoaded(true);
//     if (ref.current && measure) measure(ref.current);
//   };

//   if (isDateType) {
//     return (
//       <div
//         ref={ref}
//         style={style}
//         className="text-center text-gray-400 text-xs py-4 tracking-wider"
//       >
//         {moment(item.date).calendar(null, {
//           sameDay: "[Today]",
//           lastDay: "[Yesterday]",
//           lastWeek: "dddd",
//           sameElse: "DD MMM YYYY",
//         })}
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={measure} // ✅ instead of `ref={ref}`
//       style={{ ...style, width: "100%" }}
//       className={`flex gap-3 px-2 mb-6 items-end ${
//         isCurrentUser ? "flex-row-reverse" : ""
//       }`}
//     >
//       {/* Avatar */}
//       <div
//         className={`text-xs font-bold p-2 min-w-[32px] min-h-[32px] rounded-full shadow-md flex items-center justify-center uppercase ${
//           isAI
//             ? "bg-yellow-400 text-black"
//             : isCurrentUser
//             ? "bg-[#C9A9F8] text-black"
//             : "bg-emerald-400 text-black"
//         }`}
//       >
//         {msg?.user?.username?.[0] || "?"}
//       </div>

//       {/* Message bubble */}
//       <div
//         className={`relative p-4 rounded-2xl shadow-lg max-w-[80%] ${
//           isAI
//             ? "bg-yellow-100 text-black rounded-bl-none"
//             : isCurrentUser
//             ? "bg-[#C9A9F8] text-black rounded-br-none"
//             : "bg-gray-800 text-white rounded-bl-none"
//         } ${loaded ? "mb-6" : ""}`} // margin only after load
//       >
//         <small className="text-xs font-semibold block mb-1">
//           {msg?.user?.username}
//         </small>

//         {/* Text message */}
//         {msg?.message && (
//           <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed w-full">
//             <code className="break-words break-all w-full block">
//               {msg.message}
//             </code>
//           </pre>
//         )}

//         {/* File block */}
//         {msg?.isUploading ? (
//           // Show spinner when uploading
//           <div className="mt-2 relative rounded-xl overflow-hidden bg-white border shadow-md max-w-[260px] h-[320px] flex items-center justify-center">
//             <div className="flex flex-col items-center">
//               <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 animate-spin rounded-full mb-2" />
//               <span className="text-gray-500 text-sm">Uploading...</span>
//             </div>
//           </div>
//         ) : msg?.file ? (
//           // Show file preview when not uploading and file exists
//           <div className="mt-2 relative rounded-xl overflow-hidden bg-white border shadow-md max-w-[260px]">
//             {!loaded && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
//                 <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
//               </div>
//             )}

//             {/* File previews */}
//             {isImage && (
//               <img
//                 src={msg.file}
//                 alt="image"
//                 onLoad={handleMediaLoad}
//                 className={`w-full max-h-[300px] object-contain transition-opacity duration-300 ${
//                   loaded ? "opacity-100" : "opacity-0"
//                 }`}
//               />
//             )}

//             {isVideo && (
//               <video
//                 src={msg.file}
//                 controls
//                 muted
//                 onLoadedData={handleMediaLoad}
//                 className={`w-full max-h-[300px] object-contain transition-opacity duration-300 ${
//                   loaded ? "opacity-100" : "opacity-0"
//                 }`}
//               />
//             )}

//             {isPDF && (
//               <iframe
//                 src={`https://docs.google.com/gview?url=${encodeURIComponent(
//                   msg.file
//                 )}&embedded=true`}
//                 title="PDF Preview"
//                 onLoad={handleMediaLoad}
//                 className={`w-full h-[320px] transition-opacity duration-300 ${
//                   loaded ? "opacity-100" : "opacity-0"
//                 }`}
//               />
//             )}

//             {/* Download button */}
//             {loaded && (
//               <a
//                 href={msg.file}
//                 download={msg.originalFilename || "file"}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center justify-center py-2 bg-[#111827] hover:bg-[#1f2937] transition-colors text-white text-sm"
//               >
//                 <FiDownload className="mr-1" /> Download
//               </a>
//             )}
//           </div>
//         ) : null}

//         {/* Timestamp */}
//         <div className="absolute bottom-1 right-2 text-[11px] text-gray-500">
//           {msg?.createdAt ? moment(msg.createdAt).format("hh:mm A") : ""}
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useRef, useEffect, useState } from "react";

// export default function MessageRowWrapper({ index, style, data }) {
//   const { item, user, moment, rowRefs, itemHeights, rowVirtualizer } = data;
//   const ref = useRef(null);
//   const [loaded, setLoaded] = useState(true);

//   const isDateType = item.type === "date";
//   const msg = !isDateType ? item.data || item : null;

//   const extension = msg?.file
//     ? new URL(msg.file).pathname.split(".").pop().toLowerCase()
//     : "";

//   const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
//   const isVideo = ["mp4", "webm", "ogg"].includes(extension);
//   const isPDF = extension === "pdf";

//   const isCurrentUser = msg?.user?._id === user?._id;

//   const measureAndStore = () => {
//     if (!ref.current || !rowVirtualizer) return;
//     const height = ref.current.offsetHeight;
//     if (itemHeights.current[index] !== height) {
//       itemHeights.current[index] = height;
//       rowVirtualizer.measureElement(ref.current);
//     }
//   };

//   useEffect(() => {
//     if (ref.current) {
//       rowRefs.current[index] = ref.current;
//       measureAndStore();
//     }
//   }, [index]);

//   useEffect(() => {
//     if (loaded) {
//       measureAndStore();
//     }
//   }, [loaded]);

//   const handleMediaLoad = () => {
//     setLoaded(true);
//   };

//   if (isDateType) {
//     return (
//       <div
//         ref={ref}
//         style={style}
//         className="text-center text-gray-400 text-xs py-4 tracking-wider"
//       >
//         {moment(item.date).calendar(null, {
//           sameDay: "[Today]",
//           lastDay: "[Yesterday]",
//           lastWeek: "dddd",
//           sameElse: "DD MMM YYYY",
//         })}
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={ref}
//       style={{ ...style, width: "100%" }}
//       className={`flex gap-3 px-2 mb-6 items-end ${
//         isCurrentUser ? "flex-row-reverse" : ""
//       }`}
//     >
//       <div className="text-xs font-bold p-2 min-w-[32px] min-h-[32px] rounded-full bg-emerald-400 text-black flex items-center justify-center uppercase">
//         {msg?.user?.username?.[0] || "?"}
//       </div>

//       <div className="relative p-4 rounded-2xl shadow-lg max-w-[80%]  bg-gray-800 text-white">
//         <small className="text-xs font-semibold block mb-1">
//           {msg?.user?.username}
//         </small>

//         {msg?.message && (
//           <pre className="text-sm font-mono whitespace-pre-wrap break-words">
//             <code>{msg.message}</code>
//           </pre>
//         )}

//         {msg?.isUploading ? (
//           <div className="mt-2 bg-white border h-[320px] w-full flex items-center justify-center">
//             <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 animate-spin rounded-full" />
//           </div>
//         ) : msg?.file ? (
//           <div className="mt-2 bg-white border shadow-md max-w-[260px] max-h-[150px] overflow-hidden rounded-xl">
//             {!loaded && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
//                 <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
//               </div>
//             )}

//             {isImage && (
//               <img
//                 src={msg.file}
//                 onLoad={handleMediaLoad}
//                 className="w-full max-h-[300px] object-contain"
//               />
//             )}

//             {isVideo && (
//               <video
//                 src={msg.file}
//                 controls
//                 onLoadedData={handleMediaLoad}
//                 className="w-full max-h-[300px]"
//               />
//             )}

//             {isPDF && (
//               <iframe
//                 src={`https://docs.google.com/gview?url=${encodeURIComponent(
//                   msg.file
//                 )}&embedded=true`}
//                 onLoad={handleMediaLoad}
//                 className="w-full h-[320px]"
//               />
//             )}
//           </div>
//         ) : null}

//         <div className="absolute bottom-1 right-2 text-[11px] text-gray-400">
//           {msg?.createdAt && moment(msg.createdAt).format("hh:mm A")}
//         </div>
//       </div>
//     </div>
//   );
// }


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
        className="text-center text-gray-400 text-xs py-4 tracking-wider"
      >
        {moment(item.date).calendar(null, {
          sameDay: "[Today]",
          lastDay: "[Yesterday]",
          lastWeek: "dddd",
          sameElse: "DD MMM YYYY",
        })}
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
      className={`flex gap-3 px-2 mb-6 items-end ${
        isCurrentUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* User Avatar */}
      <div className="text-xs font-bold p-2 min-w-[32px] min-h-[32px] rounded-full bg-emerald-400 text-black flex items-center justify-center uppercase">
        {msg?.user?.username?.[0] || "?"}
      </div>

      {/* Message Bubble */}
      <div className="relative p-4 rounded-2xl shadow-lg max-w-[80%] bg-gray-800 text-white flex flex-col gap-2">
        <small className="text-xs font-semibold block mb-1">
          {msg?.user?.username}
        </small>

        {/* Text Message */}
        {msg?.message && (
          <pre className="text-sm font-mono whitespace-pre-wrap break-words">
            <code>{msg.message}</code>
          </pre>
        )}

        {/* File Uploading Spinner */}
        {msg?.isUploading ? (
          <div className="mt-2 bg-white border h-[320px] w-full flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 animate-spin rounded-full" />
          </div>
        ) : msg?.file ? (
          // File: Image / Video / PDF
          <div className="relative mt-2 bg-[#f0f0f0] border shadow-md rounded-xl overflow-hidden flex items-center justify-center p-2 max-w-[260px] max-h-[320px]">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
              </div>
            )}

            {isImage && (
              <img
                src={msg.file}
                onLoad={handleMediaLoad}
                className="rounded-lg object-cover max-w-[220px] max-h-[300px] border"
                style={{ background: "#e5e5e5" }}
                alt="shared"
              />
            )}

            {isVideo && (
              <video
                src={msg.file}
                controls
                onLoadedData={handleMediaLoad}
                className="rounded-lg object-cover max-w-[220px] max-h-[300px] border bg-black"
                style={{ background: "#000" }}
              />
            )}

            {isPDF && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                  msg.file
                )}&embedded=true`}
                onLoad={handleMediaLoad}
                className="rounded-lg max-w-[220px] max-h-[300px] border bg-white"
                style={{ background: "#fff" }}
                title="PDF Preview"
              />
            )}
          </div>
        ) : null}

        {/* Timestamp */}
        <div className="absolute bottom-1 right-2 text-[11px] text-gray-400">
          {msg?.createdAt && moment(msg.createdAt).format("hh:mm A")}
        </div>
      </div>
    </div>
  );
}

