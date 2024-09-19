$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/creditos';

    // Función genérica para cargar creditos de cualquier nivel
    function loadCreditos(level, containerId) {
        const container = $(containerId);


        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.sort((a, b) => a.credito - b.credito);

                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Número de Creditos</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(credito => {
                        tableHtml += `
                            <tr>
                                <td>${credito.credito}</td>
                                <td>
                                    <button onclick="deleteCreditos(${credito.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editCreditos(${credito.id}, ${credito.credito}, ${level})" class="btn btn-warning">
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
                    container.html('<p>No se encontraron creditos para este nivel.</p>').show();
                }
            })
            .catch(error => console.error('Error fetching creditos:', error));
    }

    // Asociar eventos para cargar y crear creditos de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        loadCreditos(level, '#creditosNivel' + level);

        handleCreateCreditos(level, '#createCreditosNivel' + level + 'Form', '#creditosNivel' + level + 'Creditos', '#loadCreditosNivel' + level);
    }

    // Función genérica para crear creditos
    function createCreditos(level, numeroCreditos, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credito: numeroCreditos, id_nivel: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating creditos:', error));
    }

    // Función para gestionar la creación de creditos para cualquier nivel
    function handleCreateCreditos(level, formId, numeroInputId, loadCreditosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const numeroCreditos = $(numeroInputId).val();
            createCreditos(level, numeroCreditos, function () {
                $(numeroInputId).val('');  // Limpiar el campo de entrada
                $(loadCreditosBtnId).click();  // Recargar la lista de creditos
            });
        });
    }


});

// Función para eliminar creditos
function deleteCreditos(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/creditos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de creditos para el nivel específico
            $('#loadCreditosNivel' + level).click();
        })
        .catch(error => console.error('Error deleting creditos:', error));
}

// Función para editar creditos
function editCreditos(id, currentNumero, level) {
    const newNumero = prompt('Nuevo número de creditos:', currentNumero);
    if (newNumero) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/creditos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credito: newNumero }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de creditos para el nivel específico
                $('#loadCreditosNivel' + level).click();
            })
            .catch(error => console.error('Error editing creditos:', error));
    }
}
