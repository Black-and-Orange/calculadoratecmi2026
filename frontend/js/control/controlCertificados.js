const apiUrlCertificados = 'https://tecmilenio-calculadora-backend.testingbo.com/api/certificados';

// Función genérica para cargar certificados de cualquier nivel
function loadCertificados(level, containerId) {
    const container = $(containerId);


    // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
    container.empty();

    fetch(`${apiUrlCertificados}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.num_certificados - b.num_certificados);

                let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Número de Certificados</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                data.forEach(certificado => {
                    tableHtml += `
                            <tr>
                                <td>${certificado.num_certificados}</td>
                                <td>
                                    <button onclick="deleteCertificados(${certificado.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editCertificados(${certificado.id}, ${certificado.num_certificados}, ${level})" class="btn btn-warning">
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
                container.html('<p>No se encontraron certificados para este nivel.</p>');
            }
        })
        .catch(error => console.error('Error fetching certificados:', error));
}

$(document).ready(function () {
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        loadCertificados(level, '#certificadosNivel' + level);

        handleCreateCertificados(level, '#createCertificadosNivel' + level + 'Form', '#certificadosNivel' + level + 'Certificados', '#loadCertificadosNivel' + level);
    }

    // Función genérica para crear certificados
    function createCertificados(level, numeroCertificados, callback) {
        fetch(apiUrlCertificados, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num_certificados: numeroCertificados, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating certificados:', error));
    }

    // Función para gestionar la creación de certificados para cualquier nivel
    function handleCreateCertificados(level, formId, numeroInputId, loadCertificadosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const numeroCertificados = $(numeroInputId).val();
            createCertificados(level, numeroCertificados, function () {
                $(numeroInputId).val('');
                loadCertificados(level, '#certificadosNivel' + level);
            });
        });
    }


});

// Función para eliminar certificados
function deleteCertificados(id, level) {
    console.log(`Intentando eliminar certificado con id: ${id}, nivel: ${level}`);

    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/certificados/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            console.log('Respuesta del servidor:', response);
            if (!response.ok) {
                throw new Error(`Error en la eliminación del certificado con id: ${id}. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Certificados eliminados exitosamente:', data);

            // Recargar lista de certificados para el nivel específico
            console.log(`Recargando la lista de certificados para el nivel: ${level}`);
            loadCertificados(level, '#certificadosNivel' + level);
        })
        .catch(error => {
            console.error('Error al eliminar certificados:', error);
        });
}

// Función para editar certificados
function editCertificados(id, currentNumero, level) {
    console.log(`Intentando editar certificado con id: ${id}, número actual: ${currentNumero}, nivel: ${level}`);

    const newNumero = prompt('Nuevo número de certificados:', currentNumero);
    if (newNumero) {
        console.log(`Nuevo número de certificados ingresado: ${newNumero}`);

        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/certificados/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num_certificados: newNumero }),
        })
            .then(response => {
                console.log('Respuesta del servidor:', response);
                if (!response.ok) {
                    throw new Error(`Error al editar el certificado con id: ${id}. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Certificados editados exitosamente:', data);

                // Recargar lista de certificados para el nivel específico
                console.log(`Recargando la lista de certificados para el nivel: ${level}`);
                loadCertificados(level, '#certificadosNivel' + level);
            })
            .catch(error => {
                console.error('Error al editar certificados:', error);
            });
    } else {
        console.log('Edición cancelada por el usuario. No se ingresó un nuevo número de certificados.');
    }
}

