const ConfiguracionCondiciones = require('../models/configuracionCondiciones');

exports.obtenerCondiciones = async (req, res) => {
    try {
        const condiciones = await ConfiguracionCondiciones.obtenerCondiciones();
        res.json({ condiciones });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las condiciones de la propuesta' });
    }
};

exports.actualizarCondiciones = async (req, res) => {
    try {
        const { condiciones } = req.body;
        if (typeof condiciones !== 'string') {
            return res.status(400).json({ error: 'El campo "condiciones" es requerido (texto).' });
        }
        await ConfiguracionCondiciones.actualizarCondiciones(condiciones);
        res.json({ mensaje: 'Condiciones de la propuesta actualizadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar las condiciones de la propuesta' });
    }
};
