// models/apoyoNivel.js
const db = require('../config/dbConfig');

const getAllInglesNiveles = (callback) => {
    db.query('SELECT * FROM ingles_nivel', callback);
};

const getInglesNivelById = (id, callback) => {
    db.query('SELECT * FROM ingles_nivel WHERE id = ?', [id], callback);
};

const createCertificadoNivel = (data, callback) => {
    const sql = 'INSERT INTO ingles_nivel SET ?';
    db.query(sql, data, callback);
};

const deleteAllCertificadosNivel = (callback) => {
    const sql = 'DELETE FROM ingles_nivel';
    db.query(sql, callback);
};

module.exports = {
    getAllInglesNiveles,
    getInglesNivelById,
    createCertificadoNivel,
    deleteAllCertificadosNivel
};
