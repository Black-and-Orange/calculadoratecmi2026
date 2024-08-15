const materiasModel = require('../models/materias');
const materiasNivelModel = require('../models/materiasNivel');

const getAllMaterias = (req, res) => {
    materiasModel.getAllMaterias((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getMateriasByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    materiasModel.getMateriasByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getMateriaById = (req, res) => {
    const id = req.params.id;
    materiasModel.getMateriaById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Materia no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createMateriaWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Crea el Materia
    materiasModel.createMateria({ nombre, categoria_coleg }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const materia_id = result.insertId;

        // Crea la relación con nivel
        materiasNivelModel.createMateriasNivel({ materia_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ materia_id });
        });
    });
};

const updateMateriaWithNivel = (req, res) => {
    const materia_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Actualiza el Materia
    materiasModel.updateMateria(materia_id, { nombre, categoria_coleg }, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualiza la relación con nivel
        materiasNivelModel.updateMateriasNivel(materia_id, { nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Materia y relación actualizados' });
        });
    });
};

const deleteMateriaWithNivel = (req, res) => {
    const materia_id = req.params.id;

    // Elimina la relación con nivel
    materiasNivelModel.deleteMateriasNivel(materia_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el Materia
        materiasModel.deleteMateria(materia_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Materia y relación eliminados' });
        });
    });
};

module.exports = {
    getAllMaterias,
    getMateriaById,
    getMateriasByNivel,
    createMateriaWithNivel,
    updateMateriaWithNivel,
    deleteMateriaWithNivel
};
