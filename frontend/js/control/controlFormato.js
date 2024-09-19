
const apiUrlFormatos = 'https://tecmilenio-calculadora-backend.testingbo.com/api/formato';

// Función genérica para cargar formato de cualquier nivel
function loadFormatos(level, containerId) {
    const container = $(containerId);


    // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
    container.empty();

    fetch(`${apiUrlFormatos}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.descripcion.localeCompare(b.descripcion));

                let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Codigo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                data.forEach(formato => {
                    tableHtml += `
                            <tr>
                                <td>${formato.descripcion}</td>
                                <td>${formato.codigo}</td>
                                <td>
                                    <button onclick="deleteFormato(${formato.id_formato}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editFormato(${formato.id_formato}, '${formato.descripcion}', '${formato.codigo}', ${level})" class="btn btn-warning">
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
                console.log('No se encontraron formatos para mostrar.');
            }
        })
        .catch(error => console.error('Error fetching formatos:', error));
}

$(document).ready(function () {
    const maxLevel = 12;
    for (let level = 1; level <= maxLevel; level++) {

        loadFormatos(level, '#formatoNivel' + level);
        handleCreateFormato(level, '#createFormatoNivel' + level + 'Form', '#formatoNivel' + level + 'Formato', '#formatoNivel' + level + 'Codigo', '#loadFormatoNivel' + level);
    }

    // Función genérica para crear un formato
    function createFormato(level, descripcion, codigo, callback) {
        console.log("Creando formato con:", { descripcion, codigo, level });  // <-- Agrega esto para depuración

        fetch(apiUrlFormatos, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: descripcion, codigo: codigo, id_nivel: level }),
        })
            .then(response => {
                console.log("Respuesta del servidor (raw):", response); // <-- Para ver la respuesta en formato bruto
                return response.json(); // Convertimos a JSON
            })
            .then(data => {
                console.log("Respuesta del servidor (json):", data);  // <-- Para ver la respuesta después de parsearla
                callback();  // <-- Callback para recargar los formatos
            })
            .catch(error => console.error('Error creando formato:', error));
    }


    // Función para gestionar la creación de formatos para cualquier nivel
    function handleCreateFormato(level, formId, descripcionInputId, codigoInputId, loadFormatosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            // Obtenemos los valores de los inputs
            const descripcion = $(descripcionInputId).val();
            const codigo = $(codigoInputId).val(); // Eliminar parseFloat aquí para no forzar el formato

            createFormato(level, descripcion, codigo, function () {
                // Limpiamos los inputs tras la creación
                $(descripcionInputId).val('');
                $(codigoInputId).val('');
                loadFormatos(level, '#formatoNivel' + level);
            });
        });
    }
});

// Función para eliminar formato
function deleteFormato(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/formato/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadFormatos(level, '#formatoNivel' + level);
        })
        .catch(error => console.error('Error eliminando formato:', error));
}

// Función para editar formato
function editFormato(id, currentDescripcion, currentCodigo, level) {
    const newDescripcion = prompt('Nueva descripción del formato:', currentDescripcion);
    const newCodigo = prompt('Nuevo codigo del formato:', currentCodigo);

    if (newDescripcion && newCodigo) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/formato/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: newDescripcion, codigo: newCodigo }),
        })
            .then(response => response.json())
            .then(data => {
                loadFormatos(level, '#formatoNivel' + level);
            })
            .catch(error => console.error('Error editando formato:', error));
    }
}
