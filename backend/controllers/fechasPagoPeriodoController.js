const fechasPagoModel = require('../models/fechasPagoPeriodo');

const getFechasByPeriodo = (req, res) => {
    fechasPagoModel.getFechasByPeriodo(req.params.periodoId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

const getFechasByNivel = (req, res) => {
    fechasPagoModel.getFechasByNivel(req.params.nivelId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// PUT /api/fechas-pago/periodo/:periodoId  body: { fechas: ['YYYY-MM-DD', ...] }
// Reemplaza la lista completa; una lista vacía borra las fechas del período.
const replaceFechasForPeriodo = (req, res) => {
    const { fechas } = req.body;
    if (!Array.isArray(fechas)) {
        return res.status(400).json({ error: 'El cuerpo debe incluir "fechas" como arreglo de fechas YYYY-MM-DD.' });
    }
    const invalida = fechas.find(f => typeof f !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(f) || isNaN(new Date(f).getTime()));
    if (invalida !== undefined) {
        return res.status(400).json({ error: `Fecha inválida: "${invalida}". Formato esperado: YYYY-MM-DD.` });
    }
    fechasPagoModel.replaceFechasForPeriodo(req.params.periodoId, fechas, (err, result = {}) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            success: true,
            total: fechas.length,
            periodosActualizados: result.periodosActualizados || 1,
        });
    });
};

module.exports = {
    getFechasByPeriodo,
    getFechasByNivel,
    replaceFechasForPeriodo,
};
