const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        // Buscar usuario
        User.findByUsername(username, async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Error del servidor' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Verificar contraseña
            User.verifyPassword(password, user.password_hash, (err, isValid) => {
                if (err || !isValid) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                // Generar token
                const token = generateToken(user);
                
                res.json({
                    message: 'Login exitoso',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        full_name: user.full_name
                    }
                });
            });
        });

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Verificar token (para el frontend)
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// Logout (manejado en el frontend eliminando el token)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logout exitoso' });
});

module.exports = router;
