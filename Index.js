import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';

function getGreeting() {
  const hour = new Date().getHours();
  const greetings = [
    "Hope you're having a fantastic day!",
    "Wishing you all the best!",
    "Stay awesome!",
    "Cheers! 😊",
    "Enjoy your day! 🌟",
    "How’s it going?",
    "Sending positive vibes your way!",
  ];
  const greet =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";
  const warm = greetings[Math.floor(Math.random() * greetings.length)];
  return `${greet}! ${warm}`;
}

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state, printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    if (!m.messages || m.type !== 'notify') return;
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    // Keyword replies
    if (body.toLowerCase().includes("send azza")) {
      await sock.sendMessage(from, { text: "Here is Azza for you!" });
    }
    if (body.toLowerCase().includes("account number")) {
      await sock.sendMessage(from, { text: "9035302085 moniepont" });
    }

    // Always greet
    await sock.sendMessage(from, { text: getGreeting() });

    // Random emoji reaction
    const emojis = ["😊", "👍", "🔥", "😂", "🙌", "😎", "💯"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
  });
}

startSock();
