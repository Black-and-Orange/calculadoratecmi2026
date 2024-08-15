const nivelModel = require('../models/nivel');

const getNiveles = async (req, res) => {
    nivelModel.getAllNiveles((err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
}

const getNivelById = async (req, res) => {
    const { id } = req.params;
    nivelModel.getNivelById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    })
};

const createNivel = async (req, res) => {
    const nivel = req.body;
    nivelModel.createNivel(nivel, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Nivel creado con éxito', id: results.insertId });
    });
};

const updateNivel = async (req, res) => {
    const { id } = req.params;
    const nivel = req.body;
    nivelModel.updateNivel(id, nivel, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Nivel actualizado con éxito' });
    });
}

const deleteNivel = async (req, res) => {
    const { id } = req.params;
    nivelModel.deleteNivel(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Nivel eliminado con éxito' });
    });

}
module.exports = { getNiveles, getNivelById, createNivel, updateNivel, deleteNivel, };