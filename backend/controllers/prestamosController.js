const prestamosModel = require('../models/prestamos');
const prestamosNivelModel = require('../models/prestamosNivel');

const getPrestamos = (req, res) => {
    prestamosModel.getAllPrestamos((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getPrestamosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    prestamosModel.getPrestamosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getPrestamoById = (req, res) => {
    const id = req.params.id;
    prestamosModel.getPrestamoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de Prestamo estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createPrestamoWithNivel = (req, res) => {
    const { porcentaje, nivel_id } = req.body;

    // Crea el prestamo
    prestamosModel.createPrestamo({ porcentaje }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const prestamo_id = result.insertId;

        // Crea la relación con nivel
        prestamosNivelModel.createPrestamoNivel({ prestamo_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ prestamo_id });
        });
    });
};

const updatePrestamoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedPrestamoUpdates = ['porcentaje'];
    const allowedPrestamoNivelUpdates = ['nivel_id'];
    const prestamoFieldsToUpdate = {};
    const prestamoNivelFieldsToUpdate = {};

    allowedPrestamoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            prestamoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedPrestamoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            prestamoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const prestamoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(prestamoFieldsToUpdate).length > 0) {
            prestamosModel.updatePrestamo(id, prestamoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const prestamoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(prestamoNivelFieldsToUpdate).length > 0) {
            prestamosNivelModel.updatePrestamoNivel(id, prestamoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([prestamoUpdatePromise, prestamoNivelUpdatePromise])
        .then(results => {
            const [prestamoResult, prestamoNivelResult] = results;
            if (prestamoResult.affectedRows > 0 || prestamoNivelResult.affectedRows > 0) {
                res.json({ message: 'Prestamo y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Prestamo y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deletePrestamoWithNivel = (req, res) => {
    const prestamo_id = req.params.id;

    // Elimina la relación con nivel
    prestamosNivelModel.deletePrestamoNivel(prestamo_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el prestamo
        prestamosModel.deletePrestamo(prestamo_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Prestamo y relación eliminados' });
        });
    });
};

module.exports = {
    getPrestamos,
    getPrestamosByNivel,
    // getRangosPorcentajePrestamo,
    getPrestamoById,
    createPrestamoWithNivel,
    updatePrestamoWithNivel,
    deletePrestamoWithNivel
};
