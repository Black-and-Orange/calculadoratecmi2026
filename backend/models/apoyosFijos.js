const db = require('../config/dbConfig');

const getAllApoyos = (callback) => {
    db.query('SELECT * FROM apoyosfijos', callback);
};

const getApoyosByNivel = (nivelId, callback) => {
    const query = `
        SELECT apoyosfijos.id, apoyosfijos.valor
        FROM apoyosfijos
        JOIN apoyos_fijos_nivel ON apoyosfijos.id = apoyos_fijos_nivel.apoyo_id
        WHERE apoyos_fijos_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getApoyoById = (id, callback) => {
    db.query('SELECT * FROM apoyosfijos WHERE id = ?', [id], callback);
};

const createApoyo = (apoyo, callback) => {
    const { valor } = apoyo;
    db.query('INSERT INTO apoyosfijos (valor) VALUES (?)', [valor], callback);
};

const deleteApoyo = (id, callback) => {
    db.query('DELETE FROM apoyosfijos WHERE id = ?', [id], callback);
};

const updateApoyo = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE apoyosfijos SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllApoyos,
    getApoyosByNivel,
    getApoyoById,
    createApoyo,
    deleteApoyo,
    updateApoyo
};
