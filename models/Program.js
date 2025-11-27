const db = require('../config/database');

class Program {
    // Crear nuevo programa
    static create(programData, callback) {
        const { title, description, host, schedule, image_url, created_by } = programData;
        const sql = `INSERT INTO programs (title, description, host, schedule, image_url, created_by) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(sql, [title, description, host, schedule, image_url, created_by], function(err) {
            callback(err, this.lastID);
        });
    }

    // Obtener todos los programas activos
    static getAllActive(callback) {
        const sql = `SELECT p.*, u.username as creator_name 
                     FROM programs p 
                     LEFT JOIN users u ON p.created_by = u.id 
                     WHERE p.is_active = 1 
                     ORDER BY p.schedule`;
        db.all(sql, callback);
    }

    // Obtener todos los programas (incluye inactivos)
    static getAll(callback) {
        const sql = `SELECT p.*, u.username as creator_name 
                     FROM programs p 
                     LEFT JOIN users u ON p.created_by = u.id 
                     ORDER BY p.created_at DESC`;
        db.all(sql, callback);
    }

    // Obtener programa por ID
    static findById(programId, callback) {
        const sql = 'SELECT * FROM programs WHERE id = ?';
        db.get(sql, [programId], callback);
    }

    // Actualizar programa
    static update(programId, programData, callback) {
        const { title, description, host, schedule, image_url } = programData;
        const sql = `UPDATE programs SET title = ?, description = ?, host = ?, schedule = ?, image_url = ? 
                     WHERE id = ?`;
        db.run(sql, [title, description, host, schedule, image_url, programId], callback);
    }

    // Activar programa
    static activate(programId, callback) {
        const sql = 'UPDATE programs SET is_active = 1 WHERE id = ?';
        db.run(sql, [programId], callback);
    }

    // Desactivar programa
    static deactivate(programId, callback) {
        const sql = 'UPDATE programs SET is_active = 0 WHERE id = ?';
        db.run(sql, [programId], callback);
    }

    // Eliminar programa
    static delete(programId, callback) {
        const sql = 'DELETE FROM programs WHERE id = ?';
        db.run(sql, [programId], callback);
    }

    // Contar programas activos
    static countActive(callback) {
        const sql = 'SELECT COUNT(*) as count FROM programs WHERE is_active = 1';
        db.get(sql, callback);
    }
}

module.exports = Program;
