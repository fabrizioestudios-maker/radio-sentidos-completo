const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Program = require('../models/Program');
const News = require('../models/News');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Dashboard stats con datos reales
router.get('/dashboard', requireRole(['admin', 'super_admin']), (req, res) => {
    // Obtener estadísticas en paralelo
    Promise.all([
        new Promise((resolve) => User.countActive((err, result) => resolve(err ? 0 : result.count))),
        new Promise((resolve) => Program.countActive((err, result) => resolve(err ? 0 : result.count))),
        new Promise((resolve) => News.countPublished((err, result) => resolve(err ? 0 : result.count)))
    ]).then(([totalUsers, activePrograms, publishedNews]) => {
        res.json({
            message: 'Dashboard administrativo',
            stats: {
                totalUsers,
                activePrograms, 
                publishedNews
            },
            user: req.user
        });
    }).catch(error => {
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    });
});

// Gestión de usuarios (solo super admin)
router.get('/users', requireRole(['super_admin']), (req, res) => {
    User.getAll((err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo usuarios' });
        }
        res.json(users);
    });
});

// Crear nuevo usuario (solo super admin)
router.post('/users', requireRole(['super_admin']), (req, res) => {
    const { username, email, password, role, full_name } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Usuario, email y contraseña son requeridos' });
    }
    
    const userData = {
        username,
        email,
        password,
        role: role || 'operator',
        full_name: full_name || ''
    };
    
    User.create(userData, (err, userId) => {
        if (err) {
            return res.status(500).json({ error: 'Error creando usuario' });
        }
        res.json({ 
            message: 'Usuario creado exitosamente', 
            userId: userId 
        });
    });
});

// Actualizar usuario
router.put('/users/:id', requireRole(['super_admin']), (req, res) => {
    const userId = req.params.id;
    const { username, email, role, full_name } = req.body;
    
    if (!username || !email) {
        return res.status(400).json({ error: 'Usuario y email son requeridos' });
    }
    
    const userData = {
        username,
        email,
        role: role || 'operator',
        full_name: full_name || ''
    };
    
    User.update(userId, userData, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error actualizando usuario' });
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    });
});

// Desactivar usuario
router.delete('/users/:id', requireRole(['super_admin']), (req, res) => {
    const userId = req.params.id;
    
    User.deactivate(userId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error desactivando usuario' });
        }
        res.json({ message: 'Usuario desactivado exitosamente' });
    });
});

module.exports = router;
