// Script de estadísticas para Radio Sentidos
const db = require('../config/database');
const moment = require('moment');

console.log('📊 GENERANDOR DE ESTADÍSTICAS - RADIO SENTIDOS');
console.log('=============================================\\n');

// Función para obtener estadísticas
function getStats() {
    const stats = {};
    
    // Estadísticas de usuarios
    db.get("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM users", (err, userResult) => {
        if (!err) {
            stats.users = userResult;
            
            // Estadísticas de programas
            db.get("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM programs", (err, programResult) => {
                if (!err) {
                    stats.programs = programResult;
                    
                    // Estadísticas de noticias
                    db.get("SELECT COUNT(*) as total, SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published FROM news", (err, newsResult) => {
                        if (!err) {
                            stats.news = newsResult;
                            
                            // Estadísticas de logs
                            db.get("SELECT COUNT(*) as total FROM activity_logs", (err, logResult) => {
                                if (!err) {
                                    stats.logs = logResult;
                                    
                                    // Logs por acción
                                    db.all(`SELECT action, COUNT(*) as count 
                                            FROM activity_logs 
                                            GROUP BY action 
                                            ORDER BY count DESC`, (err, actionResults) => {
                                        if (!err) {
                                            stats.actions = actionResults;
                                            displayStats(stats);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

// Mostrar estadísticas
function displayStats(stats) {
    console.log('👥 USUARIOS:');
    console.log(`   Total: ${stats.users.total}`);
    console.log(`   Activos: ${stats.users.active}`);
    console.log(`   Inactivos: ${stats.users.total - stats.users.active}`);
    
    console.log('\\n📺 PROGRAMAS:');
    console.log(`   Total: ${stats.programs.total}`);
    console.log(`   Activos: ${stats.programs.active}`);
    console.log(`   Inactivos: ${stats.programs.total - stats.programs.active}`);
    
    console.log('\\n📰 NOTICIAS:');
    console.log(`   Total: ${stats.news.total}`);
    console.log(`   Publicadas: ${stats.news.published}`);
    console.log(`   Borradores: ${stats.news.total - stats.news.published}`);
    
    console.log('\\n📝 LOGS DE ACTIVIDAD:');
    console.log(`   Total: ${stats.logs.total}`);
    
    if (stats.actions && stats.actions.length > 0) {
        console.log('\\n🔧 ACCIONES MÁS COMUNES:');
        stats.actions.forEach(action => {
            console.log(`   ${action.action}: ${action.count}`);
        });
    }
    
    // Estadísticas de los últimos 7 días
    const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
    db.get(`SELECT COUNT(*) as recent_activity 
            FROM activity_logs 
            WHERE created_at >= ?`, [sevenDaysAgo], (err, recentResult) => {
        if (!err) {
            console.log(`\\n📈 ACTIVIDAD RECIENTE (7 días): ${recentResult.recent_activity}`);
        }
        
        console.log('\\n✅ Estadísticas generadas exitosamente!');
        process.exit(0);
    });
}

// Ejecutar estadísticas
getStats();
