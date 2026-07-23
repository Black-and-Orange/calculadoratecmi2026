import { API_BASE_URL } from '../apiConfig.js';

const apiUrlBecas = `${API_BASE_URL}/becasVariables`;

// Función para cargar becas variables
function loadBecaVariable(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlBecas}/nivel/${level}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Porcentaje Mínimo</th>
                                <th>Porcentaje Máximo</th>
                                <th>Promedio Mínimo</th>
                                <th>Promedio Máximo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(beca => {
                    tableHtml += `
                        <tr>
                            <td>${beca.tipo}</td>
                            <td>${beca.porcentaje_min}</td>
                            <td>${beca.porcentaje_max}</td>
                            <td>${beca.promedio_min}</td>
                            <td>${beca.promedio_max}</td>
                            <td>
                                <button onclick="deleteBecaVariable(${beca.id}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editBecaVariable(${beca.id}, '${beca.tipo}', ${beca.porcentaje_min}, ${beca.porcentaje_max}, ${beca.promedio_min}, ${beca.promedio_max}, ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron becas variables para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error al cargar las becas variables:', error.message));
}

$(document).ready(function () {
    const maxLevel = 15;
    for (let level = 1; level <= maxLevel; level++) {
        loadBecaVariable(level, '#becasNivel' + level);
    }

    // Delegación de eventos para formularios de creación de becas
    $(document).on('submit', 'form[id^="createbecasNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createbecasNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const tipo = $(`#becasNivel${level}Tipo`).val();
        const porcentajeMin = $(`#becasNivel${level}PorcMinimo`).val();
        const porcentajeMax = $(`#becasNivel${level}PorcMaximo`).val();
        const promedioMin = $(`#becasNivel${level}PromMinimo`).val();
        const promedioMax = $(`#becasNivel${level}PromMaximo`).val();
        createBecaVariable(level, tipo, porcentajeMin, porcentajeMax, promedioMin, promedioMax, function () {
            $(`#becasNivel${level}Tipo`).val('');
            $(`#becasNivel${level}PorcMinimo`).val('');
            $(`#becasNivel${level}PorcMaximo`).val('');
            $(`#becasNivel${level}PromMinimo`).val('');
            $(`#becasNivel${level}PromMaximo`).val('');
            loadBecaVariable(level, '#becasNivel' + level);
        });
    });

    // Función para crear becas variables
    function createBecaVariable(level, tipo, porcentajeMin, porcentajeMax, promedioMin, promedioMax, callback) {
        fetch(apiUrlBecas, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tipo: tipo,
                porcentaje_min: porcentajeMin,
                porcentaje_max: porcentajeMax,
                promedio_min: promedioMin,
                promedio_max: promedioMax,
                nivel_id: level
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                window.tecToast('Beca creada');
                callback();
            })
            .catch(error => {
                console.error('Error al crear la beca variable:', error.message);
                window.tecToast('No se pudo crear la beca', 'error');
            });
    }
});

// Función para eliminar beca variable
async function deleteBecaVariable(id, level) {
    const confirmado = await window.tecConfirm('Se eliminará la beca de forma permanente.');
    if (!confirmado) return;
    fetch(`${apiUrlBecas}/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            loadBecaVariable(level, '#becasNivel' + level);
            window.tecToast('Beca eliminada');
        })
        .catch(error => {
            console.error('Error al eliminar la beca variable:', error.message);
            window.tecToast('No se pudo eliminar la beca', 'error');
        });
}

// Función para editar beca variable
async function editBecaVariable(id, currentTipo, currentPorcentajeMin, currentPorcentajeMax, currentPromedioMin, currentPromedioMax, level) {
    const valores = await window.tecFormModal('Editar beca', [
        { name: 'tipo', label: 'Nuevo Tipo', value: currentTipo },
        { name: 'porcentaje_min', label: 'Nuevo Porcentaje Mínimo', value: currentPorcentajeMin, type: 'number' },
        { name: 'porcentaje_max', label: 'Nuevo Porcentaje Máximo', value: currentPorcentajeMax, type: 'number' },
        { name: 'promedio_min', label: 'Nuevo Promedio Mínimo', value: currentPromedioMin, type: 'number' },
        { name: 'promedio_max', label: 'Nuevo Promedio Máximo', value: currentPromedioMax, type: 'number' },
    ]);
    if (!valores || !valores.tipo || !valores.porcentaje_min || !valores.porcentaje_max || !valores.promedio_min || !valores.promedio_max) return;
    fetch(`${apiUrlBecas}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tipo: valores.tipo,
            porcentaje_min: String(valores.porcentaje_min),
            porcentaje_max: String(valores.porcentaje_max),
            promedio_min: String(valores.promedio_min),
            promedio_max: String(valores.promedio_max)
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            loadBecaVariable(level, '#becasNivel' + level);
            window.tecToast('Beca actualizada');
        })
        .catch(error => {
            console.error('Error al editar la beca variable:', error);
            window.tecToast('No se pudo actualizar la beca', 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteBecaVariable = deleteBecaVariable;
window.editBecaVariable = editBecaVariable;
