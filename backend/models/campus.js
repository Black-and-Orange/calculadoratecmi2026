const db = require('../config/dbConfig');

const getAllCampuses = (callback) => {
    db.query('SELECT * FROM campus', callback);
};

const getCampusesByNivel = (nivelId, callback) => {
    // La categoría ahora vive por nivel en campus_nivel (editable por nivel).
    // Se expone como `categoria_coleg` para que el front/admin no cambien.
    const query = `
        SELECT campus.id, campus.nombre, campus_nivel.categoria_coleg
        FROM campus
        JOIN campus_nivel ON campus.id = campus_nivel.campus_id
        WHERE campus_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getCampusById = (id, callback) => {
    db.query('SELECT * FROM campus WHERE id = ?', [id], callback);
};

// Busca un campus por nombre (para reusar la fila al agregarlo a un nivel y no duplicar).
const getCampusByNombre = (nombre, callback) => {
    db.query('SELECT * FROM campus WHERE nombre = ? LIMIT 1', [nombre], callback);
};

const createCampus = (campus, callback) => {
    const { nombre, categoria_coleg } = campus;
    db.query('INSERT INTO campus (nombre, categoria_coleg) VALUES (?, ?)', [nombre, categoria_coleg], callback);
};

const deleteCampus = (id, callback) => {
    db.query('DELETE FROM campus WHERE id = ?', [id], callback);
};

const updateCampus = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE campus SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllCampuses,
    getCampusesByNivel,
    getCampusById,
    getCampusByNombre,
    createCampus,
    deleteCampus,
    updateCampus
};
