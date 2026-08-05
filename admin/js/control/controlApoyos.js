import { API_BASE_URL } from '../apiConfig.js';

const apiUrlApoyos = `${API_BASE_URL}/apoyos`;

// Función genérica para cargar apoyos de cualquier nivel
function loadApoyos(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlApoyos}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.porcentaje - b.porcentaje);

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Porcentaje</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(apoyos => {
                    tableHtml += `
                        <tr>
                            <td>${apoyos.porcentaje}%</td>
                            <td>
                                <button onclick="deleteApoyos(${apoyos.id}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editApoyos(${apoyos.id}, '${apoyos.nombre}', ${apoyos.porcentaje}, ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron apoyos para este nivel.</p>');
            }
        })
        .catch(error => console.error('Error fetching apoyos:', error));
}

$(document).ready(function () {
    const maxLevel = 19;
    for (let level = 1; level <= maxLevel; level++) {
        loadApoyos(level, '#apoyosNivel' + level);
    }

    // Delegación de eventos para formularios de creación de apoyos
    $(document).on('submit', 'form[id^="createapoyosNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createapoyosNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const porcentaje = $(`#apoyosNivel${level}Porcentaje`).val();
        createApoyos(level, porcentaje, function () {
            $(`#apoyosNivel${level}Porcentaje`).val('');
            loadApoyos(level, '#apoyosNivel' + level);
        });
    });

    // Función genérica para crear apoyos
    function createApoyos(level, percentage, callback) {
        fetch(apiUrlApoyos, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ porcentaje: percentage, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => {
                window.tecToast('Apoyo creado');
                callback();
            })
            .catch(error => {
                console.error('Error creating apoyos:', error);
                window.tecToast('No se pudo crear el apoyo', 'error');
            });
    }
});

// Función para eliminar apoyos
async function deleteApoyos(id, level) {
    const confirmado = await window.tecConfirm('Se eliminará el apoyo de forma permanente.');
    if (!confirmado) return;
    fetch(`${apiUrlApoyos}/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadApoyos(level, '#apoyosNivel' + level);
            window.tecToast('Apoyo eliminado');
        })
        .catch(error => {
            console.error('Error deleting apoyos:', error);
            window.tecToast('No se pudo eliminar el apoyo', 'error');
        });
}

// Función para editar apoyos
async function editApoyos(id, currentName, currentPercentage, level) {
    const valores = await window.tecFormModal('Editar apoyo', [
        { name: 'porcentaje', label: 'Nuevo porcentaje del apoyo', value: currentPercentage, type: 'number' },
    ]);
    if (!valores || !valores.porcentaje) return;
    fetch(`${apiUrlApoyos}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ porcentaje: valores.porcentaje }),
    })
        .then(response => response.json())
        .then(data => {
            loadApoyos(level, '#apoyosNivel' + level);
            window.tecToast('Apoyo actualizado');
        })
        .catch(error => {
            console.error('Error editing apoyos:', error);
            window.tecToast('No se pudo actualizar el apoyo', 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteApoyos = deleteApoyos;
window.editApoyos = editApoyos;
