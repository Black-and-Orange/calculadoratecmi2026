$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/costos';  // Cambia la URL de la API

    // Función genérica para cargar costos de materias de cualquier nivel
    function loadCostos(level, containerId) {
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
                    data.sort((a, b) => a.clave.localeCompare(b.clave));

                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Clave</th>
                                    <th>Costo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(costoMateria => {
                        console.log(level);
                        
                        tableHtml += `
                            <tr>
                                <td>${costoMateria.clave}</td>
                                <td>${costoMateria.costo}</td>
                                <td>
                                    <button onclick="deleteCosto(${costoMateria.id_costo}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editCosto(${costoMateria.id_costo}, '${costoMateria.clave}', '${costoMateria.costo}', ${level})" class="btn btn-warning">
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
                    console.log('No se encontraron costos de materias para mostrar.');
                }
            })
            .catch(error => console.error('Error fetching costos de materias:', error));
    }

    // Función genérica para crear costos de materias
    function createCosto(level, clave, costo, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clave: clave, costo: costo, id_nivel: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creando costo de materia:', error));
    }

    // Función para gestionar la creación de costos de materias para cualquier nivel
    function handleCreateCosto(level, formId, claveInputId, costoInputId, loadCostosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const clave = $(claveInputId).val();
            const costo = $(costoInputId).val();
            createCosto(level, clave, costo, function () {
                $(claveInputId).val('');
                $(costoInputId).val('');
                $(loadCostosBtnId).click();
            });
        });
    }

    // Asociar eventos para cargar y crear costos de materias de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        $('#loadCostosNivel' + level).click(function () {
            loadCostos(level, '#costosNivel' + level);
        });

        handleCreateCosto(level, '#createCostosNivel' + level + 'Form', '#costosNivel' + level + 'Name', '#costosNivel' + level + 'Type', '#loadCostosNivel' + level);
    }
});

// Función para eliminar costos de materias
function deleteCosto(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/costos/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de costos para el nivel específico
            $('#loadCostosNivel' + level).click();
        })
        .catch(error => console.error('Error eliminando costo de materia:', error));
}

// Función para editar costos de materias
function editCosto(id, currentClave, currentCosto, level) {
    const newClave = prompt('Nueva clave de la materia:', currentClave);
    const newCosto = prompt('Nuevo costo de la materia:', currentCosto);
    if (newClave && newCosto) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/costos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clave: newClave, costo: newCosto }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de costos para el nivel específico
                $('#loadCostosNivel' + level).click();
            })
            .catch(error => console.error('Error editando costo de materia:', error));
    }
}
