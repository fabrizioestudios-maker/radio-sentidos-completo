// Script de migración para Radio Sentidos
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando migración de base de datos...');

// Ejecutar migraciones
db.serialize(() => {
    console.log('📊 Verificando estructura de base de datos...');
    
    // Verificar y crear tablas si no existen
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'operator',
            full_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )`,
        
        `CREATE TABLE IF NOT EXISTS programs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            host TEXT,
            schedule TEXT,
            image_url TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            author_id INTEGER,
            category TEXT DEFAULT 'general',
            image_url TEXT,
            is_published BOOLEAN DEFAULT 0,
            published_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            resource TEXT,
            resource_id INTEGER,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`
    ];

    let tablesCreated = 0;
    let indexesCreated = 0;

    tables.forEach((sql, index) => {
        db.run(sql, function(err) {
            if (err) {
                console.error(`❌ Error creando tabla ${index + 1}:`, err.message);
            } else {
                tablesCreated++;
                console.log(`✅ Tabla ${index + 1} verificada/creada`);
            }
        });
    });

    // Crear índices para mejor performance
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_at)',
        'CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active, schedule)',
        'CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active, username)'
    ];

    indexes.forEach((sql, index) => {
        db.run(sql, function(err) {
            if (err) {
                console.error(`❌ Error creando índice ${index + 1}:`, err.message);
            } else {
                indexesCreated++;
                console.log(`✅ Índice ${index + 1} verificado/creado`);
            }
        });
    });

    // Verificar usuario admin
    db.get("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, result) => {
        if (err) {
            console.error('❌ Error verificando usuario admin:', err.message);
        } else if (result.count === 0) {
            console.log('👤 Creando usuario administrador por defecto...');
            const bcrypt = require('bcryptjs');
            const passwordHash = bcrypt.hashSync('admin123', 10);
            
            db.run(`INSERT INTO users (username, email, password_hash, role, full_name) 
                    VALUES ('admin', 'admin@radiosentidos.com', ?, 'super_admin', 'Administrador Principal')`,
                  [passwordHash], function(err) {
                if (err) {
                    console.error('❌ Error creando usuario admin:', err.message);
                } else {
                    console.log('✅ Usuario administrador creado:');
                    console.log('   👤 Usuario: admin');
                    console.log('   🔑 Contraseña: admin123');
                    console.log('   ⚠️  CAMBIA LA CONTRASEÑA INMEDIATAMENTE');
                }
            });
        } else {
            console.log('✅ Usuario administrador ya existe');
        }
    });

    // Estadísticas finales
    setTimeout(() => {
        console.log('\\n📈 RESUMEN DE MIGRACIÓN:');
        console.log(`   📊 Tablas: ${tablesCreated}/4`);
        console.log(`   🔍 Índices: ${indexesCreated}/5`);
        console.log('✅ Migración completada exitosamente!');
        console.log('🚀 El sistema está listo para producción.');
        
        process.exit(0);
    }, 2000);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado durante migración:', error);
    process.exit(1);
});
