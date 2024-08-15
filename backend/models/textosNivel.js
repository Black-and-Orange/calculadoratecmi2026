// models/campusNivel.js
const db = require('../config/dbConfig');

const getAllCampusNiveles = (callback) => {
    db.query('SELECT * FROM campus_nivel', callback);
};

const getCampusNivelById = (id, callback) => {
    db.query('SELECT * FROM campus_nivel WHERE id = ?', [id], callback);
};

const createCampusNivel = (campusNivel, callback) => {
    const { campus_id, nivel_id } = campusNivel;
    db.query('INSERT INTO campus_nivel (campus_id, nivel_id) VALUES (?, ?)', [campus_id, nivel_id], callback);
};

const deleteCampusNivel = (id, callback) => {
    db.query('DELETE FROM campus_nivel WHERE id = ?', [id], callback);
};

const updateCampusNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE campus_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllCampusNiveles,
    getCampusNivelById,
    createCampusNivel,
    deleteCampusNivel,
    updateCampusNivel
};
