// models/BeneficioNivel.js
const db = require('../config/dbConfig');

const getAllBeneficiosNiveles = (callback) => {
    db.query('SELECT * FROM beneficio_nivel', callback);
};

const getBeneficioNivelById = (id, callback) => {
    db.query('SELECT * FROM beneficio_nivel WHERE id = ?', [id], callback);
};

const createBeneficioNivel = (beneficioNivel, callback) => {
    const { beneficio_id, nivel_id } = beneficioNivel;
    db.query('INSERT INTO beneficio_nivel (beneficio_id, nivel_id) VALUES (?, ?)', [beneficio_id, nivel_id], callback);
};

const deleteBeneficioNivel = (id, callback) => {
    db.query('DELETE FROM beneficio_nivel WHERE id = ?', [id], callback);
};

const updateBeneficioNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE beneficio_nivel SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllBeneficiosNiveles,
    getBeneficioNivelById,
    createBeneficioNivel,
    deleteBeneficioNivel,
    updateBeneficioNivel
};
