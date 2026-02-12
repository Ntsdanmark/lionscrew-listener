import WebSocket from "ws";
import fetch from "node-fetch";

const API_ENDPOINT = process.env.API_ENDPOINT;
const API_KEY = process.env.API_KEY;

// KICK PUSHER SOCKET
const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  // SUBSCRIBE TO YOUR CHANNEL (V2 CHATROOM)
  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: {
      auth: "",
      channel: "chatrooms.1502369.v2" // <-- DIN KICK CHATROOM ID
    }
  }));

  console.log("Subscribed to Kick V2 chatroom");
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    // Ignore non chat events
    if (!msg.data) return;

    const data = typeof msg.data === "string"
      ? JSON.parse(msg.data)
      : msg.data;

    // Only chat messages
    if (msg.event !== "App\\Events\\ChatMessageEvent") return;

    const username = data.sender?.username;
    const message = data.message;

    if (!username || !message) return;

    console.log(`[CHAT] ${username}: ${message}`);

    // WATCHTIME COMMAND
    if (message.toLowerCase().startsWith("!watchtime")) {
      console.log("Sending XP + watchtime to Supabase...");

      await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ username })
      });

      console.log("XP + watchtime sent to Supabase");
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
});

// AUTO RECONNECT (VIGTIGT)
ws.on("close", () => {
  console.log("Socket closed. Reconnecting in 5s...");
  setTimeout(() => process.exit(1), 5000);
});
