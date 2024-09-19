const db = require('../config/dbConfig');

const getAllSeguros = (callback) => {
    db.query('SELECT * FROM seguro', callback);
};

const getSegurosByNivel = (nivelId, callback) => {
    const query = `
        SELECT seguro.id_seguro, seguro.seguro_accidentes, seguro.seguro_estudiantil, seguro.cobertura_vive
        FROM seguro
        JOIN seguro_nivel ON seguro.id_seguro = seguro_nivel.id_seguro
        WHERE seguro_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

const getSeguroById = (id, callback) => {
    db.query('SELECT * FROM seguro WHERE id_seguro = ?', [id], callback);
};

const createSeguro = (seguro, callback) => {
    const { seguro_accidentes, seguro_estudiantil, cobertura_vive } = seguro;
    db.query('INSERT INTO seguro (seguro_accidentes, seguro_estudiantil, cobertura_vive) VALUES (?, ?, ?)', [seguro_accidentes, seguro_estudiantil, cobertura_vive], callback);
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
    getSeguroById,
    createSeguro,
    deleteSeguro,
    updateSeguro,
    changeColumnNames
};
