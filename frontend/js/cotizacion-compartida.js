// Importar API_BASE_URL del archivo de configuración
import { API_BASE_URL } from './apiConfig.js';

// Importar utilidades compartidas
import {
    formatearPesos,
    formatNumber,
    getCachedData,
    cargarBeneficios,
    actualizarBeneficios,
    cargarVigencia,
    agregarEstiloPorNivel,
    hideZeroPercentages
} from './utils/shared-utils.js';

// Función helper para parsear JSON de manera segura
function parseJSONSafely(data) {
    if (!data) return null;
    if (typeof data === 'object') return data;
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Error al parsear JSON:', e);
            return null;
        }
    }
    return null;
}

// Variable global para almacenar los niveles obtenidos desde la API
let niveles = [];

// Función para cargar niveles desde la API
async function cargarNiveles() {
    try {
        const response = await fetch(`${API_BASE_URL}/nivel`);
        if (!response.ok) {
            throw new Error('Error al obtener niveles');
        }
        const data = await response.json();
        niveles = data;
    } catch (error) {
        console.error('Error al cargar niveles:', error);
        // Usar array de respaldo si falla la API
        niveles = [
            { id: 1, descripcion: 'Preparatoria Semestral' },
            { id: 2, descripcion: 'Profesional Semestral' },
            { id: 3, descripcion: 'Preparatoria Tetramestral' },
            { id: 4, descripcion: 'Profesional Semestral MAPS' },
            { id: 5, descripcion: 'Profesional Asociado' },
            { id: 6, descripcion: 'Ejecutivo' },
            { id: 7, descripcion: 'Maestría y Especialidades' },
            { id: 8, descripcion: 'Master' },
            { id: 9, descripcion: 'MLP Connect' },
            { id: 10, descripcion: 'MEDU+' },
            { id: 11, descripcion: 'MLP Presencial' },
            { id: 12, descripcion: 'Connect Presencial Matutino' },
            { id: 13, descripcion: 'Ejecutivo  Bimestral MAPS' }
        ];
    }
}

// ===== FUNCIONES ESPECÍFICAS DE COTIZACIÓN COMPARTIDA =====

// Cargar niveles al inicio
cargarNiveles();

// Función para cargar apoyos y seguros específica para cotizaciones compartidas
function cargarApoyosYSeguros(cotizacion) {
    // Apoyos financieros
    const becaElem = document.getElementById('beca');
    const apoyoEstudiantilElem = document.getElementById('apoyoEstudiantil');
    const apoyoEstudiantilFijoElem = document.getElementById('apoyoEstudiantilFijo');
    const prestamoPorcentajeElem = document.getElementById('prestamoPorcentaje');
    const apoyoFinancieroElem = document.getElementById('apoyoFinanciero');
    
    // Labels para ocultar/mostrar
    const labelBeca = document.getElementById('label-beca');
    const labelApoyoEstudiantil = document.getElementById('label-apoyoEstudiantil');
    const labelApoyoEstudiantilFijo = document.getElementById('label-apoyoEstudiantilFijo');
    const labelPrestamo = document.getElementById('label-prestamo');
    
    // Contenedor de apoyos
    const apoyosContainer = document.getElementById('apoyos');
    
    // Mostrar nombre de la beca en apoyoFinanciero (igual que en resultados.js)
    if (apoyoFinancieroElem) {
        const becaNombre = cotizacion.beca_nombre || 'Apoyo estudiantil';
        if (becaNombre && becaNombre !== 'N/A' && becaNombre !== 'null') {
            apoyoFinancieroElem.textContent = becaNombre;
        } else {
            apoyoFinancieroElem.textContent = 'Apoyo estudiantil';
        }
    }
    
    // Beca
    if (becaElem) {
        const becaPorcentaje = parseFloat(cotizacion.beca_porcentaje) || 0;
        const becaNombre = cotizacion.beca_nombre || 'Sin Beca';
        
        if (becaPorcentaje > 0) {
            becaElem.textContent = `${becaPorcentaje}%`;
            if (labelBeca) labelBeca.classList.remove('hidden');
        } else {
            becaElem.textContent = '0%';
            if (labelBeca) labelBeca.classList.add('hidden');
        }
    }
    
    // Apoyo estudiantil porcentaje
    if (apoyoEstudiantilElem) {
        const apoyoPorcentaje = parseFloat(cotizacion.apoyo_estudiantil_porcentaje) || 0;
        
        if (apoyoPorcentaje > 0) {
            apoyoEstudiantilElem.textContent = `${apoyoPorcentaje}%`;
            if (labelApoyoEstudiantil) labelApoyoEstudiantil.classList.remove('hidden');
        } else {
            apoyoEstudiantilElem.textContent = '0%';
            if (labelApoyoEstudiantil) labelApoyoEstudiantil.classList.add('hidden');
        }
    }
    
    // Apoyo estudiantil fijo
    if (apoyoEstudiantilFijoElem) {
        const apoyoFijo = parseFloat(cotizacion.apoyo_estudiantil_fijo) || 0;
        
        if (apoyoFijo > 0) {
            apoyoEstudiantilFijoElem.textContent = formatearPesos(apoyoFijo);
            if (labelApoyoEstudiantilFijo) labelApoyoEstudiantilFijo.classList.remove('hidden');
        } else {
            apoyoEstudiantilFijoElem.textContent = '$0.00';
            if (labelApoyoEstudiantilFijo) labelApoyoEstudiantilFijo.classList.add('hidden');
        }
    }
    
    // Préstamo porcentaje
    if (prestamoPorcentajeElem) {
        const prestamoPorcentaje = parseFloat(cotizacion.prestamo_porcentaje) || 0;
        
        if (prestamoPorcentaje > 0) {
            prestamoPorcentajeElem.textContent = `${prestamoPorcentaje}%`;
            if (labelPrestamo) labelPrestamo.classList.remove('hidden');
        } else {
            prestamoPorcentajeElem.textContent = '0%';
            if (labelPrestamo) labelPrestamo.classList.add('hidden');
        }
    }
    
    // Seguros
    const seguroAccidentesElem = document.getElementById('seguroAccidentes');
    const coberturaEstudiantilElem = document.getElementById('coberturaEstudiantil');
    const viveElem = document.getElementById('vive');
    const segurosContainer = document.getElementById('seguros');
    
    // Seguro accidentes
    if (seguroAccidentesElem) {
        const seguroAccidentes = parseFloat(cotizacion.seguro_accidentes) || 0;
        
        if (seguroAccidentes > 0) {
            seguroAccidentesElem.textContent = formatearPesos(seguroAccidentes);
        } else {
            seguroAccidentesElem.textContent = 'No Aplica';
        }
    }
    
    // Cobertura estudiantil
    if (coberturaEstudiantilElem) {
        const coberturaEstudiantil = parseFloat(cotizacion.seguro_estudiantil) || 0;
        
        if (coberturaEstudiantil > 0) {
            coberturaEstudiantilElem.textContent = formatearPesos(coberturaEstudiantil);
        } else {
            coberturaEstudiantilElem.textContent = 'No Aplica';
        }
    }
    
    // Cobertura VIVE
    if (viveElem) {
        const coberturaVive = parseFloat(cotizacion.cobertura_vive) || 0;
        
        if (coberturaVive > 0) {
            viveElem.textContent = formatearPesos(coberturaVive);
        } else {
            viveElem.textContent = 'No Aplica';
        }
    }
    
    // Ocultar contenedores si no hay información
    const hayApoyos = (parseFloat(cotizacion.beca_porcentaje) || 0) > 0 || 
                     (parseFloat(cotizacion.apoyo_estudiantil_porcentaje) || 0) > 0 || 
                     (parseFloat(cotizacion.apoyo_estudiantil_fijo) || 0) > 0 || 
                     (parseFloat(cotizacion.prestamo_porcentaje) || 0) > 0;
    
    const haySeguros = (parseFloat(cotizacion.seguro_accidentes) || 0) > 0 || 
                      (parseFloat(cotizacion.seguro_estudiantil) || 0) > 0 || 
                      (parseFloat(cotizacion.cobertura_vive) || 0) > 0;
    
    if (apoyosContainer) {
        if (hayApoyos) {
            apoyosContainer.style.display = 'block';
        } else {
            apoyosContainer.style.display = 'none';
        }
    }
    
    if (segurosContainer) {
        if (haySeguros) {
            segurosContainer.style.display = 'block';
        } else {
            segurosContainer.style.display = 'none';
        }
    }
    
    // Ocultar toda la sección "Tu plan incluye" si no hay nada que mostrar
    const planContainer = document.getElementById('plan');
    if (planContainer) {
        if (hayApoyos || haySeguros) {
            planContainer.style.display = 'flex';
        } else {
            planContainer.style.display = 'none';
        }
    }
    
    // Llamar a la función para ocultar porcentajes en cero
    hideZeroPercentages();
}

