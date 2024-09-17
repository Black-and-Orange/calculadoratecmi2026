const db = require('../config/dbConfig');

const getAllBecasVariables = (callback) => {
    db.query('SELECT * FROM beca_variable', callback);
};

const getBecaVariableByNivel = (nivelId, callback) => {
    const query = `
        SELECT beca_variable.id, beca_variable.tipo, beca_variable.porcentaje_min, beca_variable.porcentaje_max, beca_variable.promedio_min, beca_variable.promedio_max
        FROM beca_variable
        JOIN beca_variable_nivel ON beca_variable.id = beca_variable_nivel.beca_variable_id
        WHERE beca_variable_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getBecaVariableById = (id, callback) => {
    db.query('SELECT * FROM beca_variable WHERE id = ?', [id], callback);
};

const createBecaVariable = (beca_variable, callback) => {
    const { tipo, porcentaje_min, porcentaje_max, promedio_min, promedio_max } = beca_variable;
    db.query('INSERT INTO beca_variable (tipo, porcentaje_min, porcentaje_max, promedio_min, promedio_max) VALUES (?, ?, ?, ?, ?)',
        [tipo, porcentaje_min, porcentaje_max, promedio_min, promedio_max], callback);
};

const deleteBecaVariable = (id, callback) => {
    db.query('DELETE FROM beca_variable WHERE id = ?', [id], callback);
};

const updateBecaVariable = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE beca_variable SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllBecasVariables,
    getBecaVariableByNivel,
    getBecaVariableById,
    createBecaVariable,
    deleteBecaVariable,
    updateBecaVariable
};
