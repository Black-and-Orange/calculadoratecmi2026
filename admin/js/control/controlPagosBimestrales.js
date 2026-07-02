import { API_BASE_URL } from '../apiConfig.js';

// Función para cargar pagos bimestrales por nivel (scope global)
function loadPagosBimestrales(nivelId, containerId) {
    const container = $(containerId);
    container.empty();

    fetch(`${API_BASE_URL}/pagos-bimestrales/nivel/${nivelId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                // Ordenar datos por mes y luego por orden de pago
                const ordenMeses = {
                    'ENERO': 1,
                    'MARZO': 2,
                    'JUNIO': 3,
                    'AGOSTO': 4,
                    'OCTUBRE': 5
                };
                
                // Crear una copia del array para no modificar el original
                const datosOrdenados = [...data];
                
                // Función de ordenamiento más robusta
                datosOrdenados.sort((a, b) => {
                    // Primero ordenar por mes
                    const mesA = (a.mes || '').toUpperCase();
                    const mesB = (b.mes || '').toUpperCase();
                    const ordenA = ordenMeses[mesA] || 999;
                    const ordenB = ordenMeses[mesB] || 999;
                    
                    if (ordenA !== ordenB) {
                        return ordenA - ordenB;
                    }
                    
                    // Si el mes es igual, ordenar por número de pago
                    const pagoA = parseInt(a.pago_orden) || 0;
                    const pagoB = parseInt(b.pago_orden) || 0;
                    return pagoA - pagoB;
                });
                
                // Verificar que el ordenamiento funcionó correctamente
                const mesesEnOrden = datosOrdenados.map(d => d.mes);
                
                let tableHtml = `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Bimestre</th>
                                <th>Mes</th>
                                <th>Orden</th>
                                <th>% Parcialidad</th>
                                <th>% Int. Financ.</th>
                                <th>Fecha Vencimiento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

                datosOrdenados.forEach(pago => {
                    const fechaVencimiento = pago.fecha_vencimiento ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-ES') : 'No definida';
                    tableHtml += `
                        <tr>
                            <td>${pago.codigo ?? ''}</td>
                            <td>${pago.bimestre}</td>
                            <td>${pago.mes ?? ''}</td>
                            <td>${pago.pago_orden ?? ''}</td>
                            <td>${pago.porcentaje_parcialidad ?? ''}</td>
                            <td>${pago.porcentaje_interes ?? ''}</td>
                            <td>${fechaVencimiento}</td>
                            <td>
                                <button onclick="deletePagoBimestral(${pago.id}, ${nivelId})" class="btn btn-danger btn-sm"><i class="fas fa-trash-alt"></i></button>
                                <button onclick="editPagoBimestral(${pago.id}, ${nivelId})" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>`;
                });

                tableHtml += `</tbody></table>`;
                container.html(tableHtml).show();
            } else {
                container.html('<p>No hay pagos bimestrales para mostrar.</p>').show();
            }
        })
        .catch(error => console.error('Error fetching pagos bimestrales:', error));
}
window.loadPagosBimestrales = loadPagosBimestrales;

// Función para eliminar un pago bimestral (scope global)
async function deletePagoBimestral(id, nivelId) {
    const confirmado = await window.tecConfirm('Se eliminará el pago bimestral de forma permanente.');
    if (!confirmado) return;
    fetch(`${API_BASE_URL}/pagos-bimestrales/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            $(`#pagosbimestralesNivel${nivelId}`).empty();
            loadPagosBimestrales(nivelId, `#pagosbimestralesNivel${nivelId}`);
            window.tecToast('Pago bimestral eliminado');
        })
        .catch(error => {
            console.error('Error deleting pago bimestral:', error);
            window.tecToast('No se pudo eliminar el pago bimestral', 'error');
        });
}
window.deletePagoBimestral = deletePagoBimestral;

