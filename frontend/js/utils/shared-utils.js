// Utilidades compartidas para la calculadora de Tecmilenio
// Este archivo contiene funciones reutilizables entre resultados.js y cotizacion-compartida.js

import { API_BASE_URL } from '../apiConfig.js';

// ===== NIVELES BIMESTRALES MAPS =====
// Niveles con comportamiento "bimestral MAPS": costo por créditos (certificados + semana
// SEDI), selección de múltiples bimestres y pagos bimestrales. 13 = Ejecutivo Bimestral MAPS,
// 15 = Posgrados MAPS. Centralizado para no dispersar IDs por todo el código.
export const NIVELES_BIMESTRAL_MAPS = [13, 15];
export function esNivelBimestralMaps(nivelId) {
    return NIVELES_BIMESTRAL_MAPS.includes(Number(nivelId));
}

// Créditos por certificado en el cálculo bimestral. Posgrados MAPS (15) = 1 crédito/cert
// (colegiatura = certificados × $14,990). El resto de niveles (13, etc.) = 10, SIN cambios.
// La tabla `certificados` no almacena este valor (PENDIENTE-FASE3: debería venir del admin).
export function creditosPorCertificado(nivelId) {
    return Number(nivelId) === 15 ? 1 : 10;
}

// ===== FUNCIONES DE FORMATEO =====

/**
 * Formatea un número como moneda mexicana
 * @param {number} numero - Número a formatear
 * @returns {string} Número formateado como moneda
 */
