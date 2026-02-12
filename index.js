import WebSocket from "ws";
import fetch from "node-fetch";
import express from "express";

// ===== ENV =====
const CHATROOM_ID = process.env.CHATROOM_ID;
const FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
const API_KEY = process.env.API_KEY;

// ===== KEEP ALIVE FOR RAILWAY =====
const app = express();
app.get("/", (req, res) => res.send("Listener alive"));
app.listen(3000, () => console.log("HTTP keep-alive server started"));

// ===== KICK WEBSOCKET (CORRECT EU HOST) =====
const ws = new WebSocket(
  "wss://ws-eu.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.0.3&flash=false"
);

console.log("Using chatroom:", CHATROOM_ID);

// ===== CONNECT =====
ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  // Subscribe to correct v2 chatroom
  ws.send(
    JSON.stringify({
      event: "pusher:subscribe",
      data: {
        auth: "",
        channel: `chatrooms.${CHATROOM_ID}.v2`,
      },
    })
  );

  console.log("Subscribed to Kick V2 chatroom");
});

// ===== MESSAGE HANDLING =====
ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    if (msg.event !== "App\\Events\\ChatMessageEvent") return;

    const data = JSON.parse(msg.data);

    const username = data.sender.username;
    const content = data.content;

    console.log(`[CHAT] ${username}: ${content}`);

    // ===== SEND TO SUPABASE EDGE FUNCTION =====
    await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        username: username,
        message: content,
      }),
    });

  } catch (err) {
    console.log("Parse error", err);
  }
});

// ===== ERROR HANDLING (so Railway doesn't kill it) =====
ws.on("error", (err) => {
  console.log("WebSocket error:", err.message);
});

ws.on("close", () => {
  console.log("WebSocket closed. Reconnecting in 5s...");
  setTimeout(() => process.exit(1), 5000);
});
