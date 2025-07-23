const db = require('../config/dbConfig');

// Obtener todas las certificados
const getAllCertificados = (callback) => {
    db.query('SELECT * FROM certificados', callback);
};

const getCertificadosByNivel = (nivelId, callback) => {
    const query = `
        SELECT certificados.id, certificados.num_certificados
        FROM certificados
        JOIN certificados_nivel ON certificados.id = certificados_nivel.certificado_id
        WHERE certificados_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

// Obtener una materia por ID
const getCertificadoById = (id, callback) => {
    db.query('SELECT * FROM certificados WHERE id = ?', [id], callback);
};

// Crear una nueva materia
const createCertificado = (materia, callback) => {
    
    const { num_certificados } = materia;
    
    if (!num_certificados) {
        return callback(new Error('El número de certificados es requerido'));
    }
    db.query('INSERT INTO certificados (num_certificados) VALUES (?)', [num_certificados], callback);
};

// Actualizar una materia
const updateCertificado = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE certificados SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

// Eliminar una materia
const deleteCertificado = (id, callback) => {
    db.query('DELETE FROM certificados WHERE id = ?', [id], callback);
};

module.exports = {
    getAllCertificados,
    getCertificadosByNivel,
    getCertificadoById,
    createCertificado,
    updateCertificado,
    deleteCertificado
};
