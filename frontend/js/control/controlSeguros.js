$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/seguros';
    const maxLevel = 12;  // Define el nivel máximo

    // Función para cargar seguros con logs
    function loadSeguros(level, containerId) {
        const container = $(containerId);

        // Si la tabla ya está visible, ocultarla y salir de la función
        if (container.is(':visible')) {
            container.hide();
            return;
        }

        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty().hide();

        fetch(`${apiUrl}/nivel/${level}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Seguros recibidos:', data);  // Log de los datos recibidos

                if (Array.isArray(data) && data.length > 0) {
                    data.sort((a, b) => a.seguro_accidentes.localeCompare(b.seguro_accidentes)); // Ordenamos por seguro_accidentes

                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Seguro Accidentes</th>
                                    <th>Seguro Estudiantil</th>
                                    <th>Cobertura VIVE</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(seguro => {
                        tableHtml += `
                            <tr>
                                <td>${seguro.seguro_accidentes}</td>
                                <td>${seguro.seguro_estudiantil}</td>
                                <td>${seguro.cobertura_vive}</td>
                                <td>
                                    <button onclick="deleteSeguro(${seguro.id_seguro}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editSeguro(${seguro.id_seguro}, '${seguro.seguro_accidentes}', '${seguro.seguro_estudiantil}', '${seguro.cobertura_vive}', ${level})" class="btn btn-warning">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>`;
                    });

                    tableHtml += `</tbody></table>`;
                    container.html(tableHtml).show();
                } else {
                    console.log('No se encontraron seguros para mostrar.');
                }
            })
            .catch(error => console.error('Error al cargar los seguros:', error.message));
    }

    // Función para crear seguros con logs
    function createSeguro(level, accidentes, cobertura, estudiantil, callback) {
        console.log('Enviando datos al servidor:', {
            seguro_accidentes: accidentes,
            cobertura_vive: cobertura,
            seguro_estudiantil: estudiantil,
            nivel_id: level
        });

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seguro_accidentes: accidentes,
                cobertura_vive: cobertura,
                seguro_estudiantil: estudiantil,
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
                console.log('Respuesta del servidor al crear seguro:', data);  // Verificar la respuesta
                callback();
            })
            .catch(error => console.error('Error al crear el seguro:', error.message));
    }

    // Función para gestionar la creación del seguro con logs
    function handleCreateSeguro(level, formId, accidentesId, coberturaId, estudiantilId, loadSegurosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();

            const accidentes = $(accidentesId).val();
            const cobertura = $(coberturaId).val();
            const estudiantil = $(estudiantilId).val();

            console.log('Datos del formulario:', {
                accidentes: accidentes,
                cobertura: cobertura,
                estudiantil: estudiantil
            });

            createSeguro(level, accidentes, cobertura, estudiantil, function () {
                $(accidentesId).val('');
                $(coberturaId).val('');
                $(estudiantilId).val('');
                $(loadSegurosBtnId).click();  // Recargar los seguros al crear uno nuevo
            });
        });
    }

    // Asociar eventos para cargar y crear seguros de niveles dinámicos
    for (let level = 1; level <= maxLevel; level++) {
        // Cargar seguros al hacer clic en el botón correspondiente
        $('#loadSegurosNivel' + level).click(function () {
            loadSeguros(level, '#segurosNivel' + level);
        });

        // Manejar la creación de seguros para cada nivel
        handleCreateSeguro(level, 
            '#createSegurosNivel' + level + 'Form',
            '#segurosNivel' + level + 'Accidentes',
            '#segurosNivel' + level + 'Cobertura',
            '#segurosNivel' + level + 'Estudiantil',
            '#loadSegurosNivel' + level
        );
    }
});

// Función para eliminar seguro
function deleteSeguro(id_seguro, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/seguros/${id_seguro}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Seguro eliminado:', data);
        $('#loadSegurosNivel' + level).click();  // Recargar la lista de seguros
    })
    .catch(error => console.error('Error al eliminar el seguro:', error.message));
}

// Función para editar seguro
function editSeguro(id_seguro, currentAccidentes, currentEstudiantil, currentCobertura, level) {
    const newAccidentes = prompt('Nuevo Seguro Accidentes:', currentAccidentes);
    const newEstudiantil = prompt('Nuevo Seguro Estudiantil:', currentEstudiantil);
    const newCobertura = prompt('Nueva Cobertura VIVE:', currentCobertura);

    if (newAccidentes && newEstudiantil && newCobertura) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/seguros/${id_seguro}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seguro_accidentes: newAccidentes,
                seguro_estudiantil: newEstudiantil,
                cobertura_vive: newCobertura,
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Seguro editado:', data);
            $('#loadSegurosNivel' + level).click();  // Recargar la lista de seguros
        })
        .catch(error => console.error('Error al editar el seguro:', error.message));
    }
}
