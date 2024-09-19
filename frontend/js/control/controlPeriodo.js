const apiUrlPeriodo = 'https://tecmilenio-calculadora-backend.testingbo.com/api/periodo';

// Función genérica para cargar periodos de cualquier nivel
function loadPeriodo(level, containerId) {
    const container = $(containerId);

    // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
    container.empty();

    fetch(`${apiUrlPeriodo}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.periodo_descripcion.localeCompare(b.periodo_descripcion));

                let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Periodo</th>
                                    <th>Código</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                data.forEach(periodo => {
                    tableHtml += `
                            <tr>
                                <td>${periodo.periodo_descripcion}</td>
                                <td>${periodo.periodo_codigo}</td>
                                <td>
                                    <button onclick="deletePeriodo(${periodo.id_periodo}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editPeriodo(${periodo.id_periodo}, '${periodo.periodo_descripcion}', '${periodo.periodo_codigo}', ${level})" class="btn btn-warning">
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
                console.log('No se encontraron periodos para mostrar.');
            }
        })
        .catch(error => console.error('Error fetching periodos:', error));
}

$(document).ready(function () {
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        loadPeriodo(level, '#periodoNivel' + level);
        handleCreatePeriodo(level, '#createPeriodoNivel' + level + 'Form', '#periodoNivel' + level + 'Name', '#periodoNivel' + level + 'Type', '#loadPeriodoNivel' + level);
    }

    // Función genérica para crear periodo
    function createPeriodo(level, name, codigo, callback) {

        fetch(apiUrlPeriodo, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ periodo_descripcion: name, periodo_codigo: codigo, id_nivel: level }),
        })
            .then(response => {
                // Verificar si la respuesta es exitosa
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Respuesta del servidor:', data);  // Verifica el contenido de la respuesta
                callback();
            })
            .catch(error => {
                console.error('Error al crear el periodo:', error.message);
            });
    }


    // Función para gestionar la creación de periodos para cualquier nivel
    function handleCreatePeriodo(level, formId, nameInputId, codigoInputId, loadPeriodoBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const name = $(nameInputId).val();
            const codigo = $(codigoInputId).val();
            createPeriodo(level, name, codigo, function () {
                $(nameInputId).val('');
                $(codigoInputId).val('');
                loadPeriodo(level, '#periodoNivel' + level);
            });
        });
    }
});

// Función para eliminar periodo
function deletePeriodo(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/periodo/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadPeriodo(level, '#periodoNivel' + level);
        })
        .catch(error => console.error('Error deleting periodo:', error));
}

// Función para editar periodo
function editPeriodo(id, currentName, currentCodigo, level) {
    const newName = prompt('Nuevo periodo_descripcion del periodo:', currentName);
    const newCodigo = prompt('Nuevo código del periodo:', currentCodigo);
    if (newName && newCodigo) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/periodo/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ periodo_descripcion: newName, periodo_codigo: newCodigo }),
        })
            .then(response => response.json())
            .then(data => {
                loadPeriodo(level, '#periodoNivel' + level);
            })
            .catch(error => console.error('Error editing periodo:', error));
    }
}
