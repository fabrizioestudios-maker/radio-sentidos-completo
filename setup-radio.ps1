# Script de configuración automática para Radio Sentidos
Write-Host "CONFIGURANDO RADIO SENTIDOS - Firmat, Santa Fe" -ForegroundColor Cyan

# Crear estructura de carpetas
Write-Host "`nCreando estructura de carpetas..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "public"
New-Item -ItemType Directory -Force -Path "api"

# Crear archivo package.json
Write-Host "Creando package.json..." -ForegroundColor Yellow
$packageJson = @'
{
  "name": "radio-sentidos",
  "version": "1.0.0",
  "description": "Sitio web de Radio Sentidos 96.9 FM - Firmat, Santa Fe",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
'@

Set-Content -Path "package.json" -Value $packageJson

# Crear archivo HTML en public/
Write-Host "Creando index.html..." -ForegroundColor Yellow
$htmlContent = @'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RADIO SENTIDOS 96.9 - Firmat, Santa Fe</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0b0f13;
            --text: #f3f4f6;
            --muted: #9ca3af;
            --accent: #4f46e5;
            --accent-2: #6366f1;
            --surface: #111827;
            --card: #1f2937;
            --radius: 14px;
            --shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #0b0f13 0%, #131a22 50%, #0b0f13 100%);
            color: var(--text);
            overflow-x: hidden;
            line-height: 1.6;
        }

        header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(17, 24, 39, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }

        .logo {
            font-weight: 700;
            font-size: 1.5rem;
            color: var(--accent);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .frequency {
            color: var(--muted);
            font-size: 0.9rem;
            margin-left: 1rem;
        }

        nav ul {
            display: flex;
            gap: 2rem;
            list-style: none;
        }

        nav a {
            color: var(--muted);
            text-decoration: none;
            transition: color 0.3s;
            font-weight: 500;
        }

        nav a:hover {
            color: var(--accent);
        }

        .mini-player {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: var(--card);
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .play-btn {
            background: var(--accent);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            color: white;
        }

        .play-btn:hover {
            background: var(--accent-2);
            transform: scale(1.1);
        }

        .now-playing {
            font-size: 0.8rem;
            color: var(--muted);
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .hero {
            text-align: center;
            padding: 6rem 2rem 4rem;
            max-width: 1000px;
            margin: auto;
        }

        .hero h1 {
            font-size: 3.2rem;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }

        .hero h1 span {
            color: var(--accent);
            background: linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            color: var(--muted);
            font-size: 1.2rem;
            margin-bottom: 2.5rem;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        }

        .cta-button {
            background: linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.8rem;
            border-radius: var(--radius);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .cta-button:hover {
            transform: scale(1.05);
        }

        .section {
            max-width: 1200px;
            margin: 4rem auto;
            padding: 3rem 2rem;
            background: rgba(31, 41, 55, 0.85);
            border-radius: var(--radius);
        }

        .section-title {
            text-align: center;
            color: var(--accent);
            font-size: 2.2rem;
            margin-bottom: 3rem;
        }

        .news-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .news-card {
            background: var(--card);
            border-radius: var(--radius);
            overflow: hidden;
            transition: transform 0.3s;
        }

        .news-card:hover {
            transform: translateY(-5px);
        }

        .news-content {
            padding: 1.5rem;
        }

        @media (max-width: 768px) {
            header {
                flex-direction: column;
                gap: 1rem;
            }
            
            nav ul {
                gap: 1rem;
            }
            
            .hero h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <span>📻</span>
            RADIO SENTIDOS
            <span class="frequency">96.9 FM</span>
        </div>
        
        <nav>
            <ul>
                <li><a href="#news">Noticias</a></li>
                <li><a href="#weather">Clima</a></li>
                <li><a href="#schedule">Horarios</a></li>
                <li><a href="#pharmacies">Farmacias</a></li>
            </ul>
        </nav>
        
        <div class="mini-player">
            <button class="play-btn" id="playBtn">▶</button>
            <div class="now-playing" id="nowPlaying">Radio Sentidos 96.9 FM</div>
        </div>
    </header>

    <section class="hero">
        <h1>RADIO <span>SENTIDOS</span> 96.9 FM</h1>
        <p>La voz de Firmat, Santa Fe. Información, música y entretenimiento las 24 horas.</p>
        <button class="cta-button" id="playMain">▶ Escuchar en Vivo</button>
    </section>

    <section id="news" class="section">
        <h2 class="section-title">Últimas Noticias</h2>
        <div class="news-grid" id="newsGrid">
            <!-- Las noticias se cargarán con JavaScript -->
        </div>
    </section>

    <section id="weather" class="section">
        <h2 class="section-title">Clima en Firmat</h2>
        <div id="weatherWidget">
            <!-- El clima se cargará con JavaScript -->
        </div>
    </section>

    <script>
        const audioPlayer = new Audio();
        let isPlaying = false;

        async function setupStream() {
            try {
                const response = await fetch('/api/stream');
                const streamInfo = await response.json();
                audioPlayer.src = streamInfo.streamUrl;
                document.getElementById('nowPlaying').textContent = streamInfo.nowOnAir.program;
            } catch (error) {
                console.error('Error configurando stream:', error);
            }
        }

        function togglePlay() {
            if (isPlaying) {
                audioPlayer.pause();
                document.getElementById('playBtn').textContent = '▶';
                document.getElementById('playMain').textContent = '▶ Escuchar en Vivo';
            } else {
                audioPlayer.play().catch(e => {
                    console.log('Error reproduciendo:', e);
                    alert('Error al conectar con la radio. Intente nuevamente.');
                });
                document.getElementById('playBtn').textContent = '⏸';
                document.getElementById('playMain').textContent = '⏸ En Vivo';
            }
            isPlaying = !isPlaying;
        }

        async function loadNews() {
            try {
                const response = await fetch('/api/news');
                const data = await response.json();
                const newsGrid = document.getElementById('newsGrid');
                newsGrid.innerHTML = data.news.map(news => `
                    <div class="news-card">
                        <div class="news-content">
                            <h3>${news.title}</h3>
                            <p>${news.excerpt}</p>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Error cargando noticias:', error);
            }
        }

        async function loadWeather() {
            try {
                const response = await fetch('/api/weather');
                const weather = await response.json();
                document.getElementById('weatherWidget').innerHTML = `
                    <div style="text-align: center;">
                        <h3>${weather.current.temp_c}°C - ${weather.current.condition.text}</h3>
                        <p>Sensación: ${weather.current.feelslike_c}°C</p>
                    </div>
                `;
            } catch (error) {
                console.error('Error cargando clima:', error);
            }
        }

        document.getElementById('playBtn').addEventListener('click', togglePlay);
        document.getElementById('playMain').addEventListener('click', togglePlay);

        setupStream();
        loadNews();
        loadWeather();
    </script>
</body>
</html>
'@

Set-Content -Path "public\index.html" -Value $htmlContent -Encoding UTF8

# Crear servidor Express
Write-Host "Creando servidor Express..." -ForegroundColor Yellow
$serverCode = @'
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/stream', (req, res) => {
    res.json({
        streamUrl: 'https://stream.radio-sentidos.com/live',
        nowOnAir: {
            program: 'Programa en Vivo',
            host: 'Anfitrion',
            song: 'Cancion Actual'
        }
    });
});

app.get('/api/news', (req, res) => {
    res.json({
        news: [
            {
                title: 'Ultimas noticias de Firmat',
                excerpt: 'Informacion actualizada de la ciudad y region...',
                date: new Date().toISOString()
            },
            {
                title: 'Eventos comunitarios',
                excerpt: 'Proximos eventos culturales y deportivos...',
                date: new Date().toISOString()
            }
        ]
    });
});

app.get('/api/weather', (req, res) => {
    res.json({
        location: {
            name: 'Firmat',
            region: 'Santa Fe',
            country: 'Argentina'
        },
        current: {
            temp_c: 22,
            feelslike_c: 23,
            condition: {
                text: 'Parcialmente nublado'
            }
        }
    });
});

app.listen(PORT, () => {
    console.log('Radio Sentidos servidor ejecutandose en http://localhost:' + PORT);
    console.log('Firmat, Santa Fe - 96.9 FM');
});
'@

Set-Content -Path "server.js" -Value $serverCode -Encoding UTF8

# Crear archivo README simple
Write-Host "Creando documentacion..." -ForegroundColor Yellow
$readmeContent = @'
# RADIO SENTIDOS 96.9 FM - Firmat, Santa Fe

Sitio web oficial de Radio Sentidos 96.9 FM

## Instalacion

1. npm install

2. npm run dev

3. npm start

## Acceso

http://localhost:3000

## Contacto

Radio Sentidos 96.9 FM
Firmat, Santa Fe, Argentina
'@

Set-Content -Path "README.md" -Value $readmeContent -Encoding UTF8

# Instalar dependencias
Write-Host "Instalando dependencias de Node.js..." -ForegroundColor Yellow
npm install

Write-Host "`nCONFIGURACION COMPLETADA!" -ForegroundColor Green
Write-Host "`nPara iniciar el servidor ejecuta:" -ForegroundColor Cyan
Write-Host "npm start" -ForegroundColor White
Write-Host "`nLuego abre tu navegador en: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nRadio Sentidos 96.9 FM - Firmat, Santa Fe" -ForegroundColor Magenta