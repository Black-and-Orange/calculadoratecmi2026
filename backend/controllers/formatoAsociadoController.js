const formatoModel = require('../models/formatoAsociado');
const formatoNivelModel = require('../models/formatoAsociadoNivel');

const getAllFormato = (req, res) => {
    formatoModel.getAllFormatos((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
};

const getFormatosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    
    formatoModel.getFormatosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getFormatoById = (req, res) => {
    const id = req.params.id;
    formatoModel.getFormatoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Formato no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createFormatoWithNivel = (req, res) => {
    const { descripcion, costo, id_nivel } = req.body;

    // Crea el formato
    formatoModel.createFormato({ descripcion, costo }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const id_formato = result.insertId;

        // Crea la relación con nivel
        formatoNivelModel.createFormatoNivel({ id_formato, id_nivel }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id_formato });
        });
    });
};

const updateFormatoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedFormatoUpdates = ['descripcion', 'costo'];
    const allowedFormatoNivelUpdates = ['id_nivel'];
    const formatoFieldsToUpdate = {};
    const formatoNivelFieldsToUpdate = {};

    allowedFormatoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            formatoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedFormatoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            formatoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const formatoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(formatoFieldsToUpdate).length > 0) {
            formatoModel.updateFormato(id, formatoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const formatoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(formatoNivelFieldsToUpdate).length > 0) {
            formatoNivelModel.updateFormatoNivel(id, formatoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([formatoUpdatePromise, formatoNivelUpdatePromise])
        .then(results => {
            const [formatoResult, formatoNivelResult] = results;
            if (formatoResult.affectedRows > 0 || formatoNivelResult.affectedRows > 0) {
                res.json({ message: 'Formato y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Formato y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteFormatoWithNivel = (req, res) => {
    const id_formato = req.params.id;

    // Elimina la relación con nivel
    formatoNivelModel.deleteFormatoNivel(id_formato, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el formato
        formatoModel.deleteFormato(id_formato, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Formato y relación eliminados' });
        });
    });
};

module.exports = {
    getAllFormato,
    getFormatosByNivel,
    getFormatoById,
    createFormatoWithNivel,
    updateFormatoWithNivel,
    deleteFormatoWithNivel
};
