import { API_BASE_URL } from '../apiConfig.js';

// Función para cargar apoyos fijos por nivel (scope global)
function loadApoyosFijos(nivelId, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${API_BASE_URL}/apoyosFijos/nivel/${nivelId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.valor - b.valor);
                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Valor</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;
                data.forEach(apoyo => {
                    tableHtml += `
                        <tr>
                            <td>${Math.floor(apoyo.valor)}</td>
                            <td>
                                <button onclick="deleteApoyosFijos(${apoyo.id}, ${nivelId})" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                <button onclick="editApoyosFijos(${apoyo.id}, ${nivelId})" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>`;
                });
                tableHtml += `</tbody></table>`;
                container.html(tableHtml).show();
            } else {
                container.html('<p>No se encontraron apoyos fijos para este nivel.</p>').show();
            }
        })
        .catch(error => console.error('Error fetching apoyos fijos:', error));
}
window.loadApoyosFijos = loadApoyosFijos;

// Función para eliminar un apoyo fijo (scope global)
async function deleteApoyosFijos(id, nivelId) {
    const confirmado = await window.tecConfirm('Se eliminará el apoyo fijo de forma permanente.');
    if (!confirmado) return;
    fetch(`${API_BASE_URL}/apoyosFijos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $(`#apoyosfijosNivel${nivelId}`).empty();
            loadApoyosFijos(nivelId, `#apoyosfijosNivel${nivelId}`);
            window.tecToast('Apoyo fijo eliminado');
        })
        .catch(error => {
            console.error('Error deleting apoyo fijo:', error);
            window.tecToast('No se pudo eliminar el apoyo fijo', 'error');
        });
}
window.deleteApoyosFijos = deleteApoyosFijos;

// Función para editar un apoyo fijo (scope global)
function editApoyosFijos(id, nivelId) {
    fetch(`${API_BASE_URL}/apoyosFijos/${id}`)
        .then(async apoyoResponse => {
            const apoyo = await apoyoResponse.json();
            const valores = await window.tecFormModal('Editar apoyo fijo', [
                { name: 'valor', label: 'Nuevo valor del apoyo fijo', value: apoyo.valor, type: 'number' },
            ]);
            if (!valores || valores.valor === '') return;
            fetch(`${API_BASE_URL}/apoyosFijos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: parseFloat(valores.valor), nivel_id: nivelId })
            })
                .then(response => response.json())
                .then(data => {
                    $(`#apoyosfijosNivel${nivelId}`).empty();
                    loadApoyosFijos(nivelId, `#apoyosfijosNivel${nivelId}`);
                    window.tecToast('Apoyo fijo actualizado');
                })
                .catch(error => {
                    console.error('Error editing apoyo fijo:', error);
                    window.tecToast('No se pudo actualizar el apoyo fijo', 'error');
                });
        })
        .catch(error => console.error('Error fetching apoyo fijo:', error));
}
window.editApoyosFijos = editApoyosFijos;

// Inicialización y binds de eventos
$(document).ready(function () {
    const apiUrl = `${API_BASE_URL}/apoyosFijos`;
    const nivelesApoyosFijos = [1,2,3,4,5,6,7,8,9,10,11,12,13];

    // Cargar datos iniciales
    nivelesApoyosFijos.forEach(nivelId => {
        loadApoyosFijos(nivelId, '#apoyosfijosNivel' + nivelId);
    });

    // Cargar datos cuando se hace clic en la pestaña de apoyos fijos
    $(document).on('click', 'a[id^="apoyos-fijos-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/apoyos-fijos-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadApoyosFijos(nivelId, '#apoyosfijosNivel' + nivelId);
        }
    });

    // Configurar formularios de creación
    nivelesApoyosFijos.forEach(nivelId => {
        handleCreateApoyosFijos(
            nivelId,
            '#createapoyosfijosNivel' + nivelId + 'Form',
            '#apoyosfijosNivel' + nivelId + 'Valor'
        );
    });

    // Función para crear un apoyo fijo
    function createApoyosFijos(nivelId, valor, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: parseFloat(valor), nivel_id: nivelId })
        })
            .then(response => response.json())
            .then(data => {
                window.tecToast('Apoyo fijo creado');
                callback();
            })
            .catch(error => {
                console.error('Error creating apoyo fijo:', error);
                window.tecToast('No se pudo crear el apoyo fijo', 'error');
            });
    }

    // Manejar el formulario de creación
    function handleCreateApoyosFijos(nivelId, formId, valorId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const valor = $(valorId).val();
            createApoyosFijos(nivelId, valor, function () {
                $(formId)[0].reset();
                loadApoyosFijos(nivelId, '#apoyosfijosNivel' + nivelId);
            });
        });
    }
});
