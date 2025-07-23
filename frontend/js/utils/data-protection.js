// Utilidades para proteger datos y evitar conflictos

// Namespace para localStorage
const STORAGE_NAMESPACE = 'tecmilenio_calculator_';

// Función para limpiar localStorage de forma segura
export function clearLocalStorageSafely() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_NAMESPACE)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Función para obtener datos del localStorage con namespace
export function getStorageData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(STORAGE_NAMESPACE + key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error al obtener datos de localStorage para ${key}:`, error);
        return defaultValue;
    }
}

// Función para guardar datos en localStorage con namespace
export function setStorageData(key, value) {
    try {
        localStorage.setItem(STORAGE_NAMESPACE + key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error al guardar datos en localStorage para ${key}:`, error);
    }
}

// Función para verificar si hay datos de cotización activa
export function hasActiveCotization() {
    return getStorageData('cotizacionId') !== null;
}

// Función para limpiar datos de cotización
export function clearCotizationData() {
    const keysToRemove = [
        'cotizacionId',
        'selectedNivel',
        'nombre',
        'campus',
        'programa',
        'costoTotal',
        'totalContado',
        'finalAmount',
        'interesDividido',
        'primeraCuota',
        'selectedScholarshipName',
        'selectedScholarshipValue',
        'selectedSupportValue',
        'selectedSupportFixValue',
        'selectedprestamo',
        'totalCost',
        'selectedPercentage',
        'insuranceValue',
        'coverageValue',
        'viveValue',
        'periodosSeleccionados',
        'bimestreSeleccionado',
        'totalPagos'
    ];
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(STORAGE_NAMESPACE + key);
    });
}

// Función para validar que los datos no estén corruptos
export function validateCotizationData() {
    const requiredFields = ['selectedNivel', 'nombre', 'costoTotal'];
    const missingFields = requiredFields.filter(field => !getStorageData(field));
    
    if (missingFields.length > 0) {
        console.warn('Datos de cotización incompletos:', missingFields);
        return false;
    }
    
    return true;
}

// Función para crear un ID único para cada sesión
export function createSessionId() {
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setStorageData('sessionId', sessionId);
    return sessionId;
}

// Función para obtener el ID de sesión actual
export function getSessionId() {
    return getStorageData('sessionId') || createSessionId();
}

// Función para verificar si estamos en una sesión válida
export function isValidSession() {
    const sessionId = getStorageData('sessionId');
    const lastActivity = getStorageData('lastActivity');
    
    if (!sessionId || !lastActivity) {
        return false;
    }
    
    // Considerar sesión válida si la última actividad fue hace menos de 30 minutos
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    return lastActivity > thirtyMinutesAgo;
}

// Función para actualizar la actividad de la sesión
export function updateSessionActivity() {
    setStorageData('lastActivity', Date.now());
}

// Función para limpiar sesión expirada
export function clearExpiredSession() {
    if (!isValidSession()) {
        clearLocalStorageSafely();
        createSessionId();
    }
}

// Función para proteger contra múltiples pestañas
export function setupTabProtection() {
    const sessionId = getSessionId();
    
    // Escuchar cambios en localStorage de otras pestañas
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_NAMESPACE + 'sessionId' && event.newValue !== sessionId) {
            // Otra pestaña cambió la sesión, limpiar datos locales
            clearLocalStorageSafely();
            createSessionId();
        }
    });
    
    // Actualizar actividad periódicamente
    setInterval(updateSessionActivity, 5 * 60 * 1000); // Cada 5 minutos
}

// Función para inicializar protección de datos
export function initializeDataProtection() {
    clearExpiredSession();
    setupTabProtection();
    updateSessionActivity();
}

// Función para verificar si la página actual es para cotizaciones compartidas
export function isSharedCotizationPage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('id');
}

// Función para redirigir a la página correcta según el contexto
export function redirectToCorrectPage() {
    if (isSharedCotizationPage()) {
        const urlParams = new URLSearchParams(window.location.search);
        const cotizacionId = urlParams.get('id');
        if (cotizacionId && window.location.pathname.includes('resultado.html')) {
            window.location.href = `cotizacion-compartida.html?id=${cotizacionId}`;
        }
    }
} 