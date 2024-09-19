$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/apoyos';

    // Función genérica para cargar apoyos de cualquier nivel
    function loadApoyos(level, containerId) {
        const container = $(containerId);


        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
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

                    tableHtml += `
                            </tbody>
                        </table>`;

                    container.html(tableHtml).show();
                } else {
                    container.html('<p>No se encontraron apoyos para este nivel.</p>').show();
                }
            })
            .catch(error => console.error('Error fetching apoyos:', error));
    }

    const maxLevel = 12;
    for (let level = 1; level <= maxLevel; level++) {
        loadApoyos(level, '#apoyosNivel' + level);

        // Asociar eventos para crear apoyos de niveles dinámicos
        handleCreateApoyos(level, '#createApoyosNivel' + level + 'Form', '#apoyosNivel' + level + 'Porcentaje');
    }

    // Función genérica para crear apoyos
    function createApoyos(level, percentage, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ porcentaje: percentage, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating apoyos:', error));
    }

    // Función para gestionar la creación de apoyos para cualquier nivel
    function handleCreateApoyos(level, formId, percentageInputId, loadApoyosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const percentage = $(percentageInputId).val();
            createApoyos(level, percentage, function () {
                $(percentageInputId).val('');
                $(loadApoyosBtnId).click();
            });
        });
    }


});

// Función para eliminar apoyos
function deleteApoyos(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/apoyos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de apoyos para el nivel específico
            $('#loadApoyosNivel' + level).click();
        })
        .catch(error => console.error('Error deleting apoyos:', error));
}

// Función para editar apoyos
function editApoyos(id, currentName, currentPercentage, level) {
    const newPercentage = prompt('Nuevo porcentaje del apoyo:', currentPercentage);
    if (newPercentage) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/apoyos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ porcentaje: newPercentage }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de apoyos para el nivel específico
                $('#loadApoyosNivel' + level).click();
            })
            .catch(error => console.error('Error editing apoyos:', error));
    }
}
