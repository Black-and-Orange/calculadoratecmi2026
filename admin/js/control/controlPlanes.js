import { API_BASE_URL } from '../apiConfig.js';

const apiUrlPlanes = `${API_BASE_URL}/planes`;

// Función genérica para cargar planes de cualquier nivel
function loadPlanes(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlPlanes}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.descripcion.localeCompare(b.descripcion));

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(planes => {
                    tableHtml += `
                        <tr>
                            <td>${planes.descripcion}</td>
                            <td>${planes.tipo_plan}</td>
                            <td>
                                <button onclick="deletePlanes(${planes.id_plan}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editPlanes(${planes.id_plan}, '${planes.descripcion}', '${planes.tipo_plan}', ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `
                        </tbody>
                    </table>`;

                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron planes para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error fetching planes:', error));
}

$(document).ready(function () {
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadPlanes(level, '#programasNivel' + level);
    }

    // Delegación de eventos para formularios de creación de planes
    $(document).on('submit', 'form[id^="createprogramasNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createprogramasNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const name = $(`#programasNivel${level}Name`).val();
        const category = $(`#programasNivel${level}Type`).val();
        createPlanes(level, name, category, function () {
            $(`#programasNivel${level}Name`).val('');
            $(`#programasNivel${level}Type`).val('');
            loadPlanes(level, '#programasNivel' + level);
        });
    });

    // Función genérica para crear planes
    function createPlanes(level, name, category, callback) {
        fetch(apiUrlPlanes, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: name, tipo_plan: category, id_nivel: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating planes:', error));
    }
});

// Función para eliminar planes
function deletePlanes(id, level) {
    fetch(`${apiUrlPlanes}/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                loadPlanes(level, '#programasNivel' + level);
            } else {
                return response.json().then(err => { throw new Error(err.message); });
            }
        })
        .catch(error => console.error('Error deleting planes:', error));
}

// Función para editar planes
function editPlanes(id, currentName, currentCategory, level) {
    const newName = prompt('Nuevo nombre del plan:', currentName);
    const newCategory = prompt('Nueva categoría del plan:', currentCategory);
    if (newName && newCategory) {
        fetch(`${API_BASE_URL}/planes/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: newName, tipo_plan: newCategory }),
        })
            .then(response => {
                if (response.ok) {
                    loadPlanes(level, '#programasNivel' + level);
                } else {
                    return response.json().then(err => { throw new Error(err.message); });
                }
            })
            .catch(error => console.error('Error editing planes:', error));
    }
}

// Exponer funciones al ámbito global para los botones onclick
window.deletePlanes = deletePlanes;
window.editPlanes = editPlanes;
