const db = require('../config/database');

class Log {
    // Crear nuevo log
    static create(logData, callback) {
        const { user_id, action, resource, resource_id, details, ip_address } = logData;
        const sql = `INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(sql, [user_id, action, resource, resource_id, details, ip_address], function(err) {
            callback(err, this.lastID);
        });
    }

    // Obtener todos los logs con paginación
    static getAll(limit = 50, offset = 0, callback) {
        const sql = `SELECT l.*, u.username 
                     FROM activity_logs l 
                     LEFT JOIN users u ON l.user_id = u.id 
                     ORDER BY l.created_at DESC 
                     LIMIT ? OFFSET ?`;
        db.all(sql, [limit, offset], callback);
    }

    // Obtener logs por usuario
    static getByUser(userId, limit = 50, callback) {
        const sql = `SELECT l.*, u.username 
                     FROM activity_logs l 
                     LEFT JOIN users u ON l.user_id = u.id 
                     WHERE l.user_id = ? 
                     ORDER BY l.created_at DESC 
                     LIMIT ?`;
        db.all(sql, [userId, limit], callback);
    }

    // Obtener estadísticas de actividad
    static getStats(days = 7, callback) {
        const sql = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total_actions,
                COUNT(DISTINCT user_id) as unique_users,
                SUM(CASE WHEN action = 'login' THEN 1 ELSE 0 END) as logins,
                SUM(CASE WHEN action = 'create' THEN 1 ELSE 0 END) as creations,
                SUM(CASE WHEN action = 'update' THEN 1 ELSE 0 END) as updates,
                SUM(CASE WHEN action = 'delete' THEN 1 ELSE 0 END) as deletions
            FROM activity_logs 
            WHERE created_at >= date('now', ?) 
            GROUP BY DATE(created_at) 
            ORDER BY date DESC
        `;
        db.all(sql, [`-${days} days`], callback);
    }

    // Contar logs totales
    static countAll(callback) {
        const sql = 'SELECT COUNT(*) as count FROM activity_logs';
        db.get(sql, callback);
    }
}

module.exports = Log;
