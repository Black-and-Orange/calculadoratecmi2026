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

const getSegurosByNivelAll = (req, res) => {
    const nivelId = req.params.nivelId;
    
    seguroModel.getSegurosByNivelAll(nivelId, (err, result) => {
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
    const { nombre_seguro, valor, estado, id_nivel } = req.body;

    if (!nombre_seguro || valor === undefined || !id_nivel) {
        return res.status(400).json({ error: 'Se requieren nombre_seguro, valor e id_nivel' });
    }

    // Crea el seguro (solo con nombre)
    seguroModel.createSeguro({ nombre_seguro }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const id_seguro = result.insertId;

        // Crea la relación con nivel (incluyendo valor y estado)
        seguroNivelModel.createSeguroNivel({ 
            id_seguro, 
            id_nivel, 
            valor: parseFloat(valor), 
            estado: estado !== undefined ? estado : true 
        }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id_seguro, id_nivel });
        });
    });
};

const updateSeguroWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const { id_nivel } = updates;

    // Filtrar solo los campos permitidos para la actualización
    const allowedSeguroUpdates = ['nombre_seguro'];
    const allowedSeguroNivelUpdates = ['valor', 'estado'];
    const seguroFieldsToUpdate = {};
    const seguroNivelFieldsToUpdate = {};

    allowedSeguroUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            seguroFieldsToUpdate[field] = updates[field];
        }
    });

    allowedSeguroNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            if (field === 'valor') {
                seguroNivelFieldsToUpdate[field] = parseFloat(updates[field]);
            } else {
                seguroNivelFieldsToUpdate[field] = updates[field];
            }
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
        if (Object.keys(seguroNivelFieldsToUpdate).length > 0 && id_nivel) {
            seguroNivelModel.updateSeguroNivelBySeguroAndNivel(
                id, 
                id_nivel, 
                seguroNivelFieldsToUpdate, 
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([seguroUpdatePromise, seguroNivelUpdatePromise])
        .then(results => {
            const [seguroResult, seguroNivelResult] = results;
            // Un UPDATE sin error es exitoso aunque affectedRows sea 0 (mismo valor / idempotente).
            res.json({ message: 'Seguro y/o nivel actualizado' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteSeguroWithNivel = (req, res) => {
    const id_seguro = req.params.id;
    const { id_nivel } = req.query; // Opcional: si se proporciona, solo elimina la relación con ese nivel

    if (id_nivel) {
        // Elimina solo la relación con el nivel específico
        seguroNivelModel.deleteSeguroNivelBySeguroAndNivel(id_seguro, id_nivel, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Relación seguro-nivel eliminada' });
        });
    } else {
        // Elimina todas las relaciones con niveles
        seguroNivelModel.deleteSeguroNivel(id_seguro, (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Elimina el seguro
            seguroModel.deleteSeguro(id_seguro, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: 'Seguro y relaciones eliminados' });
            });
        });
    }
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
    getSegurosByNivelAll,
    getSeguroById,
    createSeguroWithNivel,
    updateSeguroWithNivel,
    deleteSeguroWithNivel,
    changeColumnNames
};
