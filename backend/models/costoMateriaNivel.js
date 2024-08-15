// models/costoMateriaNivel.js
const db = require('../config/dbConfig');

const getAllCostoMateriaNiveles = (callback) => {
    db.query('SELECT * FROM costo_materia_nivel', callback);
};

const getCostoMateriaNivelById = (id, callback) => {
    db.query('SELECT * FROM costo_materia_nivel WHERE id = ?', [id], callback);
};

const createCostoMateriaNivel = (costoMateriaNivel, callback) => {
    const { id_costo, id_nivel } = costoMateriaNivel;
    db.query('INSERT INTO costo_materia_nivel (id_costo, id_nivel) VALUES (?, ?)', [id_costo, id_nivel], callback);
};

const deleteCostoMateriaNivel = (id, callback) => {
    db.query('DELETE FROM costo_materia_nivel WHERE id = ?', [id], callback);
};

const updateCostoMateriaNivel = (id, costoMateriaNivel, callback) => {
    const { id_nivel } = costoMateriaNivel;
    console.log(id_nivel);
    db.query('UPDATE costo_materia_nivel SET id_nivel = ? WHERE id = ?', [id_nivel, id], callback);
};

module.exports = {
    getAllCostoMateriaNiveles,
    getCostoMateriaNivelById,
    createCostoMateriaNivel,
    deleteCostoMateriaNivel,
    updateCostoMateriaNivel
};
