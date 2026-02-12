import WebSocket from "ws";
import fetch from "node-fetch";

const apiEndpoint = process.env.API_ENDPOINT;
const apiKey = process.env.API_KEY;

const ws = new WebSocket("wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false");

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: {
      auth: "",
      channel: "chatrooms.1502369.v2"
    }
  }));
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    if (msg.event === "App\\Events\\ChatMessageEvent") {
      const data = JSON.parse(msg.data);

      const username = data.sender.username;
      const message = data.message;

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

        console.log("Sent to Supabase");
      }
    }
  } catch (e) {
    console.error(e);
  }
});
