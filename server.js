// Radio Sentidos - Servidor de Producción
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const moment = require("moment");

// Configuración
const config = require("./config/production");

// Importar configuración de base de datos
require("./config/database");

// Importar rutas
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const programsRoutes = require("./routes/programs");
const newsRoutes = require("./routes/news");
const uploadsRoutes = require("./routes/uploads");
const logsRoutes = require("./routes/logs");

const app = express();
const PORT = config.port;

// Configuración de rate limiting
const limiter = rateLimit({
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.max,
    message: {
        error: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Middleware de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", config.stream.url]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Compresión Gzip
app.use(compression());

// Rate limiting
app.use(limiter);

// Middleware
app.use(cors({
    origin: config.security.corsOrigin
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public", {
    maxAge: config.environment === 'production' ? '1d' : '0'
}));

// Servir archivos subidos
app.use("/uploads", express.static(path.join(__dirname, "public/uploads"), {
    maxAge: '7d'
}));

// Servir panel administrativo
app.use("/admin", express.static(path.join(__dirname, "public/admin"), {
    maxAge: '1h'
}));

// Middleware de logging personalizado
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms | ${req.ip}`);
    });
    next();
});

// Rutas de API
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/programs", programsRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/logs", logsRoutes);

// Ruta pública principal - SITIO WEB MEJORADO
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API pública (sin autenticación)
app.get("/api/stream", (req, res) => {
    res.json({
        success: true,
        data: {
            streamUrl: config.stream.url,
            nowOnAir: {
                program: "Programa en Vivo",
                host: "Radio Sentidos",
                song: "Música las 24 horas",
                listeners: Math.floor(Math.random() * 1000) + 500 // Simulado
            },
            station: {
                name: config.station.name,
                frequency: config.station.frequency,
                location: config.station.location,
                description: config.station.description
            }
        }
    });
});

// API pública para noticias
app.get("/api/public/news", (req, res) => {
    const News = require("./models/News");
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const sql = `SELECT n.*, u.username as author_name 
                 FROM news n 
                 LEFT JOIN users u ON n.author_id = u.id 
                 WHERE n.is_published = 1 
                 ORDER BY n.published_at DESC 
                 LIMIT ? OFFSET ?`;
    
    const db = require('./config/database');
    db.all(sql, [limit, offset], (err, news) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                error: "Error obteniendo noticias" 
            });
        }
        
        // Contar total para paginación
        db.get('SELECT COUNT(*) as total FROM news WHERE is_published = 1', (err, countResult) => {
            res.json({
                success: true,
                data: {
                    news: news,
                    pagination: {
                        page: page,
                        limit: limit,
                        total: countResult.total,
                        pages: Math.ceil(countResult.total / limit)
                    }
                }
            });
        });
    });
});

// API pública para programas activos
app.get("/api/public/programs", (req, res) => {
    const Program = require("./models/Program");
    Program.getAllActive((err, programs) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                error: "Error obteniendo programas" 
            });
        }
        res.json({
            success: true,
            data: {
                programs: programs
            }
        });
    });
});

// API pública para estadísticas básicas
app.get("/api/public/stats", (req, res) => {
    const Program = require("./models/Program");
    const News = require("./models/News");
    
    Promise.all([
        new Promise((resolve) => Program.countActive((err, result) => resolve(err ? 0 : result.count))),
        new Promise((resolve) => News.countPublished((err, result) => resolve(err ? 0 : result.count)))
    ]).then(([activePrograms, publishedNews]) => {
        res.json({
            success: true,
            data: {
                activePrograms,
                publishedNews,
                currentListeners: Math.floor(Math.random() * 500) + 200,
                uptime: process.uptime(),
                lastUpdated: new Date().toISOString()
            }
        });
    }).catch(error => {
        res.status(500).json({ 
            success: false,
            error: "Error obteniendo estadísticas" 
        });
    });
});

// API de información de la estación
app.get("/api/public/station", (req, res) => {
    res.json({
        success: true,
        data: {
            station: config.station
        }
    });
});

// Endpoint de salud del servidor
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: config.environment,
            version: "1.0.0"
        }
    });
});

// Manejo de errores mejorado
app.use((err, req, res, next) => {
    console.error("Error no manejado:", err);
    
    // Log del error
    const Log = require('./models/Log');
    Log.create({
        user_id: null,
        action: 'error',
        resource: 'server',
        resource_id: null,
        details: JSON.stringify({
            message: err.message,
            stack: config.environment === 'development' ? err.stack : undefined,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip
        }),
        ip_address: req.ip
    }, () => {}); // Fire and forget
    
    res.status(500).json({ 
        success: false,
        error: "Error interno del servidor",
        message: config.environment === 'development' ? err.message : undefined
    });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: "Ruta no encontrada" 
    });
});

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
    console.log('Recibida señal SIGTERM, cerrando servidor gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Recibida señal SIGINT, cerrando servidor gracefully...');
    process.exit(0);
});

// Crear usuario administrador por defecto al iniciar
app.listen(PORT, async () => {
    console.log("🎧 ==================================================");
    console.log("🎧 Radio Sentidos - Servidor de Producción");
    console.log("🎧 ==================================================");
    console.log(`📍 Ejecutándose en: http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${config.environment}`);
    console.log(`📻 Estación: ${config.station.name}`);
    console.log(`🔊 Stream: ${config.stream.url}`);
    console.log("👨‍💼 Panel administrativo: http://localhost:" + PORT + "/admin");
    console.log("📊 API pública: http://localhost:" + PORT + "/api/public/");
    console.log("❤️  Salud: http://localhost:" + PORT + "/api/health");
    console.log("🎧 ==================================================");
    
    // Crear usuario administrador por defecto si no existe
    const User = require("./models/User");
    const userData = {
        username: "admin",
        email: "admin@radiosentidos.com",
        password: "admin123",
        role: "super_admin",
        full_name: "Administrador Principal"
    };
    
    User.findByUsername("admin", (err, existingUser) => {
        if (err || !existingUser) {
            User.create(userData, (err, userId) => {
                if (err) {
                    console.log("⚠️  Usuario admin ya existe o error creándolo");
                } else {
                    console.log("✅ Usuario administrador creado:");
                    console.log("   👤 Usuario: admin");
                    console.log("   🔑 Contraseña: admin123");
                    console.log("   ⚠️  CAMBIA LA CONTRASEÑA INMEDIATAMENTE");
                }
            });
        }
    });
});

module.exports = app; // Para testing
