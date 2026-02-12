import express from "express";
import WebSocket from "ws";
import fetch from "node-fetch";

const app = express();
app.get("/", (req, res) => res.send("alive"));
app.listen(3000, () => console.log("HTTP keep-alive server started"));

const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
const API_KEY = process.env.API_KEY;

// ✅ RIGTIGT chatroom id fra Kick API
const chatroomId = 1502369;

console.log("Using chatroom:", chatroomId);

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/3c2bd69e4b95bf976979?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  ws.send(
    JSON.stringify({
      event: "pusher:subscribe",
      data: {
        channel: `chatrooms.${chatroomId}.v2`,
      },
    })
  );

  console.log("Subscribed to Kick V2 chatroom");
});

ws.on("message", async (data) => {
  try {
    const msg = JSON.parse(data.toString());

    if (msg.event !== "App\\Events\\ChatMessageEvent") return;

    const payload = JSON.parse(msg.data);
    const username = payload.sender.username;
    const message = payload.content;

    console.log(`[CHAT] ${username}: ${message}`);

    // 🔥 SEND TIL SUPABASE EDGE FUNCTION
    await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        username: username,
        message: message,
      }),
    });
  } catch (err) {
    console.log("Parse error", err);
  }
});

// keep alive log
setInterval(() => {
  console.log("Listener alive...");
}, 30000);
