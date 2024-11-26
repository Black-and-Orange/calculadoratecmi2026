// models/apoyoNivel.js
const db = require('../config/dbConfig');

const getAllApoyosNiveles = (callback) => {
    db.query('SELECT * FROM apoyos_fijos_nivel', callback);
};

const getApoyoNivelById = (id, callback) => {
    db.query('SELECT * FROM apoyos_fijos_nivel WHERE id = ?', [id], callback);
};

const createApoyoNivel = (apoyoNivel, callback) => {
    const { apoyo_id, nivel_id } = apoyoNivel;
    db.query('INSERT INTO apoyos_fijos_nivel (apoyo_id, nivel_id) VALUES (?, ?)', [apoyo_id, nivel_id], callback);
};

const deleteApoyoNivel = (apoyo_id, callback) => {
    db.query('DELETE FROM apoyos_fijos_nivel WHERE apoyo_id = ?', [apoyo_id], callback);
};

const updateApoyoNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE apoyos_fijos_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllApoyosNiveles,
    getApoyoNivelById,
    createApoyoNivel,
    deleteApoyoNivel,
    updateApoyoNivel
};
