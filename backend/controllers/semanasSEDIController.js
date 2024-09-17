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
        return res.status(400).json({ error: 'El número de certificado y el nivel son requeridos' });
    }

    // Intentar crear la certificado
    semanasModel.createSemanas({ num_semanas }, (err, result) => {
        if (err) {
            console.error('Error al crear la certificado:', err);  // Log de error para depuración
            return res.status(500).json({ error: 'Error al crear la certificado' });
        }
        const certificado_id = result.insertId;
        
        semanasNivelModel.createSemanasNivel({ certificado_id, nivel_id }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al crear la relación certificado-nivel' });
            }
            // Si todo fue bien, devolver el ID de la certificado creada

            res.status(201).json({ certificado_id });
        });
    });
};


const updateSemanasWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedSemanasUpdates = ['num_semanas'];
    const allowedSemanasNivelUpdates = ['nivel_id'];
    const apoyoFieldsToUpdate = {};
    const apoyoNivelFieldsToUpdate = {};

    allowedSemanasUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedSemanasNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const apoyoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoFieldsToUpdate).length > 0) {
            semanasModel.updateSemanas(id, apoyoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const apoyoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoNivelFieldsToUpdate).length > 0) {
            semanasNivelModel.updateSemanasNivel(id, apoyoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([apoyoUpdatePromise, apoyoNivelUpdatePromise])
        .then(results => {
            const [apoyoResult, apoyoNivelResult] = results;
            if (apoyoResult.affectedRows > 0 || apoyoNivelResult.affectedRows > 0) {
                res.json({ message: 'Semanas y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Semanas y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteSemanasWithNivel = (req, res) => {
    const certificado_id = req.params.id;

    // Eliminar los registros de la tabla semanas_nivel que dependen del certificado_id
    semanasNivelModel.deleteSemanasNivel(certificado_id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Una vez eliminados los registros de semanas_nivel, elimina el apoyo en semanasestudiantiles
        semanasModel.deleteSemanas(certificado_id, (err) => {
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
