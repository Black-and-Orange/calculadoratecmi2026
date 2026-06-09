// Configuración de la URL base de la API según el entorno.
// localhost → backend local; cualquier otro host → backend de staging (Cloudflare Worker).
// URL de producción para referencia futura:
// https://tecmilenio-calculadora-backend.testingbo.com/api

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = isLocal
    ? 'http://localhost:3008/api'
    : 'https://calculadora-tecmi-backend.carlos-tam-s-account.workers.dev/api';
