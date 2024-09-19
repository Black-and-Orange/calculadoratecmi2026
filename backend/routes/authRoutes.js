const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

const SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
    const { user: username, password } = req.body; 

    try {
        const userQuery = 'SELECT * FROM users WHERE user = ?';
        const [userResult] = await db.promise().query(userQuery, [username]);

        if (userResult.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado.' });
        }

        const isPasswordValid = await bcrypt.compare(password, userResult[0].password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Contraseña incorrecta.' });
        }

        const token = jwt.sign({ user: userResult[0].user }, SECRET, { expiresIn: '1h' });
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
