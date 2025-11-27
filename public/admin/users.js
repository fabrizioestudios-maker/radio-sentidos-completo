// Variables globales para usuarios
let users = [];
let currentUserEdit = null;

// Cargar usuarios al iniciar
document.addEventListener('DOMContentLoaded', function() {
    if (currentUser.role !== 'super_admin') {
        showAlert('No tienes permisos para gestionar usuarios', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }
    
    loadUsers();
    
    // Buscar usuarios
    document.getElementById('searchUsers').addEventListener('input', function(e) {
        filterUsers(e.target.value);
    });
});

// Cargar usuarios desde la API
async function loadUsers() {
    try {
        showLoading(true);
        const data = await apiRequest('/admin/users');
        users = data;
        displayUsers(users);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showAlert('Error cargando usuarios', 'error');
    }
}

// Mostrar usuarios en la tabla
function displayUsers(usersToShow) {
    const usersList = document.getElementById('usersList');
    
    if (usersToShow.length === 0) {
        usersList.innerHTML = `
            <div class="table-row">
                <div colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No se encontraron usuarios
                </div>
            </div>
        `;
        return;
    }

    usersList.innerHTML = usersToShow.map(user => `
        <div class="table-row">
            <div>
                <strong>${user.username}</strong>
                ${user.id === currentUser.id ? '<br><small><em>(Tú)</em></small>' : ''}
            </div>
            <div>${user.email}</div>
            <div>${user.full_name || '-'}</div>
            <div>
                <span class="role-badge ${user.role}">${getRoleLabel(user.role)}</span>
            </div>
            <div>
                <small>${formatDate(user.created_at)}</small>
            </div>
            <div>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editUser(${user.id})" title="Editar" ${user.id === currentUser.id ? 'disabled' : ''}>
                        ✏️
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteUser(${user.id})" title="Eliminar" ${user.id === currentUser.id ? 'disabled' : ''}>
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Obtener etiqueta del rol
function getRoleLabel(role) {
    const roles = {
        'operator': 'Operador',
        'editor': 'Editor',
        'admin': 'Administrador',
        'super_admin': 'Super Admin'
    };
    return roles[role] || role;
}

// Filtrar usuarios
function filterUsers(searchTerm) {
    const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayUsers(filtered);
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Mostrar modal de usuario
function showUserModal(user = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');
    const passwordGroup = document.getElementById('passwordGroup');
    
    if (user) {
        title.textContent = 'Editar Usuario';
        currentUserEdit = user;
        passwordGroup.style.display = 'none';
        fillUserForm(user);
    } else {
        title.textContent = 'Nuevo Usuario';
        currentUserEdit = null;
        passwordGroup.style.display = 'block';
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Cerrar modal de usuario
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
    document.getElementById('passwordGroup').style.display = 'block';
    currentUserEdit = null;
}

// Llenar formulario con datos del usuario
function fillUserForm(user) {
    document.getElementById('userId').value = user.id;
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userFullName').value = user.full_name || '';
    document.getElementById('userRole').value = user.role;
}

// Guardar usuario
async function saveUser() {
    const form = document.getElementById('userForm');
    
    const userData = {
        username: document.getElementById('userUsername').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        full_name: document.getElementById('userFullName').value.trim(),
        role: document.getElementById('userRole').value
    };
    
    // Validaciones
    if (!userData.username || !userData.email) {
        showAlert('Usuario y email son requeridos', 'error');
        return;
    }
    
    if (!currentUserEdit) {
        // Validar contraseña para nuevo usuario
        const password = document.getElementById('userPassword').value;
        if (!password || password.length < 6) {
            showAlert('La contraseña es requerida y debe tener al menos 6 caracteres', 'error');
            return;
        }
        userData.password = password;
    }
    
    try {
        if (currentUserEdit) {
            // Editar usuario existente
            await apiRequest(`/admin/users/${currentUserEdit.id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            showAlert('Usuario actualizado exitosamente');
        } else {
            // Crear nuevo usuario
            await apiRequest('/admin/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            showAlert('Usuario creado exitosamente');
        }
        
        closeUserModal();
        loadUsers();
    } catch (error) {
        showAlert('Error guardando usuario', 'error');
    }
}

// Editar usuario
async function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        showUserModal(user);
    }
}

// Eliminar usuario
async function deleteUser(userId) {
    if (userId === currentUser.id) {
        showAlert('No puedes eliminar tu propio usuario', 'error');
        return;
    }
    
    showConfirmModal(
        '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
        async () => {
            try {
                await apiRequest(`/admin/users/${userId}`, {
                    method: 'DELETE'
                });
                showAlert('Usuario eliminado exitosamente');
                loadUsers();
            } catch (error) {
                showAlert('Error eliminando usuario', 'error');
            }
        }
    );
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loadingUsers');
    const usersList = document.getElementById('usersList');
    
    if (show) {
        loading.style.display = 'block';
        usersList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        usersList.style.display = 'block';
    }
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    
    if (event.target === userModal) {
        closeUserModal();
    }
}
