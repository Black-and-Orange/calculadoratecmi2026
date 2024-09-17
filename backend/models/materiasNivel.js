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

    // Verificar si los parámetros son válidos
    console.log('Datos recibidos para insertar en materias_nivel:', { id_materia, id_nivel });

    // Validar que los campos estén presentes
    if (!id_materia || !id_nivel) {
        console.error('Error: id_materia o id_nivel no proporcionados');
        return callback(new Error('id_materia y id_nivel son requeridos'));
    }

    // Ejecutar la consulta y registrar el resultado o el error
    const query = 'INSERT INTO materias_nivel (id_materia, id_nivel) VALUES (?, ?)';
    console.log('Consulta SQL:', query);  // Imprime la consulta para verificar
    console.log('Valores para insertar:', [id_materia, id_nivel]);  // Imprime los valores que se están pasando

    db.query(query, [id_materia, id_nivel], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);  // Registrar el error si ocurre
            return callback(err);
        }

        console.log('Inserción exitosa en materias_nivel, ID generado:', result.insertId);
        callback(null, result);
    });
};


const deleteMateriasNivel = (id_materia, callback) => {
    db.query('DELETE FROM materias_nivel WHERE id_materia = ?', [id_materia], callback);
};

const updateMateriasNivel = (id_materia, materiasNivel, callback) => {
    const { id_nivel } = materiasNivel;
    console.log(id_nivel);
    db.query('UPDATE materias_nivel SET id_nivel = ? WHERE id_materia = ?', [id_nivel, id_materia], callback);
};

module.exports = {
    getAllMateriasNiveles,
    getMateriasNivelById,
    createMateriasNivel,
    deleteMateriasNivel,
    updateMateriasNivel
};
