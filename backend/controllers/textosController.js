const textosModel = require('../models/textos');
const textosNivelModel = require('../models/textosNivel');

const getTextos = (req, res) => {
    textosModel.getAllTextos((err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
};

const getTextosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;

    textosModel.getTextosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getTextoById = (req, res) => {
    const id = req.params.id;
    textosModel.getTextoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Porcentaje de texto estudiantil no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createTextoWithNivel = (req, res) => {
    const { texto, nivel_id } = req.body;

    // Crea el texto
    textosModel.createTexto({ texto }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const texto_id = result.insertId;

        // Crea la relación con nivel
        textosNivelModel.createTextoNivel({ texto_id, nivel_id }, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ texto_id });
        });
    });
};

const updateTextoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedtextoUpdates = ['texto'];
    const allowedtextoNivelUpdates = ['nivel_id'];
    const textoFieldsToUpdate = {};
    const textoNivelFieldsToUpdate = {};

    allowedtextoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            textoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedtextoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            textoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const textoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(textoFieldsToUpdate).length > 0) {
            textosModel.updateTexto(id, textoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const textoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(textoNivelFieldsToUpdate).length > 0) {
            textosNivelModel.updateTextoNivel(id, textoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([textoUpdatePromise, textoNivelUpdatePromise])
        .then(results => {
            const [textoResult, textoNivelResult] = results;
            if (textoResult.affectedRows > 0 || textoNivelResult.affectedRows > 0) {
                res.json({ message: 'texto y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'texto y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteTextoWithNivel = (req, res) => {
    const texto_id = req.params.id;

    // Elimina la relación con nivel
    textosNivelModel.deleteTextoNivel(texto_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Elimina el texto
        textosModel.deleteTexto(texto_id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'texto y relación eliminados' });
        });
    });
};

module.exports = {
    getTextos,
    getTextosByNivel,
    getTextoById,
    createTextoWithNivel,
    updateTextoWithNivel,
    deleteTextoWithNivel
};
