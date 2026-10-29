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
                // Ordenar por nombre (tolerante a nombre_seguro null: p. ej. nivel 3 tiene seguros sin nombre)
                data.sort((a, b) => (a.nombre_seguro || '').localeCompare(b.nombre_seguro || ''));

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
                    const nombreSeguro = seguro.nombre_seguro || '(sin nombre)';
                    tableHtml += `
                        <tr>
                            <td>${nombreSeguro}</td>
                            <td>$${parseFloat(seguro.valor).toFixed(2)}</td>
                            <td><span class="badge ${estadoClass}">${estadoTexto}</span></td>
                            <td>
                                <button onclick="toggleEstadoSeguro(${seguro.id_seguro}, ${level}, ${!seguro.estado})" 
                                        class="btn btn-sm ${seguro.estado ? 'btn-warning' : 'btn-success'}" 
                                        title="${seguro.estado ? 'Deshabilitar' : 'Habilitar'}">
                                    <i class="fas fa-${seguro.estado ? 'eye-slash' : 'eye'}"></i>
                                </button>
                                <button onclick="editSeguro(${seguro.id_seguro}, '${(seguro.nombre_seguro || '').replace(/'/g, "\\'")}', ${seguro.valor}, ${level})"
                                        class="btn btn-sm btn-warning" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="gestionarPreciosCampus(${seguro.id_seguro}, '${(seguro.nombre_seguro || '').replace(/'/g, "\\'")}', ${level})"
                                        class="btn btn-sm btn-info" title="Precios por campus">
                                    <i class="fas fa-map-marker-alt"></i>
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
            window.tecToast('Seguro creado');
            if (callback) callback();
        })
        .catch(error => {
            console.error('Error al crear el seguro:', error.message);
            window.tecToast(`Error al crear el seguro: ${error.message}`, 'error');
        });
}

// Función para editar seguro
async function editSeguro(id_seguro, currentNombre, currentValor, level) {
    const valores = await window.tecFormModal('Editar seguro', [
        { name: 'nombre', label: 'Nuevo nombre del seguro', value: currentNombre },
        { name: 'valor', label: 'Nuevo valor del seguro', value: currentValor, type: 'number' },
    ]);
    if (!valores || !valores.nombre) return;
    if (!valores.valor || isNaN(valores.valor)) {
        window.tecToast('El valor debe ser un número válido', 'error');
        return;
    }

    fetch(`${apiUrlSeguros}/${id_seguro}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre_seguro: valores.nombre,
            valor: parseFloat(valores.valor),
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
            window.tecToast('Seguro actualizado');
        })
        .catch(error => {
            console.error('Error al editar el seguro:', error.message);
            window.tecToast(`Error al editar el seguro: ${error.message}`, 'error');
        });
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
            window.tecToast('Estado del seguro actualizado');
        })
        .catch(error => {
            console.error('Error al cambiar el estado del seguro:', error.message);
            window.tecToast(`Error al cambiar el estado: ${error.message}`, 'error');
        });
}

// Función para eliminar seguro (solo la relación con el nivel)
async function deleteSeguro(id_seguro, level) {
    const confirmado = await window.tecConfirm('Se eliminará este seguro de este nivel de forma permanente.');
    if (!confirmado) return;

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
            window.tecToast('Seguro eliminado');
        })
        .catch(error => {
            console.error('Error al eliminar el seguro:', error.message);
            window.tecToast(`Error al eliminar el seguro: ${error.message}`, 'error');
        });
}

