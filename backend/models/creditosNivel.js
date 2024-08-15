// models/creditoNivel.js
const db = require('../config/dbConfig');

const getAllCreditosNiveles = (callback) => {
    db.query('SELECT * FROM creditos_nivel', callback);
};

const getApoyoNivelById = (id, callback) => {
    db.query('SELECT * FROM creditos_nivel WHERE id = ?', [id], callback);
};

const createApoyoNivel = (creditoNivel, callback) => {
    const { credito_id, nivel_id } = creditoNivel;
    db.query('INSERT INTO creditos_nivel (credito_id, nivel_id) VALUES (?, ?)', [credito_id, nivel_id], callback);
};

const deleteApoyoNivel = (id, callback) => {
    db.query('DELETE FROM creditos_nivel WHERE id = ?', [id], callback);
};

const updateApoyoNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE creditos_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllCreditosNiveles,
    getApoyoNivelById,
    createApoyoNivel,
    deleteApoyoNivel,
    updateApoyoNivel
};
