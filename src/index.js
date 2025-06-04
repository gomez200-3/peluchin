const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { handleMessage } = require('./bot.js');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Reconectando...');
                startBot();
            } else {
                console.log('Sesión cerrada. Escanea el QR nuevamente.');
            }
        } else if (connection === 'open') {
            console.log('🤖 Bot iniciado correctamente');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        // Ignora mensajes de estado y de ti mismo
        if (!msg.message || msg.key.fromMe) return;
        await handleMessage(sock, msg);
    });
}

startBot();
