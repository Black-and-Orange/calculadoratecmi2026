const db = require('../config/dbConfig');

// Obtener todas las semanas
const getAllSemanas = (callback) => {
    db.query('SELECT * FROM semanas', callback);
};

const getSemanasByNivel = (nivelId, callback) => {
    const query = `
        SELECT semanas.id, semanas.num_semanas
        FROM semanas
        JOIN semanas_nivel ON semanas.id = semanas_nivel.semanas_id
        WHERE semanas_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

// Obtener una semanas por ID
const getSemanasById = (id, callback) => {
    db.query('SELECT * FROM semanas WHERE id = ?', [id], callback);
};

// Crear una nueva semanas
const createSemanas = (semanas, callback) => {
    
    const { num_semanas } = semanas;
    
    if (!num_semanas) {
        return callback(new Error('El número de semanas es requerido'));
    }
    db.query('INSERT INTO semanas (num_semanas) VALUES (?)', [num_semanas], callback);
};

// Actualizar una semanas
const updateSemanas = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE semanas SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

// Eliminar una semanas
const deleteSemanas = (id, callback) => {
    db.query('DELETE FROM semanas WHERE id = ?', [id], callback);
};

module.exports = {
    getAllSemanas,
    getSemanasByNivel,
    getSemanasById,
    createSemanas,
    updateSemanas,
    deleteSemanas
};
