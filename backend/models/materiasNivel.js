// models/MateriasNivel.js
const db = require('../config/dbConfig');

const getAllMateriasNiveles = (callback) => {
    db.query('SELECT * FROM materias_nivel', callback);
};

const getMateriasNivelById = (id, callback) => {
    db.query('SELECT * FROM materias_nivel WHERE id = ?', [id], callback);
};

const createMateriasNivel = (materiasNivel, callback) => {
    const { id_materia, id_nivel } = materiasNivel;
    db.query('INSERT INTO materias_nivel (id_materia, id_nivel) VALUES (?, ?)', [id_materia, id_nivel], callback);
};

const deleteMateriasNivel = (id, callback) => {
    db.query('DELETE FROM materias_nivel WHERE id = ?', [id], callback);
};

const updateMateriasNivel = (id, materiasNivel, callback) => {
    const { id_nivel } = materiasNivel;
    console.log(id_nivel);
    db.query('UPDATE materias_nivel SET id_nivel = ? WHERE id = ?', [id_nivel, id], callback);
};

module.exports = {
    getAllMateriasNiveles,
    getMateriasNivelById,
    createMateriasNivel,
    deleteMateriasNivel,
    updateMateriasNivel
};
