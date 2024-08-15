// models/prestamoNivel.js
const db = require('../config/dbConfig');

const getAllPrestamosNiveles = (callback) => {
    db.query('SELECT * FROM prestamos_nivel', callback);
};

const getPrestamoNivelById = (id, callback) => {
    db.query('SELECT * FROM prestamos_nivel WHERE id = ?', [id], callback);
};

const createPrestamoNivel = (prestamoNivel, callback) => {
    const { prestamo_id, nivel_id } = prestamoNivel;
    db.query('INSERT INTO prestamos_nivel (prestamo_id, nivel_id) VALUES (?, ?)', [prestamo_id, nivel_id], callback);
};

const deletePrestamoNivel = (id, callback) => {
    db.query('DELETE FROM prestamos_nivel WHERE id = ?', [id], callback);
};

const updatePrestamoNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE prestamos_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllPrestamosNiveles,
    getPrestamoNivelById,
    createPrestamoNivel,
    deletePrestamoNivel,
    updatePrestamoNivel
};
