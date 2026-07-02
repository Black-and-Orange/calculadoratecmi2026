import { API_BASE_URL } from '../apiConfig.js';

const apiUrlMaterias = `${API_BASE_URL}/materias`;

// Función genérica para cargar materias de cualquier nivel
function loadMaterias(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlMaterias}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.numero - b.numero);

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Número de Materias</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(materia => {
                    tableHtml += `
                        <tr>
                            <td>${materia.numero}</td>
                            <td>
                                <button onclick="deleteMaterias(${materia.id_materia}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editMaterias(${materia.id_materia}, ${materia.numero}, ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron materias para este nivel.</p>');
            }
        })
        .catch(error => console.error('Error fetching materias:', error));
}

$(document).ready(function () {
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadMaterias(level, '#cargamateriasNivel' + level);
    }

    // Delegación de eventos para formularios de creación de materias
    $(document).on('submit', 'form[id^="createcargamateriasNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createcargamateriasNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const numeroMaterias = $(`#cargamateriasNivel${level}Materias`).val();
        createMaterias(level, numeroMaterias, function () {
            $(`#cargamateriasNivel${level}Materias`).val('');
            loadMaterias(level, '#cargamateriasNivel' + level);
        });
    });

    // Recargar la tabla al hacer clic en la pestaña de materias
    $(document).on('click', 'a[id^="cargamaterias-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/cargamaterias-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadMaterias(nivelId, '#cargamateriasNivel' + nivelId);
        }
    });

    // Función genérica para crear materias
    function createMaterias(level, numeroMaterias, callback) {
        const bodyData = { numero: numeroMaterias, id_nivel: level };
        fetch(apiUrlMaterias, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
        })
            .then(response => response.json())
            .then(data => {
                window.tecToast('Materias creadas');
                callback();
            })
            .catch(error => {
                console.error('Error creating materias:', error);
                window.tecToast('No se pudieron crear las materias', 'error');
            });
    }
});

// Función para eliminar materias
async function deleteMaterias(id, level) {
    const confirmado = await window.tecConfirm('Se eliminará el registro de materias de forma permanente.');
    if (!confirmado) return;
    fetch(`${apiUrlMaterias}/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadMaterias(level, '#cargamateriasNivel' + level);
            window.tecToast('Materias eliminadas');
        })
        .catch(error => {
            console.error('Error deleting materias:', error);
            window.tecToast('No se pudieron eliminar las materias', 'error');
        });
}

// Función para editar materias
async function editMaterias(id, currentNumero, level) {
    const valores = await window.tecFormModal('Editar materias', [
        { name: 'numero', label: 'Nuevo número de materias', value: currentNumero, type: 'number' },
    ]);
    if (!valores || !valores.numero) return;
    fetch(`${apiUrlMaterias}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numero: valores.numero }),
    })
        .then(response => response.json())
        .then(data => {
            loadMaterias(level, '#cargamateriasNivel' + level);
            window.tecToast('Materias actualizadas');
        })
        .catch(error => {
            console.error('Error editing materias:', error);
            window.tecToast('No se pudieron actualizar las materias', 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteMaterias = deleteMaterias;
window.editMaterias = editMaterias;
