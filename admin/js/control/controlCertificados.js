import { API_BASE_URL } from '../apiConfig.js';

const apiUrlCertificados = `${API_BASE_URL}/certificados`;

// Función genérica para cargar certificados de cualquier nivel
function loadCertificados(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlCertificados}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.num_certificados - b.num_certificados);

                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Número de Certificados</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                data.forEach(certificado => {
                    tableHtml += `
                        <tr>
                            <td>${certificado.num_certificados}</td>
                            <td>
                                <button onclick="deleteCertificados(${certificado.id}, ${level})" class="btn btn-danger">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="editCertificados(${certificado.id}, ${certificado.num_certificados}, ${level})" class="btn btn-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron certificados para este nivel.</p>');
            }
        })
        .catch(error => console.error('Error fetching certificados:', error));
}

$(document).ready(function () {
    const maxLevel = 19;
    for (let level = 1; level <= maxLevel; level++) {
        loadCertificados(level, '#certificadosNivel' + level);
    }

    // Delegación de eventos para formularios de creación de certificados
    $(document).on('submit', 'form[id^="createcertificadosNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createcertificadosNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const numeroCertificados = $(`#certificadosNivel${level}Certificados`).val();
        createCertificados(level, numeroCertificados, function () {
            $(`#certificadosNivel${level}Certificados`).val('');
            loadCertificados(level, '#certificadosNivel' + level);
        });
    });

    // Función genérica para crear certificados
    function createCertificados(level, numeroCertificados, callback) {
        fetch(apiUrlCertificados, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ num_certificados: numeroCertificados, nivel_id: level }),
        })
            .then(response => response.json())
            .then(data => {
                window.tecToast('Certificados creados');
                callback();
            })
            .catch(error => {
                console.error('Error creating certificados:', error);
                window.tecToast('No se pudieron crear los certificados', 'error');
            });
    }
});

// Función para eliminar certificados
async function deleteCertificados(id, level) {
    const confirmado = await window.tecConfirm('Se eliminará el registro de certificados de forma permanente.');
    if (!confirmado) return;
    fetch(`${apiUrlCertificados}/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la eliminación del certificado con id: ${id}. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadCertificados(level, '#certificadosNivel' + level);
            window.tecToast('Certificados eliminados');
        })
        .catch(error => {
            console.error('Error al eliminar certificados:', error);
            window.tecToast('No se pudieron eliminar los certificados', 'error');
        });
}

// Función para editar certificados
async function editCertificados(id, currentNumero, level) {
    const valores = await window.tecFormModal('Editar certificados', [
        { name: 'numero', label: 'Nuevo número de certificados', value: currentNumero, type: 'number' },
    ]);
    if (!valores || !valores.numero) return;
    fetch(`${apiUrlCertificados}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num_certificados: valores.numero }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al editar el certificado con id: ${id}. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadCertificados(level, '#certificadosNivel' + level);
            window.tecToast('Certificados actualizados');
        })
        .catch(error => {
            console.error('Error al editar certificados:', error);
            window.tecToast('No se pudieron actualizar los certificados', 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteCertificados = deleteCertificados;
window.editCertificados = editCertificados;

