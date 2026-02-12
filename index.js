import WebSocket from "ws";
import fetch from "node-fetch";

const API_ENDPOINT = process.env.API_ENDPOINT;
const API_KEY = process.env.API_KEY;

// Kick Pusher
const ws = new WebSocket(
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
);

ws.on("open", () => {
  console.log("Connected to Kick WebSocket");
});

ws.on("message", async (raw) => {
  try {
    const msg = JSON.parse(raw.toString());

    // Når connection er klar → subscribe til V2 chatroom
    if (msg.event === "pusher:connection_established") {
      ws.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: {
            auth: "",
            channel: "chatrooms.1502369.v2" // DIN RIGTIGE CHANNEL
          }
        })
      );
      console.log("Subscribed to Kick V2 chatroom");
      return;
    }

    if (!msg.data) return;

    const inner = JSON.parse(msg.data);

    if
