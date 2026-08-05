const inglesModel = require('../models/ingles');
const inglesNivelModel = require('../models/inglesNivel');

const getAllIngles = (req, res) => {
    inglesModel.getAllIngles((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const getInglesByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    inglesModel.getInglesByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getInglesById = (req, res) => {
    const id = req.params.id;
    inglesModel.getInglesById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Ingles no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createInglesWithNivel = (req, res) => {
    const { num_ingles, nivel_id } = req.body;
    // Validar si los campos están presentes antes de proceder
    if (!num_ingles || !nivel_id) {
        return res.status(400).json({ error: 'El número de ingles y el nivel son requeridos' });
    }

    // Intentar crear la ingles
    inglesModel.createIngles({ num_ingles }, (err, result) => {
        if (err) {
            console.error('Error al crear la ingles:', err);  // Log de error para depuración
            return res.status(500).json({ error: 'Error al crear la ingles' });
        }
        const certificado_id = result.insertId;
        
        inglesNivelModel.createInglesNivel({ certificado_id, nivel_id }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al crear la relación ingles-nivel' });
            }
            // Si todo fue bien, devolver el ID de la ingles creada

            res.status(201).json({ certificado_id });
        });
    });
};


const updateInglesWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedInglesUpdates = ['num_ingles'];
    const allowedInglesNivelUpdates = ['nivel_id'];
    const apoyoFieldsToUpdate = {};
    const apoyoNivelFieldsToUpdate = {};

    allowedInglesUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedInglesNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const apoyoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoFieldsToUpdate).length > 0) {
            inglesModel.updateIngles(id, apoyoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const apoyoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoNivelFieldsToUpdate).length > 0) {
            inglesNivelModel.updateInglesNivel(id, apoyoNivelFieldsToUpdate, (err, result) => {
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
            // Un UPDATE sin error es exitoso aunque affectedRows sea 0 (mismo valor / idempotente).
            res.json({ message: 'Ingles y/o nivel actualizado' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteInglesWithNivel = (req, res) => {
    const certificado_id = req.params.id;

    // Eliminar los registros de la tabla ingles_nivel que dependen del certificado_id
    inglesNivelModel.deleteInglesNivel(certificado_id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Una vez eliminados los registros de ingles_nivel, elimina el apoyo en inglesestudiantiles
        inglesModel.deleteIngles(certificado_id, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Ingles y relaciones de nivel eliminados' });
        });
    });
};


module.exports = {
    getAllIngles,
    getInglesById,
    getInglesByNivel,
    createInglesWithNivel,
    updateInglesWithNivel,
    deleteInglesWithNivel
};
