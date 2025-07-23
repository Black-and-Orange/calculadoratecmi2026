const semanasModel = require('../models/semanasSEDI');
const semanasNivelModel = require('../models/semanasSEDINivel');

const getAllSemanas = (req, res) => {
    semanasModel.getAllSemanas((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getSemanasByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    semanasModel.getSemanasByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getSemanasById = (req, res) => {
    const id = req.params.id;
    semanasModel.getSemanasById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Semanas no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createSemanasWithNivel = (req, res) => {
    const { num_semanas, nivel_id } = req.body;
    // Validar si los campos están presentes antes de proceder
    if (!num_semanas || !nivel_id) {
        return res.status(400).json({ error: 'El número de semanas y el nivel son requeridos' });
    }

    // Intentar crear las semanas
    semanasModel.createSemanas({ num_semanas }, (err, result) => {
        if (err) {
            console.error('Error al crear las semanas:', err);
            return res.status(500).json({ error: 'Error al crear las semanas' });
        }
        const semanas_id = result.insertId;
        
        semanasNivelModel.createSemanasNivel({ semanas_id, nivel_id }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al crear la relación semanas-nivel' });
            }
            // Si todo fue bien, devolver el ID de las semanas creadas
            res.status(201).json({ semanas_id });
        });
    });
};

const updateSemanasWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedSemanasUpdates = ['num_semanas'];
    const allowedSemanasNivelUpdates = ['nivel_id'];
    const semanasFieldsToUpdate = {};
    const semanasNivelFieldsToUpdate = {};

    allowedSemanasUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            semanasFieldsToUpdate[field] = updates[field];
        }
    });

    allowedSemanasNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            semanasNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const semanasUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(semanasFieldsToUpdate).length > 0) {
            semanasModel.updateSemanas(id, semanasFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const semanasNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(semanasNivelFieldsToUpdate).length > 0) {
            semanasNivelModel.updateSemanasNivel(id, semanasNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([semanasUpdatePromise, semanasNivelUpdatePromise])
        .then(results => {
            const [semanasResult, semanasNivelResult] = results;
            if (semanasResult.affectedRows > 0 || semanasNivelResult.affectedRows > 0) {
                res.json({ message: 'Semanas y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Semanas y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteSemanasWithNivel = (req, res) => {
    const semanas_id = req.params.id;

    // Eliminar los registros de la tabla semanas_nivel que dependen del semanas_id
    semanasNivelModel.deleteSemanasNivel(semanas_id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Una vez eliminados los registros de semanas_nivel, elimina las semanas
        semanasModel.deleteSemanas(semanas_id, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Semanas y relaciones de nivel eliminados' });
        });
    });
};

module.exports = {
    getAllSemanas,
    getSemanasById,
    getSemanasByNivel,
    createSemanasWithNivel,
    updateSemanasWithNivel,
    deleteSemanasWithNivel
};