// Función principal para cargar la cotización
async function cargarCotizacion(cotizacionId) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorSection = document.getElementById('error-section');
    const basicInfoSection = document.getElementById('basic-info-section');
    const financialPlanSection = document.getElementById('financial-plan-section');
    try {
        // Mostrar loading
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (errorSection) errorSection.style.display = 'none';
        if (basicInfoSection) basicInfoSection.style.display = 'none';
        if (financialPlanSection) financialPlanSection.style.display = 'none';
        
        // Obtener cotización del backend
        const cotizacion = await getCachedData(`cotizacion_${cotizacionId}`, async () => {
            const response = await fetch(`${API_BASE_URL}/cotizaciones/${cotizacionId}`);
            if (!response.ok) throw new Error('Cotización no encontrada');
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'Error al cargar cotización');
            return result.data;
        });
        
        // Configurar campos según el nivel
        const nivelId = cotizacion.nivel_id;
        
        // Organizar y llenar información básica dinámicamente
        organizarCamposPorNivel(nivelId, cotizacion);
        
        // Cargar beneficios y vigencia
        const beneficios = await cargarBeneficios(cotizacion.nivel_id);
        actualizarBeneficios(beneficios, cotizacion.nivel_id);
        
        // Mostrar fecha de vigencia guardada en la cotización
        const fechaVencimientoElem = document.getElementById('fechaVencimiento');
        if (fechaVencimientoElem) {
            if (cotizacion.fecha_vigencia) {
                // Usar la fecha de vigencia guardada en la cotización
                // Formatear fecha directamente desde la base de datos para evitar problemas de zona horaria
                const fechaVigencia = new Date(cotizacion.fecha_vigencia);
                const dia = fechaVigencia.getUTCDate().toString().padStart(2, '0');
                const mes = (fechaVigencia.getUTCMonth() + 1).toString().padStart(2, '0');
                const año = fechaVigencia.getUTCFullYear();
                const fechaVigenciaFormateada = `${dia}/${mes}/${año}`;
                fechaVencimientoElem.textContent = `Vigencia de la propuesta: ${fechaVigenciaFormateada}`;
            } else {
                // Fallback: calcular dinámicamente si no hay fecha guardada
                const vigenciaInfo = await cargarVigencia();
                fechaVencimientoElem.textContent = `Vigencia de la propuesta: ${vigenciaInfo.fechaVencimiento}`;
            }
        }
        
        // Agregar estilos según el nivel usando la función compartida
        agregarEstiloPorNivel(nivelId);
        
        // Mostrar secciones
        if (basicInfoSection) basicInfoSection.style.display = 'block';
        if (financialPlanSection) financialPlanSection.style.display = 'block';
        
        // Ejecutar la lógica de visualización con datos del backend
        await ejecutarLogicaVisualizacion(cotizacion);
        
        // Cargar apoyos y seguros después de la lógica de visualización
        cargarApoyosYSeguros(cotizacion);
        
    } catch (error) {
        console.error('Error al cargar cotización:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.textContent = error.message;
        if (errorSection) errorSection.style.display = 'block';
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
    document.querySelector('body').style.display = "block";
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar niveles al inicio
    await cargarNiveles();
    const params = new URLSearchParams(window.location.search);
    const cotizacionId = params.get('id');
    
    if (!cotizacionId) {
        const errorMessage = document.getElementById('error-message');
        const errorSection = document.getElementById('error-section');
        const loadingOverlay = document.getElementById('loading-overlay');
        
        if (errorMessage) errorMessage.textContent = 'No se proporcionó un ID de cotización válido';
        if (errorSection) errorSection.style.display = 'block';
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        return;
    }
    
    // Cargar la cotización
    cargarCotizacion(cotizacionId);
});

