// models/becaFijaNivel.js
const db = require('../config/dbConfig');

const getAllBecasFijasNiveles = (callback) => {
    db.query('SELECT * FROM beca_fija_nivel', callback);
};

const getBecaFijaNivelById = (id, callback) => {
    db.query('SELECT * FROM beca_fija_nivel WHERE id = ?', [id], callback);
};

const createBecaFijaNivel = (becaFijaNivel, callback) => {
    const { beca_fija_id, nivel_id } = becaFijaNivel;
    db.query('INSERT INTO beca_fija_nivel (beca_fija_id, nivel_id) VALUES (?, ?)', [beca_fija_id, nivel_id], callback);
};

const deleteBecaFijaNivel = (id, callback) => {
    db.query('DELETE FROM beca_fija_nivel WHERE id = ?', [id], callback);
};

const updateBecaFijaNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE beca_fija_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllBecasFijasNiveles,
    getBecaFijaNivelById,
    createBecaFijaNivel,
    deleteBecaFijaNivel,
    updateBecaFijaNivel
};
