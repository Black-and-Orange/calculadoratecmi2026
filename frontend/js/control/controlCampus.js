import { API_BASE_URL } from '../apiConfig.js';

const apiUrlCampus = `${API_BASE_URL}/campus`;

// Función genérica para cargar campus de cualquier nivel
function loadCampus(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlCampus}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.nombre.localeCompare(b.nombre));

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(campus => {
                    tableHtml += `
                        <tr>
                            <td>${campus.nombre}</td>
                            <td>${campus.categoria_coleg}</td>
                            <td>
                                <button onclick="deleteCampus(${campus.id}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editCampus(${campus.id}, '${campus.nombre}', '${campus.categoria_coleg}', ${level})" class="btn btn-warning">
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
                container.html('<p>No se encontraron campus para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error fetching campus:', error));
}

$(document).ready(function () {
    
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadCampus(level, '#campusNivel' + level);
    }

    // Delegación de eventos para formularios de creación de campus
    $(document).on('submit', 'form[id^="createcampusNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        // Extraer el número de nivel del id del formulario
        const nivelMatch = formId.match(/createcampusNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const name = $(`#campusNivel${level}Name`).val();
        const category = $(`#campusNivel${level}Category`).val();
        createCampus(level, name, category, function () {
            $(`#campusNivel${level}Name`).val('');
            $(`#campusNivel${level}Category`).val('');
            loadCampus(level, '#campusNivel' + level);
        });
    });

    // Función genérica para crear campus
    function createCampus(level, name, category, callback) {
        fetch(apiUrlCampus, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: name, categoria_coleg: category, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating campus:', error));
    }
});

// Función para eliminar campus
function deleteCampus(id, level) {
    fetch(`${API_BASE_URL}/campus/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                // Recargar lista de campus para el nivel específico
                loadCampus(level, '#campusNivel' + level);
            } else {
                return response.json().then(err => { throw new Error(err.message); });
            }
        })
        .catch(error => console.error('Error deleting campus:', error));
}

// Función para editar campus
function editCampus(id, currentName, currentCategory, level) {
    const newName = prompt('Nuevo nombre del campus:', currentName);
    const newCategory = prompt('Nueva categoría del campus:', currentCategory);
    if (newName && newCategory) {
        fetch(`${API_BASE_URL}/campus/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: newName, categoria_coleg: newCategory }),
        })
            .then(response => {
                if (response.ok) {
                    // Recargar lista de campus para el nivel específico
                    loadCampus(level, '#campusNivel' + level);
                } else {
                    return response.json().then(err => { throw new Error(err.message); });
                }
            })
            .catch(error => console.error('Error editing campus:', error));
    }
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteCampus = deleteCampus;
window.editCampus = editCampus;
