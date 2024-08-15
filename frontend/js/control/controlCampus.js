$(document).ready(function () {
    // Cargar campus en una tabla para un nivel específico
    function loadCampus(level, containerId) {
        fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/campus/nivel/${level}`)
            .then(response => response.json())
            .then(data => {
                $(containerId).empty();
                if (Array.isArray(data)) {
                    // Ordena los datos alfabéticamente por nombre
                    data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    
                    // tabla
                    let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    
                    data.forEach(campus => {
                        tableHtml += `
                            <tr>
                                <td>${campus.nombre}</td>
                                <td>${campus.categoria_coleg}</td>
                                <td>
                                    <button onclick="deleteCampus(${campus.id})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editCampus(${campus.id}, '${campus.nombre}', '${campus.categoria_coleg}')" class="btn btn-warning">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    
                    tableHtml += `
                            </tbody>
                        </table>
                    `;
                    
                    // Insertar tabla en el contenedor
                    $(containerId).html(tableHtml);
                } else {
                    console.error('Expected an array but got:', data);
                }
            })
            .catch(error => console.error('Error fetching campus:', error));
    }

    // Cargar campus para Preparatoria
    $('#loadCampusPreparatoria').click(function () {
        loadCampus(1, '#campusPreparatoria');
    });

    // Cargar campus para Profesional
    $('#loadCampusProfesional').click(function () {
        loadCampus(2, '#campusProfesional');
    });

    // Crear campus para Preparatoria
    $('#createCampusPreparatoriaForm').submit(function (event) {
        event.preventDefault();
        const name = $('#campusPreparatoriaName').val();
        const category = $('#campusPreparatoriaCategory').val();
        fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/campus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: name, categoria_coleg: category, nivel_id: 1 }),
        })
            .then(response => response.json())
            .then(data => {
                $('#campusPreparatoriaName').val('');
                $('#campusPreparatoriaCategory').val('');
                $('#loadCampusPreparatoria').click();
            });
    });

    // Crear campus para Profesional
    $('#createCampusProfesionalForm').submit(function (event) {
        event.preventDefault();
        const name = $('#campusProfesionalName').val();
        const category = $('#campusProfesionalCategory').val();
        fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/campus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: name, categoria_coleg: category, nivel_id: 2 }),
        })
            .then(response => response.json())
            .then(data => {
                $('#campusProfesionalName').val('');
                $('#campusProfesionalCategory').val('');
                $('#loadCampusProfesional').click();
            });
    });
});

// Eliminar campus
function deleteCampus(id) {
    fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/campus/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $('#loadCampusPreparatoria').click();
            $('#loadCampusProfesional').click();
        });
}

// Editar campus
function editCampus(id, currentName, currentCategory) {
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
                $('#loadCampusPreparatoria').click();
                $('#loadCampusProfesional').click();
            });
    }
}
