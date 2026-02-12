import WebSocket from "ws";
import http from "http";

// Dummy HTTP server så Railway tror vi er en web service
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
}).listen(3000);

console.log("HTTP keep-alive server started");

const PUSHER_URL =
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false";

function startKickSocket() {
  const ws = new WebSocket(PUSHER_URL);

  ws.on("open", () => {
    console.log("Connected to Kick WebSocket");

    // SUBSCRIBE TIL KICK V2 CHATROOM (RET TALLET!)
    ws.send(
      JSON.stringify({
        event: "pusher:subscribe",
        data: {
          auth: "",
          channel: "chatrooms.1502369.v2",
        },
      })
    );

    console.log("Subscribed to Kick V2 chatroom");
  });

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      // Ignorer pusher system events
      if (!msg.event || !msg.data) return;

      // Kick chat event
      if (msg.event === "App\\Events\\ChatMessageEvent") {
        const data = JSON.parse(msg.data);

        const username = data.sender?.username;
        const message = data.content;

        if (!username || !message) return;

        console.log(`[CHAT] ${username}: ${message}`);

        // HER kan du kalde Supabase XP/watchtime funktion
        // await giveXP(username);
      }
    } catch (err) {
      console.log("Parse error:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("Socket closed. Reconnecting in 5s...");
    setTimeout(startKickSocket, 5000);
  });

  ws.on("error", (err) => {
    console.log("WebSocket error:", err.message);
  });
}

startKickSocket();


// 🚨 KRITISK FOR RAILWAY — HOLD PROCESSEN I LIVE
setInterval(() => {
  console.log("Listener alive...");
}, 30000);
