const Log = require('../models/Log');

// Middleware para registrar actividad
function logActivity(action, resource = null, getResourceId = null) {
    return async (req, res, next) => {
        // Guardar referencia original para ejecutar después
        const originalSend = res.send;
        
        res.send = function(data) {
            // Restaurar función original
            res.send = originalSend;
            
            // Registrar actividad después de que la respuesta se envía
            try {
                if (res.statusCode < 400) { // Solo registrar si fue exitoso
                    let resourceId = null;
                    
                    if (getResourceId) {
                        resourceId = getResourceId(req, JSON.parse(data));
                    } else if (req.params.id) {
                        resourceId = req.params.id;
                    }
                    
                    const logData = {
                        user_id: req.user?.id || null,
                        action: action,
                        resource: resource,
                        resource_id: resourceId,
                        details: JSON.stringify({
                            method: req.method,
                            url: req.originalUrl,
                            body: action.includes('delete') ? req.body : undefined // Solo log body para deletes
                        }),
                        ip_address: req.ip || req.connection.remoteAddress
                    };
                    
                    Log.create(logData, (err) => {
                        if (err) {
                            console.error('Error registrando actividad:', err);
                        }
                    });
                }
            } catch (error) {
                console.error('Error en middleware de logs:', error);
            }
            
            // Llamar a la función original
            return originalSend.call(this, data);
        };
        
        next();
    };
}

// Middleware para obtener IP real
function getClientIp(req) {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

module.exports = {
    logActivity,
    getClientIp
};
