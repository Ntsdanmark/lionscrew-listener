import WebSocket from "ws";

const CHATROOM_ID = 1502369;

const ws = new WebSocket(
  "wss://ws-eu.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("🔌 Connected to Kick EU WebSocket");
});

ws.on("message", (raw) => {
  const message = JSON.parse(raw.toString());

  console.log("📩 RAW EVENT:", message.event);

  // 🟢 Håndter ALLE pusher events
  if (message.event && message.event.startsWith("pusher:")) {
    console.log("⚡ Pusher event:", message.event);
  }

  // 🟢 Når forbindelse er etableret → subscribe
  if (message.event === "pusher:connection_established") {
    console.log("✅ Handshake complete");

    ws.send(JSON.stringify({
      event: "pusher:subscribe",
      data: {
        auth: "",
        channel: `chatrooms.${CHATROOM_ID}.v2`,
      },
    }));

    console.log(`📡 Subscribed to chatrooms.${CHATROOM_ID}.v2`);
  }

  // 🟢 Når subscription lykkes
  if (message.event === "pusher_internal:subscription_succeeded") {
    console.log("🎉 Subscription succeeded");
  }

  // 🟢 Chat beskeder
  if (message.event === "App\\Events\\ChatMessageEvent") {
    const data = JSON.parse(message.data);
    console.log(`💬 ${data.sender.username}: ${data.content}`);
  }
});

ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
});
