const db = require('../config/dbConfig');

// Obtener todos los planes de estudios
const getAllPlanesDeEstudios = (callback) => {
    db.query('SELECT * FROM plan_estudios', callback);
};

const getPlanesByNivel = (nivelId, callback) => {
    const query = `
        SELECT plan_estudios.id_plan, plan_estudios.descripcion, plan_estudios.tipo_plan
        FROM plan_estudios
        JOIN plan_nivel ON plan_estudios.id_plan = plan_nivel.id_plan
        WHERE plan_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

// Obtener un plan de estudios por ID
const getPlanDeEstudiosById = (id, callback) => {
    db.query('SELECT * FROM plan_estudios WHERE id_plan = ?', [id], callback);
};

// Crear un nuevo plan de estudios
const createPlanDeEstudios = (plan, callback) => {
    const { descripcion, tipo_plan } = plan;
    if (!descripcion || !tipo_plan) {
        return callback(new Error('Descripción y tipo_plan son requeridos'));
    }
    db.query('INSERT INTO plan_estudios (descripcion, tipo_plan) VALUES (?, ?)', [descripcion, tipo_plan], callback);
};



// Actualizar un plan de estudios
const updatePlanDeEstudios = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE plan_estudios SET ${queryParts.join(', ')} WHERE id_plan = ?`;

    db.query(query, queryValues, callback);
};


// Eliminar un plan de estudios
const deletePlanDeEstudios = (id, callback) => {
    db.query('DELETE FROM plan_estudios WHERE id_plan = ?', [id], callback);
};

module.exports = {
    getAllPlanesDeEstudios,
    getPlanesByNivel,
    getPlanDeEstudiosById,
    createPlanDeEstudios,
    updatePlanDeEstudios,
    deletePlanDeEstudios
};
