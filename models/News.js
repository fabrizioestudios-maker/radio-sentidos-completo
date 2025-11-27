const db = require('../config/database');

class News {
    // Crear nueva noticia
    static create(newsData, callback) {
        const { title, content, excerpt, author_id, category } = newsData;
        const sql = `INSERT INTO news (title, content, excerpt, author_id, category) 
                     VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [title, content, excerpt, author_id, category], function(err) {
            callback(err, this.lastID);
        });
    }

    // Obtener todas las noticias
    static getAll(callback) {
        const sql = `SELECT n.*, u.username as author_name 
                     FROM news n 
                     LEFT JOIN users u ON n.author_id = u.id 
                     ORDER BY n.created_at DESC`;
        db.all(sql, callback);
    }

    // Obtener noticias publicadas
    static getPublished(callback) {
        const sql = `SELECT n.*, u.username as author_name 
                     FROM news n 
                     LEFT JOIN users u ON n.author_id = u.id 
                     WHERE n.is_published = 1 
                     ORDER BY n.published_at DESC`;
        db.all(sql, callback);
    }

    // Obtener noticia por ID
    static findById(newsId, callback) {
        const sql = 'SELECT * FROM news WHERE id = ?';
        db.get(sql, [newsId], callback);
    }

    // Actualizar noticia
    static update(newsId, newsData, callback) {
        const { title, content, excerpt, category } = newsData;
        const sql = `UPDATE news SET title = ?, content = ?, excerpt = ?, category = ? 
                     WHERE id = ?`;
        db.run(sql, [title, content, excerpt, category, newsId], callback);
    }

    // Publicar noticia
    static publish(newsId, callback) {
        const sql = 'UPDATE news SET is_published = 1, published_at = CURRENT_TIMESTAMP WHERE id = ?';
        db.run(sql, [newsId], callback);
    }

    // Despublicar noticia
    static unpublish(newsId, callback) {
        const sql = 'UPDATE news SET is_published = 0, published_at = NULL WHERE id = ?';
        db.run(sql, [newsId], callback);
    }

    // Eliminar noticia
    static delete(newsId, callback) {
        const sql = 'DELETE FROM news WHERE id = ?';
        db.run(sql, [newsId], callback);
    }

    // Contar noticias publicadas
    static countPublished(callback) {
        const sql = 'SELECT COUNT(*) as count FROM news WHERE is_published = 1';
        db.get(sql, callback);
    }
}

module.exports = News;
