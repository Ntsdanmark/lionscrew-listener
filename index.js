import WebSocket from "ws";

const CHATROOM_ID = 1502369;

// ✅ KORREKT Kick EU Pusher endpoint
const ws = new WebSocket(
  "wss://ws-eu.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick EU WebSocket");

  // Subscribe til V2 chatroom
  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: {
      auth: "",
      channel: `chatrooms.${CHATROOM_ID}.v2`,
    },
  }));

  console.log(`Subscribed to chatrooms.${CHATROOM_ID}.v2`);
});

ws.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());

  if (msg.event === "App\\Events\\ChatMessageEvent") {
    const data = JSON.parse(msg.data);

    console.log(
      `[CHAT] ${data.sender.username}: ${data.content}`
    );
  }
});

ws.on("error", (err) => {
  console.error("WebSocket error:", err.message);
});
