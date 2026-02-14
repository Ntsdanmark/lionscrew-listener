const CHANNEL = "landalggwp";

async function start() {
  // 1️⃣ Hent channel info
  const channelRes = await fetch(`https://kick.com/api/v2/channels/${CHANNEL}`);
  const channelData = await channelRes.json();

  const chatroomId = channelData.chatroom.id;
  console.log("✅ Chatroom ID:", chatroomId);

  let lastMessageId = null;

  // 2️⃣ Poll chat hvert 2. sekund
  setInterval(async () => {
    try {
      const res = await fetch(
        `https://kick.com/api/v2/chatrooms/${chatroomId}/messages`
      );

      const data = await res.json();

      const messages = data.data;

      if (!messages.length) return;

      // sorter ældste → nyeste
      messages.reverse();

      for (const msg of messages) {
        if (msg.id === lastMessageId) continue;

        lastMessageId = msg.id;

        console.log(
          `💬 ${msg.sender.username}: ${msg.content}`
        );
      }
    } catch (err) {
      console.log("❌ Fetch error:", err.message);
    }
  }, 2000);
}

start();
