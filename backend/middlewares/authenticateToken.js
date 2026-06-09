const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret';

const authenticateToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(403).json({ message: 'No token provided' });

    // Acepta "Bearer <token>" o el token directo
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
