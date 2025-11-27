// Variables globales para logs
let activityLogs = [];

// Cargar logs al iniciar
document.addEventListener('DOMContentLoaded', function() {
    if (!hasPermission('admin')) {
        showAlert('No tienes permisos para ver logs', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }
    
    loadLogs();
    loadStats();
});

// Cargar logs desde la API
async function loadLogs() {
    try {
        showLoading(true);
        const data = await apiRequest('/logs?limit=100');
        activityLogs = data;
        displayLogs(activityLogs);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showAlert('Error cargando logs', 'error');
    }
}

// Cargar estadísticas de actividad
async function loadStats() {
    try {
        const days = document.getElementById('daysFilter').value;
        const data = await apiRequest(`/logs/stats?days=${days}`);
        displayStats(data);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Mostrar estadísticas
function displayStats(statsData) {
    const statsContainer = document.getElementById('activityStats');
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
                <h3>Acciones Totales</h3>
                <div class="stat-value">${statsData.totals.total_actions}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
                <h3>Inicios de Sesión</h3>
                <div class="stat-value">${statsData.totals.total_logins}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">➕</div>
            <div class="stat-info">
                <h3>Creaciones</h3>
                <div class="stat-value">${statsData.totals.total_creations}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">✏️</div>
            <div class="stat-info">
                <h3>Actualizaciones</h3>
                <div class="stat-value">${statsData.totals.total_updates}</div>
            </div>
        </div>
    `;
}

// Mostrar logs en la tabla
function displayLogs(logsToShow) {
    const logsList = document.getElementById('logsList');
    
    if (logsToShow.length === 0) {
        logsList.innerHTML = `
            <div class="table-row">
                <div colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No se encontraron logs de actividad
                </div>
            </div>
        `;
        return;
    }

    logsList.innerHTML = logsToShow.map(log => `
        <div class="table-row">
            <div>
                <strong>${log.username || 'Sistema'}</strong>
            </div>
            <div>
                <span class="action-badge ${log.action}">${getActionLabel(log.action)}</span>
            </div>
            <div>${log.resource ? `${log.resource}${log.resource_id ? ` #${log.resource_id}` : ''}` : '-'}</div>
            <div>
                <small>${log.details ? JSON.parse(log.details).method + ' ' + JSON.parse(log.details).url : '-'}</small>
            </div>
            <div>
                <small>${log.ip_address || '-'}</small>
            </div>
            <div>
                <small>${formatDateTime(log.created_at)}</small>
            </div>
        </div>
    `).join('');
}

// Obtener etiqueta de acción
function getActionLabel(action) {
    const actions = {
        'create': 'Crear',
        'update': 'Actualizar',
        'delete': 'Eliminar',
        'login': 'Iniciar Sesión',
        'upload': 'Subir',
        'activate': 'Activar',
        'deactivate': 'Desactivar',
        'publish': 'Publicar',
        'unpublish': 'Despublicar'
    };
    return actions[action] || action;
}

// Formatear fecha y hora
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loadingLogs');
    const logsList = document.getElementById('logsList');
    
    if (show) {
        loading.style.display = 'block';
        logsList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        logsList.style.display = 'block';
    }
}
