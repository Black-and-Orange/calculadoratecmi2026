const db = require('../config/dbConfig');

// Obtener todos los pagos bimestrales
const getAllPagosBimestrales = (callback) => {
    db.query(`
        SELECT * FROM pagos_bimestrales 
        ORDER BY 
            nivel_id,
            CASE mes 
                WHEN 'ENERO' THEN 1
                WHEN 'MARZO' THEN 2
                WHEN 'JUNIO' THEN 3
                WHEN 'AGOSTO' THEN 4
                WHEN 'OCTUBRE' THEN 5
                ELSE 999
            END, 
            pago_orden
    `, callback);
};

// Obtener pagos bimestrales por ID
const getPagoBimestralById = (id, callback) => {
    db.query('SELECT * FROM pagos_bimestrales WHERE id = ?', [id], callback);
};

// Obtener pagos bimestrales por nivel
const getPagosBimestralesByNivel = (nivel_id, callback) => {
    const query = `
        SELECT * FROM pagos_bimestrales 
        WHERE nivel_id = ? 
        ORDER BY 
            CASE mes 
                WHEN 'ENERO' THEN 1
                WHEN 'MARZO' THEN 2
                WHEN 'JUNIO' THEN 3
                WHEN 'AGOSTO' THEN 4
                WHEN 'OCTUBRE' THEN 5
                ELSE 999
            END, 
            pago_orden
    `;
    db.query(query, [nivel_id], (err, results) => {
        if (err) {
            console.error('Error en query:', err);
            return callback(err);
        }   
        callback(null, results);
    });
};

// Crear un nuevo pago bimestral
const createPagoBimestral = (pago, callback) => {
    const { nivel_id, codigo, bimestre, mes, pago_orden, porcentaje_parcialidad, porcentaje_interes, fecha_vencimiento } = pago;
    if (!nivel_id || !codigo || !bimestre || !mes || !pago_orden || porcentaje_parcialidad === undefined || porcentaje_interes === undefined) {
        return callback(new Error('Todos los campos son requeridos'));
    }
    db.query(
        'INSERT INTO pagos_bimestrales (nivel_id, codigo, bimestre, mes, pago_orden, porcentaje_parcialidad, porcentaje_interes, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [nivel_id, codigo, bimestre, mes, pago_orden, porcentaje_parcialidad, porcentaje_interes, fecha_vencimiento], 
        callback
    );
};

// Actualizar un pago bimestral
const updatePagoBimestral = (id, pago, callback) => {
    const { nivel_id, codigo, bimestre, mes, pago_orden, porcentaje_parcialidad, porcentaje_interes, fecha_vencimiento } = pago;
    db.query(
        'UPDATE pagos_bimestrales SET nivel_id = ?, codigo = ?, bimestre = ?, mes = ?, pago_orden = ?, porcentaje_parcialidad = ?, porcentaje_interes = ?, fecha_vencimiento = ? WHERE id = ?', 
        [nivel_id, codigo, bimestre, mes, pago_orden, porcentaje_parcialidad, porcentaje_interes, fecha_vencimiento, id], 
        callback
    );
};

// Eliminar un pago bimestral
const deletePagoBimestral = (id, callback) => {
    db.query('DELETE FROM pagos_bimestrales WHERE id = ?', [id], callback);
};

module.exports = {
    getAllPagosBimestrales,
    getPagoBimestralById,
    getPagosBimestralesByNivel,
    createPagoBimestral,
    updatePagoBimestral,
    deletePagoBimestral
}; 