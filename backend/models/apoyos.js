const db = require('../config/dbConfig');

const getAllApoyos = (callback) => {
    db.query('SELECT * FROM apoyosestudiantiles', callback);
};

const getApoyosByNivel = (nivelId, callback) => {
    const query = `
        SELECT apoyosestudiantiles.id, apoyosestudiantiles.porcentaje
        FROM apoyosestudiantiles
        JOIN apoyos_nivel ON apoyosestudiantiles.id = apoyos_nivel.apoyo_id
        WHERE apoyos_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getApoyoById = (id, callback) => {
    db.query('SELECT * FROM apoyosestudiantiles WHERE id = ?', [id], callback);
};

const createApoyo = (apoyo, callback) => {
    const { porcentaje } = apoyo;
    db.query('INSERT INTO apoyosestudiantiles (porcentaje) VALUES (?)', [porcentaje], callback);
};

const deleteApoyo = (id, callback) => {
    db.query('DELETE FROM apoyosestudiantiles WHERE id = ?', [id], callback);
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
    const query = `UPDATE apoyosestudiantiles SET ${queryParts.join(', ')} WHERE id = ?`;

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
