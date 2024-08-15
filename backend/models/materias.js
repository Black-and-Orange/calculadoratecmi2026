const db = require('../config/dbConfig');

// Obtener todas las materias
const getAllMaterias = (callback) => {
    db.query('SELECT * FROM materias', callback);
};

const getMateriasByNivel = (nivelId, callback) => {
    const query = `
        SELECT materias.id_materia, materias.numero
        FROM materias
        JOIN materias_nivel ON materias.id_materia = materias_nivel.id_materia
        WHERE materias_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

// Obtener una materia por ID
const getMateriaById = (id, callback) => {
    db.query('SELECT * FROM materias WHERE id = ?', [id], callback);
};

// Crear una nueva materia
const createMateria = (materia, callback) => {
    const { numero_materias } = materia;
    if (!numero_materias) {
        return callback(new Error('El número de materias es requerido'));
    }
    db.query('INSERT INTO materias (numero_materias) VALUES (?)', [numero_materias], callback);
};

// Actualizar una materia
const updateMateria = (id, materia, callback) => {
    const { numero_materias } = materia;
    if (!numero_materias) {
        return callback(new Error('El número de materias es requerido'));
    }
    db.query('UPDATE materias SET numero_materias = ? WHERE id = ?', [numero_materias, id], callback);
};

// Eliminar una materia
const deleteMateria = (id, callback) => {
    db.query('DELETE FROM materias WHERE id = ?', [id], callback);
};

module.exports = {
    getAllMaterias,
    getMateriasByNivel,
    getMateriaById,
    createMateria,
    updateMateria,
    deleteMateria
};
