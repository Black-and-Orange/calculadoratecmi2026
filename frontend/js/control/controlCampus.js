$(document).ready(function () {
    const apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/campus';

    // Función genérica para cargar campus de cualquier nivel
    function loadCampus(level, containerId) {
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
                    data.sort((a, b) => a.nombre.localeCompare(b.nombre));

                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    data.forEach(campus => {
                        console.log(level);
                        
                        tableHtml += `
                            <tr>
                                <td>${campus.nombre}</td>
                                <td>${campus.categoria_coleg}</td>
                                <td>
                                    <button onclick="deleteCampus(${campus.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editCampus(${campus.id}, '${campus.nombre}', '${campus.categoria_coleg}', ${level})" class="btn btn-warning">
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
                    console.log('No se encontraron campus para mostrar.');
                }
            })
            .catch(error => console.error('Error fetching campus:', error));
    }

    // Función genérica para crear campus
    function createCampus(level, name, category, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: name, categoria_coleg: category, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating campus:', error));
    }

    // Función para gestionar la creación de campus para cualquier nivel
    function handleCreateCampus(level, formId, nameInputId, categoryInputId, loadCampusBtnId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const name = $(nameInputId).val();
            const category = $(categoryInputId).val();
            createCampus(level, name, category, function () {
                $(nameInputId).val('');
                $(categoryInputId).val('');
                $(loadCampusBtnId).click();
            });
        });
    }

    // Asociar eventos para cargar y crear campus de niveles dinámicos
    const maxLevel = 12;  // Definir el nivel máximo dinámicamente si cambia en el futuro
    for (let level = 1; level <= maxLevel; level++) {
        $('#loadCampusNivel' + level).click(function () {
            loadCampus(level, '#campusNivel' + level);
        });

        handleCreateCampus(level, '#createCampusNivel' + level + 'Form', '#campusNivel' + level + 'Name', '#campusNivel' + level + 'Category', '#loadCampusNivel' + level);
    }
});

// Función para eliminar campus
function deleteCampus(id, level) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/campus/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            // Recargar lista de campus para el nivel específico
            $('#loadCampusNivel' + level).click();
        })
        .catch(error => console.error('Error deleting campus:', error));
}

// Función para editar campus
function editCampus(id, currentName, currentCategory, level) {
    const newName = prompt('Nuevo nombre del campus:', currentName);
    const newCategory = prompt('Nueva categoría del campus:', currentCategory);
    if (newName && newCategory) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/campus/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: newName, categoria_coleg: newCategory }),
        })
            .then(response => response.json())
            .then(data => {
                // Recargar lista de campus para el nivel específico
                $('#loadCampusNivel' + level).click();
            })
            .catch(error => console.error('Error editing campus:', error));
    }
}
