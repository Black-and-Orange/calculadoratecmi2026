const db = require('../config/dbConfig');

// Obtener todos los periodos
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

// Obtener un periodo por ID
const getPeriodoById = (id, callback) => {
    db.query('SELECT * FROM periodo WHERE id = ?', [id], callback);
};

// Crear un nuevo periodo
const createPeriodo = (periodo, callback) => {
    const { periodo_descripcion, periodo_codigo } = periodo;
    if (!periodo_descripcion || !periodo_codigo) {
        return callback(new Error('periodo_descripcion y Periodo 2 son requeridos'));
    }
    db.query('INSERT INTO periodo (periodo_descripcion, periodo_codigo) VALUES (?, ?)', [periodo_descripcion, periodo_codigo], callback);
};

// Actualizar un periodo
const updatePeriodo = (id, periodo, callback) => {
    const { periodo_descripcion, periodo_codigo } = periodo;
    if (!periodo_descripcion || !periodo_codigo) {
        return callback(new Error('Periodo y Periodo 2 son requeridos'));
    }
    db.query('UPDATE periodo SET periodo_descripcion = ?, periodo_codigo = ? WHERE id = ?', [periodo_descripcion, periodo_codigo, id], callback);
};

// Eliminar un periodo
const deletePeriodo = (id, callback) => {
    db.query('DELETE FROM periodo WHERE id = ?', [id], callback);
};

module.exports = {
    getAllPeriodos,
    getPeriodosByNivel,
    getPeriodoById,
    createPeriodo,
    updatePeriodo,
    deletePeriodo
};
