const db = require('../config/dbConfig');

// Obtener todos los semanas
const getAllSemanas = (callback) => {
    db.query('SELECT * FROM semanas', callback);
};

// Obtener semanas por nivel
const getSemanasByNivel = (nivelId, callback) => {
    const query = `
        SELECT semanas.id, semanas.num_semanas
        FROM semanas
        JOIN semanas_nivel ON semanas.id = semanas_nivel.certificado_id
        WHERE semanas_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const deleteAllSemanas = (callback) => {
    db.query('DELETE FROM semanas', callback);
};

// Crear un certificado
const createCertificado = (maxNum, callback) => {
    db.query('INSERT INTO semanas SET ?', maxNum, callback);
};

const getLastInsertId = (callback) => {
    db.query('SELECT LAST_INSERT_ID()', (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].id);
    });
};


module.exports = {
    getAllSemanas,
    getSemanasByNivel,
    deleteAllSemanas,
    createCertificado,
    getLastInsertId

};
