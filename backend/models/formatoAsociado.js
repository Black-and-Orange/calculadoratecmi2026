const db = require('../config/dbConfig');

const getAllFormatos = (callback) => {
    db.query('SELECT * FROM formato_asociado', callback);
};

const getFormatosByNivel = (nivelId, callback) => {
    const query = `
        SELECT formato_asociado.id_formato_asociado, formato_asociado.descripcion, foramto.costo
        FROM formato_asociado
        JOIN formato_asociado_nivel ON formato_asociado.id_formato_asociado = formato_asociado_nivel.id_formato_asociado
        WHERE formato_asociado_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

const getFormatoById = (id_formato_asociado, callback) => {
    db.query('SELECT * FROM formato_asociado WHERE id_formato_asociado = ?', [id_formato_asociado], callback);
};

const createFormato = (formato_asociado, callback) => {
    const { descripcion, costo } = formato_asociado;
    db.query('INSERT INTO formato_asociado (descripcion, costo) VALUES (?, ?)', [descripcion, costo], callback);
};

const deleteFormato = (id_formato_asociado, callback) => {
    db.query('DELETE FROM formato_asociado WHERE id_formato_asociado = ?', [id_formato_asociado], callback);
};

const updateFormato = (id_formato_asociado, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id_formato_asociado);
    const query = `UPDATE formato_asociado SET ${queryParts.join(', ')} WHERE id_formato_asociado = ?`;

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
