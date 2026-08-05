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
    const { numero, id_nivel } = req.body;
    // Validar si los campos están presentes antes de proceder
    if (!numero || !id_nivel) {
        return res.status(400).json({ error: 'El número de materia y el nivel son requeridos' });
    }

    // Intentar crear la materia
    materiasModel.createMateria({ numero }, (err, result) => {
        if (err) {
            console.error('Error al crear la materia:', err);  // Log de error para depuración
            return res.status(500).json({ error: 'Error al crear la materia' });
        }
        const id_materia = result.insertId;
        
        materiasNivelModel.createMateriasNivel({ id_materia, id_nivel }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al crear la relación materia-nivel' });
            }
            // Si todo fue bien, devolver el ID de la materia creada

            res.status(201).json({ id_materia });
        });
    });
};


const updateMateriaWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedMateriaUpdates = ['numero'];
    const allowedMateriaNivelUpdates = ['id_nivel'];
    const apoyoFieldsToUpdate = {};
    const apoyoNivelFieldsToUpdate = {};

    allowedMateriaUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedMateriaNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const apoyoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoFieldsToUpdate).length > 0) {
            materiasModel.updateMateria(id, apoyoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const apoyoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoNivelFieldsToUpdate).length > 0) {
            materiasNivelModel.updateMateriaNivel(id, apoyoNivelFieldsToUpdate, (err, result) => {
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
            res.json({ message: 'Materia y/o nivel actualizado' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteMateriaWithNivel = (req, res) => {
    const id_materia = req.params.id;

    // Eliminar los registros de la tabla materias_nivel que dependen del id_materia
    materiasNivelModel.deleteMateriasNivel(id_materia, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Una vez eliminados los registros de materias_nivel, elimina el apoyo en materiasestudiantiles
        materiasModel.deleteMateria(id_materia, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Materia y relaciones de nivel eliminados' });
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
