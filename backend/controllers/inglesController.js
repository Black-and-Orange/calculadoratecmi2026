const inglesModel = require('../models/ingles');
const inglesNivelModel = require('../models/inglesNivel');

const getAllIngles = (req, res) => {
    inglesModel.getAllIngles((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
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

const resetAndAddIngles = (req, res) => {
    const { num_ingles, nivel_id } = req.body;

    // Validaciones de entrada
    if (isNaN(num_ingles) || num_ingles < 0) {
        return res.status(400).json({ error: 'Número máximo de ingles inválido' });
    }

    if (!nivel_id) {
        return res.status(400).json({ error: 'ID de nivel no proporcionado' });
    }

    // Primero, eliminar los registros actuales en ingles_nivel
    inglesNivelModel.deleteAllInglesNivel((err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Luego, eliminar todos los registros en ingles
        inglesModel.deleteAllIngles((err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Insertar nuevos ingles y sus relaciones con nivel
            const insertPromises = [];
            for (let i = 0; i <= num_ingles; i++) { // Inicia desde 0 hasta num_ingles
                insertPromises.push(new Promise((resolve, reject) => {
                    // Definir los datos del ingles
                    const inglesData = {
                        numero: i // Guardar solo el número del ingles
                    };

                    // Crear el ingles
                    inglesModel.createCertificado(inglesData, (err, result) => {
                        if (err) return reject(err);

                        // Obtener el ID del ingles recién insertado
                        inglesModel.getLastInsertId((err, inglesId) => {
                            if (err) return reject(err);

                            // Definir los datos para la tabla intermedia ingles_nivel
                            const inglesNivelData = {
                                ingles_id: inglesId,
                                nivel_id: nivel_id
                            };

                            // Crear la relación en ingles_nivel
                            inglesNivelModel.createCertificadoNivel(inglesNivelData, (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    });
                }));
            }

            // Esperar a que todas las promesas se resuelvan
            Promise.all(insertPromises)
                .then(() => res.status(201).json({ message: 'Ingles y relaciones actualizados correctamente' }))
                .catch(err => res.status(500).json({ error: err.message }));
        });
    });
};

module.exports = {
    getAllIngles,
    getInglesByNivel,
    resetAndAddIngles
};
