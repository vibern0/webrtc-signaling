// server.js — WebRTC Signaling Server
// Run: npm install && node server.js
// Then open http://localhost:3000 in TWO tabs

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// Keep track of connected peers (simple 2-peer demo)
let peers = [];

io.on("connection", (socket) => {
  console.log(`[+] Peer connected: ${socket.id}`);
  peers.push(socket.id);

  // Tell this socket how many peers are in the room
  socket.emit("peers-count", peers.length);

  // Notify other peer that someone joined
  socket.broadcast.emit("peer-joined", socket.id);

  // ── WebRTC Signaling ──────────────────────────────────────────────────────

  // Relay SDP offer to the other peer
  socket.on("offer", (data) => {
    console.log(`[>] Offer from ${socket.id}`);
    socket.broadcast.emit("offer", { sdp: data.sdp, from: socket.id });
  });

  // Relay SDP answer back to the offerer
  socket.on("answer", (data) => {
    console.log(`[>] Answer from ${socket.id}`);
    socket.broadcast.emit("answer", { sdp: data.sdp, from: socket.id });
  });

  // Relay ICE candidates between peers
  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", { candidate: data.candidate });
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[-] Peer disconnected: ${socket.id}`);
    peers = peers.filter((id) => id !== socket.id);
    socket.broadcast.emit("peer-left");
  });
});

// const PORT = 3000;
server.listen(process.env.PORT, () =>
  console.log(`\n🚀  Signaling server running at http://localhost:${PORT}\n   Open the URL in TWO browser tabs to test WebRTC messaging.\n`)
);