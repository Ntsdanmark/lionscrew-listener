import WebSocket from "ws";

const CHATROOM_ID = 1502369;

const ws = new WebSocket(
  "wss://ws-eu.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("🔌 Connected to Kick EU WebSocket");
});

ws.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());

  // ✅ MEGET VIGTIGT – handshake efter connection_established
  if (msg.event === "pusher:connection_established") {
    console.log("✅ Pusher handshake OK");

    ws.send(JSON.stringify({
      event: "pusher:subscribe",
      data: {
        auth: "",
        channel: `chatrooms.${CHATROOM_ID}.v2`,
      },
    }));

    console.log(`📡 Subscribed to chatrooms.${CHATROOM_ID}.v2`);
  }

  // ✅ HER KOMMER CHATBESKEDERNE
  if (msg.event === "App\\Events\\ChatMessageEvent") {
    const data = JSON.parse(msg.data);

    console.log(
      `💬 ${data.sender.username}: ${data.content}`
    );
  }
});

ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
});
