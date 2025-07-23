// models/SemanasNivel.js
const db = require('../config/dbConfig');

const getAllSemanasNiveles = (callback) => {
    db.query('SELECT * FROM semanas_nivel', callback);
};

const getSemanasNivelById = (id, callback) => {
    db.query('SELECT * FROM semanas_nivel WHERE id = ?', [id], callback);
};

const createSemanasNivel = (semanasNivel, callback) => {
    const { semanas_id, nivel_id } = semanasNivel;

    // Validar que los campos estén presentes
    if (!semanas_id || !nivel_id) {
        console.error('Error: semanas_id o nivel_id no proporcionados');
        return callback(new Error('semanas_id y nivel_id son requeridos'));
    }

    // Ejecutar la consulta y registrar el resultado o el error
    const query = 'INSERT INTO semanas_nivel (semanas_id, nivel_id) VALUES (?, ?)';

    db.query(query, [semanas_id, nivel_id], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return callback(err);
        }
        callback(null, result);
    });
};

const deleteSemanasNivel = (semanas_id, callback) => {
    db.query('DELETE FROM semanas_nivel WHERE semanas_id = ?', [semanas_id], callback);
};

const updateSemanasNivel = (semanas_id, semanasNivel, callback) => {
    const { nivel_id } = semanasNivel;
    db.query('UPDATE semanas_nivel SET nivel_id = ? WHERE semanas_id = ?', [nivel_id, semanas_id], callback);
};

module.exports = {
    getAllSemanasNiveles,
    getSemanasNivelById,
    createSemanasNivel,
    deleteSemanasNivel,
    updateSemanasNivel
};
