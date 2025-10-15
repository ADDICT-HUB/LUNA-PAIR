const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const router = express.Router();
const { upload } = require('./mega');

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

// Ensure temp directory exists
const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    Browsers, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function MALVIN_XD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            var items = ["Safari"];
            var randomItem = items[Math.floor(Math.random() * items.length)];
            
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;

                    function generateRandomText() {
                        const prefix = "3EB";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            randomText += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        return randomText;
                    }

                    const randomText = generateRandomText();

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "malvin~" + string_session;
                        let code = await sock.sendMessage(sock.user.id, { text: md });

                        let desc = `*Hey there, MALVIN-XD User!* 👋🏻

Thanks for using *MALVIN-XD* — your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————
*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A

*💻 Source Code:*  
Fork & explore the project on GitHub:  
https://github.com/itsguruu/SILENT-LUNA

——————
> *© Powered by Malvin King*
Stay cool and hack smart. ✌🏻`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴍᴀʟᴠɪɴ-xᴅ",
                                    thumbnailUrl: "https://files.catbox.moe/bqs70b.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: code });
                    } catch (e) {
                        console.log("❗ Upload failed:", e);
                        await sock.sendMessage(sock.user.id, { text: "Session created but upload failed. Please check logs." });
                    }

                    await delay(1000);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} connected ✅ session uploaded.`);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error?.output?.statusCode != 401) {
                    console.log("⚠️ Connection closed, retrying...");
                    await delay(2000);
                    MALVIN_XD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error("❌ Error in MALVIN_XD_PAIR_CODE:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    return await MALVIN_XD_PAIR_CODE();
});

// Keep app alive
setInterval(() => {
    console.log("✅ MALVIN-XD app running fine...");
}, 60000);

module.exports = router;
