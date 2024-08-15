// models/PeriodoNivel.js
const db = require('../config/dbConfig');

const getAllPeriodoNiveles = (callback) => {
    db.query('SELECT * FROM periodo_nivel', callback);
};

const getPeriodoNivelById = (id, callback) => {
    db.query('SELECT * FROM periodo_nivel WHERE id = ?', [id], callback);
};

const createPeriodoNivel = (periodoNivel, callback) => {
    const { id_periodo, id_nivel } = periodoNivel;
    db.query('INSERT INTO periodo_nivel (id_periodo, id_nivel) VALUES (?, ?)', [id_periodo, id_nivel], callback);
};

const deletePeriodoNivel = (id, callback) => {
    db.query('DELETE FROM periodo_nivel WHERE id = ?', [id], callback);
};

const updatePeriodoNivel = (id, periodoNivel, callback) => {
    const { id_nivel } = periodoNivel;
    console.log(id_nivel);
    db.query('UPDATE periodo_nivel SET id_nivel = ? WHERE id = ?', [id_nivel, id], callback);
};

module.exports = {
    getAllPeriodoNiveles,
    getPeriodoNivelById,
    createPeriodoNivel,
    deletePeriodoNivel,
    updatePeriodoNivel
};
