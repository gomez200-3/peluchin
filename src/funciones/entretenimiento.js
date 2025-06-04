async function chiste() {
    // Aquí puedes usar una API de chistes o una lista local
    const chistes = [
        "¿Por qué los programadores confunden Halloween y Navidad? Porque OCT 31 == DEC 25.",
        "¿Cuál es el animal más antiguo? La cebra, porque está en blanco y negro."
    ];
    return chistes[Math.floor(Math.random() * chistes.length)];
}

// Aquí irían las demás funciones de entretenimiento...

module.exports = { chiste };
