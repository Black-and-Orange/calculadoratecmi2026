// models/planNivel.js
const db = require('../config/dbConfig');

const getAllPlanesNiveles = (callback) => {
    db.query('SELECT * FROM plan_nivel', callback);
};

const getPlanNivelById = (id, callback) => {
    db.query('SELECT * FROM plan_nivel WHERE id = ?', [id], callback);
};

const createPlanNivel = (planNivel, callback) => {
    const { id_plan, id_nivel } = planNivel;
    db.query('INSERT INTO plan_nivel (id_plan, id_nivel) VALUES (?, ?)', [id_plan, id_nivel], callback);
};

const deletePlanNivel = (id, callback) => {
    db.query('DELETE FROM plan_nivel WHERE id = ?', [id], callback);
};

const updatePlanNivel = (id, planNivel, callback) => {
    const { id_nivel } = planNivel;
    console.log(id_nivel);
    db.query('UPDATE plan_nivel SET id_nivel = ? WHERE id = ?', [id_nivel, id], callback);
};

module.exports = {
    getAllPlanesNiveles,
    getPlanNivelById,
    createPlanNivel,
    deletePlanNivel,
    updatePlanNivel
};
