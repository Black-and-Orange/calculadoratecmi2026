const db = require('../config/dbConfig');

const getAllCostos = (callback) => {
    db.query('SELECT * FROM costo_materia', callback);
};

const getCostosByNivel = (nivelId, callback) => {
    const query = `
        SELECT costo_materia.id_costo, costo_materia.clave, costo_materia.costo
        FROM costo_materia
        JOIN costo_materia_nivel ON costo_materia.id_costo = costo_materia_nivel.id_costo
        WHERE costo_materia_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

const getCostoById = (id, callback) => {
    db.query('SELECT * FROM costo_materia WHERE id_costo = ?', [id], callback);
};

const createCosto = (costo_materia, callback) => {
    const { clave, costo } = costo_materia;
    db.query('INSERT INTO costo_materia (clave, costo) VALUES (?, ?)', [clave, costo], callback);
};

const deleteCosto = (id, callback) => {
    db.query('DELETE FROM costo_materia WHERE id_costo = ?', [id], callback);
};

const updateCosto = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE costo_materia SET ${queryParts.join(', ')} WHERE id_costo = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllCostos,
    getCostosByNivel,
    getCostoById,
    createCosto,
    deleteCosto,
    updateCosto
};
