// Variables globales para noticias
let news = [];
let currentNews = null;

// Cargar noticias al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    
    // Buscar noticias
    document.getElementById('searchNews').addEventListener('input', function(e) {
        filterNews(e.target.value);
    });
});

// Cargar noticias desde la API
async function loadNews() {
    try {
        showLoading(true);
        const data = await apiRequest('/news');
        news = data;
        displayNews(news);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showAlert('Error cargando noticias', 'error');
    }
}

// Mostrar noticias en la tabla
function displayNews(newsToShow) {
    const newsList = document.getElementById('newsList');
    
    if (newsToShow.length === 0) {
        newsList.innerHTML = `
            <div class="table-row">
                <div colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No se encontraron noticias
                </div>
            </div>
        `;
        return;
    }

    newsList.innerHTML = newsToShow.map(newsItem => `
        <div class="table-row">
            <div>
                <strong>${newsItem.title}</strong>
                ${newsItem.excerpt ? `<br><small>${newsItem.excerpt}</small>` : ''}
            </div>
            <div>
                <span class="category-badge">${getCategoryLabel(newsItem.category)}</span>
            </div>
            <div>${newsItem.author_name || 'Sistema'}</div>
            <div>
                <span class="status-badge ${newsItem.is_published ? 'active' : 'inactive'}">
                    ${newsItem.is_published ? 'Publicada' : 'Borrador'}
                </span>
            </div>
            <div>
                <small>${formatDate(newsItem.created_at)}</small>
            </div>
            <div>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editNews(${newsItem.id})" title="Editar">
                        ✏️
                    </button>
                    ${newsItem.is_published ? 
                        `<button class="btn-icon" onclick="unpublishNews(${newsItem.id})" title="Despublicar">
                            👁️‍🗨️
                        </button>` :
                        `<button class="btn-icon btn-success" onclick="publishNews(${newsItem.id})" title="Publicar">
                            📢
                        </button>`
                    }
                    <button class="btn-icon btn-danger" onclick="deleteNews(${newsItem.id})" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Obtener etiqueta de categoría
function getCategoryLabel(category) {
    const categories = {
        'general': 'General',
        'local': 'Local',
        'deportes': 'Deportes',
        'cultura': 'Cultura',
        'entretenimiento': 'Entretenimiento',
        'politica': 'Política'
    };
    return categories[category] || category;
}

// Filtrar noticias
function filterNews(searchTerm) {
    const filtered = news.filter(newsItem => 
        newsItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsItem.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsItem.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayNews(filtered);
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Mostrar modal de noticia
function showNewsModal(newsItem = null) {
    const modal = document.getElementById('newsModal');
    const title = document.getElementById('newsModalTitle');
    const form = document.getElementById('newsForm');
    
    if (newsItem) {
        title.textContent = 'Editar Noticia';
        currentNews = newsItem;
        fillNewsForm(newsItem);
    } else {
        title.textContent = 'Nueva Noticia';
        currentNews = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Cerrar modal de noticia
function closeNewsModal() {
    document.getElementById('newsModal').style.display = 'none';
    document.getElementById('newsForm').reset();
    currentNews = null;
}

// Llenar formulario con datos de la noticia
function fillNewsForm(newsItem) {
    document.getElementById('newsId').value = newsItem.id;
    document.getElementById('newsTitle').value = newsItem.title;
    document.getElementById('newsExcerpt').value = newsItem.excerpt || '';
    document.getElementById('newsContent').value = newsItem.content;
    document.getElementById('newsCategory').value = newsItem.category || 'general';
}

// Guardar noticia
async function saveNews() {
    const form = document.getElementById('newsForm');
    const formData = new FormData(form);
    
    const newsData = {
        title: document.getElementById('newsTitle').value.trim(),
        excerpt: document.getElementById('newsExcerpt').value.trim(),
        content: document.getElementById('newsContent').value.trim(),
        category: document.getElementById('newsCategory').value
    };
    
    // Validaciones
    if (!newsData.title || !newsData.content) {
        showAlert('Título y contenido son requeridos', 'error');
        return;
    }
    
    try {
        if (currentNews) {
            // Editar noticia existente
            await apiRequest(`/news/${currentNews.id}`, {
                method: 'PUT',
                body: JSON.stringify(newsData)
            });
            showAlert('Noticia actualizada exitosamente');
        } else {
            // Crear nueva noticia
            await apiRequest('/news', {
                method: 'POST',
                body: JSON.stringify(newsData)
            });
            showAlert('Noticia creada exitosamente');
        }
        
        closeNewsModal();
        loadNews();
    } catch (error) {
        showAlert('Error guardando noticia', 'error');
    }
}

// Editar noticia
async function editNews(newsId) {
    const newsItem = news.find(n => n.id === newsId);
    if (newsItem) {
        showNewsModal(newsItem);
    }
}

// Publicar noticia
async function publishNews(newsId) {
    showConfirmModal(
        '¿Estás seguro de que quieres publicar esta noticia?',
        async () => {
            try {
                await apiRequest(`/news/${newsId}/publish`, {
                    method: 'PATCH'
                });
                showAlert('Noticia publicada exitosamente');
                loadNews();
            } catch (error) {
                showAlert('Error publicando noticia', 'error');
            }
        }
    );
}

// Despublicar noticia
async function unpublishNews(newsId) {
    showConfirmModal(
        '¿Estás seguro de que quieres despublicar esta noticia?',
        async () => {
            try {
                await apiRequest(`/news/${newsId}/unpublish`, {
                    method: 'PATCH'
                });
                showAlert('Noticia despublicada exitosamente');
                loadNews();
            } catch (error) {
                showAlert('Error despublicando noticia', 'error');
            }
        }
    );
}

// Eliminar noticia
async function deleteNews(newsId) {
    showConfirmModal(
        '¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer.',
        async () => {
            try {
                await apiRequest(`/news/${newsId}`, {
                    method: 'DELETE'
                });
                showAlert('Noticia eliminada exitosamente');
                loadNews();
            } catch (error) {
                showAlert('Error eliminando noticia', 'error');
            }
        }
    );
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loadingNews');
    const newsList = document.getElementById('newsList');
    
    if (show) {
        loading.style.display = 'block';
        newsList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        newsList.style.display = 'block';
    }
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const newsModal = document.getElementById('newsModal');
    
    if (event.target === newsModal) {
        closeNewsModal();
    }
}
