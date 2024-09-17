const becasVariablesModel = require('../models/becasVariables');
const becasVariablesNivelModel = require('../models/becasVariablesNivel');

const getBecasVariables = (req, res) => {
    becasVariablesModel.getAllBecasVariables((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getBecasVariablesByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    becasVariablesModel.getBecaVariableByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getBecasVariablesByAverage = (req, res) => {
    const nivelId = req.params.nivelId;
    const promedioStr = req.query.promedio;
    const promedio = parseFloat(promedioStr); // Obtenemos el promedio del query

    becasVariablesModel.getBecaVariableByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron becas variables para el promedio proporcionado.' });
        }
        // Filtramos las becas variables según el promedio
        const filteredBecas = result.filter(beca => promedio >= beca.promedio_min && promedio <= beca.promedio_max);
        if (filteredBecas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron becas variables para el promedio proporcionado.' });
        }
        res.json(filteredBecas);
    });
};

const getRangosPorcentajeByBecaId = (req, res) => {
    const becaId = req.params.id;

    becasVariablesModel.getBecaVariableById(becaId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los datos de la beca.' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Beca no encontrada.' });
        }

        const beca = result[0];
        const porcentajeMin = parseFloat(beca.porcentaje_min);
        const porcentajeMax = parseFloat(beca.porcentaje_max);

        // Verifica que las conversiones se realizaron correctamente
        if (isNaN(porcentajeMin) || isNaN(porcentajeMax)) {
            return res.status(500).json({ error: 'Datos de porcentaje inválidos.' });
        }

        const rangosPorcentaje = {
            porcentajeMin,
            porcentajeMax
        };

        res.json(rangosPorcentaje);
    });
};




const getBecaVariableById = (req, res) => {
    const id = req.params.id;
    becasVariablesModel.getBecaVariableById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de BecaVariable estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createBecaVariableWithNivel = (req, res) => {
    const { tipo, promedio_min, promedio_max, porcentaje_min, porcentaje_max, nivel_id } = req.body;

    // Crea el becaVariable
    becasVariablesModel.createBecaVariable({ tipo, promedio_min, promedio_max, porcentaje_min, porcentaje_max }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const beca_variable_id = result.insertId;

        // Crea la relación con nivel
        becasVariablesNivelModel.createBecaVariableNivel({ beca_variable_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ beca_variable_id });
        });
    });
};

const updateBecaVariableWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedBecaVariableUpdates = ['tipo, promedio_min, promedio_max, porcentaje_min, porcentaje_max'];
    const allowedBecaVariableNivelUpdates = ['nivel_id'];
    const becaVariableFieldsToUpdate = {};
    const becaVariableNivelFieldsToUpdate = {};

    allowedBecaVariableUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            becaVariableFieldsToUpdate[field] = updates[field];
        }
    });

    allowedBecaVariableNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            becaVariableNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const becaVariableUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(becaVariableFieldsToUpdate).length > 0) {
            becasVariablesModel.updateBecaVariable(id, becaVariableFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const becaVariableNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(becaVariableNivelFieldsToUpdate).length > 0) {
            becasVariablesNivelModel.updateBecaVariableNivel(id, becaVariableNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([becaVariableUpdatePromise, becaVariableNivelUpdatePromise])
        .then(results => {
            const [becaVariableResult, becaVariableNivelResult] = results;
            if (becaVariableResult.affectedRows > 0 || becaVariableNivelResult.affectedRows > 0) {
                res.json({ message: 'BecaVariable y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'BecaVariable y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteBecaVariableWithNivel = (req, res) => {
    const beca_variable_id = req.params.id;

    // Elimina la relación con nivel
    becasVariablesNivelModel.deleteBecaVariableNivel(beca_variable_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el becaVariable
        becasVariablesModel.deleteBecaVariable(beca_variable_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'BecaVariable y relación eliminados' });
        });
    });
};

module.exports = {
    getBecasVariables,
    getBecasVariablesByNivel,
    getBecasVariablesByAverage,
    getRangosPorcentajeByBecaId,
    getBecaVariableById,
    createBecaVariableWithNivel,
    updateBecaVariableWithNivel,
    deleteBecaVariableWithNivel
};
