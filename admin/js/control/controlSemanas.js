import { API_BASE_URL } from '../apiConfig.js';

const apiUrlSemanas = `${API_BASE_URL}/semanas`;

// Función genérica para cargar semanas de cualquier nivel
function loadSemanas(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlSemanas}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.num_semanas - b.num_semanas);

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Número de Semanas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(semana => {
                    tableHtml += `
                        <tr>
                            <td>${semana.num_semanas}</td>
                            <td>
                                <button onclick="deleteSemanas(${semana.id}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editSemanas(${semana.id}, ${semana.num_semanas}, ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron semanas para este nivel.</p>');
            }
        })
        .catch(error => console.error('Error fetching semanas:', error));
}

$(document).ready(function () {
    const maxLevel = 19;
    for (let level = 1; level <= maxLevel; level++) {
        loadSemanas(level, '#semanasNivel' + level);
    }

    // Delegación de eventos para formularios de creación de semanas
    $(document).on('submit', 'form[id^="createsemanasNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        
        const formId = $(this).attr('id');
        
        const nivelMatch = formId.match(/createsemanasNivel(\d+)Form/);
        if (!nivelMatch) {
            console.error('No se pudo extraer el nivel del form ID:', formId);
            return;
        }
        
        const level = parseInt(nivelMatch[1]);
        
        const numeroSemanas = $(`#semanasNivel${level}Semanas`).val();
        
        if (!numeroSemanas) {
            console.error('No se ingresó número de semanas');
            return;
        }
        
        createSemanas(level, numeroSemanas, function () {
            $(`#semanasNivel${level}Semanas`).val('');
            loadSemanas(level, '#semanasNivel' + level);
        });
    });

    // Función genérica para crear semanas
    function createSemanas(level, numeroSemanas, callback) {
        
        const requestData = { num_semanas: numeroSemanas, nivel_id: level };
        
        fetch(apiUrlSemanas, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                window.tecToast('Semanas creadas');
                callback();
            })
            .catch(error => {
                console.error('Error creating semanas:', error);
                window.tecToast('Error al crear las semanas: ' + error.message, 'error');
            });
    }
});

// Función para eliminar semanas
async function deleteSemanas(id, level) {
    const confirmado = await window.tecConfirm('Se eliminará el registro de semanas de forma permanente.');
    if (!confirmado) return;

    fetch(`${apiUrlSemanas}/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            loadSemanas(level, '#semanasNivel' + level);
            window.tecToast('Semanas eliminadas');
        })
        .catch(error => {
            console.error('Error deleting semanas:', error);
            window.tecToast('Error al eliminar la semana: ' + error.message, 'error');
        });
}

// Función para editar semanas
async function editSemanas(id, currentNumero, level) {
    const valores = await window.tecFormModal('Editar semanas', [
        { name: 'numero', label: 'Nuevo número de semanas', value: currentNumero, type: 'number' },
    ]);
    if (!valores || !valores.numero) return;
    fetch(`${apiUrlSemanas}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num_semanas: valores.numero }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            loadSemanas(level, '#semanasNivel' + level);
            window.tecToast('Semanas actualizadas');
        })
        .catch(error => {
            console.error('Error editing semanas:', error);
            window.tecToast('Error al editar la semana: ' + error.message, 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteSemanas = deleteSemanas;
window.editSemanas = editSemanas;
