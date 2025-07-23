import { API_BASE_URL } from '../apiConfig.js';

// Función para cargar intereses por nivel (scope global)
function loadInteres(nivelId, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${API_BASE_URL}/intereses/nivel/${nivelId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.interes - b.interes);
                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Porcentaje</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;
                data.forEach(interes => {
                    tableHtml += `
                        <tr>
                            <td>${interes.interes}%</td>
                            <td>
                                <button onclick="deleteInteres(${interes.id}, ${nivelId})" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                <button onclick="editInteres(${interes.id}, ${nivelId})" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>`;
                });
                tableHtml += `</tbody></table>`;
                container.html(tableHtml).show();
            } else {
                container.html('<p>No se encontraron intereses para este nivel.</p>').show();
            }
        })
        .catch(error => console.error('Error fetching intereses:', error));
}
window.loadInteres = loadInteres;

// Función para eliminar un interés (scope global)
function deleteInteres(id, nivelId) {
    fetch(`${API_BASE_URL}/intereses/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $(`#interesNivel${nivelId}`).empty();
            loadInteres(nivelId, `#interesNivel${nivelId}`);
        })
        .catch(error => console.error('Error deleting interés:', error));
}
window.deleteInteres = deleteInteres;

// Función para editar un interés (scope global)
function editInteres(id, nivelId) {
    fetch(`${API_BASE_URL}/intereses/${id}`)
        .then(response => response.json())
        .then(interes => {
            const nuevoInteres = prompt('Nuevo porcentaje de interés:', interes.interes);
            if (nuevoInteres !== null && nuevoInteres !== '') {
                fetch(`${API_BASE_URL}/intereses/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interes: parseFloat(nuevoInteres), nivel_id: nivelId })
                })
                    .then(response => response.json())
                    .then(data => {
                        $(`#interesNivel${nivelId}`).empty();
                        loadInteres(nivelId, `#interesNivel${nivelId}`);
                    })
                    .catch(error => console.error('Error editing interés:', error));
            }
        })
        .catch(error => console.error('Error fetching interés:', error));
}
window.editInteres = editInteres;

// Función para crear un interés (scope global)
function createInteres(nivelId, interes, callback) {
    fetch(`${API_BASE_URL}/intereses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interes: parseFloat(interes), nivel_id: nivelId })
    })
        .then(response => response.json())
        .then(data => callback())
        .catch(error => console.error('Error creating interés:', error));
}
window.createInteres = createInteres;

// Inicialización y binds de eventos
$(document).ready(function () {
    const apiUrl = `${API_BASE_URL}/intereses`;
    const nivelesInteres = [1,2,3,4,5,6,7,8,9,10,11,12,13];

    // Cargar datos iniciales
    nivelesInteres.forEach(nivelId => {
        loadInteres(nivelId, '#interesNivel' + nivelId);
    });

    // Cargar datos cuando se hace clic en la pestaña de intereses
    $(document).on('click', 'a[id^="interes-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/interes-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadInteres(nivelId, '#interesNivel' + nivelId);
        }
    });

    // Delegación de eventos para formularios de creación de interés
    $(document).on('submit', 'form[id^="createinteresNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createinteresNivel(\d+)Form/);
        if (!nivelMatch) return;
        const nivelId = parseInt(nivelMatch[1]);
        const porcentaje = $(`#interesNivel${nivelId}Porcentaje`).val();
        createInteres(nivelId, porcentaje, function () {
            $(this)[0].reset();
            loadInteres(nivelId, '#interesNivel' + nivelId);
        }.bind(this));
    });
});
