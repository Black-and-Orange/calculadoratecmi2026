import { API_BASE_URL } from '../apiConfig.js';

// Función para cargar créditos por nivel (scope global)
function loadCreditos(nivelId, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${API_BASE_URL}/creditos/nivel/${nivelId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.credito - b.credito);
                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Número de Créditos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;
                data.forEach(credito => {
                    tableHtml += `
                        <tr>
                            <td>${credito.credito}</td>
                            <td>
                                <button onclick="deleteCreditos(${credito.id}, ${nivelId})" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                <button onclick="editCreditos(${credito.id}, ${nivelId})" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>`;
                });
                tableHtml += `</tbody></table>`;
                container.html(tableHtml).show();
            } else {
                container.html('<p>No se encontraron créditos para este nivel.</p>').show();
            }
        })
        .catch(error => console.error('Error fetching créditos:', error));
}
window.loadCreditos = loadCreditos;

// Función para eliminar un crédito (scope global)
async function deleteCreditos(id, nivelId) {
    const confirmado = await window.tecConfirm('Se eliminará el registro de créditos de forma permanente.');
    if (!confirmado) return;
    fetch(`${API_BASE_URL}/creditos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $(`#cargacreditosNivel${nivelId}`).empty();
            loadCreditos(nivelId, `#cargacreditosNivel${nivelId}`);
            window.tecToast('Créditos eliminados');
        })
        .catch(error => {
            console.error('Error deleting crédito:', error);
            window.tecToast('No se pudieron eliminar los créditos', 'error');
        });
}
window.deleteCreditos = deleteCreditos;

// Función para editar un crédito (scope global)
function editCreditos(id, nivelId) {
    fetch(`${API_BASE_URL}/creditos/${id}`)
        .then(async creditoResponse => {
            const credito = await creditoResponse.json();
            const valores = await window.tecFormModal('Editar créditos', [
                { name: 'credito', label: 'Nuevo número de créditos', value: credito.credito, type: 'number' },
            ]);
            if (!valores || valores.credito === '') return;
            fetch(`${API_BASE_URL}/creditos/${id}`, {
                // El backend expone PATCH /creditos/:id (no existe ruta PUT)
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credito: parseInt(valores.credito), id_nivel: nivelId })
            })
                .then(response => response.json())
                .then(data => {
                    $(`#cargacreditosNivel${nivelId}`).empty();
                    loadCreditos(nivelId, `#cargacreditosNivel${nivelId}`);
                    window.tecToast('Créditos actualizados');
                })
                .catch(error => {
                    console.error('Error editing crédito:', error);
                    window.tecToast('No se pudieron actualizar los créditos', 'error');
                });
        })
        .catch(error => console.error('Error fetching crédito:', error));
}
window.editCreditos = editCreditos;

// Función para crear un crédito (scope global)
function createCreditos(nivelId, numeroCreditos, callback) {
    fetch(`${API_BASE_URL}/creditos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credito: parseInt(numeroCreditos), id_nivel: nivelId })
    })
        .then(response => response.json())
        .then(data => {
            window.tecToast('Créditos creados');
            callback();
        })
        .catch(error => {
            console.error('Error creating crédito:', error);
            window.tecToast('No se pudieron crear los créditos', 'error');
        });
}
window.createCreditos = createCreditos;

// Inicialización y binds de eventos
$(document).ready(function () {
    const apiUrl = `${API_BASE_URL}/creditos`;
    const nivelesCreditos = [1,2,3,4,5,6,7,8,9,10,11,12,13];

    // Cargar datos iniciales
    nivelesCreditos.forEach(nivelId => {
        loadCreditos(nivelId, '#cargacreditosNivel' + nivelId);
    });

    // Cargar datos cuando se hace clic en la pestaña de créditos
    $(document).on('click', 'a[id^="creditos-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/creditos-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadCreditos(nivelId, '#cargacreditosNivel' + nivelId);
        }
    });

    // Delegación de eventos para formularios de creación de créditos
    $(document).on('submit', 'form[id^="createcargacreditosNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createcargacreditosNivel(\d+)Form/);
        if (!nivelMatch) return;
        const nivelId = parseInt(nivelMatch[1]);
        const numeroCreditos = $(`#cargacreditosNivel${nivelId}Creditos`).val();
        createCreditos(nivelId, numeroCreditos, function () {
            $(this)[0].reset();
            loadCreditos(nivelId, '#cargacreditosNivel' + nivelId);
        }.bind(this));
    });
});
