const db = require('../config/dbConfig');

// Obtener todas las periodicidades
const getAllPeriodicidades = (callback) => {
    db.query('SELECT * FROM periodicidad', callback);
};

// Obtener una periodicidad por ID
const getPeriodicidadById = (id, callback) => {
    db.query('SELECT * FROM periodicidad WHERE id = ?', [id], callback);
};

// Crear una nueva periodicidad
const createPeriodicidad = (periodicidad, callback) => {
    const { nombre } = periodicidad;
    if (!nombre) {
        return callback(new Error('Nombre es requerido'));
    }
    db.query('INSERT INTO periodicidad (nombre) VALUES (?)', [nombre], callback);
};

// Actualizar una periodicidad
const updatePeriodicidad = (id, periodicidad, callback) => {
    const { nombre } = periodicidad;
    if (!nombre) {
        return callback(new Error('Nombre es requerido'));
    }
    db.query('UPDATE periodicidad SET nombre = ? WHERE id = ?', [nombre, id], callback);
};

// Eliminar una periodicidad
const deletePeriodicidad = (id, callback) => {
    db.query('DELETE FROM periodicidad WHERE id = ?', [id], callback);
};

module.exports = {
    getAllPeriodicidades,
    getPeriodicidadById,
    createPeriodicidad,
    updatePeriodicidad,
    deletePeriodicidad
};
