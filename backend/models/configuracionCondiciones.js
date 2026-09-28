const db = require('../config/dbConfig');

// Configuración GLOBAL (una sola fila) del texto de "Condiciones de la propuesta"
// que se muestra en la hoja de resultados. Es igual para todos los niveles.
// El texto guarda una condición por línea (\n); el frontend renderiza cada línea.
class ConfiguracionCondiciones {
    static async obtenerCondiciones() {
        const [rows] = await db.promise().query('SELECT condiciones FROM configuracion_condiciones ORDER BY id DESC LIMIT 1');
        return rows[0]?.condiciones ?? '';
    }

    static async actualizarCondiciones(texto) {
        // Upsert: actualiza la última fila si existe; si no, inserta.
        const [rows] = await db.promise().query('SELECT id FROM configuracion_condiciones ORDER BY id DESC LIMIT 1');
        if (rows[0]?.id) {
            await db.promise().query('UPDATE configuracion_condiciones SET condiciones = ? WHERE id = ?', [texto, rows[0].id]);
        } else {
            await db.promise().query('INSERT INTO configuracion_condiciones (condiciones) VALUES (?)', [texto]);
        }
    }
}

module.exports = ConfiguracionCondiciones;
