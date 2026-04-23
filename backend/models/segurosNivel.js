// models/seguroNivel.js
const db = require('../config/dbConfig');

const getAllSeguroNiveles = (callback) => {
    db.query('SELECT * FROM seguro_nivel', callback);
};

const getSeguroNivelById = (id, callback) => {
    db.query('SELECT * FROM seguro_nivel WHERE id_seguro = ?', [id], callback);
};

const createSeguroNivel = (seguroNivel, callback) => {
    const { id_seguro, id_nivel, valor, estado } = seguroNivel;
    const estadoValue = estado !== undefined ? estado : true;
    db.query(
        'INSERT INTO seguro_nivel (id_seguro, id_nivel, valor, estado) VALUES (?, ?, ?, ?)', 
        [id_seguro, id_nivel, valor, estadoValue], 
        callback
    );
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

const updateSeguroNivelBySeguroAndNivel = (id_seguro, id_nivel, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id_seguro, id_nivel);
    const query = `UPDATE seguro_nivel SET ${queryParts.join(', ')} WHERE id_seguro = ? AND id_nivel = ?`;

    db.query(query, queryValues, callback);
};

const deleteSeguroNivelBySeguroAndNivel = (id_seguro, id_nivel, callback) => {
    db.query('DELETE FROM seguro_nivel WHERE id_seguro = ? AND id_nivel = ?', [id_seguro, id_nivel], callback);
};

module.exports = {
    getAllSeguroNiveles,
    getSeguroNivelById,
    createSeguroNivel,
    deleteSeguroNivel,
    updateSeguroNivel,
    updateSeguroNivelBySeguroAndNivel,
    deleteSeguroNivelBySeguroAndNivel
};
