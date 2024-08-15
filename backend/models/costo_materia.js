const db = require('../config/dbConfig');

// Obtener todos los costos de materias
const getAllCostosMateria = (callback) => {
    db.query('SELECT * FROM costo_materia', callback);
};

const getCostosByNivel = (nivelId, callback) => {
    const query = `
        SELECT costo_materia.id_costo, costo_materia.clave, costo_materia.costo
        FROM costo_materia
        JOIN costo_materia_nivel ON costo_materia.id_costo = costo_materia_nivel.id_costo
        WHERE costo_materia_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

// Obtener un costo de materia por ID
const getCostoMateriaById = (id, callback) => {
    db.query('SELECT * FROM costo_materia WHERE id = ?', [id], callback);
};

// Crear un nuevo costo de materia
const createCostoMateria = (costoMateria, callback) => {
    const { clave, costo } = costoMateria;
    if (!clave || !costo) {
        return callback(new Error('Todos los campos son requeridos'));
    }
    db.query(
        'INSERT INTO costo_materia (clave, costo) VALUES (?, ?)',
        [clave, costo],
        callback
    );
};

// Actualizar un costo de materia
const updateCostoMateria = (id, costoMateria, callback) => {
    const { clave, costo } = costoMateria;
    if (!clave || !costo) {
        return callback(new Error('Todos los campos son requeridos'));
    }
    db.query(
        'UPDATE costo_materia SET clave = ?, costo = ? WHERE id = ?',
        [clave, costo, id],
        callback
    );
};

// Eliminar un costo de materia
const deleteCostoMateria = (id, callback) => {
    db.query('DELETE FROM costo_materia WHERE id = ?', [id], callback);
};

module.exports = {
    getAllCostosMateria,
    getCostosByNivel,
    getCostoMateriaById,
    createCostoMateria,
    updateCostoMateria,
    deleteCostoMateria
};
