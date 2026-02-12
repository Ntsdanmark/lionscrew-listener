import WebSocket from "ws";
import fetch from "node-fetch";

const channel = process.env.KICK_CHANNEL;
const apiEndpoint = process.env.API_ENDPOINT;
const apiKey = process.env.API_KEY;

const ws = new WebSocket(`wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.0.3&flash=false`);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");
});

ws.on("message", async (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (!msg.data) return;

    const inner = JSON.parse(msg.data);

    if (inner.event === "App\\Events\\ChatMessageEvent") {
      const message = inner.data.message;
      const username = inner.data.sender.username;

      if (message.startsWith("!watchtime")) {
        console.log(`Watchtime requested by ${username}`);

        await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          },
          body: JSON.stringify({ username })
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
});
