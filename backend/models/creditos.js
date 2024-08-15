const db = require('../config/dbConfig');

const getAllCreditos = (callback) => {
    db.query('SELECT * FROM creditos', callback);
};

const getCreditosByNivel = (nivelId, callback) => {
    const query = `
        SELECT creditos.id, creditos.credito
        FROM creditos
        JOIN creditos_nivel ON creditos.id = creditos_nivel.credito_id
        WHERE creditos_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

const getCreditoById = (id, callback) => {
    db.query('SELECT * FROM creditos WHERE id = ?', [id], callback);
};

const createCredito = (creditoData, callback) => {
    const { credito } = creditoData;
    db.query('INSERT INTO creditos (credito) VALUES (?)', [credito], callback);
};

const deleteCredito = (id, callback) => {
    db.query('DELETE FROM creditos WHERE id = ?', [id], callback);
};

const updateCredito = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE creditos SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllCreditos,
    getCreditosByNivel,
    getCreditoById,
    createCredito,
    deleteCredito,
    updateCredito
};
