const db = require('../config/dbConfig');

const getAllBeneficios = (callback) => {
    db.query('SELECT * FROM beneficio', callback);
};

const getBeneficioByNivel = (nivelId, callback) => {
    const query = `
        SELECT beneficio.id, beneficio.nombre, beneficio.descripcion, beneficio.icono
        FROM beneficio
        JOIN beneficio_nivel ON beneficio.id = beneficio_nivel.beneficio_id
        WHERE beneficio_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getBeneficioById = (id, callback) => {
    db.query('SELECT * FROM beneficio WHERE id = ?', [id], callback);
};

const createBeneficio = (beneficio, callback) => {
    const { nombre, descripcion, icono } = beneficio;
    db.query('INSERT INTO beneficio (nombre, descripcion, icono) VALUES (?, ?)', [nombre, descripcion, icono], callback);
};

const deleteBeneficio = (id, callback) => {
    db.query('DELETE FROM beneficio WHERE id = ?', [id], callback);
};

const updateBeneficio = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE beneficio SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllBeneficios,
    getBeneficioByNivel,
    getBeneficioById,
    createBeneficio,
    deleteBeneficio,
    updateBeneficio
};
