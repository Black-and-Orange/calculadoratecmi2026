$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/ingles';

    // Función genérica para cargar ingles de cualquier nivel
    function loadIngles(level, containerId) {
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

                    tableHtml += `
                            </tbody>
                        </table>`;

                    container.html(tableHtml).show();
                } else {
                    container.html('<p>No se encontraron ingles para este nivel.</p>').show();
                }
            })
            .catch(error => console.error('Error fetching ingles:', error));
    }

    // Función genérica para crear ingles
    function createIngles(level, numeroIngles, callback) {
        fetch(apiUrl, {
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

    // Función para gestionar la creación de ingles para cualquier nivel
    function handleCreateIngles(level, formId, numeroInputId, loadInglesBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const numeroIngles = $(numeroInputId).val();
            createIngles(level, numeroIngles, function () {
                $(numeroInputId).val('');  // Limpiar el campo de entrada
                $(loadInglesBtnId).click();  // Recargar la lista de ingles
            });
        });
    }

    // Asociar eventos para cargar y crear ingles de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        $('#loadInglesNivel' + level).click(function () {
            loadIngles(level, '#inglesNivel' + level);
        });

        handleCreateIngles(level, '#createInglesNivel' + level + 'Form', '#inglesNivel' + level + 'Ingles', '#loadInglesNivel' + level);
    }
});

// Función para eliminar ingles
function deleteIngles(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/ingles/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de ingles para el nivel específico
            $('#loadInglesNivel' + level).click();
        })
        .catch(error => console.error('Error deleting ingles:', error));
}

// Función para editar ingles
function editIngles(id, currentNumero, level) {
    const newNumero = prompt('Nuevo número de ingles:', currentNumero);
    if (newNumero) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/ingles/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num_ingles: newNumero }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de ingles para el nivel específico
                $('#loadInglesNivel' + level).click();
            })
            .catch(error => console.error('Error editing ingles:', error));
    }
}
