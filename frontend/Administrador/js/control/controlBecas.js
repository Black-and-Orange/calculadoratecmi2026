$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/becasVariables';
    const maxLevel = 12; // Define el nivel máximo

    // Función para cargar becas variables
    function loadBecaVariable(level, containerId) {
        const container = $(containerId);

        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Becas Variables recibidas:', data); // Log de los datos recibidos

                if (Array.isArray(data) && data.length > 0) {
                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Porcentaje Mínimo</th>
                                    <th>Porcentaje Máximo</th>
                                    <th>Promedio Mínimo</th>
                                    <th>Promedio Máximo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(beca => {
                        tableHtml += `
                            <tr>
                                <td>${beca.tipo}</td>
                                <td>${beca.porcentaje_min}</td>
                                <td>${beca.porcentaje_max}</td>
                                <td>${beca.promedio_min}</td>
                                <td>${beca.promedio_max}</td>
                                <td>
                                    <button onclick="deleteBecaVariable(${beca.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editBecaVariable(${beca.id}, '${beca.tipo}', ${beca.porcentaje_min}, ${beca.porcentaje_max}, ${beca.promedio_min}, ${beca.promedio_max}, ${level})" class="btn btn-warning">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>`;
                    });

                    tableHtml += `</tbody></table>`;
                    container.html(tableHtml).show();
                } else {
                    console.log('No se encontraron becas variables para mostrar.');
                }
            })
            .catch(error => console.error('Error al cargar las becas variables:', error.message));
    }

    // Función para crear becas variables
    function createBecaVariable(level, tipo, porcentajeMin, porcentajeMax, promedioMin, promedioMax, callback) {
        console.log('Enviando datos al servidor:', {
            tipo: tipo,
            porcentaje_min: porcentajeMin,
            porcentaje_max: porcentajeMax,
            promedio_min: promedioMin,
            promedio_max: promedioMax,
            nivel_id: level
        });

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tipo: tipo,
                porcentaje_min: porcentajeMin,
                porcentaje_max: porcentajeMax,
                promedio_min: promedioMin,
                promedio_max: promedioMax,
                nivel_id: level
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Respuesta del servidor al crear beca variable:', data);  // Verificar la respuesta
                callback();
            })
            .catch(error => console.error('Error al crear la beca variable:', error.message));
    }

    // Asociar eventos para cargar y crear becas variables de niveles dinámicos
    for (let level = 1; level <= maxLevel; level++) {
        loadBecaVariable(level, '#becasNivel' + level);
        // Manejar la creación de becas variables para cada nivel
        handleCreateBecaVariable(level,
            '#createBecasNivel' + level + 'Form',
            '#becasNivel' + level + 'Tipo',
            '#becasNivel' + level + 'PorcMinimo',
            '#becasNivel' + level + 'PorcMaximo',
            '#becasNivel' + level + 'PromMinimo',
            '#becasNivel' + level + 'PromMaximo',
            '#loadBecasNivel' + level
        );
    }

    // Función para gestionar la creación de beca variable
    function handleCreateBecaVariable(level, formId, tipoId, porcentajeMinId, porcentajeMaxId, promedioMinId, promedioMaxId, loadBecaVariableBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();

            const tipo = $(tipoId).val();
            const porcentajeMin = $(porcentajeMinId).val();
            const porcentajeMax = $(porcentajeMaxId).val();
            const promedioMin = $(promedioMinId).val();
            const promedioMax = $(promedioMaxId).val();

            console.log('Datos del formulario:', {
                tipo: tipo,
                porcentaje_min: porcentajeMin,
                porcentaje_max: porcentajeMax,
                promedio_min: promedioMin,
                promedio_max: promedioMax
            });

            createBecaVariable(level, tipo, porcentajeMin, porcentajeMax, promedioMin, promedioMax, function () {
                $(tipoId).val('');
                $(porcentajeMinId).val('');
                $(porcentajeMaxId).val('');
                $(promedioMinId).val('');
                $(promedioMaxId).val('');
                $(loadBecaVariableBtnId).click();  // Recargar las becas al crear una nueva
            });
        });
    }


});

// Función para eliminar beca variable
function deleteBecaVariable(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/becasVariables/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Beca variable eliminada:', data);
            $('#loadBecasNivel' + level).click();  // Recargar la lista de becas
        })
        .catch(error => console.error('Error al eliminar la beca variable:', error.message));
}

// Función para editar beca variable
function editBecaVariable(id, currentTipo, currentPorcentajeMin, currentPorcentajeMax, currentPromedioMin, currentPromedioMax, level) {
    console.log("editBecaVariable llamada con:", { id, currentTipo, currentPorcentajeMin, currentPorcentajeMax, currentPromedioMin, currentPromedioMax, level });

    const newTipo = prompt('Nuevo Tipo:', currentTipo);
    const newPorcentajeMin = prompt('Nuevo Porcentaje Mínimo:', currentPorcentajeMin);
    const newPorcentajeMax = prompt('Nuevo Porcentaje Máximo:', currentPorcentajeMax);
    const newPromedioMin = prompt('Nuevo Promedio Mínimo:', currentPromedioMin);
    const newPromedioMax = prompt('Nuevo Promedio Máximo:', currentPromedioMax);

    // Verificar si todos los valores son válidos
    if (newTipo && newPorcentajeMin && newPorcentajeMax && newPromedioMin && newPromedioMax) {
        console.log('Todos los valores han sido ingresados correctamente, procediendo con la actualización...');

        // Construir el objeto JSON con los valores
        const bodyData = {
            tipo: newTipo,
            porcentaje_min: String(newPorcentajeMin),  // Convertir a string si es necesario
            porcentaje_max: String(newPorcentajeMax),  // Convertir a string si es necesario
            promedio_min: String(newPromedioMin),      // Convertir a string si es necesario
            promedio_max: String(newPromedioMax)       // Convertir a string si es necesario
        };

        console.log('Datos a enviar en el body:', bodyData);

        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/becasVariables/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tipo: newTipo,
                porcentaje_min: String(newPorcentajeMin),
                porcentaje_max: String(newPorcentajeMax),
                promedio_min: String(newPromedioMin),
                promedio_max: String(newPromedioMax)
            }),
        })
            .then(response => {
                console.log('Respuesta del servidor recibida:', response);
                if (!response.ok) {
                    console.error(`Error en la petición: ${response.status} ${response.statusText}`);
                    return response.text(); // Para capturar el mensaje de error del servidor
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    console.log('Beca variable actualizada:', data);
                    $('#loadBecasNivel' + level).click();  // Recargar la lista de becas
                }
            })
            .catch(error => console.error('Error al editar la beca variable:', error));

    } else {
        console.error('Error: Uno o más valores no fueron proporcionados correctamente.');
    }
}
