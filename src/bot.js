import { ejecutarComando } from '.src/commands.js'

export async function handleMessage(sock, message) {
    try {
        if (!message.message) return

        const from = message.key.remoteJid
        const msgText = message.message.conversation || message.message.extendedTextMessage?.text || ""

        // Comandos empiezan con "/"
        if (msgText.startsWith('/')) {
            const [cmd, ...args] = msgText.slice(1).split(' ')
            const respuesta = await ejecutarComando(cmd.toLowerCase(), args, message)
            if (respuesta) {
                await sock.sendMessage(from, { text: respuesta }, { quoted: message })
            }
        }
    } catch (e) {
        console.error("Error manejando mensaje:", e)
    }
}
