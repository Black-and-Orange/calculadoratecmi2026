const apiUrlBeneficios = 'https://tecmilenio-calculadora-backend.testingbo.com/api/beneficios';

// Función genérica para cargar beneficios de cualquier nivel
function loadBeneficios(level, containerId) {
    const container = $(containerId);

    // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
    container.empty();

    fetch(`${apiUrlBeneficios}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.nombre.localeCompare(b.nombre));

                let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Ícono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                data.forEach(beneficio => {
                    tableHtml += `
                            <tr>
                                <td>${beneficio.nombre}</td>
                                <td>${beneficio.descripcion}</td>
                                <td><img src="${beneficio.icono}" alt="Ícono" width="50" /></td>
                                <td>
                                    <button onclick="deleteBeneficio(${beneficio.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editBeneficio(${beneficio.id}, '${beneficio.nombre}', '${beneficio.descripcion}', '${beneficio.icono}', ${level})" class="btn btn-warning">
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
                console.log('No se encontraron beneficios para mostrar.');
            }
        })
        .catch(error => console.error('Error fetching beneficios:', error));
}

$(document).ready(function () {
    const maxLevel = 12;
    for (let level = 1; level <= maxLevel; level++) {

        loadBeneficios(level, '#beneficiosNivel' + level);
        handleCreateBeneficio(level, '#createBeneficiosNivel' + level + 'Form', '#beneficiosNivel' + level + 'Nombre', '#beneficiosNivel' + level + 'Descripcion', '#beneficiosNivel' + level + 'Icono', '#loadBeneficiosNivel' + level);
    }

    // Función genérica para crear beneficios
    function createBeneficio(level, name, description, icon, callback) {
        // Datos que se enviarán en la solicitud
        const requestData = { nombre: name, descripcion: description, icono: icon, nivel_id: level };
        console.log('Datos enviados en el body:', requestData);

        fetch(apiUrlBeneficios, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then(response => {
                // Verificar el estado de la respuesta
                console.log('Estado de la respuesta:', response.status);
                if (!response.ok) {
                    // Si la respuesta no es OK, se lanza un error
                    return response.text().then(text => {
                        throw new Error(`Respuesta del servidor: ${response.status} ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Verificar los datos recibidos
                console.log('Datos recibidos en la respuesta:', data);
                callback();
            })
            .catch(error => {
                // Capturar errores
                console.error('Error creando beneficio:', error);
            });
    }


    // Función para gestionar la creación de beneficios para cualquier nivel
    function handleCreateBeneficio(level, formId, nameInputId, descriptionInputId, iconInputId, loadBeneficiosBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const name = $(nameInputId).val();
            const description = $(descriptionInputId).val();
            const icon = $(iconInputId).val();
            createBeneficio(level, name, description, icon, function () {
                $(nameInputId).val('');
                $(descriptionInputId).val('');
                $(iconInputId).val('');
                loadBeneficios(level, '#beneficiosNivel' + level);
            });
        });
    }

});

// Función para eliminar beneficio
function deleteBeneficio(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/beneficios/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de beneficios para el nivel específico
            loadBeneficios(level, '#beneficiosNivel' + level);
        })
        .catch(error => console.error('Error deleting beneficio:', error));
}

// Función para editar beneficio
function editBeneficio(id, currentName, currentDescription, currentIcon, level) {
    const newName = prompt('Nuevo nombre del beneficio:', currentName);
    const newDescription = prompt('Nueva descripción del beneficio:', currentDescription);
    const newIcon = prompt('Nuevo link del icono:', currentIcon);
    if (newName && newDescription && newIcon) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/beneficios/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: newName, descripcion: newDescription, icono: newIcon }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de beneficios para el nivel específico
                loadBeneficios(level, '#beneficiosNivel' + level);
            })
            .catch(error => console.error('Error editing beneficio:', error));
    }
}