export function formatearPesos(numero) {
    return parseFloat(numero).toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Formatea un número, convirtiendo a entero si es posible
 * @param {number|string} num - Número a formatear
 * @returns {number} Número formateado
 */
export function formatNumber(num) {
    return num % 1 === 0 ? parseInt(num) : parseFloat(num);
}

/**
 * Convierte a entero si termina en .00
 * @param {number} num - Número a procesar
 * @returns {number} Número procesado
 */
export function toIntIfPossible(num) {
    return (typeof num === 'number' && num % 1 === 0) ? parseInt(num) : num;
}

/**
 * Muestra entero si es decimal
 * @param {number|string} valor - Valor a procesar
 * @returns {string} Valor procesado
 */
export function mostrarEnteroSiEsDecimal(valor) {
    if (typeof valor === 'string') valor = parseFloat(valor);
    return (typeof valor === 'number' && valor % 1 === 0) ? valor.toString() : valor;
}

// ===== FUNCIONES DE CACHE =====

/**
 * Sistema de cache simple para evitar llamadas repetidas al backend
 * @param {string} key - Clave del cache
 * @param {Function} fetchFunction - Función que obtiene los datos
 * @returns {Promise<any>} Datos del cache o del backend
 */
export async function getCachedData(key, fetchFunction) {
    const cached = sessionStorage.getItem(key);
    if (cached) {
        return JSON.parse(cached);
    }
    const data = await fetchFunction();
    sessionStorage.setItem(key, JSON.stringify(data));
    return data;
}

// ===== FUNCIONES DE UTILIDAD PARA NIVELES =====

/**
 * Obtiene la etiqueta del campo según el nivel
 * @param {number} nivelId - ID del nivel
 * @returns {string} Etiqueta del campo
 */
export function getFieldLabel(nivelId) {
    const labels = {
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
    return labels[nivelId] || 'Materias';
}

/**
 * Alterna la visibilidad de campos según el nivel
 * @param {number} nivelId - ID del nivel
 */
export function toggleFieldsByLevel(nivelId) {
    const materiasContainer = document.getElementById('materias-container');
    const certificadosContainer = document.getElementById('certificados-container');
    const semanasContainer = document.getElementById('semanas-container');
    const inglesContainer = document.getElementById('ingles-container');

    if (nivelId === 4 || esNivelBimestralMaps(nivelId)) {
        if (materiasContainer) materiasContainer.style.display = 'none';
        if (certificadosContainer) certificadosContainer.classList.remove('hidden');
        if (semanasContainer) semanasContainer.classList.remove('hidden');
        if (inglesContainer && nivelId === 4) inglesContainer.classList.remove('hidden');
    } else {
        if (materiasContainer) materiasContainer.style.display = 'block';
        if (certificadosContainer) certificadosContainer.classList.add('hidden');
        if (semanasContainer) semanasContainer.classList.add('hidden');
        if (inglesContainer) inglesContainer.classList.add('hidden');
    }
}

// ===== FUNCIONES DE APOYOS Y SEGUROS =====

/**
 * Clasifica un seguro por su nombre en el tipo canónico que usa el flujo:
 * 'vive' | 'accidente' | 'colegiatura' | 'otro'. El bloque "Seguro de accidentes"
 * del paso 3 agrupa 'accidente' + 'otro' (premium, gastos médicos, etc.), así que
 * cualquier catálogo que agregue el admin cae en un grupo sin tocar código.
 * Fuente única compartida entre step3.js (motor de selección) y resultado-doc.js
 * (desglose de la Hoja de Resultados) para que el itemizado coincida con lo elegido.
 * @param {Object} seguro - Fila de seguro del backend (usa nombre_seguro)
 * @returns {'vive'|'accidente'|'colegiatura'|'otro'}
 */
export function clasificarSeguro(seguro) {
    const n = (seguro && seguro.nombre_seguro || '').toLowerCase();
    if (n.includes('vive')) return 'vive';
    if (n.includes('accidente')) return 'accidente';
    // En la BD la "Cobertura de Colegiatura" del PDF se llama "Cobertura Estudiantil".
    if (n.includes('colegiatura') || n.includes('estudiantil')) return 'colegiatura';
    return 'otro';
}

/**
 * Oculta elementos con valores de 0%
 */
export function hideZeroPercentages() {
    const elementBeca = document.getElementById('beca');
    const elementLabelBeca = document.getElementById('label-beca');

    const elementApoyo = document.getElementById('apoyoEstudiantil');
    const elementLabelApoyo = document.getElementById('label-apoyoEstudiantil');

    const elementApoyoFijo = document.getElementById('apoyoEstudiantilFijo');
    const elementLabelApoyoFijo = document.getElementById('label-apoyoEstudiantilFijo');

    const elementPrestamo = document.getElementById('prestamoPorcentaje');
    const elementLabelPrestamo = document.getElementById('label-prestamo');

    const apoyos = document.getElementById('apoyos');

    if (elementBeca && elementBeca.innerText === '0%') {
        elementBeca.classList.add('hidden');
        if (elementLabelBeca) elementLabelBeca.classList.add('hidden');
    }

    if (elementApoyo && elementApoyo.innerText === '0%') {
        elementApoyo.classList.add('hidden');
        if (elementLabelApoyo) elementLabelApoyo.classList.add('hidden');
    }

    if (elementApoyoFijo && elementApoyoFijo.innerText === '$0.00') {
        elementApoyoFijo.classList.add('hidden');
        if (elementLabelApoyoFijo) elementLabelApoyoFijo.classList.add('hidden');
    }

    if (elementPrestamo && elementPrestamo.innerText === '0%') {
        elementPrestamo.classList.add('hidden');
        if (elementLabelPrestamo) elementLabelPrestamo.classList.add('hidden');
    }

    // Ocultar contenedor de apoyos si todos los valores son 0
    if (apoyos && 
        (elementBeca && elementBeca.innerText === '0%') && 
        (elementApoyo && elementApoyo.innerText === '0%') && 
        (elementPrestamo && elementPrestamo.innerText === '0%') && 
        (elementApoyoFijo && elementApoyoFijo.innerText === '$0.00')) {
        apoyos.style.display = 'none';
    }

    const plan = document.getElementById('plan');
    const seguros = document.getElementById('seguros');

    // Ocultar toda la sección "Tu plan incluye" si no hay apoyos ni seguros
    if (plan && apoyos && seguros) {
        if (getComputedStyle(apoyos).display === 'none' && getComputedStyle(seguros).display === 'none') {
            plan.style.display = 'none';
        } else {
            plan.style.display = 'flex';
        }
    }
}

// ===== FUNCIONES DE CÁLCULO =====

/**
 * Calcula el total financiado según el nivel
 * @param {Object} valores - Objeto con valores de la cotización
 * @param {number} levelId - ID del nivel
 * @returns {number} Total financiado
 */
export function calcularTotalFinanciado(valores, levelId) {
    let factorMultiplicador = 3;
    if (levelId === 1 || levelId === 2 || levelId === 4) {
        factorMultiplicador = 4;
    } else if (levelId === 10) {
        factorMultiplicador = 2;
    }
    return (
        (parseFloat(valores.interesDividido.replace(/[^0-9.-]+/g, "")) || 0) * factorMultiplicador +
        (parseFloat(valores.primeraCuota.replace(/[^0-9.-]+/g, "")) || 0)
    );
}

// ===== FUNCIONES DE CARGA DE DATOS =====

/**
 * Carga beneficios desde el backend
 * @param {number} nivelId - ID del nivel
 * @returns {Promise<Array>} Array de beneficios
 */
export async function cargarBeneficios(nivelId) {
    try {
        const response = await fetch(`${API_BASE_URL}/beneficios/nivel/${nivelId}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al cargar beneficios:', error);
        return [];
    }
}

/**
 * Carga información de vigencia desde el backend
 * @returns {Promise<Object>} Información de vigencia
 */
export async function cargarVigencia() {
    try {
        const response = await fetch(`${API_BASE_URL}/configuracion-vigencia/dias-vigencia`);
        const data = await response.json();
        
        const fechaActual = new Date();
        const fechaVencimiento = new Date(fechaActual);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + data.dias_vigencia);
        
        const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const fechaVencimientoFormateada = fechaVencimiento.toLocaleDateString('es-ES', opcionesFormato);
        
        return {
            diasVigencia: data.dias_vigencia,
            fechaVencimiento: fechaVencimientoFormateada
        };
    } catch (error) {
        console.error('Error al cargar vigencia:', error);
        // Fallback a 5 días si hay error
        const fechaActual = new Date();
        const fechaVencimiento = new Date(fechaActual);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);
        const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const fechaVencimientoFormateada = fechaVencimiento.toLocaleDateString('es-ES', opcionesFormato);
        
        return {
            diasVigencia: 5,
            fechaVencimiento: fechaVencimientoFormateada
        };
    }
}

// ===== FUNCIONES DE ESTILOS =====

/**
 * Agrega estilos específicos según el nivel
 * @param {number} levelId - ID del nivel
 */
export function agregarEstiloPorNivel(levelId) {
    const styleMap = {
        2: 'css/style-universidad.css',
        4: 'css/style-universidad.css',
        5: 'css/style-profesional-asociado.css',
        6: 'css/style-universidad.css',
        7: 'css/style-universidad.css',
        8: 'css/style-universidad.css',
        9: 'css/style-icbi.css',
        10: 'css/style-universidad.css',
        11: 'css/style-icbi.css',
        12: 'css/style-universidad.css',
        13: 'css/style-universidad.css',
        15: 'css/style-universidad.css',
    };

    if (styleMap[levelId]) {
        const estiloHref = styleMap[levelId];

        if (!document.querySelector('link[href="' + estiloHref + '"]')) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = estiloHref;
            document.head.appendChild(linkElement);
        }
    }
}

// ===== FUNCIONES DE TÍTULOS Y BENEFICIOS =====

/**
 * Obtiene el título según el nivel
 * @param {number} nivel - ID del nivel
 * @returns {string} Título del nivel
 */
export function getTituloPorNivel(nivel) {
    const titulos = {
        1: 'Impulsa tu futuro desde hoy',
        3: 'Avanza con determinación hacia tu futuro profesional',
        2: 'Encuentra una carrera pensada para ti',
        4: 'Encuentra una carrera diseñada para ti',
        5: 'Logra más con una carrera diseñada para tu desarrollo como profesionista',
        6: 'Encuentra una carrera ejecutiva diseñada a tu medida',
        7: 'Invierte en una educación para crecer como persona y como profesionista',
        8: 'Invierte en una educación para crecer como persona y como profesionista',
        9: 'Crece como líder para transformar a tu equipo y tu entorno',
        10: 'Invierte en una educación para crecer como persona y como profesionista',
        11: 'Crece como líder para transformar a tu equipo y tu entorno',
        12: 'Invierte en una educación para crecer como persona y como profesionista',
        13: 'Encuentra una carrera ejecutiva diseñada a tu medida',
        15: 'Encuentra una carrera ejecutiva diseñada a tu medida',
    };
    return titulos[nivel] || 'N/A';
}

/**
 * Actualiza los beneficios en el DOM
 * @param {Array} beneficios - Array de beneficios
 * @param {number} nivel - ID del nivel
 */
export function actualizarBeneficios(beneficios, nivel) {
    const benefitsWrapper = document.getElementById('benefits-wrappers');
    const titleBenefit = document.getElementById('titleBenefit');
    
    if (!benefitsWrapper || !titleBenefit) return;
    
    benefitsWrapper.innerHTML = ''; // Limpiar el contenedor de beneficios
    titleBenefit.innerText = getTituloPorNivel(nivel);
    // Mantener las clases originales y solo agregar el margen si no existe
    if (!titleBenefit.classList.contains('mb-8')) {
        titleBenefit.classList.add('mb-8');
    }
    
    beneficios.forEach((beneficio, index) => {
        const benefitItem = document.createElement('div');
        benefitItem.className = "px-4 w-full md:w-1/2 xl:w-1/4 relative mt-24 benefit-card-elem";
        benefitItem.innerHTML = `
            <div class="border-2 border-solid border-secondary-color-2 rounded-[6px] relative px-[20px] py-[30px] h-full benefits-item">
                <div class="bg-secondary-color-2 w-[96px] h-[96px] inline-block mx-auto absolute rounded-full -top-[75px] left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img class="w-[45px] h-[45px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        src="${beneficio.icono}">
                </div>
                <p class="font-bold text-[18px] leading-[26px]">${beneficio.nombre}</p>
                <p class="text-[16px] leading-[24px]">${beneficio.descripcion}</p>
            </div>
        `;
        benefitsWrapper.appendChild(benefitItem);
    });

    if (beneficios.length === 5) {
        benefitsWrapper.classList.add('benefits-3-2');
    } else {
        benefitsWrapper.classList.remove('benefits-3-2');
    }
} 