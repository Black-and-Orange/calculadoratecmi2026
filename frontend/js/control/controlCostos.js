$(document).ready(function () {
    // Cargar objetos para un nivel o categoría específica
    function loadObjects(level, containerId) {
        fetch(`http://localhost:3008/api/objects/nivel/1`)
            .then(response => response.json())
            .then(data => {
                $(containerId).empty();
                if (Array.isArray(data)) {
                    data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    data.forEach(item => {
                        $(containerId).append(`
                            <div class="action-buttons">
                                <p style="margin-top: 15px; margin-right: 25px;">${item.nombre}</p>
                                <button onclick="deleteObject(${item.id})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editObject(${item.id}, '${item.nombre}', '${item.categoria}')" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        `);
                    });
                } else {
                    console.error('Expected an array but got:', data);
                }
            })
            .catch(error => console.error('Error fetching objects:', error));
    }

    // Crear nuevo objeto
    function createObject(formId, level, containerId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const name = $(`${formId}Name`).val();
            const category = $(`${formId}Category`).val();
            fetch('http://localhost:3008/api/objects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre: name, categoria: category, nivel_id: level }),
            })
                .then(response => response.json())
                .then(data => {
                    $(`${formId}Name`).val('');
                    $(`${formId}Category`).val('');
                    loadObjects(level, containerId);
                });
        });
    }

    // Eliminar objeto
    window.deleteObject = function(id) {
        fetch(`http://localhost:3008/api/objects/${id}`, { // Cambia la URL según tu API
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                // Actualizar vistas para todos los niveles o categorías
                loadObjects(1, '#containerNivel1');
                loadObjects(2, '#containerNivel2');
            });
    }

    // Editar objeto
    window.editObject = function(id, currentName, currentCategory) {
        const newName = prompt('Nuevo nombre del objeto:', currentName);
        const newCategory = prompt('Nueva categoría del objeto:', currentCategory);
        if (newName && newCategory) {
            fetch(`http://localhost:3008/api/objects/${id}`, { // Cambia la URL según tu API
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre: newName, categoria: newCategory }),
            })
                .then(response => response.json())
                .then(data => {
                    // Actualizar vistas para todos los niveles o categorías
                    loadObjects(1, '#containerNivel1');
                    loadObjects(2, '#containerNivel2');
                });
        }
    }

    // Inicializa carga y creación para nivel 1
    loadObjects(1, '#containerNivel1');
    createObject('#createObjectNivel1Form', 1, '#containerNivel1');

    // Inicializa carga y creación para nivel 2
    loadObjects(2, '#containerNivel2');
    createObject('#createObjectNivel2Form', 2, '#containerNivel2');
});
