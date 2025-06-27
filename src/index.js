// Esto carga las variables del .env
require('dotenv').config();

// Esto importa Baileys
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');

// Aquí sigue el resto de la lógica de tu bot...
console.log(process.env.PORT);
// Ejemplo de uso de una variable del .env
const { handleMessage } = require('./bot.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function enviarQRPorGmail(rutaQR) {
    // Configura el transporter de nodemailer usando Gmail
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    let mailOptions = {
        from: `"Bot WhatsApp" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_TO,
        subject: 'QR para iniciar sesión en tu bot de WhatsApp',
        text: 'Adjunto el QR para iniciar sesión en el bot.',
        attachments: [
            {
                filename: 'qr.png',
                path: rutaQR
            }
        ]
    };

    // Envía el correo
    await transporter.sendMail(mailOptions);
    console.log('QR enviado por Gmail a:', process.env.GMAIL_TO);
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            // Crea directorio QR si no existe
            const qrDir = path.join(__dirname, '..', 'qr');
            if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir);
            const qrPath = path.join(qrDir, 'qr.png');
            await qrcode.toFile(qrPath, qr);

            // Enviar el QR por Gmail
            await enviarQRPorGmail(qrPath);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
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
        if (!msg.message || msg.key.fromMe) return;
        await handleMessage(sock, msg);
    });
}

startBot();
