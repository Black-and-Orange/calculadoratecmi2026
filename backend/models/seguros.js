const db = require('../config/dbConfig');

const getAllSeguros = (callback) => {
    db.query('SELECT * FROM seguro', callback);
};

const getSegurosByNivel = (nivelId, campusId, callback) => {
    // Firma flexible: puede llamarse (nivelId, callback) o (nivelId, campusId, callback).
    if (typeof campusId === 'function') {
        callback = campusId;
        campusId = undefined;
    }

    // Con campus: se resuelve el precio por campus. Si hay una excepción en
    // seguro_nivel_campus para ese (seguro, nivel, campus) se usa ese valor;
    // si no, cae al precio por defecto de seguro_nivel (COALESCE). Sin campus
    // se comporta igual que antes (precio por defecto del nivel).
    if (campusId) {
        const query = `
            SELECT
                s.id_seguro,
                s.nombre_seguro,
                COALESCE(snc.valor, sn.valor) AS valor,
                sn.estado
            FROM seguro s
            JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
            LEFT JOIN seguro_nivel_campus snc
                ON snc.id_seguro = s.id_seguro
               AND snc.id_nivel = sn.id_nivel
               AND snc.id_campus = ?
            WHERE sn.id_nivel = ? AND sn.estado = TRUE
            ORDER BY s.nombre_seguro
        `;
        return db.query(query, [campusId, nivelId], callback);
    }

    const query = `
        SELECT
            s.id_seguro,
            s.nombre_seguro,
            sn.valor,
            sn.estado
        FROM seguro s
        JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
        WHERE sn.id_nivel = ? AND sn.estado = TRUE
        ORDER BY s.nombre_seguro
    `;
    db.query(query, [nivelId], callback);
};

const getSegurosByNivelAll = (nivelId, callback) => {
    const query = `
        SELECT 
            s.id_seguro, 
            s.nombre_seguro, 
            sn.valor, 
            sn.estado
        FROM seguro s
        JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
        WHERE sn.id_nivel = ?
        ORDER BY s.nombre_seguro
    `;
    db.query(query, [nivelId], callback);
};

const getSeguroById = (id, callback) => {
    db.query('SELECT * FROM seguro WHERE id_seguro = ?', [id], callback);
};

const createSeguro = (seguro, callback) => {
    const { nombre_seguro } = seguro;
    db.query('INSERT INTO seguro (nombre_seguro) VALUES (?)', [nombre_seguro], callback);
};

const deleteSeguro = (id, callback) => {
    db.query('DELETE FROM seguro WHERE id_seguro = ?', [id], callback);
};

const updateSeguro = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE seguro SET ${queryParts.join(', ')} WHERE id_seguro = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllSeguros,
    getSegurosByNivel,
    getSegurosByNivelAll,
    getSeguroById,
    createSeguro,
    deleteSeguro,
    updateSeguro
};
