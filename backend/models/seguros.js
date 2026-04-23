const db = require('../config/dbConfig');

const getAllSeguros = (callback) => {
    db.query('SELECT * FROM seguro', callback);
};

const getSegurosByNivel = (nivelId, callback) => {
    const query = `
        SELECT 
            s.id_seguro, 
            s.nombre_seguro, 
            sn.valor, 
            sn.estado
        FROM seguro s
        JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
        WHERE sn.id_nivel = ? AND sn.estado = TRUE
        ORDER BY s.nombre_seguro
    `;
    db.query(query, [nivelId], callback);
};

const getSegurosByNivelAll = (nivelId, callback) => {
    const query = `
        SELECT 
            s.id_seguro, 
            s.nombre_seguro, 
            sn.valor, 
            sn.estado
        FROM seguro s
        JOIN seguro_nivel sn ON s.id_seguro = sn.id_seguro
        WHERE sn.id_nivel = ?
        ORDER BY s.nombre_seguro
    `;
    db.query(query, [nivelId], callback);
};

const getSeguroById = (id, callback) => {
    db.query('SELECT * FROM seguro WHERE id_seguro = ?', [id], callback);
};

const createSeguro = (seguro, callback) => {
    const { nombre_seguro } = seguro;
    db.query('INSERT INTO seguro (nombre_seguro) VALUES (?)', [nombre_seguro], callback);
};

const deleteSeguro = (id, callback) => {
    db.query('DELETE FROM seguro WHERE id_seguro = ?', [id], callback);
};

const updateSeguro = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE seguro SET ${queryParts.join(', ')} WHERE id_seguro = ?`;

    db.query(query, queryValues, callback);
};

const changeColumnNames = (columnChanges, callback) => {
    const alterStatements = Object.entries(columnChanges).map(([oldName, newName]) => {
        return `CHANGE ${oldName} ${newName} DECIMAL(10,2)`; 
    });

    const query = `ALTER TABLE seguro ${alterStatements.join(', ')};`;

    db.query(query, callback);
};


module.exports = {
    getAllSeguros,
    getSegurosByNivel,
    getSegurosByNivelAll,
    getSeguroById,
    createSeguro,
    deleteSeguro,
    updateSeguro,
    changeColumnNames
};
