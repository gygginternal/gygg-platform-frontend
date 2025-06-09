import { io } from "socket.io-client";

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:4000/api/v1";
const socketUrl = new URL(backendUrl).origin; // Extract domain (e.g., http://localhost:4000)

// Initialize and export the socket instance

const socket = io(socketUrl, {
  path: "/socketio",
  reconnection: false,
});
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Connect error:", err.message);
});

export default socket;
