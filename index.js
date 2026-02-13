const WebSocket = require("ws");
const axios = require("axios");

const CHATROOM_ID = "1502369"; // LandalGGWP chatroom
const EDGE_FUNCTION = process.env.EDGE_FUNCTION;

const ws = new WebSocket(
  "wss://ws-eu.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.0.3&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick EU WebSocket");

  ws.send(
    JSON.stringify({
      event: "pusher:subscribe",
      data: {
        channel: `chatrooms.${CHATROOM_ID}.v2`,
      },
    })
  );

  console.log(`Subscribed to chatrooms.${CHATROOM_ID}.v2`);
});

ws.on("message", async (msg) => {
  const data = JSON.parse(msg.toString());

  if (data.event === "App\\Events\\ChatMessageEvent") {
    const payload = JSON.parse(data.data);

    const username = payload.sender.username;
    const message = payload.message;

    console.log(`[CHAT] ${username}: ${message}`);

    // Send til Supabase Edge Function
    try {
      await axios.post(EDGE_FUNCTION, {
        username,
        message,
      });
    } catch (err) {
      console.log("Edge error:", err.message);
    }
  }
});

ws.on("error", (err) => {
  console.log("WebSocket error:", err.message);
});

ws.on("close", () => {
  console.log("WebSocket closed. Reconnecting in 5s...");
  setTimeout(() => process.exit(1), 5000);
});

// Keep alive så Railway ikke sover
setInterval(() => {
  console.log("Listener alive...");
}, 30000);
