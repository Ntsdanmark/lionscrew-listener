import WebSocket from "ws";
import fetch from "node-fetch";
import http from "http";

const apiEndpoint = process.env.API_ENDPOINT;
const apiKey = process.env.API_KEY;

// keep Railway awake
http.createServer((req, res) => res.end("alive")).listen(3000);
console.log("HTTP keep-alive server started");

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  // IMPORTANT: subscribe to the REAL chat channel
  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: {
      channel: "chatroom_1502369"   // <-- THIS IS THE FIX
    }
  }));

  console.log("Subscribed to REAL Kick chatroom");
});

ws.on("message", async (data) => {
  try {
    const msg = JSON.parse(data.toString());

    if (!msg.event) return;

    if (msg.event === "App\\Events\\ChatMessageEvent") {
      const payload = JSON.parse(msg.data);

      const username = payload.sender.username;
      const message = payload.message;

      console.log(`[CHAT] ${username}: ${message}`);

      if (message.startsWith("!watchtime")) {
        await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          },
          body: JSON.stringify({ username })
        });

        console.log("XP + watchtime sent to Supabase");
      }
    }
  } catch (err) {
    console.error(err);
  }
});
