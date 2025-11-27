// Variables globales para programas
let programs = [];
let currentProgram = null;

// Cargar programas al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadPrograms();
    
    // Buscar programas
    document.getElementById('searchPrograms').addEventListener('input', function(e) {
        filterPrograms(e.target.value);
    });
});

// Cargar programas desde la API
async function loadPrograms() {
    try {
        showLoading(true);
        const data = await apiRequest('/programs');
        programs = data;
        displayPrograms(programs);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showAlert('Error cargando programas', 'error');
    }
}

// Mostrar programas en la tabla
function displayPrograms(programsToShow) {
    const programsList = document.getElementById('programsList');
    
    if (programsToShow.length === 0) {
        programsList.innerHTML = `
            <div class="table-row">
                <div colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No se encontraron programas
                </div>
            </div>
        `;
        return;
    }

    programsList.innerHTML = programsToShow.map(program => `
        <div class="table-row">
            <div>
                <strong>${program.title}</strong>
                ${program.description ? `<br><small>${program.description}</small>` : ''}
            </div>
            <div>${program.schedule}</div>
            <div>${program.host || '-'}</div>
            <div>
                <span class="status-badge ${program.is_active ? 'active' : 'inactive'}">
                    ${program.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </div>
            <div>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editProgram(${program.id})" title="Editar">
                        ✏️
                    </button>
                    ${program.is_active ? 
                        `<button class="btn-icon" onclick="deactivateProgram(${program.id})" title="Desactivar">
                            ⏸️
                        </button>` :
                        `<button class="btn-icon" onclick="activateProgram(${program.id})" title="Activar">
                            ▶️
                        </button>`
                    }
                    <button class="btn-icon btn-danger" onclick="deleteProgram(${program.id})" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filtrar programas
function filterPrograms(searchTerm) {
    const filtered = programs.filter(program => 
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.host?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.schedule.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayPrograms(filtered);
}

// Mostrar modal de programa
function showProgramModal(program = null) {
    const modal = document.getElementById('programModal');
    const title = document.getElementById('programModalTitle');
    const form = document.getElementById('programForm');
    
    if (program) {
        title.textContent = 'Editar Programa';
        currentProgram = program;
        fillProgramForm(program);
    } else {
        title.textContent = 'Nuevo Programa';
        currentProgram = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Cerrar modal de programa
function closeProgramModal() {
    document.getElementById('programModal').style.display = 'none';
    document.getElementById('programForm').reset();
    currentProgram = null;
}

// Llenar formulario con datos del programa
function fillProgramForm(program) {
    document.getElementById('programId').value = program.id;
    document.getElementById('programTitle').value = program.title;
    document.getElementById('programDescription').value = program.description || '';
    document.getElementById('programHost').value = program.host || '';
    document.getElementById('programSchedule').value = program.schedule;
    document.getElementById('programImage').value = program.image_url || '';
}

// Guardar programa
async function saveProgram() {
    const form = document.getElementById('programForm');
    const formData = new FormData(form);
    
    const programData = {
        title: document.getElementById('programTitle').value.trim(),
        description: document.getElementById('programDescription').value.trim(),
        host: document.getElementById('programHost').value.trim(),
        schedule: document.getElementById('programSchedule').value.trim(),
        image_url: document.getElementById('programImage').value.trim()
    };
    
    // Validaciones
    if (!programData.title || !programData.schedule) {
        showAlert('Título y horario son requeridos', 'error');
        return;
    }
    
    try {
        if (currentProgram) {
            // Editar programa existente
            await apiRequest(`/programs/${currentProgram.id}`, {
                method: 'PUT',
                body: JSON.stringify(programData)
            });
            showAlert('Programa actualizado exitosamente');
        } else {
            // Crear nuevo programa
            await apiRequest('/programs', {
                method: 'POST',
                body: JSON.stringify(programData)
            });
            showAlert('Programa creado exitosamente');
        }
        
        closeProgramModal();
        loadPrograms();
    } catch (error) {
        showAlert('Error guardando programa', 'error');
    }
}

// Editar programa
async function editProgram(programId) {
    const program = programs.find(p => p.id === programId);
    if (program) {
        showProgramModal(program);
    }
}

// Activar programa
async function activateProgram(programId) {
    showConfirmModal(
        '¿Estás seguro de que quieres activar este programa?',
        async () => {
            try {
                await apiRequest(`/programs/${programId}/activate`, {
                    method: 'PATCH'
                });
                showAlert('Programa activado exitosamente');
                loadPrograms();
            } catch (error) {
                showAlert('Error activando programa', 'error');
            }
        }
    );
}

// Desactivar programa
async function deactivateProgram(programId) {
    showConfirmModal(
        '¿Estás seguro de que quieres desactivar este programa?',
        async () => {
            try {
                await apiRequest(`/programs/${programId}/deactivate`, {
                    method: 'PATCH'
                });
                showAlert('Programa desactivado exitosamente');
                loadPrograms();
            } catch (error) {
                showAlert('Error desactivando programa', 'error');
            }
        }
    );
}

// Eliminar programa
async function deleteProgram(programId) {
    showConfirmModal(
        '¿Estás seguro de que quieres eliminar este programa? Esta acción no se puede deshacer.',
        async () => {
            try {
                await apiRequest(`/programs/${programId}`, {
                    method: 'DELETE'
                });
                showAlert('Programa eliminado exitosamente');
                loadPrograms();
            } catch (error) {
                showAlert('Error eliminando programa', 'error');
            }
        }
    );
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loadingPrograms');
    const programsList = document.getElementById('programsList');
    
    if (show) {
        loading.style.display = 'block';
        programsList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        programsList.style.display = 'block';
    }
}

// Modal de confirmación
function showConfirmModal(message, confirmCallback) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    messageEl.textContent = message;
    
    // Remover event listeners anteriores
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Agregar nuevo event listener
    document.getElementById('confirmActionBtn').onclick = function() {
        confirmCallback();
        closeConfirmModal();
    };
    
    modal.style.display = 'block';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    const programModal = document.getElementById('programModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target === programModal) {
        closeProgramModal();
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
}
