// Entry point para Cloudflare Workers: envuelve el servidor Express de
// index.js con el handler HTTP de nodejs_compat. El puerto actúa solo como
// clave de ruteo dentro del Worker, no como puerto de red real.
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';

// dbConfig.js (CommonJS) no puede importar cloudflare:workers directamente;
// se le pasa el env (bindings: HYPERDRIVE, secrets) por globalThis antes de
// cargar la app.
globalThis.__CF_ENV = env;

const { default: server } = await import('./index.js');

export default httpServerHandler(server);
