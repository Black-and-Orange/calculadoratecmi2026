// models/seguroNivel.js
const db = require('../config/dbConfig');

const getAllSeguroNiveles = (callback) => {
    db.query('SELECT * FROM seguro_nivel', callback);
};

const getSeguroNivelById = (id, callback) => {
    db.query('SELECT * FROM seguro_nivel WHERE id_seguro = ?', [id], callback);
};

const createSeguroNivel = (seguroNivel, callback) => {
    const { id_seguro, id_nivel } = seguroNivel;
    db.query('INSERT INTO seguro_nivel (id_seguro, id_nivel) VALUES (?, ?)', [id_seguro, id_nivel], callback);
};

const deleteSeguroNivel = (id, callback) => {
    db.query('DELETE FROM seguro_nivel WHERE id_seguro = ?', [id], callback);
};

const updateSeguroNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE seguro_nivel SET ${queryParts.join(', ')} WHERE id_seguro = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllSeguroNiveles,
    getSeguroNivelById,
    createSeguroNivel,
    deleteSeguroNivel,
    updateSeguroNivel
};
