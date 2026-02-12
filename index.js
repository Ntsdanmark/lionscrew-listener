import WebSocket from "ws";
import fetch from "node-fetch";

const API_ENDPOINT = process.env.API_ENDPOINT;
const API_KEY = process.env.API_KEY;

// Kick Pusher WebSocket
const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    // Når vi er connected → subscribe til V2 chat
    if (msg.event === "pusher:connection_established") {
      ws.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: {
            auth: "",
            channel: "chatrooms.1502369.v2"
          }
        })
      );
      console.log("Subscribed to Kick V2 chatroom");
      return;
    }

    if (!msg.data) return;

    const inner = JSON.parse(msg.data);

    // Kun chat events
    if (inner.event !== "App\\Events\\ChatMessageEvent") return;

    const chat = inner.data;
    const username = chat.sender.username;
    const message = chat.message?.toLowerCase() || "";

    console.log(`[CHAT] ${username}: ${message}`);

    // Når BotRix svarer med watchtime
    if (
      username === "BotRix" &&
      message.includes("has watched this channel for")
    ) {
      console.log("BotRix watchtime detected → sending to Supabase");

      await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ username: chat.mentioned_users[0].username })
      });

      console.log("XP + watchtime sent to Supabase");
    }
  } catch (err) {
    console.error(err);
  }
});
