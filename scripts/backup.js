const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const backupDir = path.join(__dirname, '../backups');
const dbPath = path.join(__dirname, '../database.sqlite');

// Crear directorio de backups si no existe
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Generar nombre de archivo con fecha
const now = new Date();
const dateStr = now.toISOString().split('T')[0];
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
const backupFilename = `backup-${dateStr}_${timeStr}.sqlite`;
const backupPath = path.join(backupDir, backupFilename);

// Copiar archivo de base de datos
fs.copyFile(dbPath, backupPath, (err) => {
    if (err) {
        console.error('❌ Error creando backup:', err);
        process.exit(1);
    } else {
        console.log('✅ Backup creado exitosamente:', backupFilename);
        
        // Limpiar backups antiguos (mantener solo los últimos 7 días)
        cleanOldBackups();
    }
});

function cleanOldBackups() {
    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error('Error leyendo directorio de backups:', err);
            return;
        }
        
        const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.sqlite'));
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        backupFiles.forEach(file => {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);
            const fileDate = new Date(stats.mtime);
            
            if (fileDate < sevenDaysAgo) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error eliminando backup antiguo:', file, err);
                    } else {
                        console.log('🗑️  Backup antiguo eliminado:', file);
                    }
                });
            }
        });
    });
}
