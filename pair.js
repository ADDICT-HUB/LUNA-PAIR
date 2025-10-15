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
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  if (!num) {
    return res.status(400).send({ error: "Missing number query" });
  }

  num = num.replace(/[^0-9]/g, '');
  if (num.length < 10) {
    return res.status(400).send({ error: "Invalid number format" });
  }

  async function MALVIN_XD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

    try {
      let sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Safari")
      });

      // Request pairing code
      try {
        const code = await sock.requestPairingCode(num);
        if (!res.headersSent) {
          res.status(200).send({ code });
        }
      } catch (err) {
        console.error("❌ Pairing failed:", err);
        if (!res.headersSent) {
          res.status(500).send({ error: "❗ WhatsApp pairing failed, try again later." });
        }
        removeFile('./temp/' + id);
        return;
      }

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === "open") {
          console.log(`✅ Connected as ${sock.user.id}`);

          await delay(3000);
          const rf = path.join(__dirname, `/temp/${id}/creds.json`);
          const dataExists = fs.existsSync(rf);

          if (dataExists) {
            try {
              const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
              const sessionId = "malvin~" + mega_url.replace('https://mega.nz/file/', '');

              await sock.sendMessage(sock.user.id, { text: sessionId });

              const desc = `*Hey there, MALVIN-XD User!* 👋🏻

Your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share it.

——————
✅ *Stay Updated:*  
https://whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A

💻 *Source Code:*  
https://github.com/itsguruu/SILENT-LUNA

© Powered by Malvin King`;

              await sock.sendMessage(sock.user.id, { text: desc });
            } catch (e) {
              console.error("⚠️ Upload failed:", e);
            }
          }

          await delay(2000);
          await sock.ws.close();
          removeFile('./temp/' + id);
          process.exit();
        }

        if (connection === "close" && lastDisconnect?.error) {
          console.log("🔁 Restarting connection...");
          removeFile('./temp/' + id);
          MALVIN_XD_PAIR_CODE();
        }
      });
    } catch (err) {
      console.error("❗ Service crashed:", err);
      removeFile('./temp/' + id);
      if (!res.headersSent) {
        res.status(500).send({ error: "❗ Service Unavailable" });
      }
    }
  }

  return await MALVIN_XD_PAIR_CODE();
});

module.exports = router;
