// Rate limiting en memoria, sin dependencias (Fase 2, Block 1 / P2).
// Ventana fija por clave `${bucket}:${ip}`. Identifica al cliente por
// CF-Connecting-IP (IP real detrás de Cloudflare) con fallback a req.ip.
//
// Límite conocido: en Cloudflare Workers la memoria es por-isolate, así que este
// control es "best-effort" allí; la protección principal en producción debe ser
// una Rate Limiting Rule en el borde de Cloudflare. En Node/local es exacto.
const buckets = new Map();
const MAX_KEYS = 10000; // tope de memoria: si se excede, se purgan entradas vencidas

const clientIp = (req) =>
    (req.headers['cf-connecting-ip'] || req.ip || (req.socket && req.socket.remoteAddress) || 'unknown')
        .toString().split(',')[0].trim();

function purgeExpired(now) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

/**
 * @param {{ bucket: string, windowMs: number, max: number }} opts
 */
function rateLimit({ bucket, windowMs, max }) {
    if (!bucket || !windowMs || !max) throw new Error('rateLimit: bucket, windowMs y max son obligatorios');
    return (req, res, next) => {
        const now = Date.now();
        const key = `${bucket}:${clientIp(req)}`;
        let entry = buckets.get(key);
        if (!entry || entry.resetAt <= now) {
            if (buckets.size >= MAX_KEYS) purgeExpired(now);
            entry = { count: 0, resetAt: now + windowMs };
            buckets.set(key, entry);
        }
        entry.count += 1;
        const remaining = Math.max(0, max - entry.count);
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        if (entry.count > max) {
            const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
            res.setHeader('Retry-After', String(retryAfter));
            return res.status(429).json({ message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' });
        }
        next();
    };
}

// Solo para pruebas: limpia el estado en memoria.
rateLimit._reset = () => buckets.clear();

module.exports = rateLimit;
