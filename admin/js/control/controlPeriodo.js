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
                                <button onclick="fechasPagoPeriodo(${periodo.id_periodo})" class="btn btn-info btn-sm" title="Fechas de pago"><i class="far fa-calendar-alt"></i> Fechas de pago</button>
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

// ── Fechas de pago por período (minuta jul-2026) ─────────────────────────────
// Se configuran a nivel período; cada período guarda su propia lista, así el
// período anterior queda como consulta al crear uno nuevo. Convención: la
// primera fecha es la del plan de contado / primer pago; las siguientes, las
// mensualidades. El guardado reemplaza la lista completa (PUT).
async function fechasPagoPeriodo(idPeriodo) {
    try {
        const [periodo, fechas] = await Promise.all([
            fetch(`${API_BASE_URL}/periodo/${idPeriodo}`).then(r => r.json()),
            fetch(`${API_BASE_URL}/fechas-pago/periodo/${idPeriodo}`).then(r => r.json()),
        ]);

        const id = 'tecFechasPagoModal';
        document.getElementById(id)?.remove();
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = id;
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content tec-modal">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title tec-modal-titulo">Fechas de pago — <span class="tec-fp-periodo"></span></h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar"><span>&times;</span></button>
                    </div>
                    <form class="tec-modal-form">
                        <div class="modal-body">
                            <p class="text-muted mb-3" style="font-size: 13px;">
                                La <strong>primera fecha</strong> es el vencimiento del plan de contado y del primer
                                pago del financiamiento; las siguientes corresponden a las mensualidades, en orden.
                                Al guardar, las fechas se ordenan cronológicamente.
                            </p>
                            <div class="tec-fp-lista"></div>
                            <button type="button" class="btn btn-outline-secondary btn-sm" data-accion="agregar">
                                <i class="fas fa-plus"></i> Agregar fecha
                            </button>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar fechas</button>
                        </div>
                    </form>
                </div>
            </div>`;
        modal.querySelector('.tec-fp-periodo').textContent =
            `${periodo.periodo_descripcion || ''} (${periodo.periodo_codigo || ''})`;
        document.body.appendChild(modal);

        const lista = modal.querySelector('.tec-fp-lista');
        const agregarFila = (valor = '') => {
            const fila = document.createElement('div');
            fila.className = 'form-group d-flex align-items-center';
            fila.style.gap = '8px';
            fila.innerHTML = `
                <span class="tec-fp-orden text-muted" style="min-width: 72px; font-size: 13px;"></span>
                <input type="date" class="form-control" required>
                <button type="button" class="btn btn-outline-danger btn-sm" data-accion="quitar" title="Quitar fecha">
                    <i class="fas fa-times"></i>
                </button>`;
            fila.querySelector('input').value = valor;
            fila.querySelector('[data-accion="quitar"]').addEventListener('click', () => {
                fila.remove();
                renumerar();
            });
            lista.appendChild(fila);
            renumerar();
        };
        const renumerar = () => {
            lista.querySelectorAll('.tec-fp-orden').forEach((el, i) => {
                el.textContent = i === 0 ? 'Primer pago' : `Pago ${i + 1}`;
            });
        };

        // Filas iniciales: las fechas guardadas (YYYY-MM-DD en UTC) o una vacía
        if (Array.isArray(fechas) && fechas.length) {
            fechas.forEach(f => agregarFila(String(f.fecha_vencimiento).slice(0, 10)));
        } else {
            agregarFila();
        }

        modal.querySelector('[data-accion="agregar"]').addEventListener('click', () => agregarFila());

        modal.querySelector('.tec-modal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const valores = Array.from(lista.querySelectorAll('input[type="date"]'))
                .map(inp => inp.value)
                .filter(Boolean)
                .sort();
            try {
                const resp = await fetch(`${API_BASE_URL}/fechas-pago/periodo/${idPeriodo}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fechas: valores }),
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                window.tecToast(valores.length ? `Fechas de pago guardadas (${valores.length})` : 'Fechas de pago eliminadas');
                $(modal).modal('hide');
            } catch (error) {
                console.error('Error guardando fechas de pago:', error);
                window.tecToast('No se pudieron guardar las fechas de pago', 'error');
            }
        });

        $(modal).on('hidden.bs.modal', () => modal.remove());
        $(modal).modal('show');
    } catch (error) {
        console.error('Error cargando fechas de pago:', error);
        window.tecToast('No se pudieron cargar las fechas de pago', 'error');
    }
}
window.fechasPagoPeriodo = fechasPagoPeriodo;

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
