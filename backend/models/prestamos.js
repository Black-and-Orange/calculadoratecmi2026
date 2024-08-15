const db = require('../config/dbConfig');

const getAllPrestamos = (callback) => {
    db.query('SELECT * FROM prestamos', callback);
};

const getPrestamosByNivel = (nivelId, callback) => {
    const query = `
        SELECT prestamos.id, prestamos.prestamo
        FROM prestamos
        JOIN prestamos_nivel ON prestamos.id = prestamos_nivel.prestamo_id
        WHERE prestamos_nivel.nivel_id = ?
    `;
    db.query(query, [nivelId], callback);
};

const getPrestamoById = (id, callback) => {
    db.query('SELECT * FROM prestamos WHERE id = ?', [id], callback);
};

const createPrestamo = (prestamoData, callback) => {
    const { prestamo } = prestamoData;
    db.query('INSERT INTO prestamos (prestamo) VALUES (?)', [prestamo], callback);
};

const deletePrestamo = (id, callback) => {
    db.query('DELETE FROM prestamos WHERE id = ?', [id], callback);
};

const updatePrestamo = (id, updates, callback) => {
    const queryParts = [];
    const queryValues = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            queryParts.push(`${key} = ?`);
            queryValues.push(updates[key]);
        }
    }

    queryValues.push(id);
    const query = `UPDATE prestamos SET ${queryParts.join(', ')} WHERE id = ?`;

    db.query(query, queryValues, callback);
};

module.exports = {
    getAllPrestamos,
    getPrestamosByNivel,
    getPrestamoById,
    createPrestamo,
    deletePrestamo,
    updatePrestamo
};
