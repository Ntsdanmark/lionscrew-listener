import WebSocket from "ws";
import fetch from "node-fetch";

const apiEndpoint = "https://sodicmskjlevndktzrht.supabase.co/functions/v1/update-watchtime";
const apiKey = process.env.API_KEY;

const channelName = "chatrooms.landalggwp.v2";

const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.0.3&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");

  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: {
      channel: channelName,
    },
  }));
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
        console.log(`Updating watchtime for ${username}`);

        await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ username }),
        });

        console.log("Watchtime + XP updated");
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
});
