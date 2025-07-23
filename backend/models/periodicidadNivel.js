// models/PeriodicidadNivel.js
const db = require('../config/dbConfig');

const getAllPeriodicidadNiveles = (callback) => {
    db.query('SELECT * FROM periodicidad_nivel', callback);
};

const getPeriodicidadNivelById = (id, callback) => {
    db.query('SELECT * FROM periodicidad_nivel WHERE id = ?', [id], callback);
};

const createPeriodicidadNivel = (periodicidadNivel, callback) => {
    const { id_periodicidad, id_nivel } = periodicidadNivel;
    db.query('INSERT INTO periodicidad_nivel (id_periodicidad, id_nivel) VALUES (?, ?)', [id_periodicidad, id_nivel], callback);
};

const deletePeriodicidadNivel = (id, callback) => {
    db.query('DELETE FROM periodicidad_nivel WHERE id = ?', [id], callback);
};

const updatePeriodicidadNivel = (id, periodicidadNivel, callback) => {
    const { id_nivel } = periodicidadNivel;
    db.query('UPDATE periodicidad_nivel SET id_nivel = ? WHERE id = ?', [id_nivel, id], callback);
};

module.exports = {
    getAllPeriodicidadNiveles,
    getPeriodicidadNivelById,
    createPeriodicidadNivel,
    deletePeriodicidadNivel,
    updatePeriodicidadNivel
};
