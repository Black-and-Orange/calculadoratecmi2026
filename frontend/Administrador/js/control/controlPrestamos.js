$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/prestamos';

    // Función genérica para cargar prestamos de cualquier nivel
    function loadPrestamos(level, containerId) {
        const container = $(containerId);
        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
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

                    data.forEach(prestamos => {
                        tableHtml += `
                            <tr>
                                <td>${prestamos.prestamo}%</td>
                                <td>
                                    <button onclick="deletePrestamos(${prestamos.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editPrestamos(${prestamos.id}, '${prestamos.nombre}', ${prestamos.prestamo}, ${level})" class="btn btn-warning">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>`;
                    });

                    tableHtml += `
                            </tbody>
                        </table>`;

                    container.html(tableHtml).show();
                } else {
                    container.html('<p>No se encontraron prestamos para este nivel.</p>').show();
                }
            })
            .catch(error => console.error('Error fetching prestamos:', error));
    }

    // Asociar eventos para cargar y crear prestamos de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        loadPrestamos(level, '#prestamosNivel' + level);
        handleCreatePrestamos(level, '#createPrestamosNivel' + level + 'Form', '#prestamosNivel' + level + 'Porcentaje', '#loadPrestamosNivel' + level);
    }

    // Función genérica para crear prestamos
    function createPrestamos(level, percentage, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prestamo: percentage, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating prestamos:', error));
    }

    // Función para gestionar la creación de prestamos para cualquier nivel
    function handleCreatePrestamos(level, formId, percentageInputId, loadPrestamosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const percentage = $(percentageInputId).val();
            createPrestamos(level, percentage, function () {
                $(percentageInputId).val('');
                $(loadPrestamosBtnId).click();
            });
        });
    }

});

// Función para eliminar prestamos
function deletePrestamos(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/prestamos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de prestamos para el nivel específico
            $('#loadPrestamosNivel' + level).click();
        })
        .catch(error => console.error('Error deleting prestamos:', error));
}

// Función para editar prestamos
function editPrestamos(id, currentName, currentPercentage, level) {
    const newPercentage = prompt('Nuevo prestamo del apoyo:', currentPercentage);
    if (newPercentage) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/prestamos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prestamo: newPercentage }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de prestamos para el nivel específico
                $('#loadPrestamosNivel' + level).click();
            })
            .catch(error => console.error('Error editing prestamos:', error));
    }
}
