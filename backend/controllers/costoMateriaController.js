const costoMateriaModel = require('../models/costo_materia');
const costoMateriaNivelModel = require('../models/costoMateriaNivel');

const getAllCostoMateria = (req, res) => {
    costoMateriaModel.getAllCostosMateria((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getCostosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    costoMateriaModel.getCostosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};


const getCostoMateriaById = (req, res) => {
    const id = req.params.id;
    costoMateriaModel.getCostoMateriaById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Costo no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createCostoMateriaWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el Costo
    costoMateriaModel.createCostoMateria({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const costo_id = result.insertId;

        // Crea la relación con nivel
        costoMateriaNivelModel.createCostoMateriaNivel({ costo_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ costo_id });
        });
    });
};

const updateCostoMateriaWithNivel = (req, res) => {
    const costo_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Actualiza el Costo
    costoMateriaModel.updateCostoMateria(costo_id, { nombre, categoria_coleg }, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualiza la relación con nivel
        costoMateriaNivelModel.updateCostoMateriaNivel(costo_id, { nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Campus y relación actualizados' });
        });
    });
};

const deleteCostoMateriaWithNivel = (req, res) => {
    const costo_id = req.params.id;

    // Elimina la relación con nivel
    costoMateriaNivelModel.deleteCostoMateriaNivel(costo_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Costo
        costoMateriaModel.deleteCostoMateria(costo_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Campus y relación eliminados' });
        });
    });
};

module.exports = {
    getAllCostoMateria,
    getCostosByNivel,
    getCostoMateriaById,
    createCostoMateriaWithNivel,
    updateCostoMateriaWithNivel,
    deleteCostoMateriaWithNivel
};
