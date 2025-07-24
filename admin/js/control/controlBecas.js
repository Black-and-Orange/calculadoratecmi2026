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
    const maxLevel = 13;
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
            .then(data => callback())
            .catch(error => console.error('Error al crear la beca variable:', error.message));
    }
});

// Función para eliminar beca variable
function deleteBecaVariable(id, level) {
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
        })
        .catch(error => console.error('Error al eliminar la beca variable:', error.message));
}

// Función para editar beca variable
function editBecaVariable(id, currentTipo, currentPorcentajeMin, currentPorcentajeMax, currentPromedioMin, currentPromedioMax, level) {
    const newTipo = prompt('Nuevo Tipo:', currentTipo);
    const newPorcentajeMin = prompt('Nuevo Porcentaje Mínimo:', currentPorcentajeMin);
    const newPorcentajeMax = prompt('Nuevo Porcentaje Máximo:', currentPorcentajeMax);
    const newPromedioMin = prompt('Nuevo Promedio Mínimo:', currentPromedioMin);
    const newPromedioMax = prompt('Nuevo Promedio Máximo:', currentPromedioMax);

    if (newTipo && newPorcentajeMin && newPorcentajeMax && newPromedioMin && newPromedioMax) {
        fetch(`${apiUrlBecas}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tipo: newTipo,
                porcentaje_min: String(newPorcentajeMin),
                porcentaje_max: String(newPorcentajeMax),
                promedio_min: String(newPromedioMin),
                promedio_max: String(newPromedioMax)
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
            })
            .catch(error => console.error('Error al editar la beca variable:', error));
    }
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteBecaVariable = deleteBecaVariable;
window.editBecaVariable = editBecaVariable;
