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
    db.query('SELECT * FROM plan_estudios WHERE id = ?', [id], callback);
};

// Crear un nuevo plan de estudios
const createPlanDeEstudios = (plan, callback) => {
    const { nombre, nivel_id } = plan;
    if (!nombre || !nivel_id) {
        return callback(new Error('Nombre y nivel_id son requeridos'));
    }
    db.query('INSERT INTO plan_estudios (nombre, nivel_id) VALUES (?, ?)', [nombre, nivel_id], callback);
};

// Actualizar un plan de estudios
const updatePlanDeEstudios = (id, plan, callback) => {
    const { nombre, nivel_id } = plan;
    if (!nombre || !nivel_id) {
        return callback(new Error('Nombre y nivel_id son requeridos'));
    }
    db.query('UPDATE plan_estudios SET nombre = ?, nivel_id = ? WHERE id = ?', [nombre, nivel_id, id], callback);
};

// Eliminar un plan de estudios
const deletePlanDeEstudios = (id, callback) => {
    db.query('DELETE FROM plan_estudios WHERE id = ?', [id], callback);
};

module.exports = {
    getAllPlanesDeEstudios,
    getPlanesByNivel,
    getPlanDeEstudiosById,
    createPlanDeEstudios,
    updatePlanDeEstudios,
    deletePlanDeEstudios
};
