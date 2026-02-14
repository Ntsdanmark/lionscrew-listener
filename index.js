import WebSocket from "ws";

const CHATROOM_ID = 1502369;

// ✅ RIGTIG KICK PUSHER (US CLUSTER)
const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/6e7c9d2d4f7f6e0b1e62?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("🔌 Connected to Kick WebSocket (US2)");
});

ws.on("message", (raw) => {
  const message = JSON.parse(raw.toString());

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

  if (message.event === "pusher_internal:subscription_succeeded") {
    console.log("🎉 Subscription succeeded");
  }

  if (message.event === "App\\Events\\ChatMessageEvent") {
    const data = JSON.parse(message.data);
    console.log(`💬 ${data.sender.username}: ${data.content}`);
  }

  if (message.event === "pusher:error") {
    console.log("❌ Pusher error:", message.data);
  }
});

ws.on("error", (err) => {
  console.error("WebSocket error:", err.message);
});
