// models/campusNivel.js
const db = require('../config/dbConfig');

const getAllBecaVariableNiveles = (callback) => {
    db.query('SELECT * FROM beca_variable_nivel', callback);
};

const getBecaVariableNivelById = (id, callback) => {
    db.query('SELECT * FROM beca_variable_nivel WHERE id = ?', [id], callback);
};

const createBecaVariableNivel = (campusNivel, callback) => {
    const { beca_variable_id, nivel_id } = campusNivel;
    db.query('INSERT INTO beca_variable_nivel (beca_variable_id, nivel_id) VALUES (?, ?)', [beca_variable_id, nivel_id], callback);
};

const deleteBecaVariableNivel = (id, callback) => {
    db.query('DELETE FROM beca_variable_nivel WHERE id = ?', [id], callback);
};

const updateBecaVariableNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE beca_variable_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllBecaVariableNiveles,
    getBecaVariableNivelById,
    createBecaVariableNivel,
    deleteBecaVariableNivel,
    updateBecaVariableNivel
};
