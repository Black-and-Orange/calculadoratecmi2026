import { API_BASE_URL } from '../apiConfig.js';

const apiUrlCostos = `${API_BASE_URL}/costos`;

// Función genérica para cargar costos de materias de cualquier nivel
function loadCostos(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlCostos}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.clave.localeCompare(b.clave));

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Clave</th>
                                <th>Costo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(costoMateria => {
                    tableHtml += `
                        <tr>
                            <td>${costoMateria.clave}</td>
                            <td>${costoMateria.costo}</td>
                            <td>
                                <button onclick="deleteCosto(${costoMateria.id_costo}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editCosto(${costoMateria.id_costo}, '${costoMateria.clave}', '${costoMateria.costo}', ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml).show();
            } else {
                container.html('<p>No se encontraron costos de materias para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error fetching costos de materias:', error));
}

$(document).ready(function () {
    const maxLevel = 15;
    for (let level = 1; level <= maxLevel; level++) {
        loadCostos(level, '#costomateriasNivel' + level);
    }

    // Delegación de eventos para formularios de creación de costos
    $(document).on('submit', 'form[id^="createcostomateriasNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createcostomateriasNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const clave = $(`#costomateriasNivel${level}Clave`).val();
        const costo = $(`#costomateriasNivel${level}Costo`).val();
        createCosto(level, clave, costo, function () {
            $(`#costomateriasNivel${level}Clave`).val('');
            $(`#costomateriasNivel${level}Costo`).val('');
            loadCostos(level, '#costomateriasNivel' + level);
        });
    });

    // Recargar la tabla al hacer clic en la pestaña de costos
    $(document).on('click', 'a[id^="costomaterias-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/costomaterias-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadCostos(nivelId, '#costomateriasNivel' + nivelId);
        }
    });

    // Función genérica para crear costos de materias
    function createCosto(level, clave, costo, callback) {
        const requestData = { clave: clave, costo: costo, id_nivel: level };
        fetch(apiUrlCostos, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(data => {
                window.tecToast('Costo creado');
                callback();
            })
            .catch(error => {
                console.error('Error creando costo de materia:', error);
                window.tecToast('No se pudo crear el costo', 'error');
            });
    }
});

// Función para eliminar costos de materias
async function deleteCosto(id, level) {
    const confirmado = await window.tecConfirm('Se eliminará el costo de materia de forma permanente.');
    if (!confirmado) return;
    fetch(`${apiUrlCostos}/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadCostos(level, '#costomateriasNivel' + level);
            window.tecToast('Costo eliminado');
        })
        .catch(error => {
            console.error('Error eliminando costo de materia:', error);
            window.tecToast('No se pudo eliminar el costo', 'error');
        });
}

// Función para editar costos de materias
async function editCosto(id, currentClave, currentCosto, level) {
    const valores = await window.tecFormModal('Editar costo de materia', [
        { name: 'clave', label: 'Nueva clave de la materia', value: currentClave },
        { name: 'costo', label: 'Nuevo costo de la materia', value: currentCosto, type: 'number' },
    ]);
    if (!valores || !valores.clave || !valores.costo) return;
    fetch(`${apiUrlCostos}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clave: valores.clave, costo: valores.costo }),
    })
        .then(response => response.json())
        .then(data => {
            loadCostos(level, '#costomateriasNivel' + level);
            window.tecToast('Costo actualizado');
        })
        .catch(error => {
            console.error('Error editando costo de materia:', error);
            window.tecToast('No se pudo actualizar el costo', 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteCosto = deleteCosto;
window.editCosto = editCosto;
