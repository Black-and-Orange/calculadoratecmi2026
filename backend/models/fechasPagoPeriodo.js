const db = require('../config/dbConfig');

// Fechas de pago por período (minuta jul-2026). Convención:
// pago_orden = 1 → contado / primer pago; pago_orden > 1 → mensualidades.

const getFechasByPeriodo = (idPeriodo, callback) => {
    db.query(
        'SELECT id_fecha_pago, id_periodo, pago_orden, fecha_vencimiento FROM fechas_pago_periodo WHERE id_periodo = ? ORDER BY pago_orden',
        [idPeriodo],
        callback
    );
};

// Todas las fechas de los períodos de un nivel (una sola consulta para la
// calculadora pública, que identifica el período por su descripción).
const getFechasByNivel = (nivelId, callback) => {
    const query = `
        SELECT p.id_periodo, p.periodo_descripcion, p.periodo_codigo,
               f.pago_orden, f.fecha_vencimiento
        FROM periodo p
        JOIN periodo_nivel pn ON p.id_periodo = pn.id_periodo
        JOIN fechas_pago_periodo f ON f.id_periodo = p.id_periodo
        WHERE pn.id_nivel = ?
        ORDER BY p.id_periodo, f.pago_orden
    `;
    db.query(query, [nivelId], callback);
};

// Reemplaza la lista completa de fechas de un período (el admin guarda la
// lista ordenada; el orden del arreglo define pago_orden 1..N).
const replaceFechasForPeriodo = (idPeriodo, fechas, callback) => {
    db.query('DELETE FROM fechas_pago_periodo WHERE id_periodo = ?', [idPeriodo], (err) => {
        if (err) return callback(err);
        if (!fechas.length) return callback(null, { affectedRows: 0 });
        const values = fechas.map((fecha, i) => [idPeriodo, i + 1, fecha]);
        db.query(
            'INSERT INTO fechas_pago_periodo (id_periodo, pago_orden, fecha_vencimiento) VALUES ?',
            [values],
            callback
        );
    });
};

module.exports = {
    getFechasByPeriodo,
    getFechasByNivel,
    replaceFechasForPeriodo,
};
