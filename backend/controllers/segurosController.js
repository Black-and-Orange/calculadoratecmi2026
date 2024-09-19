const seguroModel = require('../models/seguros');
const seguroNivelModel = require('../models/segurosNivel');

const getAllSeguro = (req, res) => {
    seguroModel.getAllSeguros((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
};

const getSegurosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    
    seguroModel.getSegurosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getSeguroById = (req, res) => {
    const id = req.params.id;
    seguroModel.getSeguroById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Seguro no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createSeguroWithNivel = (req, res) => {
    const { seguro_accidentes, seguro_estudiantil, cobertura_vive, id_nivel } = req.body;

    // Crea el seguro
    seguroModel.createSeguro({ seguro_accidentes, seguro_estudiantil, cobertura_vive }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const id_seguro = result.insertId;

        // Crea la relación con nivel
        seguroNivelModel.createSeguroNivel({ id_seguro, id_nivel }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id_seguro });
        });
    });
};

const updateSeguroWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedSeguroUpdates = ['seguro_accidentes', 'seguro_estudiantil', 'cobertura_vive'];
    const allowedSeguroNivelUpdates = ['id_nivel'];
    const seguroFieldsToUpdate = {};
    const seguroNivelFieldsToUpdate = {};

    allowedSeguroUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            seguroFieldsToUpdate[field] = updates[field];
        }
    });

    allowedSeguroNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            seguroNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const seguroUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(seguroFieldsToUpdate).length > 0) {
            seguroModel.updateSeguro(id, seguroFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const seguroNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(seguroNivelFieldsToUpdate).length > 0) {
            seguroNivelModel.updateSeguroNivel(id, seguroNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([seguroUpdatePromise, seguroNivelUpdatePromise])
        .then(results => {
            const [seguroResult, seguroNivelResult] = results;
            if (seguroResult.affectedRows > 0 || seguroNivelResult.affectedRows > 0) {
                res.json({ message: 'Seguro y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Seguro y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteSeguroWithNivel = (req, res) => {
    const id_seguro = req.params.id;

    // Elimina la relación con nivel
    seguroNivelModel.deleteSeguroNivel(id_seguro, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el seguro
        seguroModel.deleteSeguro(id_seguro, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Seguro y relación eliminados' });
        });
    });
};

const changeColumnNames = (req, res) => {
    const { column_changes } = req.body;

    if (!column_changes || typeof column_changes !== 'object') {
        return res.status(400).json({ error: 'Se requiere un objeto con los cambios de nombres de columnas.' });
    }

    seguroModel.changeColumnNames(column_changes, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Nombres de columnas actualizados con éxito' });
    });
};


module.exports = {
    getAllSeguro,
    getSegurosByNivel,
    getSeguroById,
    createSeguroWithNivel,
    updateSeguroWithNivel,
    deleteSeguroWithNivel,
    changeColumnNames
};