// Función para limpiar cache (útil para debugging)
window.limpiarCache = () => {
    cache.clear();
};

// Función para recargar cotización
window.recargarCotizacion = () => {
    const params = new URLSearchParams(window.location.search);
    const cotizacionId = params.get('id');
    if (cotizacionId) {
        cache.delete(`cotizacion_${cotizacionId}`);
        cargarCotizacion(cotizacionId);
    }
}; 

// Función para ejecutar la lógica de visualización con datos del backend
async function ejecutarLogicaVisualizacion(cotizacion) {
    const nivelId = cotizacion.nivel_id;
    
    // Llenar información financiera del plan de contado
    const colegiaturaElem = document.getElementById('colegiatura');
    const apoyoEducativoElem = document.getElementById('apoyoFinanciamiento');
    const totalContadoElem = document.getElementById('totalContado');
    const totalContadoTextElem = document.getElementById('totalContadoText');
    
    // Verificar si hay descuento real
    // Verificar si hay cualquier tipo de descuento: beca, apoyo estudiantil, o finalAmount
    const hayBeca = cotizacion.beca_porcentaje && parseFloat(cotizacion.beca_porcentaje) > 0;
    const hayApoyoEstudiantil = cotizacion.apoyo_estudiantil_porcentaje && parseFloat(cotizacion.apoyo_estudiantil_porcentaje) > 0;
    const hayApoyoFijo = cotizacion.apoyo_estudiantil_fijo && parseFloat(cotizacion.apoyo_estudiantil_fijo) > 0;
    const hayFinalAmount = cotizacion.finalAmount && parseFloat(cotizacion.finalAmount) > 0;
    
    const hayDescuento = hayBeca || hayApoyoEstudiantil || hayApoyoFijo || hayFinalAmount;
    
    // Mostrar colegiatura (costo total sin descuento)
    if (colegiaturaElem) {
        if (hayDescuento) {
            colegiaturaElem.textContent = formatearPesos(cotizacion.costo_total || 0);
            colegiaturaElem.closest('tr').style.display = '';
        } else {
            colegiaturaElem.closest('tr').style.display = 'none';
        }
    }
    
    // Mostrar apoyo educativo (descuento)
    if (apoyoEducativoElem) {
        let descuentoTotal = 0;
        const costoTotal = parseFloat(cotizacion.costo_total) || 0;
        
        // Para nivel 13, calcular descuento dinámicamente usando los porcentajes guardados
        if (nivelId === 13) {
            // Calcular descuento basado en los porcentajes guardados en la BD
            const becaPorcentaje = parseFloat(cotizacion.beca_porcentaje) || 0;
            const apoyoPorcentaje = parseFloat(cotizacion.apoyo_estudiantil_porcentaje) || 0;
            const apoyoFijo = parseFloat(cotizacion.apoyo_estudiantil_fijo) || 0;
            
            // Aplicar descuentos sobre el costo total original
            let descuentoBeca = 0;
            let descuentoApoyo = 0;
            
            if (becaPorcentaje > 0) {
                descuentoBeca = costoTotal * (becaPorcentaje / 100);
            }
            
            if (apoyoPorcentaje > 0) {
                descuentoApoyo = costoTotal * (apoyoPorcentaje / 100);
            }
            
            descuentoTotal = descuentoBeca + descuentoApoyo + apoyoFijo;
        } else {
            // Para otros niveles, usar la diferencia entre costo_total y total_contado
            const totalContado = parseFloat(cotizacion.total_contado) || 0;
            descuentoTotal = costoTotal - totalContado;
        }
        
        const esCero = descuentoTotal <= 0 || Math.abs(descuentoTotal) < 0.000001;
        let tr = apoyoEducativoElem.closest('tr');
        if (!tr && apoyoEducativoElem.parentElement && apoyoEducativoElem.parentElement.parentElement && apoyoEducativoElem.parentElement.parentElement.tagName === 'TR') {
            tr = apoyoEducativoElem.parentElement.parentElement;
        }
        if (!esCero) {
            apoyoEducativoElem.textContent = `-${formatearPesos(descuentoTotal)}`;
            if (tr) {
                tr.style.display = '';
            }
        } else {
            if (tr) {
                tr.style.display = 'none';
            }
        }
    }
    
    // Ocultar línea separadora cuando no hay descuento
    const lineaSeparadora = document.querySelector('tr td[colspan="2"] hr');
    if (lineaSeparadora) {
        const trSeparadora = lineaSeparadora.closest('tr');
        if (trSeparadora) {
            if (!hayDescuento) {
                trSeparadora.style.display = 'none';
            } else {
                trSeparadora.style.display = '';
            }
        }
    }
    
    // Mostrar total contado (incluyendo seguros)
    if (totalContadoElem) {
        let totalContadoFinal = parseFloat(cotizacion.total_contado) || 0;
        
        // Para nivel 13, recalcular total contado con descuentos aplicados dinámicamente
        if (nivelId === 13) {
            const costoTotal = parseFloat(cotizacion.costo_total) || 0;
            const becaPorcentaje = parseFloat(cotizacion.beca_porcentaje) || 0;
            const apoyoPorcentaje = parseFloat(cotizacion.apoyo_estudiantil_porcentaje) || 0;
            const apoyoFijo = parseFloat(cotizacion.apoyo_estudiantil_fijo) || 0;
            
            // Calcular descuento total
            let descuentoTotal = 0;
            if (becaPorcentaje > 0) {
                descuentoTotal += costoTotal * (becaPorcentaje / 100);
            }
            if (apoyoPorcentaje > 0) {
                descuentoTotal += costoTotal * (apoyoPorcentaje / 100);
            }
            descuentoTotal += apoyoFijo;
            
            // Total contado = costo total - descuentos + seguros
            const totalSeguros = parseFloat(cotizacion.total_seguros) || 0;
            totalContadoFinal = costoTotal - descuentoTotal + totalSeguros;
        }
        
        totalContadoElem.textContent = formatearPesos(totalContadoFinal);
    }
    
    // Cambiar el texto del label según si hay descuento
    if (totalContadoTextElem) {
        if (!hayDescuento) {
            // Mantener el formato de la hoja de colegiatura.
            totalContadoTextElem.textContent = 'Colegiatura total';
        } else {
            totalContadoTextElem.textContent = 'Colegiatura total';
        }
    }
    
    // Llenar información del plan de financiamiento
    if (nivelId === 13) {
        
        // Configurar overlay de loading para nivel 13
        const loadingOverlay = document.getElementById('loading-overlay');
        const financiamientoContent = document.getElementById('financiamiento-content');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        if (financiamientoContent) {
            financiamientoContent.style.display = 'none';
        }
        
        // Para nivel 13, cargar pagos bimestrales especiales
        await cargarPagosBimestralesNivel13(cotizacion);
    } else {
        
        // Para otros niveles, mostrar información estándar
        const primerPagoElem = document.getElementById('primerPago');
        const totalFinanciadoElem = document.getElementById('totalFinanciado');
        const mensualidadesText = document.getElementById('mensualidadesText');
        const mensualidades = document.getElementById('mensualidades');
        
        if (primerPagoElem) primerPagoElem.textContent = formatearPesos(cotizacion.primera_cuota || 0);
        if (totalFinanciadoElem) totalFinanciadoElem.textContent = formatearPesos(cotizacion.total_financiado || 0);
        
        // Mostrar mensualidades
        let textoMensualidades = '3 mensualidades posteriores';
        if ([1, 2, 4].includes(nivelId)) {
            textoMensualidades = '4 mensualidades posteriores';
        } else if (nivelId === 10) {
            textoMensualidades = '2 mensualidades posteriores';
        }
        
        if (mensualidadesText) mensualidadesText.textContent = textoMensualidades;
        if (mensualidades) mensualidades.textContent = formatearPesos(cotizacion.mensualidades || 0);
        
        // Para otros niveles, mostrar el contenido de financiamiento y ocultar el loading
        const loadingOverlay = document.getElementById('loading-overlay');
        const financiamientoContent = document.getElementById('financiamiento-content');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        if (financiamientoContent) {
            financiamientoContent.style.display = 'block';
        }
    }
}

