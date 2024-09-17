// models/formatoAsociadoNivel.js
const db = require('../config/dbConfig');

const getAllFormatoNiveles = (callback) => {
    db.query('SELECT * FROM formato_asociado_nivel', callback);
};

const getFormatoNivelById = (id, callback) => {
    db.query('SELECT * FROM formato_asociado_nivel WHERE id = ?', [id], callback);
};

const createFormatoNivel = (formato_asociadoNivel, callback) => {
    const { id_formato_asociado, id_nivel } = formato_asociadoNivel;
    db.query('INSERT INTO formato_asociado_nivel (id_formato_asociado, id_nivel) VALUES (?, ?)', [id_formato_asociado, id_nivel], callback);
};

const deleteFormatoNivel = (id, callback) => {
    db.query('DELETE FROM formato_asociado_nivel WHERE id_formato_asociado = ?', [id], callback);
};

const updateFormatoNivel = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE formato_asociado_nivel SET ${queryParts.join(', ')} WHERE id_formato_asociado = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllFormatoNiveles,
    getFormatoNivelById,
    createFormatoNivel,
    deleteFormatoNivel,
    updateFormatoNivel
};
