// models/periodoNivel.js
const db = require('../config/dbConfig');

const getAllCostoNiveles = (callback) => {
    db.query('SELECT * FROM costo_materia_nivel', callback);
};

const getCostoNivelById = (id, callback) => {
    db.query('SELECT * FROM costo_materia_nivel WHERE id_costo = ?', [id], callback);
};

const createCostoNivel = (periodoNivel, callback) => {
    const { id_costo, id_nivel } = periodoNivel;
    db.query('INSERT INTO costo_materia_nivel (id_costo, id_nivel) VALUES (?, ?)', [id_costo, id_nivel], callback);
};

const deleteCostoNivel = (id, callback) => {
    db.query('DELETE FROM costo_materia_nivel WHERE id_costo = ?', [id], callback);
};

const updateCostoNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE costo_materia_nivel SET ${queryParts.join(', ')} WHERE id_costo = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllCostoNiveles,
    getCostoNivelById,
    createCostoNivel,
    deleteCostoNivel,
    updateCostoNivel
};
