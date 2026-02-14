import { io } from "socket.io-client";

const CHANNEL = "landalggwp";

const socket = io("wss://chat.kick.com", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🔌 Connected to Kick chat");

  socket.emit("subscribe", {
    channel: CHANNEL,
  });
});

socket.on("chat.message", (data) => {
  console.log(`💬 ${data.sender.username}: ${data.content}`);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});
