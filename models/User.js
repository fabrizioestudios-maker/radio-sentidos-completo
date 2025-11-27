const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Crear nuevo usuario
    static create(userData, callback) {
        const { username, email, password, role, full_name } = userData;
        
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return callback(err);
            
            const sql = `INSERT INTO users (username, email, password_hash, role, full_name) 
                         VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [username, email, hash, role, full_name], function(err) {
                callback(err, this.lastID);
            });
        });
    }

    // Buscar usuario por username
    static findByUsername(username, callback) {
        const sql = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
        db.get(sql, [username], callback);
    }

    // Buscar usuario por email
    static findByEmail(email, callback) {
        const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
        db.get(sql, [email], callback);
    }

    // Buscar usuario por ID
    static findById(userId, callback) {
        const sql = 'SELECT id, username, email, role, full_name, created_at FROM users WHERE id = ?';
        db.get(sql, [userId], callback);
    }

    // Verificar contraseña
    static verifyPassword(plainPassword, hash, callback) {
        bcrypt.compare(plainPassword, hash, callback);
    }

    // Obtener todos los usuarios
    static getAll(callback) {
        const sql = 'SELECT id, username, email, role, full_name, created_at FROM users WHERE is_active = 1';
        db.all(sql, callback);
    }

    // Actualizar usuario
    static update(userId, userData, callback) {
        const { username, email, role, full_name } = userData;
        const sql = `UPDATE users SET username = ?, email = ?, role = ?, full_name = ? 
                     WHERE id = ?`;
        db.run(sql, [username, email, role, full_name, userId], callback);
    }

    // Actualizar contraseña
    static updatePassword(userId, newPassword, callback) {
        bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) return callback(err);
            
            const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
            db.run(sql, [hash, userId], callback);
        });
    }

    // Desactivar usuario
    static deactivate(userId, callback) {
        const sql = 'UPDATE users SET is_active = 0 WHERE id = ?';
        db.run(sql, [userId], callback);
    }

    // Contar usuarios activos
    static countActive(callback) {
        const sql = 'SELECT COUNT(*) as count FROM users WHERE is_active = 1';
        db.get(sql, callback);
    }
}

module.exports = User;
