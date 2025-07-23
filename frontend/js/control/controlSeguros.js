import { API_BASE_URL } from '../apiConfig.js';

const apiUrlSeguros = `${API_BASE_URL}/seguros`;
const apiChangeHeadersUrl = 'http://localhost:3008/api/seguros/cambiar-nombres';

// Función para cargar seguros
function loadSeguros(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlSeguros}/nivel/${level}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.seguro_accidentes.localeCompare(b.seguro_accidentes)); 

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Seguro Accidentes</th>
                                <th>Cobertura Estudiantil</th>
                                <th>Cobertura VIVE</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(seguro => {
                    tableHtml += `
                        <tr>
                            <td>${seguro.seguro_accidentes}</td>
                            <td>${seguro.seguro_estudiantil}</td>
                            <td>${seguro.cobertura_vive}</td>
                            <td>
                                <button onclick="deleteSeguro(${seguro.id_seguro}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editSeguro(${seguro.id_seguro}, '${seguro.seguro_accidentes}', '${seguro.seguro_estudiantil}', '${seguro.cobertura_vive}', ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron seguros para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error al cargar los seguros:', error.message));
}

// Función para cambiar los encabezados de la tabla
// function changeTableHeaders() {
//     const newAccidentes = prompt('Nuevo nombre para "Seguro Accidentes":', $('#header-accidentes').text());
//     const newEstudiantil = prompt('Nuevo nombre para "Seguro Estudiantil":', $('#header-estudiantil').text());
//     const newCobertura = prompt('Nuevo nombre para "Cobertura VIVE":', $('#header-vive').text());

//     if (newAccidentes && newEstudiantil && newCobertura) {
//         fetch(apiChangeHeadersUrl, {
//             method: 'PATCH',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 seguro_accidentes: newAccidentes,
//                 seguro_estudiantil: newEstudiantil,
//                 cobertura_vive: newCobertura,
//             }),
//         })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log('Encabezados cambiados en la base de datos:', data);
//                 // Actualizar los encabezados en el DOM
//                 $('#header-accidentes').text(newAccidentes);
//                 $('#header-estudiantil').text(newEstudiantil);
//                 $('#header-vive').text(newCobertura);
//             })
//             .catch(error => console.error('Error al cambiar los encabezados:', error.message));
//     }
// }

$(document).ready(function () {
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadSeguros(level, '#segurosNivel' + level);
        // const changeHeadersBtn = $('<button>').text('Cambiar Encabezados').addClass('btn btn-primary');
        // changeHeadersBtn.on('click', changeTableHeaders);
        // $('#segurosNivel' + level).before(changeHeadersBtn);
    }

    // Delegación de eventos para formularios de creación de seguros
    $(document).on('submit', 'form[id^="createsegurosNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createsegurosNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const accidentes = $(`#segurosNivel${level}Accidentes`).val();
        const cobertura = $(`#segurosNivel${level}Cobertura`).val();
        const estudiantil = $(`#segurosNivel${level}Estudiantil`).val();
        createSeguro(level, accidentes, cobertura, estudiantil, function () {
            $(`#segurosNivel${level}Accidentes`).val('');
            $(`#segurosNivel${level}Cobertura`).val('');
            $(`#segurosNivel${level}Estudiantil`).val('');
            loadSeguros(level, '#segurosNivel' + level);
        });
    });

    function createSeguro(level, accidentes, cobertura, estudiantil, callback) {
        fetch(apiUrlSeguros, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seguro_accidentes: accidentes,
                cobertura_vive: cobertura,
                seguro_estudiantil: estudiantil,
                id_nivel: level
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => callback())
            .catch(error => console.error('Error al crear el seguro:', error.message));
    }
});

// Función para eliminar seguro
function deleteSeguro(id_seguro, level) {
    fetch(`${apiUrlSeguros}/${id_seguro}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            loadSeguros(level, '#segurosNivel' + level);
        })
        .catch(error => console.error('Error al eliminar el seguro:', error.message));
}

// Función para editar seguro
function editSeguro(id_seguro, currentAccidentes, currentEstudiantil, currentCobertura, level) {
    const newAccidentes = prompt('Nuevo Seguro Accidentes:', currentAccidentes);
    const newEstudiantil = prompt('Nuevo Seguro Estudiantil:', currentEstudiantil);
    const newCobertura = prompt('Nueva Cobertura VIVE:', currentCobertura);

    if (newAccidentes && newEstudiantil && newCobertura) {
        fetch(`${apiUrlSeguros}/${id_seguro}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seguro_accidentes: newAccidentes,
                seguro_estudiantil: newEstudiantil,
                cobertura_vive: newCobertura,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                loadSeguros(level, '#segurosNivel' + level);
            })
            .catch(error => console.error('Error al editar el seguro:', error.message));
    }
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteSeguro = deleteSeguro;
window.editSeguro = editSeguro;
