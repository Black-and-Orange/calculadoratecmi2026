const db = require('../config/dbConfig');

// Obtener todos los certificados
const getAllCertificados = (callback) => {
    db.query('SELECT * FROM certificados', callback);
};

// Obtener certificados por nivel
const getCertificadosByNivel = (nivelId, callback) => {
    const query = `
        SELECT certificados.id, certificados.num_certificados
        FROM certificados
        JOIN certificados_nivel ON certificados.id = certificados_nivel.certificado_id
        WHERE certificados_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const deleteAllCertificados = (callback) => {
    db.query('DELETE FROM certificados', callback);
};

// Crear un certificado
const createCertificado = (maxNum, callback) => {
    db.query('INSERT INTO certificados SET ?', maxNum, callback);
};

const getLastInsertId = (callback) => {
    db.query('SELECT LAST_INSERT_ID()', (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].id);
    });
};


module.exports = {
    getAllCertificados,
    getCertificadosByNivel,
    deleteAllCertificados,
    createCertificado,
    getLastInsertId

};
