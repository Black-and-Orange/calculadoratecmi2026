const db = require('../config/dbConfig');

// Crear una nueva cotización
const createCotizacion = (cotizacion, callback) => {    
    const {
        nombre_estudiante,
        nivel_id,
        periodo,
        campus,
        materias,
        certificados,
        semanas_sedi,
        ingles,
        creditos,
        programa,
        formato,
        costo_total,
        total_contado,
        total_financiado,
        primera_cuota,
        mensualidades,
        beca_nombre,
        beca_porcentaje,
        apoyo_estudiantil_porcentaje,
        apoyo_estudiantil_fijo,
        prestamo_porcentaje,
        seguro_accidentes,
        seguro_estudiantil,
        cobertura_vive,
        total_seguros,
        fecha_creacion
    } = cotizacion;

    const query = `
        INSERT INTO cotizaciones (
            nombre_estudiante, nivel_id, periodo, campus, materias, certificados, 
            semanas_sedi, ingles, creditos, programa, formato, costo_total, total_contado, 
            total_financiado, primera_cuota, mensualidades, beca_nombre, 
            beca_porcentaje, apoyo_estudiantil_porcentaje, apoyo_estudiantil_fijo, 
            prestamo_porcentaje, seguro_accidentes, seguro_estudiantil, 
            cobertura_vive, total_seguros, fecha_creacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        nombre_estudiante, nivel_id, periodo, campus, materias, certificados,
        semanas_sedi, ingles, creditos, programa, formato, costo_total, total_contado,
        total_financiado, primera_cuota, mensualidades, beca_nombre,
        beca_porcentaje, apoyo_estudiantil_porcentaje, apoyo_estudiantil_fijo,
        prestamo_porcentaje, seguro_accidentes, seguro_estudiantil,
        cobertura_vive, total_seguros, fecha_creacion
    ];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error('Modelo: Error en la consulta SQL:', error);
        }
        callback(error, results);
    });
};

// Obtener todas las cotizaciones con información del nivel
const getAllCotizaciones = (callback) => {
    const query = `
        SELECT c.*, n.descripcion as nivel_nombre 
        FROM cotizaciones c 
        LEFT JOIN nivel n ON c.nivel_id = n.id_nivel 
        ORDER BY c.fecha_creacion DESC
    `;
    db.query(query, callback);
};

// Obtener cotizaciones por rango de fechas
const getCotizacionesByDateRange = (fechaInicio, fechaFin, callback) => {
    const query = `
        SELECT c.*, n.descripcion as nivel_nombre 
        FROM cotizaciones c 
        LEFT JOIN nivel n ON c.nivel_id = n.id_nivel 
        WHERE c.fecha_creacion BETWEEN ? AND ? 
        ORDER BY c.fecha_creacion DESC
    `;
    db.query(query, [fechaInicio, fechaFin], callback);
};

// Obtener cotizaciones por nivel
const getCotizacionesByNivel = (nivelId, callback) => {
    const query = `
        SELECT c.*, n.descripcion as nivel_nombre 
        FROM cotizaciones c 
        LEFT JOIN nivel n ON c.nivel_id = n.id_nivel 
        WHERE c.nivel_id = ? 
        ORDER BY c.fecha_creacion DESC
    `;
    db.query(query, [nivelId], callback);
};

// Obtener estadísticas de cotizaciones
const getCotizacionesStats = (callback) => {
    const query = `
        SELECT 
            COUNT(*) as total_cotizaciones,
            COUNT(DISTINCT DATE(fecha_creacion)) as dias_con_cotizaciones,
            COUNT(DISTINCT nivel_id) as niveles_utilizados,
            AVG(costo_total) as promedio_costo_total,
            SUM(costo_total) as total_general
        FROM cotizaciones
    `;
    db.query(query, callback);
};

// Eliminar cotización por ID
const deleteCotizacion = (id, callback) => {
    db.query('DELETE FROM cotizaciones WHERE id = ?', [id], callback);
};

// Obtener cotización por ID
const getCotizacionById = (id, callback) => {
    const query = `
        SELECT c.*, n.descripcion as nivel_nombre 
        FROM cotizaciones c 
        LEFT JOIN nivel n ON c.nivel_id = n.id_nivel 
        WHERE c.id = ?
        LIMIT 1
    `;
    db.query(query, [id], (error, results) => {
        if (error) return callback(error);
        callback(null, results[0]);
    });
};

module.exports = {
    createCotizacion,
    getAllCotizaciones,
    getCotizacionesByDateRange,
    getCotizacionesByNivel,
    getCotizacionesStats,
    deleteCotizacion,
    getCotizacionById
}; 