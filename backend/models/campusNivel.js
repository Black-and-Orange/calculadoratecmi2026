// models/campusNivel.js
const db = require('../config/dbConfig');

const getAllCampusNiveles = (callback) => {
    db.query('SELECT * FROM campus_nivel', callback);
};

const getCampusNivelById = (id, callback) => {
    db.query('SELECT * FROM campus_nivel WHERE id = ?', [id], callback);
};

const createCampusNivel = (campusNivel, callback) => {
    const { campus_id, nivel_id, categoria_coleg = null } = campusNivel;
    db.query(
        'INSERT INTO campus_nivel (campus_id, nivel_id, categoria_coleg) VALUES (?, ?, ?)',
        [campus_id, nivel_id, categoria_coleg],
        callback
    );
};

// Edita la categoría de UN campus en UN nivel (sin afectar otros niveles).
const updateCampusNivelCategoria = (campus_id, nivel_id, categoria_coleg, callback) => {
    db.query(
        'UPDATE campus_nivel SET categoria_coleg = ? WHERE campus_id = ? AND nivel_id = ?',
        [categoria_coleg, campus_id, nivel_id],
        callback
    );
};

const deleteCampusNivel = (id, callback) => {
    db.query('DELETE FROM campus_nivel WHERE id = ?', [id], callback);
};

// Quita la liga de UN campus en UN nivel (sin afectar su presencia en otros niveles).
const deleteByCampusNivel = (campus_id, nivel_id, callback) => {
    db.query('DELETE FROM campus_nivel WHERE campus_id = ? AND nivel_id = ?', [campus_id, nivel_id], callback);
};

// ¿En cuántos niveles sigue usado este campus? (para decidir si se borra la fila de campus).
const countByCampus = (campus_id, callback) => {
    db.query('SELECT COUNT(*) AS n FROM campus_nivel WHERE campus_id = ?', [campus_id], callback);
};

// ¿Ya existe la liga (campus, nivel)? (para no duplicar al agregar).
const findByCampusNivel = (campus_id, nivel_id, callback) => {
    db.query('SELECT * FROM campus_nivel WHERE campus_id = ? AND nivel_id = ? LIMIT 1', [campus_id, nivel_id], callback);
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
    deleteByCampusNivel,
    countByCampus,
    findByCampusNivel,
    updateCampusNivel,
    updateCampusNivelCategoria
};
