const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpetas si no existen
const uploadDirs = [
    'public/uploads/programs',
    'public/uploads/news',
    'public/uploads/temp'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'public/uploads/temp';
        
        if (req.baseUrl.includes('programs')) {
            uploadPath = 'public/uploads/programs';
        } else if (req.baseUrl.includes('news')) {
            uploadPath = 'public/uploads/news';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'image-' + uniqueSuffix + extension);
    }
});

// Filtrar tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG, GIF y WebP.'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB límite
        files: 1 // Solo un archivo por vez
    }
});

// Función para mover archivo desde temp a destino final
function moveUploadedFile(tempPath, destination, filename) {
    return new Promise((resolve, reject) => {
        const finalPath = path.join(destination, filename);
        
        fs.rename(tempPath, finalPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(`/uploads/${path.relative('public', destination)}/${filename}`);
            }
        });
    });
}

// Función para eliminar archivo
function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join('public', filePath);
        
        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    upload,
    moveUploadedFile,
    deleteFile
};
