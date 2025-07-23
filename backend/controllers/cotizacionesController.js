const cotizacionesModel = require('../models/cotizaciones');

// Crear una nueva cotización
const createCotizacion = (req, res) => {
    
    const cotizacionData = {
        ...req.body,
        fecha_creacion: new Date()
    };

    cotizacionesModel.createCotizacion(cotizacionData, (error, results) => {
        if (error) {
            console.error('Controlador: Error al crear cotización:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear la cotización',
                error: error.message
            });
        }
        
        // Devolver el ID de la cotización creada
        const cotizacionId = results.insertId;
        
        res.status(201).json({
            success: true,
            message: 'Cotización creada exitosamente',
            data: {
                id: cotizacionId,
                ...cotizacionData
            }
        });
    });
};

// Obtener todas las cotizaciones
const getAllCotizaciones = (req, res) => {
    cotizacionesModel.getAllCotizaciones((error, results) => {
        if (error) {
            console.error('Error al obtener cotizaciones:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las cotizaciones',
                error: error.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// Obtener cotizaciones por rango de fechas
const getCotizacionesByDateRange = (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
            success: false,
            message: 'Se requieren fecha de inicio y fecha de fin'
        });
    }

    cotizacionesModel.getCotizacionesByDateRange(fechaInicio, fechaFin, (error, results) => {
        if (error) {
            console.error('Error al obtener cotizaciones por fecha:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las cotizaciones',
                error: error.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// Obtener cotizaciones por nivel
const getCotizacionesByNivel = (req, res) => {
    const { nivelId } = req.params;

    cotizacionesModel.getCotizacionesByNivel(nivelId, (error, results) => {
        if (error) {
            console.error('Error al obtener cotizaciones por nivel:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las cotizaciones',
                error: error.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// Obtener estadísticas de cotizaciones
const getCotizacionesStats = (req, res) => {
    cotizacionesModel.getCotizacionesStats((error, results) => {
        if (error) {
            console.error('Error al obtener estadísticas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las estadísticas',
                error: error.message
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};

// Eliminar cotización
const deleteCotizacion = (req, res) => {
    const { id } = req.params;

    cotizacionesModel.deleteCotizacion(id, (error, results) => {
        if (error) {
            console.error('Error al eliminar cotización:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar la cotización',
                error: error.message
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cotización no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Cotización eliminada exitosamente'
        });
    });
};

// Obtener cotización por ID
const getCotizacionById = (req, res) => {
    const { id } = req.params;
    cotizacionesModel.getCotizacionById(id, (error, cotizacion) => {
        if (error) {
            console.error('Error al obtener cotización por id:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener la cotización',
                error: error.message
            });
        }
        if (!cotizacion) {
            return res.status(404).json({
                success: false,
                message: 'Cotización no encontrada'
            });
        }
        res.json({
            success: true,
            data: cotizacion
        });
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