import { API_BASE_URL } from './apiConfig.js';

// Función principal que se ejecuta al cargar la página
async function inicializarCotizacion() {
    // Obtener el ID de la cotización de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cotizacionId = urlParams.get('id');
    
    // Si no hay ID, no hacer nada (flujo normal)
    if (!cotizacionId) {
        return;
    }

    try {
        // Mostrar loading mientras se cargan los datos
        mostrarLoading();
        
        // Cargar la cotización desde el backend
        const response = await fetch(`${API_BASE_URL}/cotizaciones/${cotizacionId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                mostrarError('La cotización no fue encontrada.');
            } else {
                mostrarError('Error al cargar la cotización.');
            }
            return;
        }

        const result = await response.json();
        
        if (!result.success) {
            mostrarError('Error al cargar la cotización.');
            return;
        }

        const cotizacion = result.data;
        
        // Mostrar información básica directamente en el DOM
        mostrarInformacionBasica(cotizacion);

        // Cargar datos en localStorage para mantener compatibilidad
        cargarDatosEnLocalStorage(cotizacion);
        
        // Ocultar loading
        ocultarLoading();
        
    } catch (error) {
        console.error('Error al cargar la cotización:', error);
        mostrarError('Error de conexión al cargar la cotización.');
        ocultarLoading();
    }
}

function mostrarInformacionBasica(cotizacion) {
    // Mapeo directo de los campos del backend a los elementos del DOM
    if (document.getElementById('nombre'))
        document.getElementById('nombre').textContent = cotizacion.nombre_estudiante || 'N/A';
    if (document.getElementById('nivel'))
        document.getElementById('nivel').textContent = cotizacion.nivel_nombre || 'N/A';
    if (document.getElementById('periodo'))
        document.getElementById('periodo').textContent = cotizacion.periodo || 'N/A';
    if (document.getElementById('campus'))
        document.getElementById('campus').textContent = cotizacion.campus || 'N/A';
    // Mapear programa a ambos elementos posibles
    if (document.getElementById('programa-fila1'))
        document.getElementById('programa-fila1').textContent = cotizacion.programa || 'fila1';
    if (document.getElementById('programa-fila2'))
        document.getElementById('programa-fila2').textContent = cotizacion.programa || 'fila2';
    // Mapear formato a ambos elementos posibles
    if (document.getElementById('formato-fila1'))
        document.getElementById('formato-fila1').textContent = cotizacion.formato || 'N/A';
    if (document.getElementById('formato-fila2'))
        document.getElementById('formato-fila2').textContent = cotizacion.formato || 'N/A';
    if (document.getElementById('certificados'))
        document.getElementById('certificados').textContent = cotizacion.certificados || 'N/A';
    if (document.getElementById('materias')) {
        document.getElementById('materias').textContent = mostrarEnteroSiEsDecimal(cotizacion.materias);
    }
    if (document.getElementById('semanas'))
        document.getElementById('semanas').textContent = cotizacion.semanas_sedi || 'N/A';
    if (document.getElementById('ingles'))
        document.getElementById('ingles').textContent = cotizacion.ingles || 'N/A';
}

function cargarDatosEnLocalStorage(cotizacion) {
    // Cargar todos los datos necesarios en localStorage para mantener compatibilidad
    // con la lógica existente de resultados.js
    
    // Datos básicos
    localStorage.setItem('nombreEstudiante', cotizacion.nombre_estudiante || '');
    localStorage.setItem('selectedNivel', cotizacion.nivel_id || '');
    localStorage.setItem('selectedCampus', cotizacion.campus || '');
    localStorage.setItem('selectedPeriodo', cotizacion.periodo || '');
    localStorage.setItem('selectedPrograma', cotizacion.programa || '');
    localStorage.setItem('selectedFormato', cotizacion.formato || '');
    
    // Datos académicos según nivel
    if (cotizacion.nivel_id === 13) {
        // Nivel 13: Sistema bimestral
        localStorage.setItem('certificados', cotizacion.certificados || 0);
        localStorage.setItem('semanasSEDI', cotizacion.semanas_sedi || 0);
    } else if (cotizacion.nivel_id === 4) {
        // Nivel 4: Certificados, semanas SEDI e inglés
        localStorage.setItem('certificados', cotizacion.certificados || 0);
        localStorage.setItem('semanasSEDI', cotizacion.semanas_sedi || 0);
        localStorage.setItem('ingles', cotizacion.ingles || 0);
    } else {
        // Otros niveles: materias
        localStorage.setItem('materias', cotizacion.materias || 0);
    }
    
    // Datos de costos y pagos
    localStorage.setItem('costoTotal', cotizacion.costo_total || 0);
    localStorage.setItem('totalContado', cotizacion.total_contado || 0);
    localStorage.setItem('primeraCuota', cotizacion.primera_cuota || 0);
    localStorage.setItem('mensualidades', cotizacion.mensualidades || 0);
    localStorage.setItem('totalFinanciado', cotizacion.total_financiado || 0);
    
    // Datos de beneficios
    if (cotizacion.beca_porcentaje > 0) {
        localStorage.setItem('becaPorcentaje', cotizacion.beca_porcentaje);
        localStorage.setItem('becaNombre', cotizacion.beca_nombre || 'Beca');
    }
    
    if (cotizacion.apoyo_estudiantil_porcentaje > 0) {
        localStorage.setItem('apoyoEstudiantilPorcentaje', cotizacion.apoyo_estudiantil_porcentaje);
    }
    
    if (cotizacion.apoyo_estudiantil_fijo > 0) {
        localStorage.setItem('apoyoEstudiantilFijo', cotizacion.apoyo_estudiantil_fijo);
    }
    
    if (cotizacion.prestamo_porcentaje > 0) {
        localStorage.setItem('prestamoPorcentaje', cotizacion.prestamo_porcentaje);
    }
    
    // Datos de seguros
    if (cotizacion.seguro_accidentes > 0) {
        localStorage.setItem('seguroAccidentes', cotizacion.seguro_accidentes);
    }
    
    if (cotizacion.seguro_estudiantil > 0) {
        localStorage.setItem('seguroEstudiantil', cotizacion.seguro_estudiantil);
    }
    
    if (cotizacion.cobertura_vive > 0) {
        localStorage.setItem('coberturaVive', cotizacion.cobertura_vive);
    }
    
    // Para nivel 13: datos de pagos bimestrales
    if (cotizacion.nivel_id === 13 && cotizacion.periodos_seleccionados) {
        localStorage.setItem('periodosSeleccionados', JSON.stringify(cotizacion.periodos_seleccionados));
        
        // Cargar totales por período si existen
        if (cotizacion.totales_por_periodo) {
            Object.keys(cotizacion.totales_por_periodo).forEach(codigo => {
                localStorage.setItem(`totalContado_${codigo}`, cotizacion.totales_por_periodo[codigo]);
            });
        }
    }
    
    // Marcar que los datos vienen del backend
    localStorage.setItem('datosDesdeBackend', 'true');
    localStorage.setItem('cotizacionId', cotizacion.id);
    
}

function mostrarLoading() {
    // Crear overlay de loading si no existe
    let loadingOverlay = document.getElementById('loading-overlay-cotizacion');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay-cotizacion';
        loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-4 text-gray-700">Cargando cotización...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
}

function ocultarLoading() {
    const loadingOverlay = document.getElementById('loading-overlay-cotizacion');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function mostrarError(mensaje) {
    // Crear notificación de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
    errorDiv.textContent = mensaje;
    document.body.appendChild(errorDiv);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function mostrarEnteroSiEsDecimal(valor) {
    if (typeof valor === 'string') valor = parseFloat(valor);
    return (typeof valor === 'number' && valor % 1 === 0) ? valor.toString() : valor;
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarCotizacion);
} else {
    inicializarCotizacion();
}

// Exportar funciones para uso en otros módulos
export { inicializarCotizacion, cargarDatosEnLocalStorage }; 