// Función para cargar pagos bimestrales del nivel 13
async function cargarPagosBimestralesNivel13(cotizacion) {
    try {
        // Obtener todos los pagos bimestrales del nivel 13
        const pagos = await getCachedData(`pagos_bimestrales_13`, async () => {
            const response = await fetch(`${API_BASE_URL}/pagos-bimestrales/nivel/13`);
            if (!response.ok) throw new Error('Error al cargar pagos bimestrales');
            const data = await response.json();
            return data;
        });
        
        // Obtener los períodos de la cotización
        const periodosCotizacion = cotizacion.periodo || '';
        
        // Obtener los códigos únicos de bimestres desde los pagos del backend
        const codigosUnicos = [...new Set(pagos.map(pago => pago.codigo))];
        
        // Crear mapeo usando el campo 'mes' de los pagos bimestrales
        const mapeoMeses = {};
        pagos.forEach(pago => {
            if (pago.mes && pago.codigo) {
                mapeoMeses[pago.mes] = pago.codigo;
            }
        });
        
        // Parsear los períodos (pueden estar separados por comas)
        let codigosBimestres = [];
        if (periodosCotizacion.includes(',')) {
            // Múltiples períodos separados por comas
            const periodosArray = periodosCotizacion.split(',').map(p => p.trim());
            
            codigosBimestres = periodosArray.map(periodo => mapeoMeses[periodo]).filter(codigo => codigo);
        } else {
            // Un solo período
            const codigo = mapeoMeses[periodosCotizacion];
            if (codigo) codigosBimestres = [codigo];
        }
        
        // Filtrar pagos solo para los períodos seleccionados
        const pagosFiltrados = pagos.filter(pago => codigosBimestres.includes(pago.codigo));
        
        if (pagosFiltrados.length === 0) {
            // Mostrar mensaje de error o fallback
            const mensualidadesText = document.getElementById('mensualidadesText');
            const mensualidades = document.getElementById('mensualidades');
            const primerPagoElem = document.getElementById('primerPago');
            const totalFinanciadoElem = document.getElementById('totalFinanciado');
            
            if (mensualidadesText) mensualidadesText.innerHTML = '<span>No hay pagos disponibles</span>';
            if (mensualidades) mensualidades.innerHTML = '<b>$0.00</b>';
            if (primerPagoElem) primerPagoElem.textContent = '$0.00';
            if (totalFinanciadoElem) totalFinanciadoElem.textContent = '$0.00';
            
            // Mostrar el contenido de financiamiento y ocultar el loading
            const loadingOverlay = document.getElementById('loading-overlay');
            const financiamientoContent = document.getElementById('financiamiento-content');
            
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            if (financiamientoContent) financiamientoContent.style.display = 'block';
            
            return;
        }
        
        // Agrupar pagos por bimestre (código)
        const pagosPorBimestre = {};
        pagosFiltrados.forEach(pago => {
            if (!pagosPorBimestre[pago.codigo]) {
                pagosPorBimestre[pago.codigo] = [];
            }
            pagosPorBimestre[pago.codigo].push(pago);
        });
        
        // Ordenar los pagos dentro de cada bimestre por orden de pago
        Object.keys(pagosPorBimestre).forEach(codigo => {
            pagosPorBimestre[codigo].sort((a, b) => a.pago_orden - b.pago_orden);
        });
        
        // Ordenar los códigos de bimestre según el orden de selección
        let codigosBimestresOrdenados = codigosBimestres.slice();
        
        // Procesar pagos por bimestre en el orden correcto
        let totalPagos = 0;
        let totalSeguros = 0;
        try {
            totalSeguros = parseFloat(cotizacion.total_seguros) || 0;
        } catch (e) { totalSeguros = 0; }
        let totalContado = parseFloat(cotizacion.total_contado) || 0;
        let costoTotal = parseFloat(cotizacion.costo_total) || 0;
        
        // NO SUMAR SEGUROS AQUÍ - ya están incluidos en total_contado de la BD
        const cantidadBimestres = codigosBimestresOrdenados.length;
        
        // Intentar obtener costos específicos por bimestre desde la base de datos
        let costosPorBimestre = parseJSONSafely(cotizacion.costos_por_bimestre) || {};
        // console.log('Costos por bimestre desde BD:', costosPorBimestre);
        // console.log('Códigos de bimestres ordenados:', codigosBimestresOrdenados);
        
        // Obtener el descuento total para aplicarlo proporcionalmente
        // Para nivel 13, calcular descuento dinámicamente usando los porcentajes guardados
        let finalAmount = 0;
        const becaPorcentaje = parseFloat(cotizacion.beca_porcentaje) || 0;
        const apoyoPorcentaje = parseFloat(cotizacion.apoyo_estudiantil_porcentaje) || 0;
        const apoyoFijo = parseFloat(cotizacion.apoyo_estudiantil_fijo) || 0;
        
        // Calcular descuento total dinámicamente
        if (becaPorcentaje > 0) {
            finalAmount += costoTotal * (becaPorcentaje / 100);
        }
        if (apoyoPorcentaje > 0) {
            finalAmount += costoTotal * (apoyoPorcentaje / 100);
        }
        finalAmount += apoyoFijo;
        
        // Obtener porcentajes individuales
        const prestamoPorcentaje = parseFloat(cotizacion.prestamo_porcentaje) || 0;
        
        // Array auxiliar para pagos con fecha
        const pagosConFechas = [];
        
        // Función para procesar los pagos de un bimestre
        function procesarPagosBimestre(codigo, costoBimestre) {
            // Calcular descuento por bimestre según la fórmula del Excel
            // Fórmula: (costoBimestre × beca%) + (costoBimestre × apoyo%) + (costoBimestre × préstamo%) + (apoyoFijo / cantidadBimestres)
            const descuentoBeca = costoBimestre * (becaPorcentaje / 100);
            const descuentoApoyo = costoBimestre * (apoyoPorcentaje / 100);
            const descuentoPrestamo = costoBimestre * (prestamoPorcentaje / 100);
            const apoyoFijoPorBimestre = cantidadBimestres > 0 ? apoyoFijo / cantidadBimestres : 0;
            
            const descuentoBimestreCalculado = descuentoBeca + descuentoApoyo + descuentoPrestamo + apoyoFijoPorBimestre;
            
            // APLICAR DESCUENTO AL COSTO DEL BIMESTRE (método del Excel)
            const costoBimestreConDescuento = Math.max(0, costoBimestre - descuentoBimestreCalculado);
            
            const pagosBimestre = pagosPorBimestre[codigo] || [];
            pagosBimestre.forEach((pago, idx) => {
                const porcentaje = parseFloat(pago.porcentaje_parcialidad) / 100;
                let parcialidad = costoBimestreConDescuento * porcentaje;
                let interes = 0;
                let totalParcialidad = parcialidad;
                
                // Aplicar interés solo al primer pago del bimestre (idx === 0)
                if (idx === 0 && parseFloat(pago.porcentaje_interes) > 0) {
                    // El interés se calcula sobre el costo total del bimestre CON DESCUENTO
                    interes = costoBimestreConDescuento * (parseFloat(pago.porcentaje_interes) / 100);
                    totalParcialidad += interes;
                }
                // Agregar seguros completos al primer pago de cada bimestre (idx === 0)
                if (idx === 0 && totalSeguros > 0) {
                    totalParcialidad += totalSeguros;
                }
                
                // Asignar la fecha correcta a cada pago
                if (pago.fecha_vencimiento) {
                    const fecha = new Date(pago.fecha_vencimiento);
                    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    pagosConFechas.push({ fecha: fechaFormateada, valor: totalParcialidad, bimestre: codigo, orden: pago.pago_orden });
                } else {
                    pagosConFechas.push({ fecha: `Pago ${pago.pago_orden}`, valor: totalParcialidad, bimestre: codigo, orden: pago.pago_orden });
                }
                totalPagos += totalParcialidad;
            });
        }
        
        // Procesar todos los bimestres
        for (let i = 0; i < codigosBimestresOrdenados.length; i++) {
            const codigo = codigosBimestresOrdenados[i];
            let costoBimestre = costosPorBimestre[codigo];
            
            // Si no hay costo específico del bimestre, recalcular usando las configuraciones por período
            if (costoBimestre === undefined || costoBimestre === 0) {
                try {
                    // Obtener costos base del nivel desde el endpoint
                    const response = await fetch(`${API_BASE_URL}/costos/nivel/${cotizacion.nivel_id}`);
                    const costosMateria = await response.json();
                    
                    // Obtener configuraciones por período desde el backend
                    let configuracionesPorPeriodo = parseJSONSafely(cotizacion.configuraciones_por_periodo) || {};
                    console.log('Configuraciones por período desde BD:', configuracionesPorPeriodo);
                    
                    // Obtener la configuración específica para este bimestre
                    const configPeriodo = configuracionesPorPeriodo[codigo];
                    if (configPeriodo) {
                        // Calcular créditos para este bimestre específico usando las configuraciones guardadas
                        const numeroCertificados = parseInt(configPeriodo.certificados) || 0;
                        const numeroSemanasSEDI = parseInt(configPeriodo.semanas) || 0;
                        const totalCreditos = (numeroCertificados * 10) + (numeroSemanasSEDI * 1);
                        
                        // Buscar el costo usando solo el código del período
                        const costoPeriodo = costosMateria.find(item => item.clave.includes(codigo))?.costo || 0;
                        
                        // Calcular el costo del bimestre
                        costoBimestre = totalCreditos * costoPeriodo;
                        
                        console.log(`Bimestre ${codigo}:`, {
                            certificados: numeroCertificados,
                            semanas: numeroSemanasSEDI,
                            creditos: totalCreditos,
                            costoPeriodo: costoPeriodo,
                            costoBimestre: costoBimestre
                        });
                    } else {
                        // Si no hay configuración específica, usar fallback
                        const totalContadoSinSeguros = totalContado - totalSeguros;
                        costoBimestre = cantidadBimestres > 0 ? totalContadoSinSeguros / cantidadBimestres : 0;
                    }

                } catch (error) {
                    console.error('Error al recalcular costos:', error);
                    // Fallback: usar totalContado dividido
                    const totalContadoSinSeguros = totalContado - totalSeguros;
                    costoBimestre = cantidadBimestres > 0 ? totalContadoSinSeguros / cantidadBimestres : 0;
                }
            }
            
            // Procesar los pagos de este bimestre
            procesarPagosBimestre(codigo, costoBimestre);
        }
        
        // Ordenar pagos por fecha y luego por orden dentro de la misma fecha
        pagosConFechas.sort((a, b) => {
            // Si ambas fechas son válidas, ordenar por fecha
            if (a.fecha.includes('/') && b.fecha.includes('/')) {
                const fechaA = new Date(a.fecha.split('/').reverse().join('-'));
                const fechaB = new Date(b.fecha.split('/').reverse().join('-'));
                if (fechaA.getTime() !== fechaB.getTime()) {
                    return fechaA - fechaB;
                }
            }
            // Si están en la misma fecha, ordenar por orden de pago
            return a.orden - b.orden;
        });
        
        // Agrupar pagos por fecha (CORRECCIÓN: igual que en resultados.js)
        const pagosAgrupados = {};
        pagosConFechas.forEach(pago => {
            if (!pagosAgrupados[pago.fecha]) {
                pagosAgrupados[pago.fecha] = 0;
            }
            pagosAgrupados[pago.fecha] += pago.valor;
        });
        
        // Obtener las fechas ordenadas cronológicamente
        const fechasOrdenadas = Object.keys(pagosAgrupados).sort((a, b) => {
            // Convertir fechas de formato DD/MM/YYYY a objetos Date para comparación
            const fechaA = new Date(a.split('/').reverse().join('-'));
            const fechaB = new Date(b.split('/').reverse().join('-'));
            return fechaA - fechaB;
        });
        const primeraFecha = fechasOrdenadas[0];
        const fechasRestantes = fechasOrdenadas.slice(1);
        
        // Cambiar el texto "Primer pago" por la primera fecha
        const primerPagoElem = document.getElementById('primerPago');
        if (primerPagoElem) {
            const primerPagoRow = primerPagoElem.closest('tr');
            if (primerPagoRow) {
                const primerPagoLabel = primerPagoRow.querySelector('td:first-child p');
                if (primerPagoLabel && primerPagoLabel.textContent.includes('Primer pago')) {
                    primerPagoLabel.textContent = primeraFecha;
                }
            }
        }
        
        // Mostrar el valor del primer pago (primer pago de la lista ordenada)
        if (primerPagoElem && fechasOrdenadas.length > 0) {
            primerPagoElem.textContent = formatearPesos(pagosAgrupados[primeraFecha] || 0);
        }
        
        // Mostrar solo las fechas restantes en mensualidades
        let pagosTextHtml = '';
        let pagosValorHtml = '';
        fechasRestantes.forEach(fecha => {
            pagosTextHtml += `<span>${fecha}</span><br>`;
            pagosValorHtml += `<b>${formatearPesos(pagosAgrupados[fecha])}</b><br>`;
        });
        
        const mensualidadesText = document.getElementById('mensualidadesText');
        const mensualidades = document.getElementById('mensualidades');
        const totalFinanciadoElem = document.getElementById('totalFinanciado');
        
        if (mensualidadesText) mensualidadesText.innerHTML = pagosTextHtml;
        if (mensualidades) mensualidades.innerHTML = pagosValorHtml;
        if (totalFinanciadoElem) totalFinanciadoElem.textContent = formatearPesos(totalPagos);
        
        // Mostrar el contenido de financiamiento y ocultar el loading
        const loadingOverlay = document.getElementById('loading-overlay');
        const financiamientoContent = document.getElementById('financiamiento-content');
        
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (financiamientoContent) financiamientoContent.style.display = 'block';
        
    } catch (error) {
        console.error('Error al procesar pagos bimestrales:', error);
    }
} 

