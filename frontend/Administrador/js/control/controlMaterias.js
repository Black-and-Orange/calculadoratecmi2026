$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/materias';

    // Función genérica para cargar materias de cualquier nivel
    function loadMaterias(level, containerId) {
        const container = $(containerId);

        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.sort((a, b) => a.numero - b.numero);

                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Número de Materias</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(materia => {
                        tableHtml += `
                            <tr>
                                <td>${materia.numero}</td>
                                <td>
                                    <button onclick="deleteMaterias(${materia.id_materia}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editMaterias(${materia.id_materia}, ${materia.numero}, ${level})" class="btn btn-warning">
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
                    container.html('<p>No se encontraron materias para este nivel.</p>').show();
                }
            })
            .catch(error => console.error('Error fetching materias:', error));
    }

    // Asociar eventos para cargar y crear materias de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        $('#loadMateriasNivel' + level).click(function () {
            loadMaterias(level, '#materiasNivel' + level);
        });

        handleCreateMaterias(level, '#createMateriasNivel' + level + 'Form', '#materiasNivel' + level + 'Materias', '#loadMateriasNivel' + level);
    }

    // Función genérica para crear materias
    function createMaterias(level, numeroMaterias, callback) {
        // Verificar los datos que estás enviando
        const bodyData = { numero: numeroMaterias, id_nivel: level };
        console.log('Datos enviados en el body:', bodyData);

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
        })
            .then(response => {
                // Verificar el estado de la respuesta del servidor
                console.log('Estado de la respuesta:', response.status);
                return response.json();
            })
            .then(data => {
                // Verificar los datos que recibes en la respuesta
                console.log('Datos recibidos en la respuesta:', data);
                callback();
            })
            .catch(error => {
                // Capturar errores y mostrarlos
                console.error('Error creating materias:', error);
            });
    }


    // Función para gestionar la creación de materias para cualquier nivel
    function handleCreateMaterias(level, formId, numeroInputId, loadMateriasBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const numeroMaterias = $(numeroInputId).val();
            console.log('Número de materias a crear:', numeroMaterias);

            createMaterias(level, numeroMaterias, function () {
                $(numeroInputId).val('');  // Limpiar el campo de entrada
                $(loadMateriasBtnId).click();  // Recargar la lista de materias
            });
        });
    }


});

// Función para eliminar materias
function deleteMaterias(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/materias/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de materias para el nivel específico
            $('#loadMateriasNivel' + level).click();
        })
        .catch(error => console.error('Error deleting materias:', error));
}

// Función para editar materias
function editMaterias(id, currentNumero, level) {
    const newNumero = prompt('Nuevo número de materias:', currentNumero);
    if (newNumero) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/materias/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numero: newNumero }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de materias para el nivel específico
                $('#loadMateriasNivel' + level).click();
            })
            .catch(error => console.error('Error editing materias:', error));
    }
}
