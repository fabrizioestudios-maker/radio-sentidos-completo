const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { upload, moveUploadedFile, deleteFile } = require('../config/upload');
const { logActivity } = require('../middleware/logger');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Subir imagen para programa
router.post('/programs', requireRole(['admin', 'super_admin', 'editor']), upload.single('image'), logActivity('upload', 'program_image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        }

        // Mover archivo de temp a destino final
        const tempPath = req.file.path;
        const destination = 'public/uploads/programs';
        const filename = req.file.filename;

        moveUploadedFile(tempPath, destination, filename)
            .then(fileUrl => {
                res.json({
                    message: 'Imagen subida exitosamente',
                    fileUrl: fileUrl,
                    filename: filename
                });
            })
            .catch(error => {
                console.error('Error moviendo archivo:', error);
                res.status(500).json({ error: 'Error procesando archivo' });
            });

    } catch (error) {
        console.error('Error subiendo archivo:', error);
        res.status(500).json({ error: 'Error subiendo archivo' });
    }
});

// Subir imagen para noticia
router.post('/news', requireRole(['admin', 'super_admin', 'editor']), upload.single('image'), logActivity('upload', 'news_image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        }

        // Mover archivo de temp a destino final
        const tempPath = req.file.path;
        const destination = 'public/uploads/news';
        const filename = req.file.filename;

        moveUploadedFile(tempPath, destination, filename)
            .then(fileUrl => {
                res.json({
                    message: 'Imagen subida exitosamente',
                    fileUrl: fileUrl,
                    filename: filename
                });
            })
            .catch(error => {
                console.error('Error moviendo archivo:', error);
                res.status(500).json({ error: 'Error procesando archivo' });
            });

    } catch (error) {
        console.error('Error subiendo archivo:', error);
        res.status(500).json({ error: 'Error subiendo archivo' });
    }
});

// Eliminar archivo
router.delete('/:type/:filename', requireRole(['admin', 'super_admin', 'editor']), logActivity('delete', 'file'), (req, res) => {
    try {
        const { type, filename } = req.params;
        
        let filePath = '';
        if (type === 'program') {
            filePath = `/uploads/programs/${filename}`;
        } else if (type === 'news') {
            filePath = `/uploads/news/${filename}`;
        } else {
            return res.status(400).json({ error: 'Tipo de archivo no válido' });
        }

        deleteFile(filePath)
            .then(() => {
                res.json({ message: 'Archivo eliminado exitosamente' });
            })
            .catch(error => {
                console.error('Error eliminando archivo:', error);
                res.status(500).json({ error: 'Error eliminando archivo' });
            });

    } catch (error) {
        console.error('Error eliminando archivo:', error);
        res.status(500).json({ error: 'Error eliminando archivo' });
    }
});

// Manejar errores de multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande. Límite: 5MB' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Demasiados archivos. Solo se permite 1 archivo por vez' });
        }
    }
    
    if (error.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = router;
