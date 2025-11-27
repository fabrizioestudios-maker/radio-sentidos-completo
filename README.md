# 🎧 Radio Sentidos 96.9 FM - Firmat, Santa Fe

Sistema web completo para la gestión y transmisión de Radio Sentidos 96.9 FM.

## 🚀 Características

### 📻 Sistema de Radio
- Transmisión en vivo 24/7
- Player web integrado
- Estadísticas de oyentes en tiempo real
- Programación de contenidos

### 👨‍💼 Panel Administrativo
- Gestión completa de usuarios y roles
- CRUD de programas y noticias
- Sistema de logs de actividad
- Subida de archivos e imágenes
- Dashboard con estadísticas

### 🌐 Sitio Web Público
- Diseño responsive y moderno
- Programación en tiempo real
- Últimas noticias
- Player integrado
- Optimizado para SEO

## 🛠️ Instalación y Configuración

### Requisitos
- Node.js 14.0 o superior
- npm 6.0 o superior

### Instalación Rápida
\`\`\`bash
# Clonar repositorio
git clone <repository-url>
cd radio-sentidos

# Instalar dependencias
npm install

# Configurar entorno (opcional)
cp .env.example .env

# Ejecutar migración de base de datos
npm run migrate

# Iniciar servidor de desarrollo
npm run dev

# O iniciar servidor de producción
npm start
\`\`\`

### Scripts Disponibles
- \`npm start\` - Servidor de producción
- \`npm run dev\` - Servidor de desarrollo con nodemon
- \`npm run migrate\` - Migración de base de datos
- \`npm run backup\` - Backup de base de datos
- \`npm run stats\` - Estadísticas del sistema

## 📁 Estructura del Proyecto

\`\`\`
radio-sentidos/
├── config/                 # Configuraciones
│   ├── database.js        # Configuración de BD
│   ├── production.js      # Configuración producción
│   └── upload.js          # Configuración de uploads
├── models/                # Modelos de datos
│   ├── User.js
│   ├── Program.js
│   ├── News.js
│   └── Log.js
├── routes/                # Rutas de API
│   ├── auth.js
│   ├── admin.js
│   ├── programs.js
│   ├── news.js
│   ├── uploads.js
│   └── logs.js
├── middleware/            # Middlewares
│   ├── auth.js
│   └── logger.js
├── public/               # Archivos públicos
│   ├── admin/           # Panel administrativo
│   ├── uploads/         # Archivos subidos
│   └── index.html       # Sitio web público
├── scripts/             # Scripts utilitarios
│   ├── backup.js
│   ├── migrate.js
│   └── stats.js
├── server.js           # Servidor principal
└── package.json
\`\`\`

## 🔐 Acceso Inicial

### Panel Administrativo
- **URL:** http://localhost:3000/admin
- **Usuario:** admin
- **Contraseña:** admin123

**⚠️ IMPORTANTE:** Cambia la contraseña del administrador después del primer login.

### API Pública
- **Información de la estación:** \`GET /api/public/station\`
- **Programación:** \`GET /api/public/programs\`
- **Noticias:** \`GET /api/public/news\`
- **Estadísticas:** \`GET /api/public/stats\`
- **Salud del servidor:** \`GET /api/health\`

## 🎛️ Configuración

### Variables de Entorno
Crea un archivo \`.env\` en la raíz del proyecto:

\`\`\`env
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro
DB_PATH=./database.sqlite
STREAM_URL=http://tu-servidor-de-stream/stream
\`\`\`

### Configuración del Stream
Edita \`config/production.js\` para configurar:
- URL del stream de audio
- Información de la estación
- Redes sociales
- Información de contacto

## 📊 Características Técnicas

### Seguridad
- Autenticación JWT
- Helmet.js para seguridad HTTP
- Rate limiting
- Validación de archivos
- Sanitización de inputs

### Rendimiento
- Compresión Gzip
- Caché de archivos estáticos
- Índices de base de datos optimizados
- Paginación de resultados

### Mantenimiento
- Backup automático de BD
- Logs de actividad
- Estadísticas del sistema
- Monitoreo de salud

## 🤝 Soporte

Para soporte técnico o reportar problemas:
- 📧 Email: soporte@radiosentidos.com
- 📱 Teléfono: +54 3465 123456

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver \`LICENSE\` para más detalles.

---

**Radio Sentidos 96.9 FM** - La voz de Firmat, Santa Fe 🎧
\`\`\`
radio-sentidos@1.0.0
\`\`\`
