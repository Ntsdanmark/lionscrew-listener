import WebSocket from "ws";

const CHANNEL = "landalggwp"; // stream navn (små bogstaver)

async function start() {
  // 1️⃣ Hent stream info fra Kick API
  const res = await fetch(`https://kick.com/api/v2/channels/${CHANNEL}`);
  const json = await res.json();

  const chatroomId = json.chatroom.id;
  console.log("✅ Chatroom ID:", chatroomId);

  // 2️⃣ Hent korrekt websocket info
  const wsRes = await fetch("https://kick.com/api/v2/pusher");
  const wsJson = await wsRes.json();

  const { key, cluster } = wsJson;

  console.log("🔑 Using key:", key);
  console.log("🌍 Cluster:", cluster);

  // 3️⃣ Forbind korrekt
  const ws = new WebSocket(
    `wss://ws-${cluster}.pusher.com/app/${key}?protocol=7&client=js&version=8.4.0&flash=false`
  );

  ws.on("open", () => {
    console.log("🔌 Connected to Kick WebSocket");
  });

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());

    if (msg.event === "pusher:connection_established") {
      console.log("✅ Handshake complete");

      ws.send(JSON.stringify({
        event: "pusher:subscribe",
        data: {
          auth: "",
          channel: `chatrooms.${chatroomId}.v2`,
        },
      }));
    }

    if (msg.event === "pusher_internal:subscription_succeeded") {
      console.log("🎉 Subscription succeeded");
    }

    if (msg.event === "App\\Events\\ChatMessageEvent") {
      const data = JSON.parse(msg.data);
      console.log(`💬 ${data.sender.username}: ${data.content}`);
    }
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
  });
}

start();
