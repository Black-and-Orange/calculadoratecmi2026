const DATABASE = 'database_calculadora_prueba';
// const DATABASE = 'database_calculadora';

// En Cloudflare Workers no se puede mantener un pool de conexiones entre
// requests, así que se abre una conexión por consulta (vía Hyperdrive, que
// hace el pooling del lado de Cloudflare). En Node se usa el pool de siempre.
const isWorkers = typeof navigator !== 'undefined'
    && typeof navigator.userAgent === 'string'
    && navigator.userAgent.startsWith('Cloudflare-Workers');

let db;

if (isWorkers) {
    const mysqlPromise = require('mysql2/promise');
    const env = globalThis.__CF_ENV; // bindings inyectados por worker.js

    const connectionConfig = () => env.HYPERDRIVE
        ? {
            host: env.HYPERDRIVE.host,
            user: env.HYPERDRIVE.user,
            password: env.HYPERDRIVE.password,
            database: env.HYPERDRIVE.database,
            port: env.HYPERDRIVE.port,
            disableEval: true, // requerido en Workers
        }
        : {
            host: env.DB_HOST,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: DATABASE,
            disableEval: true,
        };

    const run = async (sql, params) => {
        const conn = await mysqlPromise.createConnection(connectionConfig());
        try {
            return await conn.query(sql, params);
        } finally {
            conn.end().catch(() => {});
        }
    };

    db = {
        query(sql, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            run(sql, params).then(
                ([results, fields]) => callback(null, results, fields),
                (err) => callback(err),
            );
        },
        promise() {
            return { query: (sql, params = []) => run(sql, params) };
        },
    };
} else {
    const mysql = require('mysql2');
    db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: DATABASE,
        connectionLimit: 10,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
    });

    // Mantener la conexión "caliente": la BD remota cierra las conexiones
    // inactivas, lo que provocaba que la primera petición tras un rato de
    // inactividad expirara y dejara vacío un dropdown de la cascada
    // (nivel/programa/campus). Un ping periódico lo evita. Solo en Node; en
    // Cloudflare Workers el pooling lo maneja Hyperdrive.
    const keepAlive = setInterval(() => {
        db.query('SELECT 1', (err) => {
            if (err) console.error('DB keep-alive falló:', err.code || err.message);
        });
    }, 60 * 1000);
    if (keepAlive.unref) keepAlive.unref();
}

module.exports = db;
