const db = require('../config/dbConfig');

// Obtener todas las ingles
const getAllIngles = (callback) => {
    db.query('SELECT * FROM ingles', callback);
};

const getInglesByNivel = (nivelId, callback) => {
    const query = `
        SELECT ingles.id, ingles.num_ingles
        FROM ingles
        JOIN ingles_nivel ON ingles.id = ingles_nivel.id
        WHERE ingles_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

// Obtener una materia por ID
const getInglesById = (id, callback) => {
    db.query('SELECT * FROM ingles WHERE id = ?', [id], callback);
};

// Crear una nueva materia
const createIngles = (materia, callback) => {

    const { num_ingles } = materia;
    
    if (!num_ingles) {
        return callback(new Error('El número de ingles es requerido'));
    }
    db.query('INSERT INTO ingles (num_ingles) VALUES (?)', [num_ingles], callback);
};

// Actualizar una materia
const updateIngles = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE ingles SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

// Eliminar una materia
const deleteIngles = (id, callback) => {
    db.query('DELETE FROM ingles WHERE id = ?', [id], callback);
};

module.exports = {
    getAllIngles,
    getInglesByNivel,
    getInglesById,
    createIngles,
    updateIngles,
    deleteIngles
};
