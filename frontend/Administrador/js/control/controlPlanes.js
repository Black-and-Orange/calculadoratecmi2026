$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/planes';

    // Función genérica para cargar planes de cualquier nivel
    function loadPlanes(level, containerId) {
        const container = $(containerId);
        // Ocultar la tabla y limpiar el contenedor antes de cargar nuevos datos
        container.empty();

        fetch(`${apiUrl}/nivel/${level}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.sort((a, b) => a.descripcion.localeCompare(b.descripcion));

                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(planes => {
                        console.log(planes.id_plan);

                        tableHtml += `
                            <tr>
                                <td>${planes.descripcion}</td>
                                <td>${planes.tipo_plan}</td>
                                <td>
                                    <button onclick="deletePlanes(${planes.id_plan}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editPlanes(${planes.id_plan}, '${planes.descripcion}', '${planes.tipo_plan}', ${level})" class="btn btn-warning">
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
                    console.log('No se encontraron planes para mostrar.');
                }
            })
            .catch(error => console.error('Error fetching planes:', error));
    }

    // Asociar eventos para cargar y crear planes de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        loadPlanes(level, '#planesNivel' + level);
        handleCreatePlanes(level, '#createPlanesNivel' + level + 'Form', '#planesNivel' + level + 'Name', '#planesNivel' + level + 'Type', '#loadPlanesNivel' + level);
    }

    // Función genérica para crear planes
    function createPlanes(level, name, category, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: name, tipo_plan: category, id_nivel: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating planes:', error));
    }

    // Función para gestionar la creación de planes para cualquier nivel
    function handleCreatePlanes(level, formId, nameInputId, categoryInputId, loadPlanesBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const name = $(nameInputId).val();
            const category = $(categoryInputId).val();
            console.log('Creating planes:', name, category, level);

            createPlanes(level, name, category, function () {
                $(nameInputId).val('');
                $(categoryInputId).val('');
                $(loadPlanesBtnId).click();
            });
        });
    }
});

// Función para eliminar planes
function deletePlanes(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/planes/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de planes para el nivel específico
            $('#loadPlanesNivel' + level).click();
        })
        .catch(error => console.error('Error deleting planes:', error));
}

// Función para editar planes
function editPlanes(id, currentName, currentCategory, level) {
    const newName = prompt('Nuevo nombre del planes:', currentName);
    const newCategory = prompt('Nueva categoría del planes:', currentCategory);
    if (newName && newCategory) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/planes/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: newName, tipo_plan: newCategory }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de planes para el nivel específico
                $('#loadPlanesNivel' + level).click();
            })
            .catch(error => console.error('Error editing planes:', error));
    }
}
