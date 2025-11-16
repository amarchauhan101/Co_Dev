


// module.exports = function whiteboard(io) {
//   const scenes = {}; // { roomId: { objects: {}, paths: {} } }

//   io.on("connection", (socket) => {
//     socket.on("join-room", (roomId) => {
//       socket.join(roomId);

//       // Initialize room if needed
//       if (!scenes[roomId]) {
//         scenes[roomId] = { objects: {}, paths: {} };
//       }

//       // Send existing state to new user
//       socket.emit("scene:init", scenes[roomId]);
//     });

//     // Handle object updates
//     socket.on("object:update", ({ roomId, object }) => {
//       if (!scenes[roomId]) return;

//       scenes[roomId].objects[object.id] = object;
//       socket.to(roomId).emit("object:update", object);
//     });

//     socket.on("object:remove", ({ roomId, objectId }) => {
//       if (!scenes[roomId] || !scenes[roomId].objects[objectId]) return;

//       delete scenes[roomId].objects[objectId];
//       socket.to(roomId).emit("object:remove", objectId);
//     });

//     // Handle drawing paths
//     socket.on("path:start", ({ roomId, pathId, startPoint, color, width }) => {
//       if (!scenes[roomId]) return;

//       scenes[roomId].paths[pathId] = {
//         points: [startPoint],
//         color,
//         width
//       };
//       socket.to(roomId).emit("path:start", { pathId, startPoint, color, width });
//     });

//     socket.on("path:update", ({ roomId, pathId, point }) => {
//       if (!scenes[roomId]?.paths[pathId]) return;

//       scenes[roomId].paths[pathId].points.push(point);
//       socket.to(roomId).emit("path:update", { pathId, point });
//     });

//     socket.on("path:end", ({ roomId, pathId }) => {
//       if (!scenes[roomId]?.paths[pathId]) return;

//       // Convert path to permanent object
//       const pathData = scenes[roomId].paths[pathId];
//       const fabricPath = {
//         type: 'path',
//         path: pathToSVG(pathData.points),
//         stroke: pathData.color,
//         strokeWidth: pathData.width,
//         fill: '',
//         selectable: true,
//         id: pathId
//       };

//       scenes[roomId].objects[pathId] = fabricPath;
//       delete scenes[roomId].paths[pathId];

//       socket.to(roomId).emit("object:update", fabricPath);
//     });

//     socket.on("leave-room", (roomId) => socket.leave(roomId));
//   });
// };

// // Helper to convert points to SVG path string
// function pathToSVG(points) {
//   if (points.length === 0) return "";
//   return `M ${points[0].x} ${points[0].y} ` +
//     points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
// }

// socket/whiteboard.js


// socket/whiteboard.js
// module.exports = function whiteboard(io) {
//   const scenes = {};

//   io.on("connection", (socket) => {

//     socket.on("join-room", (roomId) => {
//       socket.join(roomId);
//       scenes[roomId] ??= { objects: {}, paths: {} };
//       socket.emit("scene:init", scenes[roomId]);   // just to the joiner
//     });

//     /* ------------- object updates ------------- */

//    socket.on("object:update", ({ roomId, object }) => {
//       if (!scenes[roomId]) return;
//       scenes[roomId].objects[object.id] = object;

//      io.in(roomId).emit("object:update", object);            // 👍 everyone
//     });

//     socket.on("object:remove", ({ roomId, objectId }) => {
//       if (!scenes[roomId]?.objects[objectId]) return;
//       delete scenes[roomId].objects[objectId];

//     io.in(roomId).emit("object:remove", objectId);
//     });

//     /* ------------- free‑hand paths ------------- */
//     socket.on("path:start", ({ roomId, pathId, startPoint, color, width }) => {
//       if (!scenes[roomId]) return;
//       scenes[roomId].paths[pathId] = { points: [startPoint], color, width };

//     io.in(roomId).emit("path:start", { pathId, startPoint, color, width });
//     });

//     socket.on("path:update", ({ roomId, pathId, point }) => {
//       if (!scenes[roomId]?.paths[pathId]) return;
//       scenes[roomId].paths[pathId].points.push(point);

//     io.in(roomId).emit("path:update", { pathId, point });
//     });

//     socket.on("path:end", ({ roomId, pathId }) => {
//       if (!scenes[roomId]?.paths[pathId]) return;

//       const p = scenes[roomId].paths[pathId];
//       const fabricPath = {
//         id: pathId,
//         type: "path",
//         path: pointsToFabricPath(p.points),
//         stroke: p.color,
//         strokeWidth: p.width,
//         fill: "",
//         selectable: true,
//       };

//       scenes[roomId].objects[pathId] = fabricPath;
//       delete scenes[roomId].paths[pathId];


//      io.in(roomId).emit("object:update", fabricPath);   // sender now sees it too
//     });

//     socket.on("leave-room", (roomId) => socket.leave(roomId));
//   });
// };
// function pathToSVG(points) {
//   if (points.length === 0) return "";
//   return `M ${points[0].x} ${points[0].y} ` +
//     points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
// }
// function pointsToFabricPath(points) {
//   if (!points || points.length === 0) return [];
//   const fabricPath = [["M", points[0].x, points[0].y]];
//   for (let i = 1; i < points.length; i++) {
//     fabricPath.push(["L", points[i].x, points[i].y]);
//   }
//   return fabricPath;
// }




// socket/whiteboard.js

module.exports = function handleWhiteboard(socket, io) {
  const scenes = {}; // move inside or make global/shared if needed

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    scenes[roomId] ??= { objects: {}, paths: {} };
    socket.emit("scene:init", scenes[roomId]);
  });

  socket.on("object:update", ({ roomId, object }) => {
    if (!scenes[roomId]) return;
    scenes[roomId].objects[object.id] = object;
    io.in(roomId).emit("object:update", object);
  });

  socket.on("object:remove", ({ roomId, objectId }) => {
    if (!scenes[roomId]?.objects[objectId]) return;
    delete scenes[roomId].objects[objectId];
    io.in(roomId).emit("object:remove", objectId);
  });

  socket.on("path:start", ({ roomId, pathId, startPoint, color, width }) => {
    if (!scenes[roomId]) return;
    scenes[roomId].paths[pathId] = { points: [startPoint], color, width };
    io.in(roomId).emit("path:start", { pathId, startPoint, color, width });
  });

  socket.on("path:update", ({ roomId, pathId, point }) => {
    if (!scenes[roomId]?.paths[pathId]) return;
    scenes[roomId].paths[pathId].points.push(point);
    io.in(roomId).emit("path:update", { pathId, point });
  });

  socket.on("path:end", ({ roomId, pathId }) => {
    if (!scenes[roomId]?.paths[pathId]) return;

    const p = scenes[roomId].paths[pathId];
    const fabricPath = {
      id: pathId,
      type: "path",
      path: pointsToFabricPath(p.points),
      stroke: p.color,
      strokeWidth: p.width,
      fill: "",
      selectable: true,
    };

    scenes[roomId].objects[pathId] = fabricPath;
    delete scenes[roomId].paths[pathId];

    io.in(roomId).emit("object:update", fabricPath);
  });

  socket.on("leave-room", (roomId) => socket.leave(roomId));
};

function pointsToFabricPath(points) {
  if (!points || points.length === 0) return [];
  const fabricPath = [["M", points[0].x, points[0].y]];
  for (let i = 1; i < points.length; i++) {
    fabricPath.push(["L", points[i].x, points[i].y]);
  }
  return fabricPath;
}
