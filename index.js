import WebSocket from "ws";
import fetch from "node-fetch";

const CHATROOM_ID = 1502369; // Landal chatroom
const FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
const API_KEY = process.env.API_KEY;

console.log("Using chatroom:", CHATROOM_ID);

const ws = new WebSocket("wss://ws-us.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.0.3&flash=false");

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: { channel: `chatrooms.${CHATROOM_ID}.v2` }
  }));
});

ws.on("message", async (msg) => {
  try {
    const parsed = JSON.parse(msg.toString());

    if (parsed.event !== "App\\Events\\ChatMessageEvent") return;

    const data = JSON.parse(parsed.data);

    const username = data.sender.username;
    const message = data.content;

    console.log(`[CHAT] ${username}: ${message}`);

    // Send watchtime update to Supabase Edge Function
    await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        username: username,
        seconds: 15
      })
    });

  } catch (err) {
    console.log("Parse error:", err.message);
  }
});

setInterval(() => {
  console.log("Listener alive...");
}, 30000);
