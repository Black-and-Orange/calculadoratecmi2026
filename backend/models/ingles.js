const db = require('../config/dbConfig');

// Obtener todos los ingles
const getAllIngles = (callback) => {
    db.query('SELECT * FROM ingles', callback);
};

// Obtener ingles por nivel
const getInglesByNivel = (nivelId, callback) => {
    const query = `
        SELECT ingles.id, ingles.num_ingles
        FROM ingles
        JOIN ingles_nivel ON ingles.id = ingles_nivel.certificado_id
        WHERE ingles_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const deleteAllIngles = (callback) => {
    db.query('DELETE FROM ingles', callback);
};

// Crear un certificado
const createCertificado = (maxNum, callback) => {
    db.query('INSERT INTO ingles SET ?', maxNum, callback);
};

const getLastInsertId = (callback) => {
    db.query('SELECT LAST_INSERT_ID()', (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].id);
    });
};


module.exports = {
    getAllIngles,
    getInglesByNivel,
    deleteAllIngles,
    createCertificado,
    getLastInsertId

};
