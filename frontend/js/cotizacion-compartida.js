// Importar API_BASE_URL del archivo de configuración
import { API_BASE_URL } from './apiConfig.js';

// Importar utilidades compartidas
import {
    formatearPesos,
    formatNumber,
    getCachedData,
    getFieldLabel,
    toggleFieldsByLevel,
    hideZeroPercentages,
    cargarBeneficios,
    cargarVigencia,
    agregarEstiloPorNivel,
    actualizarBeneficios
} from './utils/shared-utils.js';

// ===== FUNCIONES ESPECÍFICAS DE COTIZACIÓN COMPARTIDA =====

// Función para cargar apoyos y seguros específica para cotizaciones compartidas
function cargarApoyosYSeguros(cotizacion) {
    console.log('=== CARGANDO APOYOS Y SEGUROS ===');
    console.log('Datos de la cotización para apoyos:', cotizacion);
    
    // Apoyos financieros
    const becaElem = document.getElementById('beca');
    const apoyoEstudiantilElem = document.getElementById('apoyoEstudiantil');
    const apoyoEstudiantilFijoElem = document.getElementById('apoyoEstudiantilFijo');
    const prestamoPorcentajeElem = document.getElementById('prestamoPorcentaje');
    
    // Labels para ocultar/mostrar
    const labelBeca = document.getElementById('label-beca');
    const labelApoyoEstudiantil = document.getElementById('label-apoyoEstudiantil');
    const labelApoyoEstudiantilFijo = document.getElementById('label-apoyoEstudiantilFijo');
    const labelPrestamo = document.getElementById('label-prestamo');
    
    // Contenedor de apoyos
    const apoyosContainer = document.getElementById('apoyos');
    
    console.log('Elementos del DOM para apoyos:');
    console.log('becaElem:', becaElem);
    console.log('apoyoEstudiantilElem:', apoyoEstudiantilElem);
    console.log('apoyoEstudiantilFijoElem:', apoyoEstudiantilFijoElem);
    console.log('prestamoPorcentajeElem:', prestamoPorcentajeElem);
    
    // Beca
    if (becaElem) {
        const becaPorcentaje = parseFloat(cotizacion.beca_porcentaje) || 0;
        const becaNombre = cotizacion.beca_nombre || 'Sin Beca';
        
        if (becaPorcentaje > 0) {
            becaElem.textContent = `${becaPorcentaje}%`;
            if (labelBeca) labelBeca.classList.remove('hidden');
            console.log('Beca mostrada:', `${becaPorcentaje}%`);
        } else {
            becaElem.textContent = '0%';
            if (labelBeca) labelBeca.classList.add('hidden');
            console.log('Beca oculta (0%)');
        }
    }
    
    // Apoyo estudiantil porcentaje
    if (apoyoEstudiantilElem) {
        const apoyoPorcentaje = parseFloat(cotizacion.apoyo_estudiantil_porcentaje) || 0;
        
        if (apoyoPorcentaje > 0) {
            apoyoEstudiantilElem.textContent = `${apoyoPorcentaje}%`;
            if (labelApoyoEstudiantil) labelApoyoEstudiantil.classList.remove('hidden');
            console.log('Apoyo estudiantil % mostrado:', `${apoyoPorcentaje}%`);
        } else {
            apoyoEstudiantilElem.textContent = '0%';
            if (labelApoyoEstudiantil) labelApoyoEstudiantil.classList.add('hidden');
            console.log('Apoyo estudiantil % oculto (0%)');
        }
    }
    
    // Apoyo estudiantil fijo
    if (apoyoEstudiantilFijoElem) {
        const apoyoFijo = parseFloat(cotizacion.apoyo_estudiantil_fijo) || 0;
        
        if (apoyoFijo > 0) {
            apoyoEstudiantilFijoElem.textContent = formatearPesos(apoyoFijo);
            if (labelApoyoEstudiantilFijo) labelApoyoEstudiantilFijo.classList.remove('hidden');
            console.log('Apoyo estudiantil $ mostrado:', formatearPesos(apoyoFijo));
        } else {
            apoyoEstudiantilFijoElem.textContent = '$0.00';
            if (labelApoyoEstudiantilFijo) labelApoyoEstudiantilFijo.classList.add('hidden');
            console.log('Apoyo estudiantil $ oculto ($0.00)');
        }
    }
    
    // Préstamo porcentaje
    if (prestamoPorcentajeElem) {
        const prestamoPorcentaje = parseFloat(cotizacion.prestamo_porcentaje) || 0;
        
        if (prestamoPorcentaje > 0) {
            prestamoPorcentajeElem.textContent = `${prestamoPorcentaje}%`;
            if (labelPrestamo) labelPrestamo.classList.remove('hidden');
            console.log('Préstamo % mostrado:', `${prestamoPorcentaje}%`);
        } else {
            prestamoPorcentajeElem.textContent = '0%';
            if (labelPrestamo) labelPrestamo.classList.add('hidden');
            console.log('Préstamo % oculto (0%)');
        }
    }
    
    // Seguros
    const seguroAccidentesElem = document.getElementById('seguroAccidentes');
    const coberturaEstudiantilElem = document.getElementById('coberturaEstudiantil');
    const viveElem = document.getElementById('vive');
    const segurosContainer = document.getElementById('seguros');
    
    console.log('Elementos del DOM para seguros:');
    console.log('seguroAccidentesElem:', seguroAccidentesElem);
    console.log('coberturaEstudiantilElem:', coberturaEstudiantilElem);
    console.log('viveElem:', viveElem);
    
    // Seguro accidentes
    if (seguroAccidentesElem) {
        const seguroAccidentes = parseFloat(cotizacion.seguro_accidentes) || 0;
        
        if (seguroAccidentes > 0) {
            seguroAccidentesElem.textContent = formatearPesos(seguroAccidentes);
            console.log('Seguro accidentes mostrado:', formatearPesos(seguroAccidentes));
        } else {
            seguroAccidentesElem.textContent = 'No Aplica';
            console.log('Seguro accidentes: No Aplica');
        }
    }
    
    // Cobertura estudiantil
    if (coberturaEstudiantilElem) {
        const coberturaEstudiantil = parseFloat(cotizacion.seguro_estudiantil) || 0;
        
        if (coberturaEstudiantil > 0) {
            coberturaEstudiantilElem.textContent = formatearPesos(coberturaEstudiantil);
            console.log('Cobertura estudiantil mostrada:', formatearPesos(coberturaEstudiantil));
        } else {
            coberturaEstudiantilElem.textContent = 'No Aplica';
            console.log('Cobertura estudiantil: No Aplica');
        }
    }
    
    // Cobertura VIVE
    if (viveElem) {
        const coberturaVive = parseFloat(cotizacion.cobertura_vive) || 0;
        
        if (coberturaVive > 0) {
            viveElem.textContent = formatearPesos(coberturaVive);
            console.log('Cobertura VIVE mostrada:', formatearPesos(coberturaVive));
        } else {
            viveElem.textContent = 'No Aplica';
            console.log('Cobertura VIVE: No Aplica');
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
    
    console.log('Hay apoyos:', hayApoyos);
    console.log('Hay seguros:', haySeguros);
    
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
    
    console.log('=== FIN CARGANDO APOYOS Y SEGUROS ===');
    
    // Llamar a la función para ocultar porcentajes en cero
    hideZeroPercentages();
}

// Función principal para cargar la cotización
async function cargarCotizacion(cotizacionId) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorSection = document.getElementById('error-section');
    const basicInfoSection = document.getElementById('basic-info-section');
    const financialPlanSection = document.getElementById('financial-plan-section');
    
    console.log('=== INICIANDO CARGA DE COTIZACIÓN ===');
    console.log('ID de cotización:', cotizacionId);
    
    try {
        // Mostrar loading
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (errorSection) errorSection.style.display = 'none';
        if (basicInfoSection) basicInfoSection.style.display = 'none';
        if (financialPlanSection) financialPlanSection.style.display = 'none';
        
        // Obtener cotización del backend
        const cotizacion = await getCachedData(`cotizacion_${cotizacionId}`, async () => {
            console.log('Haciendo request al backend para cotización:', cotizacionId);
            const response = await fetch(`${API_BASE_URL}/cotizaciones/${cotizacionId}`);
            console.log('Respuesta del backend:', response.status, response.statusText);
            if (!response.ok) throw new Error('Cotización no encontrada');
            const result = await response.json();
            console.log('Datos recibidos del backend:', result);
            if (!result.success) throw new Error(result.message || 'Error al cargar cotización');
            return result.data;
        });
        
        console.log('Cotización cargada exitosamente:', cotizacion);
        

        
        // Llenar información básica
        const nombreElem = document.getElementById('nombre');
        const periodoElem = document.getElementById('periodo');
        const campusElem = document.getElementById('campus');
        const nivelElem = document.getElementById('nivel');
        const programaFila1Elem = document.getElementById('programa-fila1');
        const formatoFila1Elem = document.getElementById('formato-fila1');
        const programaFila2Elem = document.getElementById('programa-fila2');
        const formatoFila2Elem = document.getElementById('formato-fila2');
        
        if (nombreElem) nombreElem.textContent = cotizacion.nombre_estudiante || 'N/A';
        if (periodoElem) periodoElem.textContent = cotizacion.periodo || 'N/A';
        if (campusElem) campusElem.textContent = cotizacion.campus || 'N/A';
        if (nivelElem) nivelElem.textContent = cotizacion.nivel_nombre || 'N/A';
        if (programaFila1Elem) programaFila1Elem.textContent = cotizacion.programa || '';
        if (formatoFila1Elem) formatoFila1Elem.textContent = cotizacion.formato || '';
        // También llenar los elementos de la segunda fila con los mismos valores
        if (programaFila2Elem) programaFila2Elem.textContent = cotizacion.programa || '';
        if (formatoFila2Elem) formatoFila2Elem.textContent = cotizacion.formato || '';
        
        // Configurar campos según el nivel
        const nivelId = cotizacion.nivel_id;
        console.log('Nivel ID de la cotización:', nivelId);
        
        // Mejorar la organización de campos según el nivel
        organizarCamposPorNivel(nivelId, cotizacion);
        
        // Llenar campos académicos
        const materiasElem = document.getElementById('materias');
        const certificadosElem = document.getElementById('certificados');
        const semanasElem = document.getElementById('semanas');
        const inglesElem = document.getElementById('ingles');
        const creditosElem = document.getElementById('creditos');
        
        if (materiasElem) materiasElem.textContent = formatNumber(cotizacion.materias);
        if (certificadosElem) certificadosElem.textContent = formatNumber(cotizacion.certificados);
        if (semanasElem) semanasElem.textContent = formatNumber(cotizacion.semanas_sedi);
        if (inglesElem) inglesElem.textContent = formatNumber(cotizacion.ingles);
        if (creditosElem) creditosElem.textContent = formatNumber(cotizacion.creditos);
        
        // Actualizar label del campo principal
        const textMaterias = document.getElementById('text-materias');
        if (textMaterias) textMaterias.textContent = getFieldLabel(nivelId);
        
        // Cargar beneficios y vigencia
        const beneficios = await cargarBeneficios(nivelId);
        actualizarBeneficios(beneficios, nivelId);
        
        // Cargar vigencia usando la función compartida
        const vigenciaInfo = await cargarVigencia();
        const fechaVencimientoElem = document.getElementById('fechaVencimiento');
        if (fechaVencimientoElem) {
            fechaVencimientoElem.textContent = `Vigencia de la propuesta: ${vigenciaInfo.fechaVencimiento}`;
        }
        
        // Agregar estilos según el nivel usando la función compartida
        agregarEstiloPorNivel(nivelId);
        
        // Mostrar secciones
        if (basicInfoSection) basicInfoSection.style.display = 'block';
        if (financialPlanSection) financialPlanSection.style.display = 'block';
        
        console.log('Ejecutando lógica de visualización...');
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
        console.log('=== FIN CARGA DE COTIZACIÓN ===');
    }
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const cotizacionId = params.get('id');
    
    console.log('=== INICIANDO PÁGINA DE COTIZACIÓN COMPARTIDA ===');
    console.log('URL actual:', window.location.href);
    console.log('ID de cotización de la URL:', cotizacionId);
    
    // Verificar conectividad con el backend
    try {
        console.log('Verificando conectividad con el backend...');
        const testResponse = await fetch(`${API_BASE_URL}/cotizaciones`);
        console.log('Respuesta de prueba del backend:', testResponse.status, testResponse.statusText);
        if (testResponse.ok) {
            console.log('✅ Backend conectado correctamente');
        } else {
            console.log('⚠️ Backend responde pero con error:', testResponse.status);
        }
    } catch (error) {
        console.error('❌ Error de conectividad con el backend:', error);
    }
    
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
    
    // LOGS DE DEPURACIÓN
    console.log('=== DEPURACIÓN COTIZACIÓN COMPARTIDA ===');
    console.log('Datos de la cotización:', cotizacion);
    console.log('Nivel ID:', nivelId);
    console.log('Costo total:', cotizacion.costo_total);
    console.log('Total contado:', cotizacion.total_contado);
    console.log('Primera cuota:', cotizacion.primera_cuota);
    console.log('Total financiado:', cotizacion.total_financiado);
    console.log('Mensualidades:', cotizacion.mensualidades);
    
    // Llenar información financiera del plan de contado
    const colegiaturaElem = document.getElementById('colegiatura');
    const apoyoEducativoElem = document.getElementById('apoyoFinanciamiento');
    const totalContadoElem = document.getElementById('totalContado');
    
    console.log('Elementos del DOM encontrados:');
    console.log('colegiaturaElem:', colegiaturaElem);
    console.log('apoyoEducativoElem:', apoyoEducativoElem);
    console.log('totalContadoElem:', totalContadoElem);
    
    // Mostrar colegiatura (costo total sin descuento)
    if (colegiaturaElem) {
        colegiaturaElem.textContent = formatearPesos(cotizacion.costo_total || 0);
        console.log('Colegiatura actualizada:', formatearPesos(cotizacion.costo_total || 0));
    }
    
    // Mostrar apoyo educativo (descuento)
    if (apoyoEducativoElem) {
        const descuento = (cotizacion.costo_total || 0) - (cotizacion.total_contado || 0);
        console.log('Descuento calculado:', descuento);
        if (descuento > 0) {
            apoyoEducativoElem.textContent = `-${formatearPesos(descuento)}`;
            console.log('Apoyo educativo actualizado:', `-${formatearPesos(descuento)}`);
            if (apoyoEducativoElem.closest('tr')) {
                apoyoEducativoElem.closest('tr').style.display = '';
            }
        } else {
            if (apoyoEducativoElem.closest('tr')) {
                apoyoEducativoElem.closest('tr').style.display = 'none';
            }
            console.log('Apoyo educativo ocultado (sin descuento)');
        }
    }
    
    // Mostrar total contado
    if (totalContadoElem) {
        totalContadoElem.textContent = formatearPesos(cotizacion.total_contado || 0);
        console.log('Total contado actualizado:', formatearPesos(cotizacion.total_contado || 0));
    }
    
    // Llenar información del plan de financiamiento
    if (nivelId === 13) {
        console.log('Procesando nivel 13 - cargando pagos bimestrales');
        
        // Configurar overlay de loading para nivel 13
        const loadingOverlay = document.getElementById('loading-overlay');
        const financiamientoContent = document.getElementById('financiamiento-content');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            console.log('Overlay de loading mostrado para nivel 13');
        }
        if (financiamientoContent) {
            financiamientoContent.style.display = 'none';
            console.log('Contenido de financiamiento oculto para nivel 13');
        }
        
        // Para nivel 13, cargar pagos bimestrales especiales
        await cargarPagosBimestralesNivel13(cotizacion);
    } else {
        console.log('Procesando nivel', nivelId, '- cargando información estándar');
        
        // Para otros niveles, mostrar información estándar
        const primerPagoElem = document.getElementById('primerPago');
        const totalFinanciadoElem = document.getElementById('totalFinanciado');
        const mensualidadesText = document.getElementById('mensualidadesText');
        const mensualidades = document.getElementById('mensualidades');
        
        if (primerPagoElem) primerPagoElem.textContent = formatearPesos(cotizacion.primera_cuota || 0);
        if (totalFinanciadoElem) totalFinanciadoElem.textContent = formatearPesos(cotizacion.total_financiado || 0);
        
        // Mostrar mensualidades
        let textoMensualidades = '3 Mensualidades';
        if ([1, 2, 4].includes(nivelId)) {
            textoMensualidades = '4 Mensualidades';
        } else if (nivelId === 10) {
            textoMensualidades = '2 Mensualidades';
        }
        
        if (mensualidadesText) mensualidadesText.textContent = textoMensualidades;
        if (mensualidades) mensualidades.textContent = formatearPesos(cotizacion.mensualidades || 0);
        
        // Para otros niveles, mostrar el contenido de financiamiento y ocultar el loading
        const loadingOverlay = document.getElementById('loading-overlay');
        const financiamientoContent = document.getElementById('financiamiento-content');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            console.log('Overlay de loading oculto para nivel', nivelId);
        }
        if (financiamientoContent) {
            financiamientoContent.style.display = 'block';
            console.log('Contenido de financiamiento mostrado para nivel', nivelId);
        }
    }
    
    console.log('=== FIN DEPURACIÓN ===');
}

