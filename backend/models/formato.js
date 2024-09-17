const db = require('../config/dbConfig');

const getAllFormatos = (callback) => {
    db.query('SELECT * FROM formato', callback);
};

const getFormatosByNivel = (nivelId, callback) => {
    const query = `
        SELECT formato.id_formato, formato.descripcion, formato.codigo
        FROM formato
        JOIN formato_nivel ON formato.id_formato = formato_nivel.id_formato
        WHERE formato_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

const getFormatoById = (id_formato, callback) => {
    db.query('SELECT * FROM formato WHERE id_formato = ?', [id_formato], callback);
};

const createFormato = (formato, callback) => {
    const { descripcion, codigo } = formato;
    db.query('INSERT INTO formato (descripcion, codigo) VALUES (?, ?)', [descripcion, codigo], callback);
};

const deleteFormato = (id_formato, callback) => {
    db.query('DELETE FROM formato WHERE id_formato = ?', [id_formato], callback);
};

const updateFormato = (id_formato, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id_formato);
    const query = `UPDATE formato SET ${queryParts.join(', ')} WHERE id_formato = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllFormatos,
    getFormatosByNivel,
    getFormatoById,
    createFormato,
    deleteFormato,
    updateFormato
};
