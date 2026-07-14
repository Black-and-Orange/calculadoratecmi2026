const db = require('../config/dbConfig');

// Fechas de pago por período (minuta jul-2026). Convención:
// pago_orden = 1 → contado / primer pago; pago_orden > 1 → mensualidades.

const getFechasByPeriodo = (idPeriodo, callback) => {
    const query = `
        SELECT
            MIN(f.id_fecha_pago) AS id_fecha_pago,
            p.id_periodo,
            f.pago_orden,
            MIN(f.fecha_vencimiento) AS fecha_vencimiento
        FROM periodo p
        JOIN periodo p_equivalente
            ON p_equivalente.periodo_descripcion = p.periodo_descripcion
            AND p_equivalente.periodo_codigo <=> p.periodo_codigo
        JOIN fechas_pago_periodo f
            ON f.id_periodo = p_equivalente.id_periodo
        WHERE p.id_periodo = ?
        GROUP BY p.id_periodo, f.pago_orden
        ORDER BY f.pago_orden
    `;
    db.query(query, [idPeriodo], callback);
};

// Todas las fechas de los períodos de un nivel (una sola consulta para la
// calculadora pública, que identifica el período por su descripción).
const getFechasByNivel = (nivelId, callback) => {
    const query = `
        SELECT p.id_periodo, p.periodo_descripcion, p.periodo_codigo,
               f.pago_orden, MIN(f.fecha_vencimiento) AS fecha_vencimiento
        FROM periodo p
        JOIN periodo_nivel pn ON p.id_periodo = pn.id_periodo
        JOIN periodo p_equivalente
            ON p_equivalente.periodo_descripcion = p.periodo_descripcion
            AND p_equivalente.periodo_codigo <=> p.periodo_codigo
        JOIN fechas_pago_periodo f ON f.id_periodo = p_equivalente.id_periodo
        WHERE pn.id_nivel = ?
        GROUP BY p.id_periodo, p.periodo_descripcion, p.periodo_codigo, f.pago_orden
        ORDER BY p.id_periodo, f.pago_orden
    `;
    db.query(query, [nivelId], callback);
};

// Reemplaza la lista completa de fechas de un período (el admin guarda la
// lista ordenada; el orden del arreglo define pago_orden 1..N). Si el mismo
// período existe para varios programas/niveles, la configuración aplica a todos.
const replaceFechasForPeriodo = (idPeriodo, fechas, callback) => {
    db.query('SELECT periodo_descripcion, periodo_codigo FROM periodo WHERE id_periodo = ?', [idPeriodo], (err, rows) => {
        if (err) return callback(err);
        if (!rows.length) return callback(new Error('Período no encontrado'));

        const { periodo_descripcion, periodo_codigo } = rows[0];
        db.query(
            'SELECT id_periodo FROM periodo WHERE periodo_descripcion = ? AND periodo_codigo <=> ? ORDER BY id_periodo',
            [periodo_descripcion, periodo_codigo],
            (idsErr, periodosEquivalentes) => {
                if (idsErr) return callback(idsErr);

                const idsPeriodo = periodosEquivalentes.map(periodo => periodo.id_periodo);
                if (!idsPeriodo.length) return callback(new Error('No se encontraron períodos equivalentes'));

                db.query('DELETE FROM fechas_pago_periodo WHERE id_periodo IN (?)', [idsPeriodo], (deleteErr) => {
                    if (deleteErr) return callback(deleteErr);
                    if (!fechas.length) {
                        return callback(null, {
                            affectedRows: 0,
                            periodosActualizados: idsPeriodo.length,
                            fechasPorPeriodo: 0,
                        });
                    }

                    const values = idsPeriodo.flatMap(periodoId =>
                        fechas.map((fecha, i) => [periodoId, i + 1, fecha])
                    );
                    db.query(
                        'INSERT INTO fechas_pago_periodo (id_periodo, pago_orden, fecha_vencimiento) VALUES ?',
                        [values],
                        (insertErr, result) => {
                            if (insertErr) return callback(insertErr);
                            callback(null, {
                                ...result,
                                periodosActualizados: idsPeriodo.length,
                                fechasPorPeriodo: fechas.length,
                            });
                        }
                    );
                });
            }
        );
    });
};

module.exports = {
    getFechasByPeriodo,
    getFechasByNivel,
    replaceFechasForPeriodo,
};
