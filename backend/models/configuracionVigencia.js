const db = require('../config/dbConfig');

class ConfiguracionVigencia {
    static async obtenerDiasVigencia() {
        const [rows] = await db.promise().query('SELECT dias_vigencia FROM configuracion_vigencia ORDER BY id DESC LIMIT 1');
        return rows[0]?.dias_vigencia || 5;
    }

    static async actualizarDiasVigencia(dias) {
        await db.promise().query('UPDATE configuracion_vigencia SET dias_vigencia = ? ORDER BY id DESC LIMIT 1', [dias]);
    }
}

module.exports = ConfiguracionVigencia; 