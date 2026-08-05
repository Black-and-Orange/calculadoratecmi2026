const beneficiosModel = require('../models/beneficios');
const beneficiosNivelModel = require('../models/beneficiosNivel');

const getBeneficios = (req, res) => {
    beneficiosModel.getAllBeneficios((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getBeneficiosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    beneficiosModel.getBeneficioByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getBeneficioById = (req, res) => {
    const id = req.params.id;
    beneficiosModel.getBeneficioById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de Beneficio estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createBeneficioWithNivel = (req, res) => {
    const { nombre, descripcion, icono, nivel_id } = req.body;

    // Crea el beneficio
    beneficiosModel.createBeneficio({ nombre, descripcion, icono }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const beneficio_id = result.insertId;

        // Crea la relación con nivel
        beneficiosNivelModel.createBeneficioNivel({ beneficio_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ beneficio_id });
        });
    });
};

const updateBeneficioWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedBeneficioUpdates = ['nombre', 'descripcion', 'icono'];
    const allowedBeneficioNivelUpdates = ['nivel_id'];
    const beneficioFieldsToUpdate = {};
    const beneficioNivelFieldsToUpdate = {};

    allowedBeneficioUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            beneficioFieldsToUpdate[field] = updates[field];
        }
    });

    allowedBeneficioNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            beneficioNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const beneficioUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(beneficioFieldsToUpdate).length > 0) {
            beneficiosModel.updateBeneficio(id, beneficioFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const beneficioNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(beneficioNivelFieldsToUpdate).length > 0) {
            beneficiosNivelModel.updateBeneficioNivel(id, beneficioNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([beneficioUpdatePromise, beneficioNivelUpdatePromise])
        .then(results => {
            const [beneficioResult, beneficioNivelResult] = results;
            // Un UPDATE sin error es exitoso aunque affectedRows sea 0 (mismo valor / idempotente).
            res.json({ message: 'Beneficio y/o nivel actualizado' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteBeneficioWithNivel = (req, res) => {
    const beneficio_id = req.params.id;

    // Elimina la relación con nivel
    beneficiosNivelModel.deleteBeneficioNivel(beneficio_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el beneficio
        beneficiosModel.deleteBeneficio(beneficio_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Beneficio y relación eliminados' });
        });
    });
};

module.exports = {
    getBeneficios,
    getBeneficiosByNivel,
    getBeneficioById,
    createBeneficioWithNivel,
    updateBeneficioWithNivel,
    deleteBeneficioWithNivel
};
