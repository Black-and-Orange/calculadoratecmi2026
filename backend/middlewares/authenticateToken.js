const jwt = require('jsonwebtoken');

// Resuelve el secreto de firma JWT según el entorno, SIN fallback hardcodeado:
//  - Cloudflare Worker: bindings/secrets vía globalThis.__CF_ENV (lo fija worker.js
//    antes de cargar la app; es el mismo mecanismo que usa config/dbConfig.js).
//  - Node/local: process.env.JWT_SECRET (cargado desde .env por dotenv).
// Si no está configurado se lanza un error (fail-closed). El valor nunca se
// registra ni se devuelve en respuestas.
function getJwtSecret() {
    const fromWorker = globalThis.__CF_ENV && globalThis.__CF_ENV.JWT_SECRET;
    const secret = fromWorker || process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no configurado');
    return secret;
}

const authenticateToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(403).json({ message: 'No token provided' });

    // Acepta "Bearer <token>" o el token directo
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;

    let secret;
    try {
        secret = getJwtSecret();
    } catch (e) {
        // Configuración ausente: denegar sin exponer detalles.
        console.error('Auth: JWT_SECRET no configurado');
        return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    // Solo HS256: evita confusión de algoritmos (p. ej. "none" o RS*).
    jwt.verify(token, secret, { algorithms: ['HS256'] }, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
module.exports.getJwtSecret = getJwtSecret;
