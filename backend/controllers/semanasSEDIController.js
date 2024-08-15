const semanasModel = require('../models/semanasSEDI');
const semanasNivelModel = require('../models/semanasSEDINivel');

const getAllSemanas = (req, res) => {
    semanasModel.getAllSemanas((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
};

const getSemanasByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    
    semanasModel.getSemanasByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const resetAndAddSemanas = (req, res) => {
    const { num_semanas, nivel_id } = req.body;

    // Validaciones de entrada
    if (isNaN(num_semanas) || num_semanas < 0) {
        return res.status(400).json({ error: 'Número máximo de semanas inválido' });
    }

    if (!nivel_id) {
        return res.status(400).json({ error: 'ID de nivel no proporcionado' });
    }

    // Primero, eliminar los registros actuales en semanas_nivel
    semanasNivelModel.deleteAllSemanasNivel((err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Luego, eliminar todos los registros en semanas
        semanasModel.deleteAllSemanas((err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Insertar nuevos semanas y sus relaciones con nivel
            const insertPromises = [];
            for (let i = 0; i <= num_semanas; i++) { // Inicia desde 0 hasta num_semanas
                insertPromises.push(new Promise((resolve, reject) => {
                    // Definir los datos del semana
                    const semanaData = {
                        numero: i // Guardar solo el número del semana
                    };

                    // Crear el semana
                    semanasModel.createCertificado(semanaData, (err, result) => {
                        if (err) return reject(err);

                        // Obtener el ID del semana recién insertado
                        semanasModel.getLastInsertId((err, semanaId) => {
                            if (err) return reject(err);

                            // Definir los datos para la tabla intermedia semanas_nivel
                            const semanaNivelData = {
                                semana_id: semanaId,
                                nivel_id: nivel_id
                            };

                            // Crear la relación en semanas_nivel
                            semanasNivelModel.createCertificadoNivel(semanaNivelData, (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    });
                }));
            }

            // Esperar a que todas las promesas se resuelvan
            Promise.all(insertPromises)
                .then(() => res.status(201).json({ message: 'Semanas y relaciones actualizados correctamente' }))
                .catch(err => res.status(500).json({ error: err.message }));
        });
    });
};

module.exports = {
    getAllSemanas,
    getSemanasByNivel,
    resetAndAddSemanas
};
