import { API_BASE_URL } from '../apiConfig.js';

const apiUrlSeguros = `${API_BASE_URL}/seguros`;

// Función para cargar seguros de un nivel
function loadSeguros(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlSeguros}/nivel/${level}/todos`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                // Ordenar por nombre
                data.sort((a, b) => a.nombre_seguro.localeCompare(b.nombre_seguro));

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre del Seguro</th>
                                <th>Valor</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(seguro => {
                    const estadoTexto = seguro.estado ? 'Habilitado' : 'Deshabilitado';
                    const estadoClass = seguro.estado ? 'badge-success' : 'badge-secondary';
                    tableHtml += `
                        <tr>
                            <td>${seguro.nombre_seguro}</td>
                            <td>$${parseFloat(seguro.valor).toFixed(2)}</td>
                            <td><span class="badge ${estadoClass}">${estadoTexto}</span></td>
                            <td>
                                <button onclick="toggleEstadoSeguro(${seguro.id_seguro}, ${level}, ${!seguro.estado})" 
                                        class="btn btn-sm ${seguro.estado ? 'btn-warning' : 'btn-success'}" 
                                        title="${seguro.estado ? 'Deshabilitar' : 'Habilitar'}">
                                    <i class="fas fa-${seguro.estado ? 'eye-slash' : 'eye'}"></i>
                                </button>
                                <button onclick="editSeguro(${seguro.id_seguro}, '${seguro.nombre_seguro.replace(/'/g, "\\'")}', ${seguro.valor}, ${level})" 
                                        class="btn btn-sm btn-warning" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteSeguro(${seguro.id_seguro}, ${level})" 
                                        class="btn btn-sm btn-danger" title="Eliminar">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p class="text-muted">No se encontraron seguros para este nivel. Agrega uno usando el formulario de abajo.</p>');
            }
        })
        .catch(error => {
            console.error('Error al cargar los seguros:', error.message);
            container.html(`<p class="text-danger">Error al cargar seguros: ${error.message}</p>`);
        });
}

// Función para crear un nuevo seguro
function createSeguro(level, nombre, valor, estado, callback) {
    fetch(apiUrlSeguros, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre_seguro: nombre,
            valor: parseFloat(valor),
            estado: estado !== undefined ? estado : true,
            id_nivel: level
        }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Error en la petición: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (callback) callback();
        })
        .catch(error => {
            console.error('Error al crear el seguro:', error.message);
            alert(`Error al crear el seguro: ${error.message}`);
        });
}

// Función para editar seguro
function editSeguro(id_seguro, currentNombre, currentValor, level) {
    const newNombre = prompt('Nuevo nombre del seguro:', currentNombre);
    if (!newNombre) return;

    const newValor = prompt('Nuevo valor del seguro:', currentValor);
    if (!newValor || isNaN(newValor)) {
        alert('El valor debe ser un número válido');
        return;
    }

    if (newNombre && newValor) {
        fetch(`${apiUrlSeguros}/${id_seguro}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre_seguro: newNombre,
                valor: parseFloat(newValor),
                id_nivel: level
            }),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || `Error en la petición: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                loadSeguros(level, '#segurosNivel' + level);
            })
            .catch(error => {
                console.error('Error al editar el seguro:', error.message);
                alert(`Error al editar el seguro: ${error.message}`);
            });
    }
}

// Función para cambiar el estado de un seguro
function toggleEstadoSeguro(id_seguro, level, nuevoEstado) {
    fetch(`${apiUrlSeguros}/${id_seguro}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            estado: nuevoEstado,
            id_nivel: level
        }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Error en la petición: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            loadSeguros(level, '#segurosNivel' + level);
        })
        .catch(error => {
            console.error('Error al cambiar el estado del seguro:', error.message);
            alert(`Error al cambiar el estado: ${error.message}`);
        });
}

// Función para eliminar seguro (solo la relación con el nivel)
function deleteSeguro(id_seguro, level) {
    if (!confirm('¿Estás seguro de que deseas eliminar este seguro de este nivel?')) {
        return;
    }

    fetch(`${apiUrlSeguros}/${id_seguro}?id_nivel=${level}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Error en la petición: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            loadSeguros(level, '#segurosNivel' + level);
        })
        .catch(error => {
            console.error('Error al eliminar el seguro:', error.message);
            alert(`Error al eliminar el seguro: ${error.message}`);
        });
}

// Inicialización cuando el documento está listo
$(document).ready(function () {
    const maxLevel = 13;
    
    // Cargar seguros para todos los niveles
    for (let level = 1; level <= maxLevel; level++) {
        loadSeguros(level, '#segurosNivel' + level);
    }

    // Delegación de eventos para formularios de creación de seguros
    $(document).on('submit', 'form[id^="createsegurosNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createsegurosNivel(\d+)Form/);
        if (!nivelMatch) return;
        
        const level = parseInt(nivelMatch[1]);
        const nombre = $(`#segurosNivel${level}Nombre`).val().trim();
        const valor = $(`#segurosNivel${level}Valor`).val().trim();
        const estado = $(`#segurosNivel${level}Estado`).is(':checked');

        if (!nombre) {
            alert('El nombre del seguro es requerido');
            return;
        }

        if (!valor || isNaN(valor)) {
            alert('El valor debe ser un número válido');
            return;
        }

        createSeguro(level, nombre, valor, estado, function () {
            $(`#segurosNivel${level}Nombre`).val('');
            $(`#segurosNivel${level}Valor`).val('');
            $(`#segurosNivel${level}Estado`).prop('checked', true);
            loadSeguros(level, '#segurosNivel' + level);
        });
    });
});

// Exponer funciones al ámbito global para los botones onclick
window.deleteSeguro = deleteSeguro;
window.editSeguro = editSeguro;
window.toggleEstadoSeguro = toggleEstadoSeguro;
