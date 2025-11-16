// start-websocket.js
const http = require("http");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils.js");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

server.listen(1234, () => {
  console.log("✅ Yjs WebSocket server running at ws://localhost:1234");
});
