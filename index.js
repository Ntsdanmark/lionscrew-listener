import express from "express";
import WebSocket from "ws";
import fetch from "node-fetch";

const app = express();
app.get("/", (req, res) => res.send("alive"));
app.listen(3000, () => console.log("HTTP keep-alive server started"));

const CHATROOM_ID = "1502369"; // LandalGGWP chatroom
const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL;
const API_KEY = process.env.API_KEY;

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: {
      channel: `chatrooms.${CHATROOM_ID}.v2`
    }
  }));

  console.log(`Subscribed to chatrooms.${CHATROOM_ID}.v2`);
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    if (msg.event !== "App\\Events\\ChatMessageEvent") return;

    const data = JSON.parse(msg.data);

    const username = data.sender.username;
    const content = data.content;

    console.log(`[CHAT] ${username}: ${content}`);

    // Send watchtime + xp to Supabase Edge Function
    await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        username: username,
        message: content
      })
    });

  } catch (err) {
    console.log("Parse error", err);
  }
});

setInterval(() => {
  console.log("Listener alive...");
}, 20000);
