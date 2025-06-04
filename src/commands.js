const { chiste } = require('./funciones/entretenimiento.js');
const { menuPrincipal } = require('./utils/helpers.js');

// Mapea cada comando al módulo y función correspondiente
async function ejecutarComando(cmd, args, message) {
    switch (cmd) {
        case 'chiste':
            return await chiste();
        case 'menu':
        case 'ayuda':
            return menuPrincipal();
        // Agrega más comandos aquí...
        default:
            return "Comando no reconocido. Usa /menu para ver las opciones.";
    }
}

module.exports = { ejecutarComando };
