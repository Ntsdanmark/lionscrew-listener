import WebSocket from 'ws';
import fetch from 'node-fetch';
import express from 'express';

// ===== KEEP ALIVE SERVER (Railway kræver dette) =====
const app = express();
app.get('/', (req, res) => res.send('Listener alive'));
app.listen(3000, () => console.log('HTTP keep-alive server started'));


// ===== KICK WEBSOCKET =====
const ws = new WebSocket('wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.0.3&flash=false');

ws.on('open', () => {
    console.log('Connected to Kick WebSocket');

    ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: {
            auth: '',
            channel: 'chatrooms.2328900.v2' // DIN chatroom id
        }
    }));

    console.log('Subscribed to Kick V2 chatroom');
});


ws.on('message', async (data) => {
    try {
        const msg = JSON.parse(data);

        if (msg.event === 'App\\Events\\ChatMessageEvent') {
            const messageData = JSON.parse(msg.data);
            const username = messageData.sender.username;
            const text = messageData.content;

            console.log(`[CHAT] ${username}: ${text}`);

            // SEND WATCHTIME + XP TIL SUPABASE EDGE FUNCTION
            await fetch(process.env.SUPABASE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.API_KEY
                },
                body: JSON.stringify({
                    username: username,
                    seconds: 60
                })
            });

            console.log('XP + watchtime sent to Supabase Edge Function');
        }

    } catch (err) {
        console.error('Parse error', err);
    }
});


// ===== FAILSAFE LOG =====
setInterval(() => {
    console.log('Listener alive...');
}, 30000);
