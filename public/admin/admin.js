// Configuración global
const API_BASE = '/api';
let currentToken = localStorage.getItem('admin_token');
let currentUser = null;

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
    if (!currentToken) {
        window.location.href = 'index.html';
        return;
    }
    
    verifyToken();
});

// Verificar token
async function verifyToken() {
    try {
        const response = await fetch(API_BASE + '/auth/verify', {
            headers: {
                'Authorization': 'Bearer ' + currentToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            
            // Actualizar UI con información del usuario
            const userNameElements = document.querySelectorAll('#userName, .user-info');
            userNameElements.forEach(el => {
                if (el.id === 'userName' || el.classList.contains('user-info')) {
                    el.textContent = currentUser.username + ' (' + currentUser.role + ')';
                }
            });
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error verificando token:', error);
        logout();
    }
}

// Logout
function logout() {
    localStorage.removeItem('admin_token');
    window.location.href = 'index.html';
}

// Mostrar alertas
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insertar al inicio del contenido
    const content = document.querySelector('.content');
    if (content) {
        content.insertBefore(alertDiv, content.firstChild);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Función para hacer requests API
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Authorization': 'Bearer ' + currentToken,
            'Content-Type': 'application/json'
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(API_BASE + endpoint, finalOptions);
        return await response.json();
    } catch (error) {
        console.error('Error en request API:', error);
        throw error;
    }
}

// Navegación entre páginas
function navigateTo(page) {
    window.location.href = page;
}


// Función para mostrar alertas mejorada
function showAlert(message, type = 'success') {
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insertar al inicio del contenido
    alertsContainer.appendChild(alertDiv);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Función para verificar permisos
function hasPermission(requiredRole) {
    const rolesHierarchy = {
        'operator': 1,
        'editor': 2,
        'admin': 3,
        'super_admin': 4
    };
    
    const userLevel = rolesHierarchy[currentUser?.role] || 0;
    const requiredLevel = rolesHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
}
