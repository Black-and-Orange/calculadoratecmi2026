const db = require('../config/dbConfig');

const getAllTextos = (callback) => {
    db.query('SELECT * FROM textos', callback);
};

const getTextoByNivel = (nivelId, callback) => {
    const query = `
        SELECT textos.id, textos.texto
        FROM textos
        JOIN textos_nivel ON textos.id = textos_nivel.textos_id
        WHERE textos_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getTextoById = (id, callback) => {
    db.query('SELECT * FROM textos WHERE id = ?', [id], callback);
};

const createTexto = (textos, callback) => {
    const { texto } = textos;
    db.query('INSERT INTO textos (texto) VALUES (?, ?)', [texto], callback);
};

const deleteTexto = (id, callback) => {
    db.query('DELETE FROM textos WHERE id = ?', [id], callback);
};

const updateTexto = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE textos SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllTextos,
    getTextoByNivel,
    getTextoById,
    createTexto,
    deleteTexto,
    updateTexto
};
