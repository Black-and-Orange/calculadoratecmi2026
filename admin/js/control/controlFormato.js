import { API_BASE_URL } from '../apiConfig.js';

const apiUrlFormatos = `${API_BASE_URL}/formato`;

// Función genérica para cargar formato de cualquier nivel
function loadFormatos(level, containerId) {
    const container = $(containerId);
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
                                <th>Código</th>
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

                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron formatos para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error fetching formatos:', error));
}

$(document).ready(function () {
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadFormatos(level, '#formatoNivel' + level);
    }

    // Delegación de eventos para formularios de creación de formatos
    $(document).on('submit', 'form[id^="createformatoNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createformatoNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const descripcion = $(`#formatoNivel${level}Formato`).val();
        const codigo = $(`#formatoNivel${level}Codigo`).val();
        createFormato(level, descripcion, codigo, function () {
            $(`#formatoNivel${level}Formato`).val('');
            $(`#formatoNivel${level}Codigo`).val('');
            loadFormatos(level, '#formatoNivel' + level);
        });
    });

    // Función genérica para crear un formato
    function createFormato(level, descripcion, codigo, callback) {
        fetch(apiUrlFormatos, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: descripcion, codigo: codigo, id_nivel: level }),
        })
            .then(response => response.json())
            .then(data => callback())
            .catch(error => console.error('Error creating formato:', error));
    }
});

// Función para eliminar formato
function deleteFormato(id, level) {
    fetch(`${API_BASE_URL}/formato/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                loadFormatos(level, '#formatoNivel' + level);
            } else {
                return response.json().then(err => { throw new Error(err.message); });
            }
        })
        .catch(error => console.error('Error deleting formato:', error));
}

// Función para editar formato
function editFormato(id, currentDescripcion, currentCodigo, level) {
    const newDescripcion = prompt('Nueva descripción del formato:', currentDescripcion);
    const newCodigo = prompt('Nuevo código del formato:', currentCodigo);

    if (newDescripcion && newCodigo) {
        fetch(`${API_BASE_URL}/formato/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: newDescripcion, codigo: newCodigo }),
        })
            .then(response => {
                if (response.ok) {
                    loadFormatos(level, '#formatoNivel' + level);
                } else {
                    return response.json().then(err => { throw new Error(err.message); });
                }
            })
            .catch(error => console.error('Error editing formato:', error));
    }
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteFormato = deleteFormato;
window.editFormato = editFormato;
