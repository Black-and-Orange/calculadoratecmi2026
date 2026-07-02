import { API_BASE_URL } from '../apiConfig.js';

const apiUrlFormatosAsociado = `${API_BASE_URL}/formatoAsociado`;

// Función genérica para cargar formato asociado de cualquier nivel
function loadFormatoAsociado(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlFormatosAsociado}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.descripcion.localeCompare(b.descripcion));

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Costo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(formatoAsociado => {
                    tableHtml += `
                        <tr>
                            <td>${formatoAsociado.descripcion}</td>
                            <td>${formatoAsociado.costo}</td>
                            <td>
                                <button onclick="deleteFormatoAsociado(${formatoAsociado.id_formato_asociado}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editFormatoAsociado(${formatoAsociado.id_formato_asociado}, '${formatoAsociado.descripcion}', ${formatoAsociado.costo}, ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron formatos asociados para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error fetching formato asociado:', error));
}

$(document).ready(function () {
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadFormatoAsociado(level, '#formatoasociadoNivel' + level);
    }

    // Delegación de eventos para formularios de creación de formato asociado
    $(document).on('submit', 'form[id^="createformatoasociadoNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createformatoasociadoNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const descripcion = $(`#formatoasociadoNivel${level}Formato`).val();
        const costo = $(`#formatoasociadoNivel${level}Costo`).val();
        createFormatoAsociado(level, descripcion, costo, function () {
            $(`#formatoasociadoNivel${level}Formato`).val('');
            $(`#formatoasociadoNivel${level}Costo`).val('');
            loadFormatoAsociado(level, '#formatoasociadoNivel' + level);
        });
    });

    // Recargar la tabla al hacer clic en la pestaña de formato asociado
    $(document).on('click', 'a[id^="formatoasociado-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/formatoasociado-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadFormatoAsociado(nivelId, '#formatoasociadoNivel' + nivelId);
        }
    });

    // Función genérica para crear formato asociado
    function createFormatoAsociado(level, descripcion, costo, callback) {
        fetch(apiUrlFormatosAsociado, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descripcion: descripcion, costo: costo, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => {
                window.tecToast('Formato asociado creado');
                callback();
            })
            .catch(error => {
                console.error('Error creating formato asociado:', error);
                window.tecToast('No se pudo crear el formato asociado', 'error');
            });
    }
});

// Función para eliminar formato asociado
async function deleteFormatoAsociado(id_formato_asociado, level) {
    const confirmado = await window.tecConfirm('Se eliminará el formato asociado de forma permanente.');
    if (!confirmado) return;
    fetch(`${apiUrlFormatosAsociado}/${id_formato_asociado}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadFormatoAsociado(level, '#formatoasociadoNivel' + level);
            window.tecToast('Formato asociado eliminado');
        })
        .catch(error => {
            console.error('Error deleting formato asociado:', error);
            window.tecToast('No se pudo eliminar el formato asociado', 'error');
        });
}

// Función para editar formato asociado
async function editFormatoAsociado(id_formato_asociado, currentDescripcion, currentCosto, level) {
    const valores = await window.tecFormModal('Editar formato asociado', [
        { name: 'descripcion', label: 'Nueva descripción del formato asociado', value: currentDescripcion },
        { name: 'costo', label: 'Nuevo costo del formato asociado', value: currentCosto, type: 'number' },
    ]);
    if (!valores || !valores.descripcion || !valores.costo) return;
    fetch(`${apiUrlFormatosAsociado}/${id_formato_asociado}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ descripcion: valores.descripcion, costo: valores.costo }),
    })
        .then(response => response.json())
        .then(data => {
            loadFormatoAsociado(level, '#formatoasociadoNivel' + level);
            window.tecToast('Formato asociado actualizado');
        })
        .catch(error => {
            console.error('Error editing formato asociado:', error);
            window.tecToast('No se pudo actualizar el formato asociado', 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteFormatoAsociado = deleteFormatoAsociado;
window.editFormatoAsociado = editFormatoAsociado;
