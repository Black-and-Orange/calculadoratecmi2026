// Configuración de la URL base de la API según el entorno.
// localhost → backend local; cualquier otro host → backend de staging (Cloudflare Worker).
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = isLocal
    ? 'http://localhost:3008/api'
    : 'https://api-tecmi.blnolabs.dev/api';

// Todas las llamadas del panel se hacen con fetch(). En lugar de tocar cada
// módulo, se envuelve window.fetch para adjuntar el token JWT a las peticiones
// dirigidas al API y redirigir al login cuando la sesión expira (403).
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url && url.startsWith(API_BASE_URL)) {
        const token = localStorage.getItem('token');
        if (token) {
            init.headers = { ...(init.headers || {}), 'Authorization': `Bearer ${token}` };
        }
        const response = await originalFetch(input, init);
        if (response.status === 403 && !url.includes('/auth/login')) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
        return response;
    }
    return originalFetch(input, init);
};
