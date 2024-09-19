const apiUrlFormatosAsociado = 'https://tecmilenio-calculadora-backend.testingbo.com/api/formatoAsociado';

// Función genérica para cargar formato asociado de cualquier nivel
function loadFormatoAsociado(level, containerId) {
    const container = $(containerId);


    // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
    container.empty();

    fetch(`${apiUrlFormatosAsociado}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.descripcion.localeCompare(b.descripcion));

                let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Costo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                data.forEach(formatoAsociado => {
                    tableHtml += `
                            <tr>
                                <td>${formatoAsociado.descripcion}</td>
                                <td>${formatoAsociado.costo}</td>
                                <td>
                                    <button onclick="deleteFormatoAsociado(${formatoAsociado.id_formato_asociado}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editFormatoAsociado(${formatoAsociado.id_formato_asociado}, '${formatoAsociado.descripcion}', ${formatoAsociado.costo}, ${level})" class="btn btn-warning">
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
                console.log('No se encontraron formatos asociados para mostrar.');
            }
        })
        .catch(error => console.error('Error fetching formato asociado:', error));
}

$(document).ready(function () {
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        loadFormatoAsociado(level, '#formatoNivel' + level);

        handleCreateFormatoAsociado(level, '#createFormatoAsociadoNivel' + level + 'Form', '#formatoNivel' + level + 'FormatoAsociado', '#formatoNivel' + level + 'Costo', '#loadFormatoAsociadoNivel' + level);
    }

    // Función genérica para crear formato asociado
    function createFormatoAsociado(level, descripcion, costo, callback) {
        fetch(apiUrlFormatosAsociado, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: descripcion, costo: costo, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating formato asociado:', error));
    }

    // Función para gestionar la creación de formato asociado para cualquier nivel
    function handleCreateFormatoAsociado(level, formId, descripcionInputId, costoInputId, loadFormatoAsociadoBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const descripcion = $(descripcionInputId).val();
            const costo = $(costoInputId).val();
            createFormatoAsociado(level, descripcion, costo, function () {
                $(descripcionInputId).val('');
                $(costoInputId).val('');
                loadFormatoAsociado(level, '#formatoNivel' + level);
            });
        });
    }

});

// Función para eliminar formato asociado
function deleteFormatoAsociado(id_formato_asociado, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/formatoAsociado/${id_formato_asociado}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadFormatoAsociado(level, '#formatoNivel' + level);
        })
        .catch(error => console.error('Error deleting formato asociado:', error));
}

// Función para editar formato asociado
function editFormatoAsociado(id_formato_asociado, currentDescripcion, currentCosto, level) {
    const newDescripcion = prompt('Nueva descripción del formato asociado:', currentDescripcion);
    const newCosto = prompt('Nuevo costo del formato asociado:', currentCosto);
    if (newDescripcion && newCosto) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/formatoAsociado/${id_formato_asociado}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: newDescripcion, costo: newCosto }),
        })
            .then(response => response.json())
            .then(data => {
                loadFormatoAsociado(level, '#formatoNivel' + level);
            })
            .catch(error => console.error('Error editing formato asociado:', error));
    }
}
