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
    if (!id_plan || !id_nivel) {
        return callback(new Error('id_plan e id_nivel son requeridos'));
    }
    db.query('INSERT INTO plan_nivel (id_plan, id_nivel) VALUES (?, ?)', [id_plan, id_nivel], callback);
};



const deletePlanNivel = (id, callback) => {
    db.query('DELETE FROM plan_nivel WHERE id_plan = ?', [id], callback);
};

const updatePlanNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE plan_nivel SET ${queryParts.join(', ')} WHERE id_plan = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllPlanesNiveles,
    getPlanNivelById,
    createPlanNivel,
    deletePlanNivel,
    updatePlanNivel
};
