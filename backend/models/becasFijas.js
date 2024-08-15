const db = require('../config/dbConfig');

const getAllBecasFijas = (callback) => {
    db.query('SELECT * FROM beca_fija', callback);
};

const getBecaFijaByNivel = (nivelId, callback) => {
    const query = `
        SELECT beca_fija.id, beca_fija.tipo, beca_fija.promedio, beca_fija.porcentaje
        FROM beca_fija
        JOIN beca_fija_nivel ON beca_fija.id = beca_fija_nivel.beca_fija_id
        WHERE beca_fija_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getBecaFijaById = (id, callback) => {
    db.query('SELECT * FROM beca_fija WHERE id = ?', [id], callback);
};

const createBecaFija = (beca_fija, callback) => {
    const { tipo, promedio, porcentaje } = beca_fija;
    db.query('INSERT INTO beca_fija (tipo, promedio, porcentaje) VALUES (?, ?)', [tipo, promedio, porcentaje], callback);
};

const deleteBecaFija = (id, callback) => {
    db.query('DELETE FROM beca_fija WHERE id = ?', [id], callback);
};

const updateBecaFija = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE beca_fija SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllBecasFijas,
    getBecaFijaByNivel,
    getBecaFijaById,
    createBecaFija,
    deleteBecaFija,
    updateBecaFija
};
