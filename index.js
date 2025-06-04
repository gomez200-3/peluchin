const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const config = require("./config");
const fs = require("fs");
const path = require("path");

const commandsDir = path.join(__dirname, "commands");

// Cargar comandos dinámicamente
const commands = {};
fs.readdirSync(commandsDir).forEach(file => {
  if (file.endsWith(".js")) {
    const cmdName = file.replace(".js", "");
    commands[cmdName] = require(path.join(commandsDir, file));
  }
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid) return;
    const sender = msg.key.remoteJid;
    const fromNumber = sender.split("@")[0];

    // Obtener texto del mensaje
    let text = "";
    if (msg.message.conversation) text = msg.message.conversation;
    else if (msg.message.extendedTextMessage) text = msg.message.extendedTextMessage.text;

    // Prefijo de comando
    if (text.startsWith(config.prefix)) {
      const [cmd, ...args] = text.slice(config.prefix.length).split(" ");
      const userRole = getUserRole(fromNumber);

      // Buscar y ejecutar comando
      for (const moduleName in commands) {
        if (typeof commands[moduleName][cmd] === "function") {
          await commands[moduleName][cmd](sock, msg, args, userRole);
          return;
        }
      }
      await sock.sendMessage(sender, { text: "Comando no reconocido. Usa /menu para ayuda." });
    } else if (text.toLowerCase() === "hola") {
      await sock.sendMessage(sender, { text: config.welcomeMessage });
    }
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
  });
}

function getUserRole(number) {
  if (config.vipNumbers.includes(number)) return "vip";
  if (config.familyNumbers.includes(number)) return "family";
  if (number === config.ownerNumber) return "owner";
  return "user";
}

startBot();
