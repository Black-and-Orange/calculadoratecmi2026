// models/interesesNivel.js
const db = require('../config/dbConfig');

const getAllInteresesNiveles = (callback) => {
    db.query('SELECT * FROM intereses_nivel', callback);
};

const getInteresNivelById = (id, callback) => {
    db.query('SELECT * FROM intereses_nivel WHERE id = ?', [id], callback);
};

const createInteresNivel = (interesesNivel, callback) => {
    const { intereses_id, nivel_id } = interesesNivel;
    db.query('INSERT INTO intereses_nivel (intereses_id, nivel_id) VALUES (?, ?)', [intereses_id, nivel_id], callback);
};

const deleteInteresNivel = (id, callback) => {
    db.query('DELETE FROM intereses_nivel WHERE id = ?', [id], callback);
};

const updateInteresNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE intereses_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllInteresesNiveles,
    getInteresNivelById,
    createInteresNivel,
    deleteInteresNivel,
    updateInteresNivel
};
