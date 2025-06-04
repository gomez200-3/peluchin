import { chiste } from '.src/funciones/entretenimiento.js'
import { menuPrincipal } from '.src/utils/helpers.js'

// Mapea cada comando al módulo y función correspondiente
export async function ejecutarComando(cmd, args, message) {
    switch (cmd) {
        case 'chiste':
            return await chiste()
        case 'menu':
        case 'ayuda':
            return menuPrincipal()
        // Agrega más comandos aquí...
        default:
            return "Comando no reconocido. Usa /menu para ver las opciones."
    }
}
