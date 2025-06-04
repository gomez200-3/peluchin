import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { handleMessage } from './bot.js'

// Inicio y autenticación con Baileys
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const { version } = await fetchLatestBaileysVersion()
    const sock = makeWASocket({
        version,
        auth: state
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            await handleMessage(sock, messages[0])
        }
    })

    sock.ev.on('creds.update', saveCreds)
    console.log("🤖 Bot iniciado correctamente")
}

startBot()
