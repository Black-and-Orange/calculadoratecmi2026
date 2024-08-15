// models/SegurosNivel.js
const db = require('../config/dbConfig');

const getAllSegurosNiveles = (callback) => {
    db.query('SELECT * FROM seguros_nivel', callback);
};

const getSegurosNivelById = (id, callback) => {
    db.query('SELECT * FROM seguros_nivel WHERE id = ?', [id], callback);
};

const createSegurosNivel = (segurosNivel, callback) => {
    const { id_seguros, id_nivel } = segurosNivel;
    db.query('INSERT INTO seguros_nivel (id_seguros, id_nivel) VALUES (?, ?)', [id_seguros, id_nivel], callback);
};

const deleteSegurosNivel = (id, callback) => {
    db.query('DELETE FROM seguros_nivel WHERE id = ?', [id], callback);
};

const updateSegurosNivel = (id, segurosNivel, callback) => {
    const { id_nivel } = segurosNivel;
    console.log(id_nivel);
    db.query('UPDATE Seguros_nivel SET id_nivel = ? WHERE id = ?', [id_nivel, id], callback);
};

module.exports = {
    getAllSegurosNiveles,
    getSegurosNivelById,
    createSegurosNivel,
    deleteSegurosNivel,
    updateSegurosNivel
};
