// models/creditoNivel.js
const db = require('../config/dbConfig');

const getAllCreditosNiveles = (callback) => {
    db.query('SELECT * FROM creditos_nivel', callback);
};

const getCreditoNivelById = (id, callback) => {
    db.query('SELECT * FROM creditos_nivel WHERE id = ?', [id], callback);
};

const createCreditoNivel = (creditoNivel, callback) => {
    const { credito_id, id_nivel } = creditoNivel;
    db.query('INSERT INTO creditos_nivel (credito_id, id_nivel) VALUES (?, ?)', [credito_id, id_nivel], callback);
};

const deleteCreditoNivel = (id, callback) => {
    db.query('DELETE FROM creditos_nivel WHERE id = ?', [id], callback);
};

const updateCreditoNivel = (id, updates, callback) => {
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
    getCreditoNivelById,
    createCreditoNivel,
    deleteCreditoNivel,
    updateCreditoNivel
};
