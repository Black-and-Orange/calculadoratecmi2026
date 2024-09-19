$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/intereses';

    // Función genérica para cargar interes de cualquier nivel
    function loadInteres(level, containerId) {
        const container = $(containerId);


        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
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
                                    <button onclick="deleteInteres(${interes.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editInteres(${interes.id}, '${interes.nombre}', ${interes.interes}, ${level})" class="btn btn-warning">
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
                    container.html('<p>No se encontraron interes para este nivel.</p>').show();
                }
            })
            .catch(error => console.error('Error fetching interes:', error));
    }


    // Asociar eventos para cargar y crear interes de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {

        loadInteres(level, '#interesNivel' + level);


        handleCreateInteres(level, '#createInteresNivel' + level + 'Form', '#interesNivel' + level + 'Porcentaje', '#loadInteresNivel' + level);
    }

    // Función genérica para crear interes
    function createInteres(level, percentage, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ interes: percentage, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating interes:', error));
    }

    // Función para gestionar la creación de interes para cualquier nivel
    function handleCreateInteres(level, formId, percentageInputId, loadInteresBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const percentage = $(percentageInputId).val();
            createInteres(level, percentage, function () {
                $(percentageInputId).val('');
                $(loadInteresBtnId).click();
            });
        });
    }

});

// Función para eliminar interes
function deleteInteres(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/intereses/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de interes para el nivel específico
            $('#loadInteresNivel' + level).click();
        })
        .catch(error => console.error('Error deleting interes:', error));
}

// Función para editar interes
function editInteres(id, currentName, currentPercentage, level) {
    const newPercentage = prompt('Nuevo interes del apoyo:', currentPercentage);
    if (newPercentage) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/intereses/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ interes: newPercentage }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de interes para el nivel específico
                $('#loadInteresNivel' + level).click();
            })
            .catch(error => console.error('Error editing interes:', error));
    }
}