// Función para cargar pagos bimestrales del nivel 13
async function cargarPagosBimestralesNivel13(cotizacion) {
    console.log('=== INICIANDO CARGA DE PAGOS BIMESTRALES NIVEL 13 ===');
    console.log('Datos de la cotización para pagos:', cotizacion);
    
    try {
        // Obtener todos los pagos bimestrales del nivel 13
        const pagos = await getCachedData(`pagos_bimestrales_13`, async () => {
            console.log('Haciendo request para pagos bimestrales nivel 13');
            const response = await fetch(`${API_BASE_URL}/pagos-bimestrales/nivel/13`);
            console.log('Respuesta pagos bimestrales:', response.status, response.statusText);
            if (!response.ok) throw new Error('Error al cargar pagos bimestrales');
            const data = await response.json();
            console.log('Pagos bimestrales recibidos:', data);
            return data;
        });
        
        console.log('Pagos procesados:', pagos);
        
        // Obtener los períodos de la cotización
        const periodosCotizacion = cotizacion.periodo || '';
        console.log('Períodos de la cotización:', periodosCotizacion);
        
        // Obtener los códigos únicos de bimestres desde los pagos del backend
        const codigosUnicos = [...new Set(pagos.map(pago => pago.codigo))];
        console.log('Códigos únicos disponibles en el backend:', codigosUnicos);
        
        // Crear mapeo usando el campo 'mes' de los pagos bimestrales
        const mapeoMeses = {};
        pagos.forEach(pago => {
            if (pago.mes && pago.codigo) {
                mapeoMeses[pago.mes] = pago.codigo;
            }
        });
        console.log('Mapeo de meses desde pagos bimestrales:', mapeoMeses);
        
        // Parsear los períodos (pueden estar separados por comas)
        let codigosBimestres = [];
        if (periodosCotizacion.includes(',')) {
            // Múltiples períodos separados por comas
            const periodosArray = periodosCotizacion.split(',').map(p => p.trim());
            console.log('Períodos parseados:', periodosArray);
            
            codigosBimestres = periodosArray.map(periodo => mapeoMeses[periodo]).filter(codigo => codigo);
        } else {
            // Un solo período
            const codigo = mapeoMeses[periodosCotizacion];
            if (codigo) codigosBimestres = [codigo];
        }
        
        console.log('Códigos de bimestres a buscar:', codigosBimestres);
        
        // Filtrar pagos solo para los períodos seleccionados
        const pagosFiltrados = pagos.filter(pago => codigosBimestres.includes(pago.codigo));
        console.log('Pagos filtrados por períodos:', pagosFiltrados);
        
        if (pagosFiltrados.length === 0) {
            console.log('No hay pagos para los períodos seleccionados');
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
        const cantidadBimestres = codigosBimestresOrdenados.length;
        
        // Intentar obtener costos específicos por bimestre desde la base de datos
        let costosPorBimestre = {};
        try {
            console.log('Campo costos_por_bimestre en BD:', cotizacion.costos_por_bimestre);
            if (cotizacion.costos_por_bimestre) {
                costosPorBimestre = JSON.parse(cotizacion.costos_por_bimestre);
                console.log('Costos por bimestre parseados:', costosPorBimestre);
            } else {
                console.log('Campo costos_por_bimestre está vacío o no existe');
            }
        } catch (e) {
            console.log('No se pudieron parsear los costos por bimestre:', e);
        }
        
        // Usar el costo total (sin descuentos) dividido entre bimestres como fallback
        let costoPorBimestre = cantidadBimestres > 0 ? costoTotal / cantidadBimestres : 0;
        
        // Si no hay costos específicos en BD, recalcular usando el endpoint de costos
        if (Object.keys(costosPorBimestre).length === 0 && cotizacion.nivel_id === 13) {
            console.log('Recalculando costos usando endpoint...');
            await recalcularCostosPorBimestre(cotizacion, codigosBimestresOrdenados);
        }
        
        console.log('=== DEPURACIÓN COTIZACIÓN COMPARTIDA ===');
        console.log('Total contado (con descuentos):', totalContado);
        console.log('Costo total (sin descuentos):', costoTotal);
        console.log('Cantidad de bimestres:', cantidadBimestres);
        console.log('Costo por bimestre (fallback):', costoPorBimestre);
        console.log('Costos específicos por bimestre:', costosPorBimestre);
        console.log('Total seguros:', totalSeguros);
        
        // Obtener el descuento total para aplicarlo proporcionalmente
        const descuentoTotal = costoTotal - totalContado;
        const descuentoPorBimestre = cantidadBimestres > 0 ? descuentoTotal / cantidadBimestres : 0;
        
        console.log(`Descuento total: ${descuentoTotal}, descuento por bimestre: ${descuentoPorBimestre}`);
        
        // Array auxiliar para pagos con fecha
        const pagosConFechas = [];
        codigosBimestresOrdenados.forEach((codigo, bimestreIdx) => {
            // Obtener el costo total del bimestre específico
            // Usar costos recalculados si están disponibles, sino usar costos específicos de BD, sino usar el costo dividido equitativamente
            let costoBimestre = window.costosPorBimestreRecalculados?.[codigo] || costosPorBimestre[codigo] || costoPorBimestre;
            
            // APLICAR DESCUENTO AL COSTO DEL BIMESTRE
            const costoBimestreConDescuento = Math.max(0, costoBimestre - descuentoPorBimestre);
            
            console.log(`Bimestre ${codigo}: costo original = ${costoBimestre}, descuento aplicado = ${descuentoPorBimestre}, costo final = ${costoBimestreConDescuento}`);
            
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
                    console.log(`Bimestre ${codigo}, Pago ${idx + 1}: parcialidad=${parcialidad}, interés=${interes}, total=${totalParcialidad}`);
                } else {
                    console.log(`Bimestre ${codigo}, Pago ${idx + 1}: parcialidad=${parcialidad}, sin interés`);
                }
                
                // Agregar seguros completos al primer pago de cada bimestre (idx === 0)
                if (idx === 0 && totalSeguros > 0) {
                    totalParcialidad += totalSeguros;
                    console.log(`Bimestre ${codigo}, Pago ${idx + 1}: agregando TODOS los seguros=${totalSeguros}, total final=${totalParcialidad}`);
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
        });
        
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
        
        // Obtener las fechas únicas ordenadas
        const fechasUnicas = [...new Set(pagosConFechas.map(p => p.fecha))];
        const primeraFecha = fechasUnicas[0];
        const fechasRestantes = fechasUnicas.slice(1);
        
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
        if (primerPagoElem && pagosConFechas.length > 0) {
            primerPagoElem.textContent = formatearPesos(pagosConFechas[0].valor || 0);
        }
        
        // Mostrar solo las fechas restantes en mensualidades
        let pagosTextHtml = '';
        let pagosValorHtml = '';
        fechasRestantes.forEach(fecha => {
            pagosTextHtml += `<span>${fecha}</span><br>`;
            // Buscar el pago correspondiente a esta fecha
            const pagoEnFecha = pagosConFechas.find(p => p.fecha === fecha);
            pagosValorHtml += `<b>${formatearPesos(pagoEnFecha ? pagoEnFecha.valor : 0)}</b><br>`;
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
        
        console.log('=== FIN CARGA DE PAGOS BIMESTRALES NIVEL 13 ===');
        
    } catch (error) {
        console.error('Error al procesar pagos bimestrales:', error);
    }
} 

// Función para organizar campos según el nivel de manera más lógica
function organizarCamposPorNivel(nivelId, cotizacion) {
    console.log('=== ORGANIZANDO CAMPOS POR NIVEL ===');
    console.log('Nivel:', nivelId);
    console.log('Datos de la cotización:', cotizacion);
    
    // Obtener elementos del DOM
    const materiasContainer = document.getElementById('materias-container');
    const certificadosContainer = document.getElementById('certificados-container');
    const semanasContainer = document.getElementById('semanas-container');
    const inglesContainer = document.getElementById('ingles-container');
    const creditosContainer = document.getElementById('creditos-container');
    
    // Ocultar todos los contenedores primero
    if (materiasContainer) materiasContainer.style.display = 'none';
    if (certificadosContainer) certificadosContainer.classList.add('hidden');
    if (semanasContainer) semanasContainer.classList.add('hidden');
    if (inglesContainer) inglesContainer.classList.add('hidden');
    if (creditosContainer) creditosContainer.classList.add('hidden');
    
    // Mostrar campos según el nivel (misma lógica que resultados.js)
    if (nivelId === 4) {
        // Nivel 4: certificados, semanas SEDI e inglés
        if (certificadosContainer) certificadosContainer.classList.remove('hidden');
        if (semanasContainer) semanasContainer.classList.remove('hidden');
        if (inglesContainer) inglesContainer.classList.remove('hidden');
        console.log('Nivel 4: mostrando certificados, semanas SEDI e inglés');
    } else if (nivelId === 13) {
        // Nivel 13: certificados y semanas SEDI
        if (certificadosContainer) certificadosContainer.classList.remove('hidden');
        if (semanasContainer) semanasContainer.classList.remove('hidden');
        console.log('Nivel 13: mostrando certificados y semanas SEDI');
    } else if ([8, 9].includes(nivelId)) {
        // Niveles 8 y 9: créditos
        if (creditosContainer) creditosContainer.classList.remove('hidden');
        console.log(`Nivel ${nivelId}: mostrando créditos`);
    } else {
        // Resto de niveles: materias
        if (materiasContainer) materiasContainer.style.display = 'block';
        console.log(`Nivel ${nivelId}: mostrando materias`);
    }
    
    // Organizar la disposición visual según el nivel (misma lógica que resultados.js)
    const infoProgramaFila1 = document.querySelector('.info-programa-fila1');
    const infoProgramaFila2 = document.querySelector('.info-programa-fila2');
    const infoFormatoFila1 = document.querySelector('.info-formato-fila1');
    const infoFormatoFila2 = document.querySelector('.info-formato-fila2');
    
    // Verificar si hay campos adicionales visibles (misma lógica que resultados.js)
    const hayAcompananteSegundaFila = [
        certificadosContainer,
        semanasContainer,
        inglesContainer,
        creditosContainer
    ].some(el => el && !el.classList.contains('hidden') && el.style.display !== 'none');
    
    // Verificar si Formato tiene valor (misma lógica que resultados.js)
    const formatoVisible = (cotizacion.formato && cotizacion.formato !== 'N/A' && cotizacion.formato !== '');
    
    console.log('Hay acompañante segunda fila:', hayAcompananteSegundaFila);
    console.log('Formato visible:', formatoVisible);
    
    // Solo baja Programa si hay acompañante o formato visible (misma lógica que resultados.js)
    if (hayAcompananteSegundaFila || formatoVisible) {
        // Mover programa y formato a la segunda fila
        if (infoProgramaFila1) infoProgramaFila1.classList.add('hidden');
        if (infoProgramaFila2) infoProgramaFila2.classList.remove('hidden');
        
        if (formatoVisible) {
            if (infoFormatoFila1) infoFormatoFila1.classList.add('hidden');
            if (infoFormatoFila2) infoFormatoFila2.classList.remove('hidden');
        } else {
            if (infoFormatoFila1) infoFormatoFila1.classList.add('hidden');
            if (infoFormatoFila2) infoFormatoFila2.classList.add('hidden');
        }
        
        // Mover campos adicionales a la segunda fila cuando hay formato visible
        if (formatoVisible) {
            // Ocultar campos adicionales de la primera fila
            if (certificadosContainer) certificadosContainer.classList.add('hidden');
            if (semanasContainer) semanasContainer.classList.add('hidden');
            if (inglesContainer) inglesContainer.classList.add('hidden');
            if (creditosContainer) creditosContainer.classList.add('hidden');
            
            // Mostrar campos adicionales en la segunda fila
            const certificadosFila2Container = document.getElementById('certificados-fila2-container');
            const semanasFila2Container = document.getElementById('semanas-fila2-container');
            const inglesFila2Container = document.getElementById('ingles-fila2-container');
            const creditosFila2Container = document.getElementById('creditos-fila2-container');
            
            const certificadosFila2 = document.getElementById('certificados-fila2');
            const semanasFila2 = document.getElementById('semanas-fila2');
            const inglesFila2 = document.getElementById('ingles-fila2');
            const creditosFila2 = document.getElementById('creditos-fila2');
            
            // Mostrar certificados en segunda fila para niveles 4 y 13
            if (certificadosFila2Container && certificadosFila2 && (nivelId === 4 || nivelId === 13)) {
                certificadosFila2Container.classList.remove('hidden');
                certificadosFila2.textContent = formatNumber(cotizacion.certificados || 0);
            }
            
            // Mostrar semanas SEDI en segunda fila para niveles 4 y 13
            if (semanasFila2Container && semanasFila2 && (nivelId === 4 || nivelId === 13)) {
                semanasFila2Container.classList.remove('hidden');
                semanasFila2.textContent = formatNumber(cotizacion.semanas_sedi || 0);
            }
            
            // Mostrar inglés en segunda fila solo para nivel 4
            if (inglesFila2Container && inglesFila2 && nivelId === 4) {
                inglesFila2Container.classList.remove('hidden');
                inglesFila2.textContent = formatNumber(cotizacion.ingles || 0);
            }
            
            // Mostrar créditos en segunda fila para niveles 8 y 9
            if (creditosFila2Container && creditosFila2 && [8, 9].includes(nivelId)) {
                creditosFila2Container.classList.remove('hidden');
                creditosFila2.textContent = formatNumber(cotizacion.creditos || 0);
            }
        }
    } else {
        // Mantener programa en la primera fila
        if (infoProgramaFila1) infoProgramaFila1.classList.remove('hidden');
        if (infoProgramaFila2) infoProgramaFila2.classList.add('hidden');
        if (infoFormatoFila1) infoFormatoFila1.classList.add('hidden');
        if (infoFormatoFila2) infoFormatoFila2.classList.add('hidden');
        
        // Ocultar campos de la segunda fila
        const certificadosFila2Container = document.getElementById('certificados-fila2-container');
        const semanasFila2Container = document.getElementById('semanas-fila2-container');
        const inglesFila2Container = document.getElementById('ingles-fila2-container');
        const creditosFila2Container = document.getElementById('creditos-fila2-container');
        
        if (certificadosFila2Container) certificadosFila2Container.classList.add('hidden');
        if (semanasFila2Container) semanasFila2Container.classList.add('hidden');
        if (inglesFila2Container) inglesFila2Container.classList.add('hidden');
        if (creditosFila2Container) creditosFila2Container.classList.add('hidden');
    }
    
    // Actualizar el label del campo principal según el nivel
    const textMaterias = document.getElementById('text-materias');
    if (textMaterias) {
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
        
        const label = materiasPorNivel[nivelId] || 'Materias';
        textMaterias.textContent = label;
        console.log(`Label actualizado para nivel ${nivelId}: ${label}`);
    }
    
    console.log('=== FIN ORGANIZACIÓN DE CAMPOS ===');
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
            const numeroWhatsApp = '57'+numeroUsuario;
            
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
        console.log('=== RECALCULANDO COSTOS POR BIMESTRE ===');
        
        // Obtener costos base del nivel desde el endpoint
        const response = await fetch(`${API_BASE_URL}/costos/nivel/${cotizacion.nivel_id}`);
        if (!response.ok) {
            throw new Error(`Error al obtener costos: ${response.status}`);
        }
        
        const costosBase = await response.json();
        console.log('Costos base obtenidos:', costosBase);
        
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
                console.log(`Bimestre ${codigo}: buscando clave que contenga '${codigo}', costo por crédito = ${costoPorCredito}`);
                
                // Corregir la fórmula: (certificados × 10 × costo) + (semanas × 1 × costo)
                console.log('numeroCertificados', numeroCertificados);
                const costoCertificados = numeroCertificados * 10 * costoPorCredito;
                const costoSemanasSEDI = numeroSemanasSEDI * 1 * costoPorCredito;
                costoBimestre = costoCertificados + costoSemanasSEDI;
                
                console.log(`Bimestre ${codigo}: certificados=${numeroCertificados}×10×${costoPorCredito}=${costoCertificados}, semanas=${numeroSemanasSEDI}×1×${costoPorCredito}=${costoSemanasSEDI}, total=${costoBimestre}`);
            }
            
            // NO aplicar descuentos aquí porque ya están aplicados en total_contado de la BD
            // Los descuentos se aplican a nivel de cotización, no por bimestre individual
            
            costosPorBimestre[codigo] = Math.max(0, costoBimestre);
            console.log(`Bimestre ${codigo}: costo calculado = ${costoBimestre}`);
        });
        
        // Actualizar la variable global para que se use en los cálculos de pagos
        window.costosPorBimestreRecalculados = costosPorBimestre;
        
        console.log('Costos recalculados:', costosPorBimestre);
        console.log('=== FIN RECÁLCULO DE COSTOS ===');
        
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