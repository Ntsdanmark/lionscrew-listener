import WebSocket from "ws";
import fetch from "node-fetch";

const apiEndpoint = "https://sodicmskjlevndktzrht.supabase.co/functions/v1/update-watchtime";
const apiKey = process.env.API_KEY;

// Dit rigtige Kick chatroom ID
const CHANNEL = "chatroom_1502369";

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  // 🔥 Abonnér på RIGTIG chat kanal
  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: {
      auth: "",
      channel: CHANNEL,
    },
  }));

  console.log("Subscribed to Kick chatroom");
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    // Vi vil kun have chat events
    if (msg.event !== "App\\Events\\ChatMessageEvent") return;

    const data = JSON.parse(msg.data);

    const username = data.sender.username;
    const message = data.message;

    console.log(`[CHAT] ${username}: ${message}`);

    if (message.startsWith("!watchtime")) {
      console.log(`Updating XP for ${username}`);

      await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ username }),
      });

      console.log("XP + watchtime sent to Supabase");
    }
  } catch (err) {
    console.error("Error:", err);
  }
});
