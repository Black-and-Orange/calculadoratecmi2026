import { API_BASE_URL } from '../apiConfig.js';

// Función para cargar préstamos por nivel (scope global)
function loadPrestamos(nivelId, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${API_BASE_URL}/prestamos/nivel/${nivelId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.prestamo - b.prestamo);
                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Porcentaje</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;
                data.forEach(prestamo => {
                    tableHtml += `
                        <tr>
                            <td>${prestamo.prestamo}%</td>
                            <td>
                                <button onclick="deletePrestamos(${prestamo.id}, ${nivelId})" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                <button onclick="editPrestamos(${prestamo.id}, ${nivelId})" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>`;
                });
                tableHtml += `</tbody></table>`;
                container.html(tableHtml).show();
            } else {
                container.html('<p>No se encontraron préstamos para este nivel.</p>').show();
            }
        })
        .catch(error => console.error('Error fetching préstamos:', error));
}
window.loadPrestamos = loadPrestamos;

// Función para eliminar un préstamo (scope global)
function deletePrestamos(id, nivelId) {
    fetch(`${API_BASE_URL}/prestamos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $(`#prestamosNivel${nivelId}`).empty();
            loadPrestamos(nivelId, `#prestamosNivel${nivelId}`);
        })
        .catch(error => console.error('Error deleting préstamo:', error));
}
window.deletePrestamos = deletePrestamos;

// Función para editar un préstamo (scope global)
function editPrestamos(id, nivelId) {
    fetch(`${API_BASE_URL}/prestamos/${id}`)
        .then(response => response.json())
        .then(prestamo => {
            const nuevoPrestamo = prompt('Nuevo porcentaje de préstamo:', prestamo.prestamo);
            if (nuevoPrestamo !== null && nuevoPrestamo !== '') {
                fetch(`${API_BASE_URL}/prestamos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prestamo: parseFloat(nuevoPrestamo), nivel_id: nivelId })
                })
                    .then(response => response.json())
                    .then(data => {
                        $(`#prestamosNivel${nivelId}`).empty();
                        loadPrestamos(nivelId, `#prestamosNivel${nivelId}`);
                    })
                    .catch(error => console.error('Error editing préstamo:', error));
            }
        })
        .catch(error => console.error('Error fetching préstamo:', error));
}
window.editPrestamos = editPrestamos;

// Función para crear un préstamo (scope global)
function createPrestamos(nivelId, prestamo, callback) {
    fetch(`${API_BASE_URL}/prestamos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestamo: parseFloat(prestamo), nivel_id: nivelId })
    })
        .then(response => response.json())
        .then(data => callback())
        .catch(error => console.error('Error creating préstamo:', error));
}
window.createPrestamos = createPrestamos;

// Inicialización y binds de eventos
$(document).ready(function () {
    const apiUrl = `${API_BASE_URL}/prestamos`;
    const nivelesPrestamos = [1,2,3,4,5,6,7,8,9,10,11,12,13];

    // Cargar datos iniciales
    nivelesPrestamos.forEach(nivelId => {
        loadPrestamos(nivelId, '#prestamosNivel' + nivelId);
    });

    // Cargar datos cuando se hace clic en la pestaña de préstamos
    $(document).on('click', 'a[id^="prestamos-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/prestamos-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadPrestamos(nivelId, '#prestamosNivel' + nivelId);
        }
    });

    // Configurar formularios de creación
    nivelesPrestamos.forEach(nivelId => {
        handleCreatePrestamos(
            nivelId,
            '#createprestamosNivel' + nivelId + 'Form',
            '#prestamosNivel' + nivelId + 'Porcentaje'
        );
    });

    // Manejar el formulario de creación
    function handleCreatePrestamos(nivelId, formId, prestamoId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const prestamo = $(prestamoId).val();
            createPrestamos(nivelId, prestamo, function () {
                $(formId)[0].reset();
                loadPrestamos(nivelId, '#prestamosNivel' + nivelId);
            });
        });
    }
});
