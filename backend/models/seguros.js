const db = require('../config/dbConfig');

// Obtener todos los seguros
const getAllSeguros = (callback) => {
    db.query('SELECT * FROM seguros', callback);
};

// Obtener un seguro por ID
const getSeguroById = (id, callback) => {
    db.query('SELECT * FROM seguros WHERE id = ?', [id], callback);
};

// Crear un nuevo seguro
const createSeguro = (seguro, callback) => {
    const { seguro_accidentes, seguro_estudiantil, cobertura_vive } = seguro;
    if (!seguro_accidentes || !seguro_estudiantil || !cobertura_vive) {
        return callback(new Error('Todos los campos son requeridos'));
    }
    db.query(
        'INSERT INTO seguros (seguro_accidentes, seguro_estudiantil, cobertura_vive) VALUES (?, ?, ?)',
        [seguro_accidentes, seguro_estudiantil, cobertura_vive],
        callback
    );
};

// Actualizar un seguro
const updateSeguro = (id, seguro, callback) => {
    const { seguro_accidentes, seguro_estudiantil, cobertura_vive } = seguro;
    if (!seguro_accidentes || !seguro_estudiantil || !cobertura_vive) {
        return callback(new Error('Todos los campos son requeridos'));
    }
    db.query(
        'UPDATE seguros SET seguro_accidentes = ?, seguro_estudiantil = ?, cobertura_vive = ? WHERE id = ?',
        [seguro_accidentes, seguro_estudiantil, cobertura_vive, id],
        callback
    );
};

// Eliminar un seguro
const deleteSeguro = (id, callback) => {
    db.query('DELETE FROM seguros WHERE id = ?', [id], callback);
};

module.exports = {
    getAllSeguros,
    getSeguroById,
    createSeguro,
    updateSeguro,
    deleteSeguro
};
