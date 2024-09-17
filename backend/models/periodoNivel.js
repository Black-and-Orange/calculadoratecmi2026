// models/periodoNivel.js
const db = require('../config/dbConfig');

const getAllPeriodoNiveles = (callback) => {
    db.query('SELECT * FROM periodo_nivel', callback);
};

const getPeriodoNivelById = (id, callback) => {
    db.query('SELECT * FROM periodo_nivel WHERE id_periodo = ?', [id], callback);
};

const createPeriodoNivel = (periodoNivel, callback) => {
    const { id_periodo, id_nivel } = periodoNivel;
    db.query('INSERT INTO periodo_nivel (id_periodo, id_nivel) VALUES (?, ?)', [id_periodo, id_nivel], callback);
};

const deletePeriodoNivel = (id, callback) => {
    db.query('DELETE FROM periodo_nivel WHERE id_periodo = ?', [id], callback);
};

const updatePeriodoNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE periodo_nivel SET ${queryParts.join(', ')} WHERE id_periodo = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllPeriodoNiveles,
    getPeriodoNivelById,
    createPeriodoNivel,
    deletePeriodoNivel,
    updatePeriodoNivel
};
