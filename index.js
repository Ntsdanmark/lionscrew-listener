import WebSocket from "ws";
import fetch from "node-fetch";
import http from "http";

const CHANNEL_ID = process.env.CHANNEL_ID;
const API_URL = process.env.SUPABASE_FUNCTION_URL;
const API_KEY = process.env.SUPABASE_API_KEY;

// Keep-alive HTTP server (Railway må ikke lukke container)
http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Listener alive");
  })
  .listen(3000, () => {
    console.log("HTTP keep-alive server started");
  });

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  // Subscribe til rigtige Kick V2 chatroom
  ws.send(
    JSON.stringify({
      event: "pusher:subscribe",
      data: {
        channel: `chatrooms.${CHANNEL_ID}.v2`,
      },
    })
  );

  console.log("Subscribed to Kick V2 chatroom");
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    if (!msg.data) return;

    const data = JSON.parse(msg.data);

    // Kun chat events
    if (data.event !== "App\\Events\\ChatMessageEvent") return;

    const username = data.data.sender.username;
    const message = data.data.content;

    if (!username || !message) return;

    console.log(`[CHAT] ${username}: ${message}`);

    // 🔥 SEND TIL SUPABASE FOR HVER CHAT BESKED
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ username }),
    });

    console.log("XP + watchtime sent to Supabase");
  } catch (err) {
    console.log("Parse error:", err.message);
  }
});

// Auto reconnect hvis WS dør
ws.on("close", () => {
  console.log("WebSocket closed. Reconnecting in 5s...");
  setTimeout(() => process.exit(1), 5000);
});
