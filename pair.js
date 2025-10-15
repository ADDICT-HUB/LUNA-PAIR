const fs = require('fs');
const express = require('express');
const pino = require("pino");
const router = express.Router();
const { makeid } = require('./gen-id');
const { upload } = require('./mega');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

// ✅ Ensure temp folder exists
const TEMP_PATH = './temp';
if (!fs.existsSync(TEMP_PATH)) fs.mkdirSync(TEMP_PATH, { recursive: true });

// 🔧 Utility function to remove folder safely
function removeFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { recursive: true, force: true });
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    if (!num) {
        return res.status(400).json({ error: "Missing 'number' parameter." });
    }

    num = num.replace(/[^0-9]/g, '');
    console.log(`📲 Pairing request for: ${num}`);

    async function generatePairCode() {
        const { state, saveCreds } = await useMultiFileAuthState(`${TEMP_PATH}/${id}`);

        try {
            const browser = ["Safari", "Firefox", "Chrome"];
            const randomBrowser = browser[Math.floor(Math.random() * browser.length)];

            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }),
                browser: Browsers.macOS(randomBrowser)
            });

            // ✅ Request pairing code
            if (!sock.authState.creds.registered) {
                await delay(2000);
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    return res.status(200).json({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
                if (connection === "open") {
                    await delay(3000);
                    console.log(`✅ Connected: ${sock.user.id}`);

                    const rf = `${TEMP_PATH}/${id}/creds.json`;
                    if (fs.existsSync(rf)) {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const sessionID = "malvin~" + mega_url.replace('https://mega.nz/file/', '');

                        const successMsg = `*Hey there, MALVIN-XD User!* 👋🏻

Your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ Keep it safe — don't share it.

💻 *GitHub:*  
https://github.com/itsguruu/SILENT-LUNA  
© Powered by *Malvin King*`;

                        await sock.sendMessage(sock.user.id, { text: sessionID });
                        await sock.sendMessage(sock.user.id, { text: successMsg });
                    }

                    await delay(1000);
                    await sock.ws.close();
                    removeFile(`${TEMP_PATH}/${id}`);
                    process.exit();
                } else if (connection === "close") {
                    console.log("🔄 Reconnecting...");
                    await delay(2000);
                    generatePairCode();
                }
            });

        } catch (err) {
            console.error("❌ Pairing error:", err);
            removeFile(`${TEMP_PATH}/${id}`);
            if (!res.headersSent) {
                return res.status(500).json({ error: "❗ Service temporarily unavailable. Try again later." });
            }
        }
    }

    return await generatePairCode();
});

module.exports = router;
