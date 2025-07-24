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
function deleteCreditos(id, nivelId) {
    fetch(`${API_BASE_URL}/creditos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $(`#cargacreditosNivel${nivelId}`).empty();
            loadCreditos(nivelId, `#cargacreditosNivel${nivelId}`);
        })
        .catch(error => console.error('Error deleting crédito:', error));
}
window.deleteCreditos = deleteCreditos;

// Función para editar un crédito (scope global)
function editCreditos(id, nivelId) {
    fetch(`${API_BASE_URL}/creditos/${id}`)
        .then(response => response.json())
        .then(credito => {
            const nuevoCredito = prompt('Nuevo número de créditos:', credito.credito);
            if (nuevoCredito !== null && nuevoCredito !== '') {
                fetch(`${API_BASE_URL}/creditos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credito: parseInt(nuevoCredito), id_nivel: nivelId })
                })
                    .then(response => response.json())
                    .then(data => {
                        $(`#cargacreditosNivel${nivelId}`).empty();
                        loadCreditos(nivelId, `#cargacreditosNivel${nivelId}`);
                    })
                    .catch(error => console.error('Error editing crédito:', error));
            }
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
            callback();
        })
        .catch(error => console.error('Error creating crédito:', error));
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
