$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/creditos';

    // Función genérica para cargar creditos de cualquier nivel
    function loadCampus(level, containerId) {
        const container = $(containerId);

        // Si la tabla ya está visible, ocultarla y salir de la función
        if (container.is(':visible')) {
            container.hide();
            return;
        }

        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty().hide();

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
                                    <button onclick="deleteCampus(${credito.id_credito}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editCampus(${credito.id_credito}, ${credito.credito}, ${level})" class="btn btn-warning">
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

    // Función genérica para crear creditos
    function createCampus(level, numeroCreditos, callback) {
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
    function handleCreateCampus(level, formId, numeroInputId, loadCampusBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const numeroCreditos = $(numeroInputId).val();
            createCampus(level, numeroCreditos, function () {
                $(numeroInputId).val('');  // Limpiar el campo de entrada
                $(loadCampusBtnId).click();  // Recargar la lista de creditos
            });
        });
    }

    // Asociar eventos para cargar y crear creditos de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        $('#loadCreditosNivel' + level).click(function () {
            loadCampus(level, '#creditosNivel' + level);
        });

        handleCreateCampus(level, '#createCreditosNivel' + level + 'Form', '#creditosNivel' + level + 'Creditos', '#loadCreditosNivel' + level);
    }
});

// Función para eliminar creditos
function deleteCampus(id, level) {
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
function editCampus(id, currentNumero, level) {
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
