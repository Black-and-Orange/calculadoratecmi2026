const db = require('../config/dbConfig');

// Obtener todos los niveles
const getAllNiveles = (callback) => {
    db.query('SELECT * FROM nivel', callback);
};

// Obtener un nivel por ID
const getNivelById = (id, callback) => {
    db.query('SELECT * FROM nivel WHERE id = ?', [id], callback);
};

// Crear un nuevo nivel
const createNivel = (nivel, callback) => {
    const { nombre } = nivel;
    if (!nombre) {
        return callback(new Error('Nombre es requerido'));
    }
    db.query('INSERT INTO nivel (nombre) VALUES (?)', [nombre], callback);
};

// Actualizar un nivel
const updateNivel = (id, nivel, callback) => {
    const { nombre } = nivel;
    if (!nombre) {
        return callback(new Error('Nombre es requerido'));
    }
    db.query('UPDATE nivel SET nombre = ? WHERE id = ?', [nombre, id], callback);
};

// Eliminar un nivel
const deleteNivel = (id, callback) => {
    db.query('DELETE FROM nivel WHERE id = ?', [id], callback);
};

module.exports = {
    getAllNiveles,
    getNivelById,
    createNivel,
    updateNivel,
    deleteNivel
};
