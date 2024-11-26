const apiUrlApoyosFijos = 'https://tecmilenio-calculadora-backend.testingbo.com/api/apoyosFijos';

// Función genérica para cargar apoyos de cualquier nivel
function loadApoyosFijos(level, containerId) {

    const container = $(containerId);

    // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
    container.empty();

    console.log(`${apiUrlApoyosFijos}/nivel/${level}`);
    fetch(`${apiUrlApoyosFijos}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {

            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.valor - b.valor);

                let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Valor</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                data.forEach(apoyos => {
                    tableHtml += `
                            <tr>
                                <td>${Math.floor(apoyos.valor)}</td>
                                <td>
                                    <button onclick="deleteApoyosFijos(${apoyos.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editApoyosFijos(${apoyos.id}, '${apoyos.nombre}', ${apoyos.valor}, ${level})" class="btn btn-warning">
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
                container.html('<p>No se encontraron apoyos para este nivel.</p>');
            }
        })
        .catch(error => console.error('Error fetching apoyos:', error));
}
$(document).ready(function () {
    const maxLevel = 12;
    for (let level = 1; level <= maxLevel; level++) {
        loadApoyosFijos(level, '#apoyosfijosNivel' + level);

        // Asociar eventos para crear apoyos de niveles dinámicos
        handleCreateApoyosFijos(level, '#createApoyosFijosNivel' + level + 'Form', '#apoyosfijosNivel' + level + 'Valor');
    }

    // Función genérica para crear apoyos
    function createApoyosFijos(level, percentage, callback) {
        fetch(apiUrlApoyosFijos, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ valor: percentage, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating apoyos:', error));
    }

    // Función para gestionar la creación de apoyos para cualquier nivel
    function handleCreateApoyosFijos(level, formId, percentageInputId, loadApoyosFijosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const percentage = $(percentageInputId).val();
            createApoyosFijos(level, percentage, function () {
                $(percentageInputId).val('');
                loadApoyosFijos(level, '#apoyosfijosNivel' + level);
            });
        });
    }

});

// Función para eliminar apoyos
function deleteApoyosFijos(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/apoyosFijos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadApoyosFijos(level, '#apoyosfijosNivel' + level);
        })
        .catch(error => console.error('Error deleting apoyos:', error));
}

// Función para editar apoyos
function editApoyosFijos(id, currentName, currentPercentage, level) {
    const newPercentage = prompt('Nuevo valor del apoyo:', currentPercentage);
    if (newPercentage) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/apoyosFijos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ valor: newPercentage }),
        })
            .then(response => response.json())
            .then(data => {
                loadApoyosFijos(level, '#apoyosfijosNivel' + level);
            })
            .catch(error => console.error('Error editing apoyos:', error));
    }
}
