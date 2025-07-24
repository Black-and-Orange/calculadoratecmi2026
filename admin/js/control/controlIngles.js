import { API_BASE_URL } from '../apiConfig.js';

const apiUrlIngles = `${API_BASE_URL}/ingles`;

// Función genérica para cargar ingles de cualquier nivel
function loadIngles(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlIngles}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.num_ingles - b.num_ingles);

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Número de Ingles</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(ingles => {
                    tableHtml += `
                        <tr>
                            <td>${ingles.num_ingles}</td>
                            <td>
                                <button onclick="deleteIngles(${ingles.id}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editIngles(${ingles.id}, ${ingles.num_ingles}, ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron ingles para este nivel.</p>');
            }
        })
        .catch(error => console.error('Error fetching ingles:', error));
}

$(document).ready(function () {
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadIngles(level, '#inglesNivel' + level);
    }

    // Delegación de eventos para formularios de creación de inglés
    $(document).on('submit', 'form[id^="createInglesNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createInglesNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const numeroIngles = $(`#inglesNivel${level}Ingles`).val();
        createIngles(level, numeroIngles, function () {
            $(`#inglesNivel${level}Ingles`).val('');
            loadIngles(level, '#inglesNivel' + level);
        });
    });

    // Recargar la tabla al hacer clic en la pestaña de inglés
    $(document).on('click', 'a[id^="ingles-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/ingles-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadIngles(nivelId, '#inglesNivel' + nivelId);
        }
    });

    // Función genérica para crear ingles
    function createIngles(level, numeroIngles, callback) {
        fetch(apiUrlIngles, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num_ingles: numeroIngles, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating ingles:', error));
    }
});

// Función para eliminar ingles
function deleteIngles(id, level) {
    fetch(`${apiUrlIngles}/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadIngles(level, '#inglesNivel' + level);
        })
        .catch(error => console.error('Error deleting ingles:', error));
}

// Función para editar ingles
function editIngles(id, currentNumero, level) {
    const newNumero = prompt('Nuevo número de ingles:', currentNumero);
    if (newNumero) {
        fetch(`${apiUrlIngles}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num_ingles: newNumero }),
        })
            .then(response => response.json())
            .then(data => {
                loadIngles(level, '#inglesNivel' + level);
            })
            .catch(error => console.error('Error editing ingles:', error));
    }
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteIngles = deleteIngles;
window.editIngles = editIngles;