// Función para editar un pago bimestral (scope global)
function editPagoBimestral(id, nivelId) {
    fetch(`${API_BASE_URL}/pagos-bimestrales/${id}`)
        .then(async pagoResponse => {
            const pago = await pagoResponse.json();
            const valores = await window.tecFormModal('Editar pago bimestral', [
                { name: 'codigo', label: 'Código', value: pago.codigo },
                { name: 'bimestre', label: 'Bimestre', value: pago.bimestre, type: 'number' },
                { name: 'mes', label: 'Mes (ej: Agosto, Octubre)', value: pago.mes },
                { name: 'pago_orden', label: 'Orden de pago', value: pago.pago_orden, type: 'number' },
                { name: 'porcentaje_parcialidad', label: '% Parcialidad', value: pago.porcentaje_parcialidad, type: 'number' },
                { name: 'porcentaje_interes', label: '% Int. Financiero', value: pago.porcentaje_interes, type: 'number' },
                { name: 'fecha_vencimiento', label: 'Fecha de vencimiento', value: pago.fecha_vencimiento ? pago.fecha_vencimiento.split('T')[0] : '', type: 'date', required: false },
            ]);
            if (!valores) return;

            const actualizado = {
                codigo: valores.codigo,
                bimestre: valores.bimestre,
                mes: valores.mes,
                pago_orden: valores.pago_orden,
                porcentaje_parcialidad: parseFloat(valores.porcentaje_parcialidad),
                porcentaje_interes: parseFloat(valores.porcentaje_interes),
                fecha_vencimiento: valores.fecha_vencimiento || null,
                nivel_id: nivelId
            };

            fetch(`${API_BASE_URL}/pagos-bimestrales/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actualizado)
            })
                .then(response => response.json())
                .then(data => {
                    $(`#pagosbimestralesNivel${nivelId}`).empty();
                    loadPagosBimestrales(nivelId, `#pagosbimestralesNivel${nivelId}`);
                    window.tecToast('Pago bimestral actualizado');
                })
                .catch(error => {
                    console.error('Error editing pago bimestral:', error);
                    window.tecToast('No se pudo actualizar el pago bimestral', 'error');
                });
        })
        .catch(error => console.error('Error fetching pago bimestral:', error));
}
window.editPagoBimestral = editPagoBimestral;

// Inicialización y binds de eventos
$(document).ready(function () {
    const apiUrl = `${API_BASE_URL}/pagos-bimestrales`;
    const nivelesBimestrales = [13];
    
    // Cargar datos iniciales (igual que campus)
    nivelesBimestrales.forEach(nivelId => {
        loadPagosBimestrales(nivelId, '#pagosbimestralesNivel' + nivelId);
    });
    
    // Cargar datos cuando se hace clic en la pestaña de pagos bimestrales
    $(document).on('click', 'a[id^="pagos-bimestrales-"][id$="-tab"]', function() {
        const nivelMatch = $(this).attr('id').match(/pagos-bimestrales-(\d+)-tab/);
        if (nivelMatch) {
            const nivelId = parseInt(nivelMatch[1]);

            loadPagosBimestrales(nivelId, '#pagosbimestralesNivel' + nivelId);
        }
    });
    
    // Configurar formularios de creación
    nivelesBimestrales.forEach(nivelId => {
        handleCreatePagoBimestral(
            nivelId,
            '#createpagosbimestralesNivel' + nivelId + 'Form',
            '#createpagosbimestralesNivel' + nivelId + 'Codigo',
            '#createpagosbimestralesNivel' + nivelId + 'Bimestre',
            '#createpagosbimestralesNivel' + nivelId + 'Mes',
            '#createpagosbimestralesNivel' + nivelId + 'Orden',
            '#createpagosbimestralesNivel' + nivelId + 'PorcentajeParcialidad',
            '#createpagosbimestralesNivel' + nivelId + 'PorcentajeInteres',
            '#createpagosbimestralesNivel' + nivelId + 'FechaVencimiento'
        );
    });

    // Función para crear un pago bimestral
    function createPagoBimestral(nivelId, codigo, bimestre, mes, pago_orden, porcentaje_parcialidad, porcentaje_interes, fecha_vencimiento, callback) {
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codigo: codigo,
                bimestre: bimestre,
                mes: mes,
                pago_orden: pago_orden,
                porcentaje_parcialidad: porcentaje_parcialidad,
                porcentaje_interes: porcentaje_interes,
                fecha_vencimiento: fecha_vencimiento || null,
                nivel_id: nivelId
            })
        })
            .then(response => response.json())
            .then(data => {
                window.tecToast('Pago bimestral creado');
                callback();
            })
            .catch(error => {
                console.error('Error creating pago bimestral:', error);
                window.tecToast('No se pudo crear el pago bimestral', 'error');
            });
    }

    // Manejar el formulario de creación
    function handleCreatePagoBimestral(nivelId, formId, codigoId, bimestreId, mesId, ordenId, parcialidadId, interesId, fechaVencimientoId) {
        $(formId).submit(function (event) {
            event.preventDefault();
            const codigo = $(codigoId).val();
            const bimestre = $(bimestreId).val();
            const mes = $(mesId).val();
            const pago_orden = $(ordenId).val();
            const porcentaje_parcialidad = $(parcialidadId).val();
            const porcentaje_interes = $(interesId).val();
            const fecha_vencimiento = $(fechaVencimientoId).val();
            createPagoBimestral(nivelId, codigo, bimestre, mes, pago_orden, porcentaje_parcialidad, porcentaje_interes, fecha_vencimiento, function () {
                $(formId)[0].reset();
                loadPagosBimestrales(nivelId, '#pagosbimestralesNivel' + nivelId);
            });
        });
    }
}); 