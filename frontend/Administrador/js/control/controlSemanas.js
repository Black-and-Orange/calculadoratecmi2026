$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/semanas';

    // Función genérica para cargar semanas de cualquier nivel
    function loadSemanas(level, containerId) {
        const container = $(containerId);

        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.sort((a, b) => a.num_semanas - b.num_semanas);

                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Número de Semanas</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(semana => {
                        tableHtml += `
                            <tr>
                                <td>${semana.num_semanas}</td>
                                <td>
                                    <button onclick="deleteSemanas(${semana.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editSemanas(${semana.id}, ${semana.num_semanas}, ${level})" class="btn btn-warning">
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
                    container.html('<p>No se encontraron semanas para este nivel.</p>').show();
                }
            })
            .catch(error => console.error('Error fetching semanas:', error));
    }


    // Asociar eventos para cargar y crear semanas de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        loadSemanas(level, '#semanasNivel' + level);
        handleCreateSemanas(level, '#createSemanasNivel' + level + 'Form', '#semanasNivel' + level + 'Semanas', '#loadSemanasNivel' + level);
    }
});

// Función genérica para crear semanas
function createSemanas(level, numeroSemanas, callback) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num_semanas: numeroSemanas, nivel_id: level }),
    })
        .then(response => response.json())
        .then(data => callback())
        .catch(error => console.error('Error creating semanas:', error));
}

// Función para gestionar la creación de semanas para cualquier nivel
function handleCreateSemanas(level, formId, numeroInputId, loadSemanasBtnId) {
    $(formId).submit(function (event) {
        event.preventDefault();
        const numeroSemanas = $(numeroInputId).val();
        createSemanas(level, numeroSemanas, function () {
            $(numeroInputId).val('');  // Limpiar el campo de entrada
            $(loadSemanasBtnId).click();  // Recargar la lista de semanas
        });
    });
}


// Función para eliminar semanas
function deleteSemanas(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/semanas/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de semanas para el nivel específico
            $('#loadSemanasNivel' + level).click();
        })
        .catch(error => console.error('Error deleting semanas:', error));
}

// Función para editar semanas
function editSemanas(id, currentNumero, level) {
    const newNumero = prompt('Nuevo número de semanas:', currentNumero);
    if (newNumero) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/semanas/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num_semanas: newNumero }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de semanas para el nivel específico
                $('#loadSemanasNivel' + level).click();
            })
            .catch(error => console.error('Error editing semanas:', error));
    }
}
