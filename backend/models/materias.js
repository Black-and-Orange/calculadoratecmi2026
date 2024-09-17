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
    console.log(materia);
    
    const { numero } = materia;
    console.log(numero);
    
    if (!numero) {
        return callback(new Error('El número de materias es requerido'));
    }
    db.query('INSERT INTO materias (numero) VALUES (?)', [numero], callback);
};

// Actualizar una materia
const updateMateria = (id_materia, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id_materia);
    const query = `UPDATE materias SET ${queryParts.join(', ')} WHERE id_materia = ?`;

    db.query(query, queryValues, callback);
};

// Eliminar una materia
const deleteMateria = (id_materia, callback) => {
    db.query('DELETE FROM materias WHERE id_materia = ?', [id_materia], callback);
};

module.exports = {
    getAllMaterias,
    getMateriasByNivel,
    getMateriaById,
    createMateria,
    updateMateria,
    deleteMateria
};
