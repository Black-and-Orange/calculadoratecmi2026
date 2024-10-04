const becasFijasModel = require('../models/becasFijas');
const becasFijasNivelModel = require('../models/becasFijasNivel');

const getBecasFijas = (req, res) => {
    becasFijasModel.getAllBecasFijas((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getBecasFijasByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    becasFijasModel.getBecaFijaByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const getBecasFijasByAverage = (req, res) => {
    const nivelId = req.params.nivelId;
    const promedioStr = req.query.promedio;
    const promedio = parseFloat(promedioStr); // Convertimos el promedio a decimal
    
    becasFijasModel.getBecaFijaByNivel(nivelId, (err, result) => {
        if (err) {
            // Devolver un error 500 solo si ocurre un error en la consulta
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        
        // Filtrar las becas que coincidan con el promedio
        const filteredBecas = result.filter(beca => parseFloat(beca.promedio) === promedio);

        if (filteredBecas.length === 0) {
            // Devolver una respuesta vacía si no se encontraron becas
            return res.json([]);
        }

        // Devolver las becas filtradas si se encontraron coincidencias
        res.json(filteredBecas);
    });
};




const getBecaFijaById = (req, res) => {
    const id = req.params.id;
    becasFijasModel.getBecaFijaById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de BecaFija estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createBecaFijaWithNivel = (req, res) => {
    const { tipo, promedio, porcentaje, nivel_id } = req.body;

    // Crea el becaFija
    becasFijasModel.createBecaFija({ tipo, promedio, porcentaje }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const becaFija_id = result.insertId;

        // Crea la relación con nivel
        becasFijasNivelModel.createBecaFijaNivel({ becaFija_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ becaFija_id });
        });
    });
};

const updateBecaFijaWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedBecaFijaUpdates = ['tipo', 'promedio', 'porcentaje'];
    const allowedBecaFijaNivelUpdates = ['nivel_id'];
    const becaFijaFieldsToUpdate = {};
    const becaFijaNivelFieldsToUpdate = {};

    allowedBecaFijaUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            becaFijaFieldsToUpdate[field] = updates[field];
        }
    });

    allowedBecaFijaNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            becaFijaNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const becaFijaUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(becaFijaFieldsToUpdate).length > 0) {
            becasFijasModel.updateBecaFija(id, becaFijaFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const becaFijaNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(becaFijaNivelFieldsToUpdate).length > 0) {
            becasFijasNivelModel.updateBecaFijaNivel(id, becaFijaNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([becaFijaUpdatePromise, becaFijaNivelUpdatePromise])
        .then(results => {
            const [becaFijaResult, becaFijaNivelResult] = results;
            if (becaFijaResult.affectedRows > 0 || becaFijaNivelResult.affectedRows > 0) {
                res.json({ message: 'BecaFija y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'BecaFija y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteBecaFijaWithNivel = (req, res) => {
    const becaFija_id = req.params.id;

    // Elimina la relación con nivel
    becasFijasNivelModel.deleteBecaFijaNivel(becaFija_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el becaFija
        becasFijasModel.deleteBecaFija(becaFija_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'BecaFija y relación eliminados' });
        });
    });
};

module.exports = {
    getBecasFijas,
    getBecasFijasByNivel,
    getBecasFijasByAverage,
    getBecaFijaById,
    createBecaFijaWithNivel,
    updateBecaFijaWithNivel,
    deleteBecaFijaWithNivel
};
