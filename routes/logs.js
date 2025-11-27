const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Log = require('../models/Log');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener logs de actividad (solo admin y super admin)
router.get('/', requireRole(['admin', 'super_admin']), (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    Log.getAll(limit, offset, (err, logs) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo logs' });
        }
        res.json(logs);
    });
});

// Obtener estadísticas de actividad
router.get('/stats', requireRole(['admin', 'super_admin']), (req, res) => {
    const days = parseInt(req.query.days) || 7;
    
    Log.getStats(days, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo estadísticas' });
        }
        
        // Calcular totales
        const totals = {
            total_actions: 0,
            total_logins: 0,
            total_creations: 0,
            total_updates: 0,
            total_deletions: 0,
            unique_users: new Set()
        };
        
        stats.forEach(day => {
            totals.total_actions += day.total_actions;
            totals.total_logins += day.logins;
            totals.total_creations += day.creations;
            totals.total_updates += day.updates;
            totals.total_deletions += day.deletions;
            if (day.unique_users) {
                // En una implementación real, necesitarías una consulta separada para usuarios únicos
            }
        });
        
        res.json({
            period: `${days} días`,
            stats: stats,
            totals: totals
        });
    });
});

// Obtener logs por usuario
router.get('/user/:userId', requireRole(['admin', 'super_admin']), (req, res) => {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    Log.getByUser(userId, limit, (err, logs) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo logs del usuario' });
        }
        res.json(logs);
    });
});

module.exports = router;
