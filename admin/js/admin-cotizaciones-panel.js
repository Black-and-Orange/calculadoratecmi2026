import { API_BASE_URL } from './apiConfig.js';
import { niveles as nivelesData } from './control/tabs.js';

document.addEventListener('DOMContentLoaded', function() {
    let cotizaciones = [];
    let cotizacionesCompletas = []; // Para almacenar todas las cotizaciones
    let niveles = [];

    // Elementos del DOM
    const btnRefresh = document.getElementById('btnRefresh');
    const btnExportCSV = document.getElementById('btnExportCSV');
    // Eliminar referencia al filtro de nivel
    // const filtroNivel = document.getElementById('filtroNivel');
    const cotizacionesTableBody = document.getElementById('cotizacionesTableBody');
    const loading = document.getElementById('loading');
    const noData = document.getElementById('noData');

    // Event listeners
    if (btnRefresh) btnRefresh.addEventListener('click', cargarCotizaciones);
    if (btnExportCSV) btnExportCSV.addEventListener('click', exportarCSV);
    
    // Eliminar event listener del filtro de nivel
    // if (filtroNivel) {
    //     filtroNivel.addEventListener('change', function() {
    //         aplicarFiltroAutomatico();
    //     });
    // }

    // Eliminar función aplicarFiltroAutomatico
    // async function aplicarFiltroAutomatico() {
    //     mostrarLoading(true);
    //     try {
    //         let url = `${API_BASE_URL}/cotizaciones`;
            
    //         if (filtroNivel && filtroNivel.value) {
    //             url = `${API_BASE_URL}/cotizaciones/por-nivel/${filtroNivel.value}`;
    //         }
            
    //         const response = await fetch(url);
    //         if (!response.ok) throw new Error('Error al aplicar filtro');
            
    //         const result = await response.json();
    //         cotizaciones = result.data || [];
            
    //         mostrarCotizaciones(cotizaciones);
    //         actualizarTotalCotizaciones();
    //     } catch (error) {
    //         console.error('Error al aplicar filtro:', error);
    //         mostrarError('Error al aplicar el filtro');
    //     } finally {
    //         mostrarLoading(false);
    //     }
    // }

    // Función para cargar niveles
    async function cargarNiveles() {
        try {
            // Usar los datos hardcodeados de tabs.js
            niveles = nivelesData;
            
            // Llenar el select de filtro de niveles
            // if (filtroNivel) {
            //     niveles.forEach(nivel => {
            //         const option = document.createElement('option');
            //         option.value = nivel.id;
            //         option.textContent = nivel.nombre;
            //         filtroNivel.appendChild(option);
            //     });
            // }
        } catch (error) {
            console.error('Error al cargar niveles:', error);
        }
    }

    // Modificar cargarCotizaciones para que siempre obtenga todas
    async function cargarCotizaciones() {
        try {
            const response = await fetch(`${API_BASE_URL}/cotizaciones`);
            let result = await response.json();
            cotizacionesCompletas = Array.isArray(result) ? result : result.data;
            cotizaciones = [...cotizacionesCompletas]; // Mostrar todas
            mostrarCotizaciones(cotizaciones);
            actualizarTotalCotizaciones();
        } catch (error) {
            console.error('Error al obtener cotizaciones:', error);
        }
    }

    // Función para actualizar el total de cotizaciones según el filtro
    function actualizarTotalCotizaciones() {
        const totalElement = document.getElementById('totalCotizaciones');
        if (totalElement) {
            // Siempre mostrar el número de cotizaciones que se están mostrando actualmente
            totalElement.textContent = cotizaciones.length || 0;
        }
    }

    // Función para mostrar cotizaciones en la tabla
    function mostrarCotizaciones(cotizaciones) {
        let tbody = document.querySelector('#tablaCotizaciones tbody');
        if (!tbody) {
            // Intentar con el primer tbody de la página
            tbody = document.querySelector('tbody');
            if (!tbody) {
                console.error('No se encontró ningún <tbody> en la página. Verifica el HTML de la tabla de cotizaciones.');
                return;
            } else {
                console.warn('No se encontró #tablaCotizaciones, usando el primer <tbody> encontrado.');
            }
        }
        tbody.innerHTML = '';
        if (!cotizaciones || cotizaciones.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 9; // Actualizado para reflejar el número correcto de columnas (sin fecha de vigencia)
            cell.textContent = 'No hay cotizaciones registradas.';
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }
        cotizaciones.forEach(cotizacion => {
            const row = document.createElement('tr');
            const nivel = niveles.find(n => n.id == cotizacion.nivel_id);
            const nivelNombre = cotizacion.nivel_nombre || (nivel ? nivel.nombre : `Nivel ${cotizacion.nivel_id}`);
            
            row.innerHTML = `
                <td>${cotizacion.id}</td>
                <td>${cotizacion.nombre_estudiante || ''}</td>
                <td>${nivelNombre}</td>
                <td>${cotizacion.campus || ''}</td>
                <td>${cotizacion.programa || ''}</td>
                <td>${formatearPesos(cotizacion.total_contado) || ''}</td>
                <td>${formatearPesos(cotizacion.total_financiado) || ''}</td>
                <td>${new Date(cotizacion.fecha_creacion).toLocaleDateString('es-ES')}</td>
                <td>
                    <button onclick="verDetalleCotizacion(${cotizacion.id})" class="btn btn-sm btn-info mr-1">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    <button onclick="eliminarCotizacion(${cotizacion.id})" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                    
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Función para exportar a CSV
    function exportarCSV() {
        // Usar las cotizaciones filtradas en lugar de todas
        const cotizacionesAExportar = cotizaciones.length > 0 ? cotizaciones : cotizacionesCompletas;
        
        if (cotizacionesAExportar.length === 0) {
            window.tecToast('No hay datos para exportar', 'error');
            return;
        }

        const headers = [
            'ID', 'Estudiante', 'Nivel', 'Periodo', 'Campus', 'Programa', 'Formato',
            'Materias', 'Certificados', 'Semanas SEDI', 'Inglés', 'Créditos',
            'Costo Total', 'Total Contado', 'Total Financiado', 'Primera Cuota', 'Mensualidades', 
            'Beca Nombre', 'Beca %', 'Apoyo Estudiantil %', 'Apoyo Estudiantil Fijo', 
            'Préstamo %', 'Seguro Accidentes', 'Seguro Estudiantil', 'Cobertura Vive', 
            'Total Seguros', 'Fecha Creación', 'Fecha Vigencia'
        ];

        const csvContent = [
            headers.join(','),
            ...cotizacionesAExportar.map(cotizacion => {
                // Buscar el nombre del nivel en el array hardcodeado
                const nivel = niveles.find(n => n.id == cotizacion.nivel_id);
                const nivelNombre = nivel ? nivel.nombre : `Nivel ${cotizacion.nivel_id}`;
                const fecha = new Date(cotizacion.fecha_creacion).toLocaleDateString('es-ES');
                const fechaVigencia = cotizacion.fecha_vigencia ? 
                    (() => {
                        // Formatear fecha directamente desde la base de datos para evitar problemas de zona horaria
                        const fecha = new Date(cotizacion.fecha_vigencia);
                        const dia = fecha.getUTCDate().toString().padStart(2, '0');
                        const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
                        const año = fecha.getUTCFullYear();
                        return `${dia}/${mes}/${año}`;
                    })() : 
                    'N/A';
                
                // Determinar qué valor mostrar según el nivel
                let materiasValue = 0;
                let certificadosValue = 0;
                let creditosValue = 0;
                let semanasValue = 0;
                let inglesValue = 0;

                if (cotizacion.nivel_id === 4) {
                    // Nivel 4: certificados, semanas SEDI e inglés
                    certificadosValue = cotizacion.certificados || 0;
                    semanasValue = cotizacion.semanas_sedi || 0;
                    inglesValue = cotizacion.ingles || 0;
                } else if ([5, 8, 9].includes(cotizacion.nivel_id)) {
                    // Niveles 5, 8, 9: certificados
                    certificadosValue = cotizacion.certificados || 0;
                } else if ([2, 6, 10].includes(cotizacion.nivel_id)) {
                    // Niveles 2, 6, 10: créditos
                    creditosValue = cotizacion.creditos || 0;
                } else if (cotizacion.nivel_id === 13) {
                    // Nivel 13: certificados y semanas SEDI
                    certificadosValue = cotizacion.certificados || 0;
                    semanasValue = cotizacion.semanas_sedi || 0;
                } else {
                    // Niveles 1, 3, 7, 11, 12: materias
                    materiasValue = cotizacion.materias || 0;
                }

                return [
                    cotizacion.id,
                    `"${cotizacion.nombre_estudiante}"`,
                    `"${nivelNombre}"`,
                    `"${cotizacion.periodo || ''}"`,
                    `"${cotizacion.campus || ''}"`,
                    `"${cotizacion.programa || ''}"`,
                    `"${cotizacion.formato || ''}"`,
                    materiasValue,
                    certificadosValue,
                    semanasValue,
                    inglesValue,
                    creditosValue,
                    cotizacion.costo_total || 0,
                    cotizacion.total_contado || 0,
                    cotizacion.total_financiado || 0,
                    cotizacion.primera_cuota || 0,
                    cotizacion.mensualidades || 0,
                    `"${cotizacion.beca_nombre || ''}"`,
                    cotizacion.beca_porcentaje || 0,
                    cotizacion.apoyo_estudiantil_porcentaje || 0,
                    cotizacion.apoyo_estudiantil_fijo || 0,
                    cotizacion.prestamo_porcentaje || 0,
                    cotizacion.seguro_accidentes || 0,
                    cotizacion.seguro_estudiantil || 0,
                    cotizacion.cobertura_vive || 0,
                    cotizacion.total_seguros || 0,
                    `"${fecha}"`,
                    `"${fechaVigencia}"`
                ].join(',');
            })
        ].join('\n');

        // Generar nombre de archivo con información del filtro
        let nombreArchivo = `cotizaciones_${new Date().toISOString().split('T')[0]}`;
        // Eliminar referencia al filtro de nivel
        // if (filtroNivel && filtroNivel.value) {
        //     const nivelSeleccionado = niveles.find(n => n.id == filtroNivel.value);
        //     const nombreNivel = nivelSeleccionado ? nivelSeleccionado.nombre.replace(/\s+/g, '_') : `nivel_${filtroNivel.value}`;
        //     nombreArchivo += `_${nombreNivel}`;
        // }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${nombreArchivo}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Función para mostrar/ocultar loading
    function mostrarLoading(mostrar) {
        if (loading) {
            loading.style.display = mostrar ? 'block' : 'none';
        }
        if (cotizacionesTableBody) {
            cotizacionesTableBody.innerHTML = '';
        }
    }

    // Función para mostrar error
    function mostrarError(mensaje) {
        window.tecToast(mensaje, 'error');
    }

    // Función para formatear pesos
    function formatearPesos(numero) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(numero || 0);
    }

    // Funciones globales para los botones de la tabla
    window.verDetalleCotizacion = function(id) {
        const cotizacion = cotizaciones.find(c => c.id === id);
        if (cotizacion) {
            // Buscar el nombre del nivel en el array hardcodeado
            const nivel = niveles.find(n => n.id == cotizacion.nivel_id);
            const nivelNombre = nivel ? nivel.nombre : `Nivel ${cotizacion.nivel_id}`;
            
            // Determinar qué información mostrar según el nivel
            let infoUnidades = '';
            if (cotizacion.nivel_id === 4) {
                infoUnidades = `Certificados: ${cotizacion.certificados || 0}<br>Semanas de Desarrollo Integral: ${cotizacion.semanas_sedi || 0}<br>Certificados de Inglés: ${cotizacion.ingles || 0}`;
            } else if ([5, 8, 9].includes(cotizacion.nivel_id)) {
                // Niveles 5, 8, 9: certificados
                infoUnidades = `Certificados: ${cotizacion.certificados || 0}`;
            } else if ([2, 6, 10].includes(cotizacion.nivel_id)) {
                // Niveles 2, 6, 10: créditos
                infoUnidades = `Créditos: ${cotizacion.creditos || 0}`;
            } else if (cotizacion.nivel_id === 13) {
                infoUnidades = `Certificados: ${cotizacion.certificados || 0}<br>Semanas de Desarrollo Integral: ${cotizacion.semanas_sedi || 0}`;
            } else {
                // Niveles 1, 3, 7, 11, 12: materias
                infoUnidades = `Materias: ${cotizacion.materias || 0}`;
            }

            // Definir la fila de mensualidades y primera cuota correctamente
            let filaMensualidades = `<tr><td><strong>Mensualidades:</strong></td><td>${formatearPesos(cotizacion.mensualidades)}</td></tr>`;
            let filaPrimeraCuota = `<tr><td><strong>Primera Cuota:</strong></td><td>${formatearPesos(cotizacion.primera_cuota)}</td></tr>`;
            if (cotizacion.nivel_id === 13) {
                filaMensualidades = '';
                filaPrimeraCuota = '';
            }
            
            // Crear el contenido HTML del modal
            const contenidoHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="font-weight-bold text-primary">INFORMACIÓN BÁSICA</h6>
                        <table class="table table-sm">
                            <tr><td><strong>ID:</strong></td><td>${cotizacion.id}</td></tr>
                            <tr><td><strong>Estudiante:</strong></td><td>${cotizacion.nombre_estudiante}</td></tr>
                            <tr><td><strong>Nivel:</strong></td><td>${nivelNombre}</td></tr>
                            <tr><td><strong>Periodo:</strong></td><td>${cotizacion.periodo || 'N/A'}</td></tr>
                            <tr><td><strong>Campus:</strong></td><td>${cotizacion.campus || 'N/A'}</td></tr>
                            <tr><td><strong>Programa:</strong></td><td>${cotizacion.programa || 'N/A'}</td></tr>
                            <tr><td><strong>Formato:</strong></td><td>${cotizacion.formato || 'N/A'}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="font-weight-bold text-success">INFORMACIÓN ACADÉMICA</h6>
                        <div class="p-3 bg-light rounded">
                            ${infoUnidades}
                        </div>
                    </div>
                </div>
                
                <hr>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="font-weight-bold text-info">INFORMACIÓN FINANCIERA</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Costo Total:</strong></td><td>${formatearPesos(cotizacion.costo_total)}</td></tr>
                            <tr><td><strong>Total Contado:</strong></td><td>${formatearPesos(cotizacion.total_contado)}</td></tr>
                            <tr><td><strong>Total Financiado:</strong></td><td>${formatearPesos(cotizacion.total_financiado)}</td></tr>
                            ${filaPrimeraCuota}
                            ${filaMensualidades}
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="font-weight-bold text-warning">BECAS Y APOYOS</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Beca:</strong></td><td>${cotizacion.beca_nombre || 'N/A'} (${cotizacion.beca_porcentaje || 0}%)</td></tr>
                            <tr><td><strong>Apoyo Estudiantil:</strong></td><td>${cotizacion.apoyo_estudiantil_porcentaje || 0}%</td></tr>
                            <tr><td><strong>Apoyo Fijo:</strong></td><td>${formatearPesos(cotizacion.apoyo_estudiantil_fijo)}</td></tr>
                            <tr><td><strong>Préstamo:</strong></td><td>${cotizacion.prestamo_porcentaje || 0}%</td></tr>
                        </table>
                    </div>
                </div>
                
                <hr>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="font-weight-bold text-danger">SEGUROS</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Seguro Accidentes:</strong></td><td>${formatearPesos(cotizacion.seguro_accidentes)}</td></tr>
                            <tr><td><strong>Seguro Estudiantil:</strong></td><td>${formatearPesos(cotizacion.seguro_estudiantil)}</td></tr>
                            <tr><td><strong>Cobertura Vive:</strong></td><td>${formatearPesos(cotizacion.cobertura_vive)}</td></tr>
                            <tr><td><strong>Total Seguros:</strong></td><td>${formatearPesos(cotizacion.total_seguros)}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="font-weight-bold text-secondary">FECHA DE CREACIÓN</h6>
                        <div class="p-3 bg-light rounded">
                            ${new Date(cotizacion.fecha_creacion).toLocaleString('es-ES')}
                        </div>
                    </div>
                </div>
                
                ${cotizacion.fecha_vigencia ? `
                <hr>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="font-weight-bold text-success">FECHA DE VIGENCIA</h6>
                        <div class="p-3 bg-light rounded">
                            ${(() => {
                                // Formatear fecha directamente desde la base de datos para evitar problemas de zona horaria
                                const fecha = new Date(cotizacion.fecha_vigencia);
                                const dia = fecha.getUTCDate().toString().padStart(2, '0');
                                const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
                                const año = fecha.getUTCFullYear();
                                return `${dia}/${mes}/${año}`;
                            })()}
                        </div>
                    </div>
                </div>
                ` : ''}
            `;
            
            // Llenar el contenido del modal
            document.getElementById('detalleCotizacionContent').innerHTML = contenidoHTML;
            
            // Configurar el botón "Ver Cotización Completa"
            const btnVerCotizacion = document.getElementById('btnVerCotizacion');
            btnVerCotizacion.onclick = function() {
                // Cerrar el modal
                $('#detalleCotizacionModal').modal('hide');
                
                // Determinar la URL correcta según el entorno
                let urlCotizacion;
                const hostname = window.location.hostname;
                
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    // Desarrollo local
                    urlCotizacion = `http://localhost:5500/Calculadora/frontend/cotizacion-compartida.html?id=${cotizacion.id}`;
                } else if (hostname.includes('testingbo.com')) {
                    // Staging/Testing
                    urlCotizacion = `https://universidad.tecmilenio.mx/cotizacion?id=${cotizacion.id}`;
                } else {
                    // Producción
                    urlCotizacion = `https://universidad.tecmilenio.mx/cotizacion?id=${cotizacion.id}`;
                }
                
                // Abrir la cotización completa en una nueva pestaña
                window.open(urlCotizacion, '_blank');
            };
            
            // Mostrar el modal
            $('#detalleCotizacionModal').modal('show');
        }
    };

    window.eliminarCotizacion = async function(id) {
        const confirmado = await window.tecConfirm('Se eliminará la cotización de forma permanente.');
        if (!confirmado) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cotizaciones/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar cotización');

            window.tecToast('Cotización eliminada');
            cargarCotizaciones();
        } catch (error) {
            console.error('Error al eliminar cotización:', error);
            window.tecToast('No se pudo eliminar la cotización', 'error');
        }
    };

    // Inicializar cuando se carga la página
    cargarNiveles();
    
    // Hacer las funciones disponibles globalmente para el botón de toggle
    window.cargarCotizaciones = cargarCotizaciones;
}); 