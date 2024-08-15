const db = require('../config/dbConfig');

const getAllIntereses = (callback) => {
    db.query('SELECT * FROM intereses', callback);
};

const getInteresesByNivel = (nivelId, callback) => {
    const query = `
        SELECT intereses.id, intereses.interes
        FROM intereses
        JOIN intereses_nivel ON intereses.id = intereses_nivel.intereses_id
        WHERE intereses_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getInteresById = (id, callback) => {
    db.query('SELECT * FROM intereses WHERE id = ?', [id], callback);
};

const createInteres = (intereses, callback) => {
    const { interes } = intereses;
    db.query('INSERT INTO intereses (interes) VALUES (?)', [interes], callback);
};

const deleteInteres = (id, callback) => {
    db.query('DELETE FROM intereses WHERE id = ?', [id], callback);
};

const updateInteres = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE intereses SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllIntereses,
    getInteresesByNivel,
    getInteresById,
    createInteres,
    deleteInteres,
    updateInteres
};
