// models/InglesNivel.js
const db = require('../config/dbConfig');

const getAllInglesNiveles = (callback) => {
    db.query('SELECT * FROM ingles_nivel', callback);
};

const getInglesNivelById = (id, callback) => {
    db.query('SELECT * FROM ingles_nivel WHERE id = ?', [id], callback);
};

const createInglesNivel = (inglesNivel, callback) => {
    const { certificado_id, nivel_id } = inglesNivel;

    // Verificar si los parámetros son válidos
    console.log('Datos recibidos para insertar en ingles_nivel:', { certificado_id, nivel_id });

    // Validar que los campos estén presentes
    if (!certificado_id || !nivel_id) {
        console.error('Error: certificado_id o nivel_id no proporcionados');
        return callback(new Error('certificado_id y nivel_id son requeridos'));
    }

    // Ejecutar la consulta y registrar el resultado o el error
    const query = 'INSERT INTO ingles_nivel (certificado_id, nivel_id) VALUES (?, ?)';
    console.log('Consulta SQL:', query);  // Imprime la consulta para verificar
    console.log('Valores para insertar:', [certificado_id, nivel_id]);  // Imprime los valores que se están pasando

    db.query(query, [certificado_id, nivel_id], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);  // Registrar el error si ocurre
            return callback(err);
        }

        console.log('Inserción exitosa en ingles_nivel, ID generado:', result.insertId);
        callback(null, result);
    });
};


const deleteInglesNivel = (certificado_id, callback) => {
    db.query('DELETE FROM ingles_nivel WHERE certificado_id = ?', [certificado_id], callback);
};

const updateInglesNivel = (certificado_id, inglesNivel, callback) => {
    const { nivel_id } = inglesNivel;
    console.log(nivel_id);
    db.query('UPDATE ingles_nivel SET nivel_id = ? WHERE certificado_id = ?', [nivel_id, certificado_id], callback);
};

module.exports = {
    getAllInglesNiveles,
    getInglesNivelById,
    createInglesNivel,
    deleteInglesNivel,
    updateInglesNivel
};
