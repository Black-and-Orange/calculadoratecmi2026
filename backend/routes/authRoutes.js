const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const rateLimit = require('../middlewares/rateLimit');

// Rate limiting por IP (Block 1 / P2). Umbrales conservadores; ajustar si hace falta.
const limitLogin = rateLimit({ bucket: 'login', windowMs: 60 * 1000, max: 5 });
const limitRegister = rateLimit({ bucket: 'register', windowMs: 60 * 1000, max: 3 });

// Hash bcrypt de referencia para igualar el tiempo de respuesta cuando el usuario
// no existe (evita enumeración por timing). Precalculado como constante (no es un
// secreto) en lugar de generarlo al cargar: en Cloudflare Workers la API de
// criptografía no está disponible durante la evaluación del módulo, así que
// bcrypt.hashSync() al arranque hacía fallar el despliegue del Worker (error 10021).
const DUMMY_HASH = '$2b$10$JKRUmxsAr9Hc3GlT38cTx.CkTQ1eXIjkE51A.wpx5iBpyoKX8obo.';
const MSG_CREDENCIALES = 'Credenciales inválidas.';

router.post('/register', limitRegister, async (req, res) => {
    const { user, password } = req.body;

    try {
        const existingUserQuery = 'SELECT * FROM users WHERE user = ?';
        const [existingUser] = await db.promise().query(existingUserQuery, [user]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El usuario ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO users (user, password) VALUES (?, ?)';
        await db.promise().query(insertUserQuery, [user, hashedPassword]);

        res.status(201).json({ message: 'Usuario registrado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

router.post('/login', limitLogin, async (req, res) => {
    const { user: username, password } = req.body;
    const passwordStr = typeof password === 'string' ? password : '';

    try {
        const userQuery = 'SELECT * FROM users WHERE user = ?';
        const [userResult] = await db.promise().query(userQuery, [username]);

        if (userResult.length === 0) {
            // Mismo costo de bcrypt y mismo mensaje que una contraseña incorrecta.
            await bcrypt.compare(passwordStr, DUMMY_HASH);
            return res.status(400).json({ message: MSG_CREDENCIALES });
        }

        const isPasswordValid = await bcrypt.compare(passwordStr, userResult[0].password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: MSG_CREDENCIALES });
        }

        const token = jwt.sign({ user: userResult[0].user }, authenticateToken.getJwtSecret(), { expiresIn: '1h', algorithm: 'HS256' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

router.get('/ruta-protegida', authenticateToken, (req, res) => {
    res.json({ message: 'Has accedido a una ruta protegida.', user: req.user });
});

module.exports = router;
