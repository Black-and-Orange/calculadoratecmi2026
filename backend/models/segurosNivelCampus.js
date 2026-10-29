// Precio de un seguro por campus (excepciones al precio por defecto de seguro_nivel).
// Tabla: seguro_nivel_campus (id_seguro, id_nivel, id_campus, valor).
const db = require('../config/dbConfig');

// Lista las excepciones de un nivel (todas las de todos los seguros de ese nivel),
// con el nombre del campus y del seguro para pintarlas en el admin.
const getByNivel = (nivelId, callback) => {
    const query = `
        SELECT snc.id_seguro, snc.id_nivel, snc.id_campus, snc.valor,
               c.nombre AS campus_nombre, s.nombre_seguro
        FROM seguro_nivel_campus snc
        JOIN campus c ON c.id = snc.id_campus
        JOIN seguro s ON s.id_seguro = snc.id_seguro
        WHERE snc.id_nivel = ?
        ORDER BY s.nombre_seguro, c.nombre
    `;
    db.query(query, [nivelId], callback);
};

// Alta o actualización (upsert) de una excepción por campus.
const upsert = ({ id_seguro, id_nivel, id_campus, valor }, callback) => {
    const query = `
        INSERT INTO seguro_nivel_campus (id_seguro, id_nivel, id_campus, valor)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
    `;
    db.query(query, [id_seguro, id_nivel, id_campus, parseFloat(valor)], callback);
};

// Elimina una excepción (vuelve a usar el precio por defecto del nivel).
const remove = ({ id_seguro, id_nivel, id_campus }, callback) => {
    db.query(
        'DELETE FROM seguro_nivel_campus WHERE id_seguro = ? AND id_nivel = ? AND id_campus = ?',
        [id_seguro, id_nivel, id_campus],
        callback
    );
};

// Limpieza de huérfanos: al eliminar un seguro/relación o un campus, se borran
// sus excepciones por campus para no dejar filas colgadas.
const removeBySeguroNivel = (id_seguro, id_nivel, callback) => {
    db.query('DELETE FROM seguro_nivel_campus WHERE id_seguro = ? AND id_nivel = ?', [id_seguro, id_nivel], callback);
};
const removeBySeguro = (id_seguro, callback) => {
    db.query('DELETE FROM seguro_nivel_campus WHERE id_seguro = ?', [id_seguro], callback);
};
const removeByCampus = (id_campus, callback) => {
    db.query('DELETE FROM seguro_nivel_campus WHERE id_campus = ?', [id_campus], callback);
};

module.exports = { getByNivel, upsert, remove, removeBySeguroNivel, removeBySeguro, removeByCampus };
