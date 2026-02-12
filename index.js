import WebSocket from "ws";
import fetch from "node-fetch";

const apiEndpoint = process.env.API_ENDPOINT;
const apiKey = process.env.API_KEY;

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());
    if (!msg.data) return;

    const inner = JSON.parse(msg.data);

    if (inner.event !== "App\\Events\\ChatMessageEvent") return;

    const username = inner.data.sender.username;
    const message = inner.data.message;

    console.log(`[CHAT] ${username}: ${message}`);

    // VI LYTTER EFTER BOTRIX SVAR
    if (username === "BotRix" && message.includes("has watched this channel for")) {
      const match = message.match(
        /@(\w+)\s+has watched this channel for\s+(\d+)\s+days?\s+(\d+)\s+hours?\s+(\d+)\s+min/
      );

      if (!match) return;

      const user = match[1];
      const days = parseInt(match[2]);
      const hours = parseInt(match[3]);
      const minutes = parseInt(match[4]);

      const totalMinutes = days * 1440 + hours * 60 + minutes;

      console.log(`Parsed watchtime for ${user}: ${totalMinutes} minutes`);

      await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          username: user,
          minutes: totalMinutes,
        }),
      });

      console.log("Real watchtime sent to Supabase");
    }
  } catch (err) {
    console.error(err);
  }
});
