const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Program = require('../models/Program');
const { logActivity } = require('../middleware/logger');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los programas (para administración)
router.get('/', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    Program.getAll((err, programs) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo programas' });
        }
        res.json(programs);
    });
});

// Obtener programa por ID
router.get('/:id', requireRole(['admin', 'super_admin', 'editor']), (req, res) => {
    const programId = req.params.id;
    
    Program.findById(programId, (err, program) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo programa' });
        }
        if (!program) {
            return res.status(404).json({ error: 'Programa no encontrado' });
        }
        res.json(program);
    });
});

// Crear nuevo programa
router.post('/', requireRole(['admin', 'super_admin', 'editor']), logActivity('create', 'program', (req, data) => data.programId), (req, res) => {
    const { title, description, host, schedule, image_url } = req.body;
    
    if (!title || !schedule) {
        return res.status(400).json({ error: 'Título y horario son requeridos' });
    }
    
    const programData = {
        title,
        description: description || '',
        host: host || '',
        schedule,
        image_url: image_url || '',
        created_by: req.user.id
    };
    
    Program.create(programData, (err, programId) => {
        if (err) {
            return res.status(500).json({ error: 'Error creando programa' });
        }
        res.json({ 
            message: 'Programa creado exitosamente', 
            programId: programId 
        });
    });
});

// Actualizar programa
router.put('/:id', requireRole(['admin', 'super_admin', 'editor']), logActivity('update', 'program', (req) => req.params.id), (req, res) => {
    const programId = req.params.id;
    const { title, description, host, schedule, image_url } = req.body;
    
    if (!title || !schedule) {
        return res.status(400).json({ error: 'Título y horario son requeridos' });
    }
    
    const programData = {
        title,
        description: description || '',
        host: host || '',
        schedule,
        image_url: image_url || ''
    };
    
    Program.update(programId, programData, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error actualizando programa' });
        }
        res.json({ message: 'Programa actualizado exitosamente' });
    });
});

// Activar programa
router.patch('/:id/activate', requireRole(['admin', 'super_admin', 'editor']), logActivity('activate', 'program', (req) => req.params.id), (req, res) => {
    const programId = req.params.id;
    
    Program.activate(programId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error activando programa' });
        }
        res.json({ message: 'Programa activado exitosamente' });
    });
});

// Desactivar programa
router.patch('/:id/deactivate', requireRole(['admin', 'super_admin', 'editor']), logActivity('deactivate', 'program', (req) => req.params.id), (req, res) => {
    const programId = req.params.id;
    
    Program.deactivate(programId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error desactivando programa' });
        }
        res.json({ message: 'Programa desactivado exitosamente' });
    });
});

// Eliminar programa
router.delete('/:id', requireRole(['admin', 'super_admin']), logActivity('delete', 'program', (req) => req.params.id), (req, res) => {
    const programId = req.params.id;
    
    Program.delete(programId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error eliminando programa' });
        }
        res.json({ message: 'Programa eliminado exitosamente' });
    });
});

module.exports = router;
