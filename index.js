import WebSocket from "ws";
import fetch from "node-fetch";

const apiEndpoint = process.env.API_ENDPOINT;
const apiKey = process.env.API_KEY;

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  // Subscribe til dit chatroom
  ws.send(
    JSON.stringify({
      event: "pusher:subscribe",
      data: { channel: "chatrooms.1502369.v2" }
    })
  );

  console.log("Subscribed to Kick chatroom");
});

ws.on("message", async (raw) => {
  try {
    const outer = JSON.parse(raw.toString());

    if (!outer.data) return;

    const inner = JSON.parse(outer.data);

    // Log ALT så vi kan se formatet
    console.log("RAW EVENT:", inner);

    if (inner.event !== "App\\Events\\ChatMessageEvent") return;

    const username = inner.data?.sender?.username;
    const message = inner.data?.content;

    if (!username || !message) return;

    console.log(`[CHAT] ${username}: ${message}`);

    if (message.toLowerCase().startsWith("!watchtime")) {
      console.log("Triggering XP for", username);

      await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({ username })
      });

      console.log("XP sent to API");
    }
  } catch (err) {
    console.error("Parse error:", err);
  }
});

// HOLD PROCESSEN I LIVE
setInterval(() => {}, 1000);
