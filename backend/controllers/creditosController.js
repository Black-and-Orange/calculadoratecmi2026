const creditosModel = require('../models/creditos');
const creditosNivelModel = require('../models/creditosNivel');

const getCreditos = (req, res) => {
    creditosModel.getAllCreditos((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getCreditosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    creditosModel.getCreditosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getCreditoById = (req, res) => {
    const id = req.params.id;
    creditosModel.getCreditoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de Credito estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createCreditoWithNivel = (req, res) => {
    const { porcentaje, nivel_id } = req.body;

    // Crea el credito
    creditosModel.createCredito({ porcentaje }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const credito_id = result.insertId;

        // Crea la relación con nivel
        creditosNivelModel.createCreditoNivel({ credito_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ credito_id });
        });
    });
};

const updateCreditoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedCreditoUpdates = ['porcentaje'];
    const allowedCreditoNivelUpdates = ['nivel_id'];
    const creditoFieldsToUpdate = {};
    const creditoNivelFieldsToUpdate = {};

    allowedCreditoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            creditoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedCreditoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            creditoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const creditoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(creditoFieldsToUpdate).length > 0) {
            creditosModel.updateCredito(id, creditoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const creditoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(creditoNivelFieldsToUpdate).length > 0) {
            creditosNivelModel.updateCreditoNivel(id, creditoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([creditoUpdatePromise, creditoNivelUpdatePromise])
        .then(results => {
            const [creditoResult, creditoNivelResult] = results;
            if (creditoResult.affectedRows > 0 || creditoNivelResult.affectedRows > 0) {
                res.json({ message: 'Credito y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Credito y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteCreditoWithNivel = (req, res) => {
    const credito_id = req.params.id;

    // Elimina la relación con nivel
    creditosNivelModel.deleteCreditoNivel(credito_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el credito
        creditosModel.deleteCredito(credito_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Credito y relación eliminados' });
        });
    });
};

module.exports = {
    getCreditos,
    getCreditosByNivel,
    // getRangosPorcentajeCredito,
    getCreditoById,
    createCreditoWithNivel,
    updateCreditoWithNivel,
    deleteCreditoWithNivel
};
