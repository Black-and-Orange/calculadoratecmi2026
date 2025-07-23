const ConfiguracionVigencia = require('../models/configuracionVigencia');

exports.obtenerDiasVigencia = async (req, res) => {
    try {
        const dias = await ConfiguracionVigencia.obtenerDiasVigencia();
        res.json({ dias_vigencia: dias });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener días de vigencia' });
    }
};

exports.actualizarDiasVigencia = async (req, res) => {
    try {
        const { dias_vigencia } = req.body;
        await ConfiguracionVigencia.actualizarDiasVigencia(dias_vigencia);
        res.json({ mensaje: 'Días de vigencia actualizados correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar días de vigencia' });
    }
}; 