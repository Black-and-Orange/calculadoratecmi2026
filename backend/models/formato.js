const db = require('../config/dbConfig');

// Obtener todos los formatos
const getAllFormatos = (callback) => {
    db.query('SELECT * FROM formato', callback);
};

const getFormatosByNivel = (nivelId, callback) => {
    const query = `
        SELECT formato.id_formato, formato.descripcion
        FROM formato
        JOIN formato_nivel ON formato.id_formato = formato_nivel.id_formato
        WHERE formato_nivel.id_nivel = ?
    `;
    db.query(query, [nivelId], callback);
};

// Obtener un formato por ID
const getFormatoById = (id, callback) => {
    db.query('SELECT * FROM formato WHERE id = ?', [id], callback);
};

// Crear un nuevo formato
const createFormato = (formato, callback) => {
    const { nombre, descripcion } = formato;
    if (!nombre || !descripcion) {
        return callback(new Error('Nombre y descripción son requeridos'));
    }
    db.query('INSERT INTO formato (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], callback);
};

// Actualizar un formato
const updateFormato = (id, formato, callback) => {
    const { nombre, descripcion } = formato;
    if (!nombre || !descripcion) {
        return callback(new Error('Nombre y descripción son requeridos'));
    }
    db.query('UPDATE formato SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id], callback);
};

// Eliminar un formato
const deleteFormato = (id, callback) => {
    db.query('DELETE FROM formato WHERE id = ?', [id], callback);
};

module.exports = {
    getAllFormatos,
    getFormatosByNivel,
    getFormatoById,
    createFormato,
    updateFormato,
    deleteFormato
};
