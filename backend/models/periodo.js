const db = require('../config/dbConfig');

const getAllPeriodos = (callback) => {
    db.query('SELECT * FROM periodo', callback);
};

const getPeriodosByNivel = (nivelId, callback) => {
    const query = `
        SELECT periodo.id_periodo, periodo.periodo_descripcion, periodo.periodo_codigo
        FROM periodo
        JOIN periodo_nivel ON periodo.id_periodo = periodo_nivel.id_periodo
        WHERE periodo_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

const getPeriodoById = (id, callback) => {
    db.query('SELECT * FROM periodo WHERE id_periodo = ?', [id], callback);
};

const createPeriodo = (periodo, callback) => {
    const { periodo_descripcion, periodo_codigo } = periodo;
    db.query('INSERT INTO periodo (periodo_descripcion, periodo_codigo) VALUES (?, ?)', [periodo_descripcion, periodo_codigo], callback);
};

const deletePeriodo = (id, callback) => {
    db.query('DELETE FROM periodo WHERE id_periodo = ?', [id], callback);
};

const updatePeriodo = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE periodo SET ${queryParts.join(', ')} WHERE id_periodo = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllPeriodos,
    getPeriodosByNivel,
    getPeriodoById,
    createPeriodo,
    deletePeriodo,
    updatePeriodo
};
