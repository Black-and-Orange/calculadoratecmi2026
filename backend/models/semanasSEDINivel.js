// models/SemanasNivel.js
const db = require('../config/dbConfig');

const getAllSemanasNiveles = (callback) => {
    db.query('SELECT * FROM semanas_nivel', callback);
};

const getSemanasNivelById = (id, callback) => {
    db.query('SELECT * FROM semanas_nivel WHERE id = ?', [id], callback);
};

const createCertificadoNivel = (data, callback) => {
    const sql = 'INSERT INTO semanas_nivel SET ?';
    db.query(sql, data, callback);
};

const deleteAllSemanasNivel = (callback) => {
    const sql = 'DELETE FROM semanas_nivel';
    db.query(sql, callback);
};

module.exports = {
    getAllSemanasNiveles,
    getSemanasNivelById,
    createCertificadoNivel,
    deleteAllSemanasNivel
};
