import { API_BASE_URL } from '../apiConfig.js';

const apiUrlBeneficios = `${API_BASE_URL}/beneficios`;

// Función genérica para cargar beneficios de cualquier nivel
function loadBeneficios(level, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${apiUrlBeneficios}/nivel/${level}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.nombre.localeCompare(b.nombre));

                let tableHtml = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Ícono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>`;

                data.forEach(beneficio => {
                    tableHtml += `
                            <tr>
                                <td>${beneficio.nombre}</td>
                                <td>${beneficio.descripcion}</td>
                                <td><img src="${beneficio.icono}" alt="Ícono" width="50" /></td>
                                <td>
                                    <button onclick="deleteBeneficio(${beneficio.id}, ${level})" class="btn btn-danger">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                    <button onclick="editBeneficio(${beneficio.id}, '${beneficio.nombre}', '${beneficio.descripcion}', '${beneficio.icono}', ${level})" class="btn btn-warning">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml);
            } else {
                container.html('<p>No se encontraron beneficios para mostrar.</p>');
            }
        })
        .catch(error => console.error('Error fetching beneficios:', error));
}

$(document).ready(function () {
    const maxLevel = 13;
    for (let level = 1; level <= maxLevel; level++) {
        loadBeneficios(level, '#beneficiosNivel' + level);
    }

    // Delegación de eventos para formularios de creación de beneficios
    $(document).on('submit', 'form[id^="createbeneficiosNivel"][id$="Form"]', function(event) {
        event.preventDefault();
        const formId = $(this).attr('id');
        const nivelMatch = formId.match(/createbeneficiosNivel(\d+)Form/);
        if (!nivelMatch) return;
        const level = parseInt(nivelMatch[1]);
        const name = $(`#beneficiosNivel${level}Nombre`).val();
        const description = $(`#beneficiosNivel${level}Descripcion`).val();
        const icon = $(`#beneficiosNivel${level}Icono`).val();
        createBeneficio(level, name, description, icon, function () {
            $(`#beneficiosNivel${level}Nombre`).val('');
            $(`#beneficiosNivel${level}Descripcion`).val('');
            $(`#beneficiosNivel${level}Icono`).val('');
            loadBeneficios(level, '#beneficiosNivel' + level);
        });
    });

    // Función genérica para crear beneficios
    function createBeneficio(level, name, description, icon, callback) {
        fetch(apiUrlBeneficios, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                nombre: name, 
                descripcion: description, 
                icono: icon, 
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
                window.tecToast('Beneficio creado');
                callback();
            })
            .catch(error => {
                console.error('Error creando beneficio:', error);
                window.tecToast('No se pudo crear el beneficio', 'error');
            });
    }
});

// Función para eliminar beneficio
async function deleteBeneficio(id, level) {
    const confirmado = await window.tecConfirm('Se eliminará el beneficio de forma permanente.');
    if (!confirmado) return;
    fetch(`${apiUrlBeneficios}/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            loadBeneficios(level, '#beneficiosNivel' + level);
            window.tecToast('Beneficio eliminado');
        })
        .catch(error => {
            console.error('Error deleting beneficio:', error);
            window.tecToast('No se pudo eliminar el beneficio', 'error');
        });
}

// Función para editar beneficio
async function editBeneficio(id, currentName, currentDescription, currentIcon, level) {
    const valores = await window.tecFormModal('Editar beneficio', [
        { name: 'nombre', label: 'Nuevo nombre del beneficio', value: currentName },
        { name: 'descripcion', label: 'Nueva descripción del beneficio', value: currentDescription },
        { name: 'icono', label: 'Nuevo link del icono', value: currentIcon },
    ]);
    if (!valores || !valores.nombre || !valores.descripcion || !valores.icono) return;
    fetch(`${apiUrlBeneficios}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre: valores.nombre,
            descripcion: valores.descripcion,
            icono: valores.icono
        }),
    })
        .then(response => response.json())
        .then(data => {
            loadBeneficios(level, '#beneficiosNivel' + level);
            window.tecToast('Beneficio actualizado');
        })
        .catch(error => {
            console.error('Error editing beneficio:', error);
            window.tecToast('No se pudo actualizar el beneficio', 'error');
        });
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteBeneficio = deleteBeneficio;
window.editBeneficio = editBeneficio;