// Inicialización cuando el documento está listo
$(document).ready(function () {
    const maxLevel = 19;
    
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
            window.tecToast('El nombre del seguro es requerido', 'error');
            return;
        }

        if (!valor || isNaN(valor)) {
            window.tecToast('El valor debe ser un número válido', 'error');
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

// ===== Precios por campus (excepciones al precio por defecto del seguro) =====
async function gestionarPreciosCampus(id_seguro, nombreSeguro, level) {
    const esc = (s) => String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Carga campus del nivel y excepciones actuales de este seguro.
    let campuses = [];
    let excepciones = [];
    try {
        [campuses, excepciones] = await Promise.all([
            fetch(`${API_BASE_URL}/campus/nivel/${level}`).then(r => r.json()),
            fetch(`${apiUrlSeguros}/nivel/${level}/precios-campus`).then(r => r.json())
        ]);
    } catch (e) {
        window.tecToast('No se pudieron cargar los datos de campus', 'error');
        return;
    }
    const excSeguro = (excepciones || []).filter(x => Number(x.id_seguro) === Number(id_seguro));
    const conExcepcion = new Set(excSeguro.map(x => Number(x.id_campus)));

    const id = 'tecPreciosCampusModal';
    document.getElementById(id)?.remove();

    const filasExc = excSeguro.length
        ? excSeguro.map(x => `
            <tr>
                <td>${esc(x.campus_nombre)}</td>
                <td>$${parseFloat(x.valor).toFixed(2)}</td>
                <td class="text-right">
                    <button class="btn btn-sm btn-danger" data-del-campus="${x.id_campus}" title="Quitar (vuelve al precio por defecto)">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`).join('')
        : '<tr><td colspan="3" class="text-muted">Sin excepciones. Todos los campus usan el precio por defecto.</td></tr>';

    const checksCampus = (campuses || [])
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
        .map(c => `
            <label class="d-inline-flex align-items-center mr-3 mb-2" style="gap:6px;">
                <input type="checkbox" class="pc-campus-chk" value="${c.id}" ${conExcepcion.has(Number(c.id)) ? 'checked' : ''}>
                ${esc(c.nombre)}
            </label>`).join('');

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = id;
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content tec-modal">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title tec-modal-titulo">Precios por campus — ${esc(nombreSeguro)}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar"><span>&times;</span></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted" style="font-size:13px;">
                        El <b>precio por defecto</b> del seguro aplica a todos los campus. Aquí defines
                        <b>excepciones</b>: un costo distinto para los campus que selecciones.
                    </p>
                    <h6 class="font-weight-bold mt-2">Excepciones actuales</h6>
                    <table class="table table-sm table-striped mb-4">
                        <thead><tr><th>Campus</th><th>Costo</th><th></th></tr></thead>
                        <tbody id="pc-tbody">${filasExc}</tbody>
                    </table>
                    <h6 class="font-weight-bold">Agregar / actualizar costo</h6>
                    <div class="form-group">
                        <label for="pc-valor">Costo para los campus seleccionados</label>
                        <input type="number" step="any" min="0" class="form-control" id="pc-valor" placeholder="Ej. 2500">
                    </div>
                    <label class="font-weight-bold d-block">Campus</label>
                    <div id="pc-campus-list" style="max-height:180px; overflow:auto;">${checksCampus || '<span class="text-muted">Sin campus en este nivel</span>'}</div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" id="pc-guardar">Guardar costo</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const recargar = () => { $(modal).modal('hide'); gestionarPreciosCampus(id_seguro, nombreSeguro, level); };

    // Guardar (upsert multi-campus)
    modal.querySelector('#pc-guardar').addEventListener('click', async () => {
        const valor = parseFloat(modal.querySelector('#pc-valor').value);
        const campusSel = [...modal.querySelectorAll('.pc-campus-chk:checked')].map(c => Number(c.value));
        if (isNaN(valor) || valor < 0) { window.tecToast('Indica un costo válido', 'error'); return; }
        if (!campusSel.length) { window.tecToast('Selecciona al menos un campus', 'error'); return; }
        try {
            const resp = await fetch(`${apiUrlSeguros}/precios-campus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_seguro, id_nivel: level, valor, campus: campusSel })
            });
            if (!resp.ok) throw new Error((await resp.json()).error || resp.status);
            window.tecToast('Precios por campus guardados');
            recargar();
        } catch (e) {
            window.tecToast(`Error al guardar: ${e.message}`, 'error');
        }
    });

    // Borrar excepción
    modal.querySelectorAll('[data-del-campus]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id_campus = btn.getAttribute('data-del-campus');
            const ok = await window.tecConfirm('Se quitará la excepción (ese campus volverá al precio por defecto).');
            if (!ok) return;
            try {
                const resp = await fetch(`${apiUrlSeguros}/precios-campus?id_seguro=${id_seguro}&id_nivel=${level}&id_campus=${id_campus}`, { method: 'DELETE' });
                if (!resp.ok) throw new Error((await resp.json()).error || resp.status);
                window.tecToast('Excepción eliminada');
                recargar();
            } catch (e) {
                window.tecToast(`Error al eliminar: ${e.message}`, 'error');
            }
        });
    });

    $(modal).on('hidden.bs.modal', () => modal.remove());
    $(modal).modal('show');
}

// Exponer funciones al ámbito global para los botones onclick
window.deleteSeguro = deleteSeguro;
window.editSeguro = editSeguro;
window.toggleEstadoSeguro = toggleEstadoSeguro;
window.gestionarPreciosCampus = gestionarPreciosCampus;
