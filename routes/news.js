const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const News = require('../models/News');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las noticias (para administración)
router.get('/', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    News.getAll((err, news) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo noticias' });
        }
        res.json(news);
    });
});

// Obtener noticia por ID
router.get('/:id', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    const newsId = req.params.id;
    
    News.findById(newsId, (err, news) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo noticia' });
        }
        if (!news) {
            return res.status(404).json({ error: 'Noticia no encontrada' });
        }
        res.json(news);
    });
});

// Crear nueva noticia
router.post('/', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    const { title, content, excerpt, category } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Título y contenido son requeridos' });
    }
    
    const newsData = {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        category: category || 'general',
        author_id: req.user.id
    };
    
    News.create(newsData, (err, newsId) => {
        if (err) {
            return res.status(500).json({ error: 'Error creando noticia' });
        }
        res.json({ 
            message: 'Noticia creada exitosamente', 
            newsId: newsId 
        });
    });
});

// Actualizar noticia
router.put('/:id', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    const newsId = req.params.id;
    const { title, content, excerpt, category } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Título y contenido son requeridos' });
    }
    
    const newsData = {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        category: category || 'general'
    };
    
    News.update(newsId, newsData, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error actualizando noticia' });
        }
        res.json({ message: 'Noticia actualizada exitosamente' });
    });
});

// Publicar noticia
router.patch('/:id/publish', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    const newsId = req.params.id;
    
    News.publish(newsId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error publicando noticia' });
        }
        res.json({ message: 'Noticia publicada exitosamente' });
    });
});

// Despublicar noticia
router.patch('/:id/unpublish', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    const newsId = req.params.id;
    
    News.unpublish(newsId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error despublicando noticia' });
        }
        res.json({ message: 'Noticia despublicada exitosamente' });
    });
});

// Eliminar noticia
router.delete('/:id', requireRole(['admin', 'super_admin']), (req, res) => {
    const newsId = req.params.id;
    
    News.delete(newsId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error eliminando noticia' });
        }
        res.json({ message: 'Noticia eliminada exitosamente' });
    });
});

module.exports = router;
