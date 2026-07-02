import { API_BASE_URL } from '../apiConfig.js';

// Función para cargar períodos por nivel (scope global)
function loadPeriodo(nivelId, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${API_BASE_URL}/periodo/nivel/${nivelId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.periodo_descripcion.localeCompare(b.periodo_descripcion));
                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Periodo</th>
                                <th>Código</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;
                data.forEach(periodo => {
                    tableHtml += `
                        <tr>
                            <td>${periodo.periodo_descripcion}</td>
                            <td>${periodo.periodo_codigo}</td>
                            <td>
                                <button onclick="deletePeriodo(${periodo.id_periodo}, ${nivelId})" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                <button onclick="editPeriodo(${periodo.id_periodo}, ${nivelId})" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>`;
                });
                tableHtml += `</tbody></table>`;
                container.html(tableHtml).show();
            } else {
                container.html('<p>No se encontraron períodos para mostrar.</p>').show();
            }
        })
        .catch(error => console.error('Error fetching períodos:', error));
}
window.loadPeriodo = loadPeriodo;

// Función para eliminar un período (scope global)
async function deletePeriodo(id, nivelId) {
    const confirmado = await window.tecConfirm('Se eliminará el período de forma permanente.');
    if (!confirmado) return;
    fetch(`${API_BASE_URL}/periodo/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $(`#periodoNivel${nivelId}`).empty();
            loadPeriodo(nivelId, `#periodoNivel${nivelId}`);
            window.tecToast('Período eliminado');
        })
        .catch(error => {
            console.error('Error deleting período:', error);
            window.tecToast('No se pudo eliminar el período', 'error');
        });
}
window.deletePeriodo = deletePeriodo;

// Función para editar un período (scope global)
function editPeriodo(id, nivelId) {
    fetch(`${API_BASE_URL}/periodo/${id}`)
        .then(async periodoResponse => {
            const periodo = await periodoResponse.json();
            const valores = await window.tecFormModal('Editar período', [
                { name: 'nombre', label: 'Nuevo nombre del período', value: periodo.periodo_descripcion },
                { name: 'codigo', label: 'Nuevo código del período', value: periodo.periodo_codigo },
            ]);
            if (!valores || !valores.nombre || !valores.codigo) return;
            fetch(`${API_BASE_URL}/periodo/${id}`, {
                // El backend expone PATCH /periodo/:id (no existe ruta PUT)
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    periodo_descripcion: valores.nombre,
                    periodo_codigo: valores.codigo,
                    id_nivel: nivelId
                })
            })
                .then(response => response.json())
                .then(data => {
                    $(`#periodoNivel${nivelId}`).empty();
                    loadPeriodo(nivelId, `#periodoNivel${nivelId}`);
                    window.tecToast('Período actualizado');
                })
                .catch(error => {
                    console.error('Error editing período:', error);
                    window.tecToast('No se pudo actualizar el período', 'error');
                });
        })
        .catch(error => console.error('Error fetching período:', error));
}
window.editPeriodo = editPeriodo;

// Función para crear un período (scope global)
function createPeriodo(nivelId, nombre, codigo, callback) {
    fetch(`${API_BASE_URL}/periodo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            periodo_descripcion: nombre, 
            periodo_codigo: codigo, 
            id_nivel: nivelId 
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            window.tecToast('Período creado');
            callback();
        })
        .catch(error => {
            console.error('Error al crear el período:', error.message);
            window.tecToast('No se pudo crear el período', 'error');
        });
}
window.createPeriodo = createPeriodo;

// Inicialización y binds de eventos
$(document).ready(function () {
    const apiUrl = `${API_BASE_URL}/periodo`;
    const nivelesPeriodo = [1,2,3,4,5,6,7,8,9,10,11,12,13];

    // Cargar datos iniciales
    nivelesPeriodo.forEach(nivelId => {
        loadPeriodo(nivelId, '#periodoNivel' + nivelId);
    });

    // Cargar datos cuando se hace clic en la pestaña de período
    $(document).on('click', 'a[id^="periodo-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/periodo-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);
            loadPeriodo(nivelId, '#periodoNivel' + nivelId);
        }
    });

    // Configurar formularios de creación
    nivelesPeriodo.forEach(nivelId => {
        handleCreatePeriodo(
            nivelId,
            '#createperiodoNivel' + nivelId + 'Form',
            '#periodoNivel' + nivelId + 'Name',
            '#periodoNivel' + nivelId + 'Type'
        );
    });

    // Manejar el formulario de creación
    function handleCreatePeriodo(nivelId, formId, nombreId, codigoId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const nombre = $(nombreId).val();
            const codigo = $(codigoId).val();
            createPeriodo(nivelId, nombre, codigo, function () {
                $(formId)[0].reset();
                loadPeriodo(nivelId, '#periodoNivel' + nivelId);
            });
        });
    }
});