// Función para organizar campos automáticamente según el nivel
function organizarCamposPorNivel(nivelId, cotizacion) {
    const infoGrid = document.getElementById('info-grid');
    if (!infoGrid) {
        console.error('No se encontró el contenedor info-grid');
        return;
    }
    
    // Limpiar el grid
    infoGrid.innerHTML = '';
    
    // Función para formatear números
    function formatearNumero(valor) {
        if (valor === null || valor === undefined || valor === '') return 'N/A';
        
        // Convertir a string y limpiar
        let valorStr = valor.toString().trim();
        
        // Si ya es un string que termina en .00, convertirlo a entero
        if (valorStr.endsWith('.00')) {
            valorStr = valorStr.replace('.00', '');
        }
        
        const num = parseFloat(valorStr);
        if (isNaN(num)) return valorStr;
        
        // Si es un número entero, devolver como string sin decimales
        if (Number.isInteger(num)) {
            return num.toString();
    }
    
        // Si es decimal, mostrar con 2 decimales
        return num.toFixed(2);
    }
    
    // Definir los campos base que siempre se muestran
    const camposBase = [
        { id: 'nombre', label: 'Nombre', valor: cotizacion.nombre_estudiante || 'N/A' }
    ];
    
    // Agregar programa y formato si tienen valor (después del nombre)
    if (cotizacion.programa && cotizacion.programa !== 'N/A' && cotizacion.programa !== '') {
        camposBase.push({ id: 'programa', label: 'Programa', valor: cotizacion.programa });
    }
    
    if (cotizacion.formato && cotizacion.formato !== 'N/A' && cotizacion.formato !== '') {
        camposBase.push({ id: 'formato', label: 'Formato', valor: cotizacion.formato });
        }
        
    // Agregar periodo (después de programa y formato)
    camposBase.push({ id: 'periodo', label: 'Periodo', valor: cotizacion.periodo || 'N/A' });
    
    // Agregar nivel solo para niveles que no sean 4 ni 13 (después del periodo)
    if (nivelId !== 4 && nivelId !== 13) {
        // Buscar el nombre del nivel en el array de niveles
        const nivel = niveles.find(n => n.id_nivel == nivelId || n.id == nivelId || n.id == parseInt(nivelId));
        const nivelNombre = nivel ? nivel.descripcion : `Nivel ${nivelId}`;
        camposBase.push({ id: 'nivel', label: 'Nivel', valor: nivelNombre });
    }
    
    // Agregar campus (después del nivel)
    camposBase.push({ id: 'campus', label: 'Campus', valor: cotizacion.campus || 'N/A' });
            
    // Definir campos adicionales según el nivel (unidades)
    let camposAdicionales = [];
    
    if (nivelId === 4) {
        // Nivel 4: certificados, semanas SEDI e inglés
        camposAdicionales = [
            { id: 'certificados', label: 'Certificados', valor: formatearNumero(cotizacion.certificados) },
            { id: 'semanas', label: 'Semanas de Desarrollo Integral', valor: formatearNumero(cotizacion.semanas_sedi) },
            { id: 'ingles', label: 'Certificados de inglés', valor: formatearNumero(cotizacion.ingles) }
        ];
    } else if (nivelId === 13) {
        // Nivel 13: certificados y semanas SEDI
        camposAdicionales = [
            { id: 'certificados', label: 'Certificados', valor: formatearNumero(cotizacion.certificados) },
            { id: 'semanas', label: 'Semanas de Desarrollo Integral', valor: formatearNumero(cotizacion.semanas_sedi) }
        ];
    } else if ([5, 8, 9].includes(nivelId)) {
        // Niveles 5, 8, 9: certificados
        camposAdicionales = [
            { id: 'certificados', label: 'Certificados', valor: formatearNumero(cotizacion.certificados) }
        ];
    } else {
        // Resto de niveles: materias
        const materiasLabel = getMateriasLabel(nivelId);
        camposAdicionales = [
            { id: 'materias', label: materiasLabel, valor: formatearNumero(cotizacion.materias) }
        ];
    }
    
    // Función auxiliar para obtener el label correcto según el nivel
    function getMateriasLabel(nivelId) {
        const materiasPorNivel = {
            1: 'Materias',
            2: 'Créditos',
            3: 'Materias',
            4: 'Certificados',
            5: 'Certificados',
            6: 'Créditos',
            7: 'Materias',
            8: 'Certificados',
            9: 'Certificados',
            10: 'Créditos',
            11: 'Materias',
            12: 'Materias',
            13: 'Certificados'
        };
        
        return materiasPorNivel[nivelId] || 'Materias';
    }
    
    // Combinar todos los campos
    const todosLosCampos = [...camposBase, ...camposAdicionales];

    // Determinar la organización del grid
    const totalCampos = todosLosCampos.length;
    let gridClasses = '';
    
    if (totalCampos <= 6) {
        // Una sola fila: distribuir uniformemente
        if (totalCampos <= 2) {
            gridClasses = 'grid-cols-1 md:grid-cols-2';
        } else if (totalCampos <= 3) {
            gridClasses = 'grid-cols-1 md:grid-cols-3';
        } else if (totalCampos <= 4) {
            gridClasses = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
        } else if (totalCampos <= 6) {
            gridClasses = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
        }
    } else {
        // Dos filas: primeros 4 en la primera fila, resto en la segunda
        gridClasses = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
    
    // Aplicar las clases del grid
    infoGrid.className = `grid ${gridClasses} gap-4`;
    
    // Crear y agregar los elementos
    todosLosCampos.forEach((campo, index) => {
        const campoElement = crearElementoCampo(campo, index, totalCampos);
        infoGrid.appendChild(campoElement);
    });

}

// Función auxiliar para crear un elemento de campo
function crearElementoCampo(campo, index, totalCampos) {
    
    const div = document.createElement('div');
    div.className = 'px-4 grow lg:w-auto';
    
    const htmlContent = `
        <p class="text-[19px] leading-[27px] text-secondary-color-2 font-bold mb-2">${campo.label}</p>
        <p id="${campo.id}" class="text-[21px] leading-[29px]">${campo.valor}</p>
    `;
    
    div.innerHTML = htmlContent;
    
    return div;
} 

// Función para enviar cotización por WhatsApp
window.enviarWhatsApp = function() {
    // Obtener el ID de la cotización desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cotizacionId = urlParams.get('id');
    
    if (cotizacionId) {
        // Crear URL de la cotización compartible
        const urlCotizacion = `${window.location.origin}/Calculadora/frontend/cotizacion-compartida.html?id=${cotizacionId}`;
        const mensaje = `Hola, aquí tienes tu cotización de Tecmilenio: ${urlCotizacion}`;
        const mensajeCodificado = encodeURIComponent(mensaje);
        
        // Mostrar el modal para ingresar número
        const modal = document.getElementById('modal-whatsapp');
        const input = document.getElementById('input-numero-whatsapp');
        const error = document.getElementById('error-numero-whatsapp');
        modal.classList.add('visible');
        input.value = '';
        error.classList.add('hidden');
        input.focus();
    } else {
        alert('Error: No se encontró el ID de la cotización');
    }
};

// Listeners para el modal de WhatsApp
document.addEventListener('DOMContentLoaded', function() {
    const btnCerrar = document.getElementById('btn-cerrar-whatsapp');
    const btnEnviar = document.getElementById('btn-enviar-whatsapp');
    const input = document.getElementById('input-numero-whatsapp');
    const error = document.getElementById('error-numero-whatsapp');
    const modal = document.getElementById('modal-whatsapp');
    
    if (btnCerrar) {
        btnCerrar.onclick = function() {
            modal.classList.remove('visible');
        };
    }
    
    if (btnEnviar) {
        btnEnviar.onclick = function() {
            let numeroUsuario = input.value.replace(/\D/g, '');
            if (numeroUsuario.length !== 10) {
                error.classList.remove('hidden');
                return;
            }
            error.classList.add('hidden');
            // Lada de México (52); el número capturado es de 10 dígitos
            const numeroWhatsApp = '52'+numeroUsuario;
            
            // Obtener el ID de la cotización desde la URL
            const urlParams = new URLSearchParams(window.location.search);
            const cotizacionId = urlParams.get('id');
            
            let mensaje;
            if (cotizacionId) {
                const urlCotizacion = `${window.location.origin}/Calculadora/frontend/cotizacion-compartida.html?id=${cotizacionId}`;
                mensaje = `Hola, aquí tienes tu cotización de Tecmilenio: ${urlCotizacion}`;
            } else {
                mensaje = 'Hola, aquí tienes tu cotización de Tecmilenio.';
            }
            
            const mensajeCodificado = encodeURIComponent(mensaje);
            const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
            window.open(urlWhatsApp, '_blank');
            modal.classList.remove('visible');
        };
    }
}); 

// Función para recalcular costos por bimestre usando el endpoint
async function recalcularCostosPorBimestre(cotizacion, codigosBimestresOrdenados) {
    try {
        
        // Obtener costos base del nivel desde el endpoint
        const response = await fetch(`${API_BASE_URL}/costos/nivel/${cotizacion.nivel_id}`);
        if (!response.ok) {
            throw new Error(`Error al obtener costos: ${response.status}`);
        }
        
        const costosBase = await response.json();
        
        // Calcular costos por bimestre usando la misma lógica que en step1.js
        const costosPorBimestre = {};
        
        codigosBimestresOrdenados.forEach((codigo, index) => {
            let costoBimestre = 0;
            
            // Calcular costo base según el nivel
            if (cotizacion.nivel_id === 13) {
                // Nivel 13: certificados y semanas SEDI (misma lógica que step1.js)
                const numeroCertificados = parseInt(cotizacion.certificados) || 0;
                const numeroSemanasSEDI = parseInt(cotizacion.semanas_sedi) || 0;
                const totalCreditos = (numeroCertificados * 10) + (numeroSemanasSEDI * 1);
                
                // Generar la clave correcta para este bimestre (misma lógica que step1.js)
                // Usar el primer bimestre como referencia para generar la clave
                const periodKey = codigo;
                const planKey = 'SUP'; // Plan por defecto para nivel 13
                const campusKey = 'Normal'; // Campus por defecto
                const claveFinal = `${periodKey}${planKey}${campusKey}`;
                
                // Buscar el costo usando solo el código del período dentro de la clave
                const costoPorCredito = costosBase.find(c => c.clave.includes(codigo))?.costo || 0;
                
                const costoCertificados = numeroCertificados * 10 * costoPorCredito;
                const costoSemanasSEDI = numeroSemanasSEDI * 1 * costoPorCredito;
                costoBimestre = costoCertificados + costoSemanasSEDI;
            }
            
            // NO aplicar descuentos aquí porque ya están aplicados en total_contado de la BD
            // Los descuentos se aplican a nivel de cotización, no por bimestre individual
            
            costosPorBimestre[codigo] = Math.max(0, costoBimestre);
        });
        
        // Actualizar la variable global para que se use en los cálculos de pagos
        window.costosPorBimestreRecalculados = costosPorBimestre;
        
        return costosPorBimestre;
        
    } catch (error) {
        console.error('Error al recalcular costos:', error);
        // Fallback: usar costo dividido equitativamente
        const costoPorBimestre = cotizacion.total_contado / codigosBimestresOrdenados.length;
        const costosFallback = {};
        codigosBimestresOrdenados.forEach(codigo => {
            costosFallback[codigo] = costoPorBimestre;
        });
        window.costosPorBimestreRecalculados = costosFallback;
        return costosFallback;
    }
}
