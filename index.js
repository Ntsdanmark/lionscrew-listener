
import express from "express";
import WebSocket from "ws";
import fetch from "node-fetch";

const app = express();
app.get("/", (req, res) => res.send("alive"));
app.listen(3000, () => console.log("HTTP keep-alive server started"));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: { channel: "chatrooms.1502369.v2" }
  }));

  console.log("Subscribed to Kick V2 chatroom");
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    if (msg.event !== "App\\Events\\ChatMessageEvent") return;

    const data = JSON.parse(msg.data);
    const username = data.sender.username;
    const message = data.content;

    console.log(`[CHAT] ${username}: ${message}`);

    // SEND XP + WATCHTIME TO SUPABASE
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_watchtime_and_xp`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        minutes: 1
      })
    });

    console.log("XP + watchtime sent to Supabase");
  } catch (err) {
    console.log("Parse error", err);
  }
});

// keep railway awake
setInterval(() => {
  console.log("Listener alive...");
}, 60000);
