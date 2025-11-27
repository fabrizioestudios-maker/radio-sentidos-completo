// Configuración para entorno de producción
const path = require('path');

module.exports = {
    // Servidor
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'production',
    
    // Base de datos
    database: {
        path: process.env.DB_PATH || path.join(__dirname, '../database.sqlite'),
        options: {
            timeout: 30000,
            verbose: process.env.NODE_ENV === 'development' ? console.log : null
        }
    },
    
    // Autenticación
    jwt: {
        secret: process.env.JWT_SECRET || 'radio_sentidos_production_secret',
        expiresIn: '24h'
    },
    
    // Stream de radio
    stream: {
        url: process.env.STREAM_URL || 'http://media.witel.ar:8080/radioSentidosFirmat',
        name: process.env.STATION_NAME || 'Radio Sentidos 96.9 FM',
        location: process.env.STATION_LOCATION || 'Firmat, Santa Fe'
    },
    
    // Upload de archivos
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
        directories: {
            programs: 'public/uploads/programs',
            news: 'public/uploads/news',
            temp: 'public/uploads/temp'
        }
    },
    
    // Seguridad
    security: {
        corsOrigin: process.env.CORS_ORIGIN || '*',
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_MAX) || 100
        }
    },
    
    // Estación
    station: {
        name: process.env.STATION_NAME || 'Radio Sentidos 96.9 FM',
        frequency: '96.9 FM',
        location: process.env.STATION_LOCATION || 'Firmat, Santa Fe',
        email: process.env.STATION_EMAIL || 'contacto@radiosentidos.com',
        phone: process.env.STATION_PHONE || '+54-3465-123456',
        description: 'La voz de Firmat, Santa Fe. Información, música y entretenimiento las 24 horas.',
        social: {
            facebook: 'https://facebook.com/radiosentidosfirmat',
            instagram: 'https://instagram.com/radiosentidosfirmat',
            twitter: 'https://twitter.com/radiosentidos'
        }
    }
};
