// models/MateriasNivel.js
const db = require('../config/dbConfig');

const getAllMateriasNiveles = (callback) => {
    db.query('SELECT * FROM materias_nivel', callback);
};

const getMateriasNivelById = (id, callback) => {
    db.query('SELECT * FROM materias_nivel WHERE id = ?', [id], callback);
};

const createMateriasNivel = (materiasNivel, callback) => {
    const { id_materia, id_nivel } = materiasNivel;

    // Validar que los campos estén presentes
    if (!id_materia || !id_nivel) {
        console.error('Error: id_materia o id_nivel no proporcionados');
        return callback(new Error('id_materia y id_nivel son requeridos'));
    }

    // Ejecutar la consulta y registrar el resultado o el error
    const query = 'INSERT INTO materias_nivel (id_materia, id_nivel) VALUES (?, ?)';

    db.query(query, [id_materia, id_nivel], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);  // Registrar el error si ocurre
            return callback(err);
        }
        callback(null, result);
    });
};


const deleteMateriasNivel = (id_materia, callback) => {
    db.query('DELETE FROM materias_nivel WHERE id_materia = ?', [id_materia], callback);
};

const updateMateriasNivel = (id_materia, materiasNivel, callback) => {
    const { id_nivel } = materiasNivel;
    db.query('UPDATE materias_nivel SET id_nivel = ? WHERE id_materia = ?', [id_nivel, id_materia], callback);
};

module.exports = {
    getAllMateriasNiveles,
    getMateriasNivelById,
    createMateriasNivel,
    deleteMateriasNivel,
    updateMateriasNivel
};
