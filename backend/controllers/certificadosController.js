const certificadosModel = require('../models/certificados');
const certificadosNivelModel = require('../models/certificadosNivel');

const getAllCertificados = (req, res) => {
    certificadosModel.getAllCertificados((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
};

const getCertificadosByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    
    certificadosModel.getCertificadosByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};

const resetAndAddCertificados = (req, res) => {
    const { num_certificados, nivel_id } = req.body;

    // Validaciones de entrada
    if (isNaN(num_certificados) || num_certificados < 0) {
        return res.status(400).json({ error: 'Número máximo de certificados inválido' });
    }

    if (!nivel_id) {
        return res.status(400).json({ error: 'ID de nivel no proporcionado' });
    }

    // Primero, eliminar los registros actuales en certificados_nivel
    certificadosNivelModel.deleteAllCertificadosNivel((err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Luego, eliminar todos los registros en certificados
        certificadosModel.deleteAllCertificados((err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Insertar nuevos certificados y sus relaciones con nivel
            const insertPromises = [];
            for (let i = 0; i <= num_certificados; i++) { // Inicia desde 0 hasta num_certificados
                insertPromises.push(new Promise((resolve, reject) => {
                    // Definir los datos del certificado
                    const certificadoData = {
                        numero: i // Guardar solo el número del certificado
                    };

                    // Crear el certificado
                    certificadosModel.createCertificado(certificadoData, (err, result) => {
                        if (err) return reject(err);

                        // Obtener el ID del certificado recién insertado
                        certificadosModel.getLastInsertId((err, certificadoId) => {
                            if (err) return reject(err);

                            // Definir los datos para la tabla intermedia certificados_nivel
                            const certificadoNivelData = {
                                certificado_id: certificadoId,
                                nivel_id: nivel_id
                            };

                            // Crear la relación en certificados_nivel
                            certificadosNivelModel.createCertificadoNivel(certificadoNivelData, (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    });
                }));
            }

            // Esperar a que todas las promesas se resuelvan
            Promise.all(insertPromises)
                .then(() => res.status(201).json({ message: 'Certificados y relaciones actualizados correctamente' }))
                .catch(err => res.status(500).json({ error: err.message }));
        });
    });
};

module.exports = {
    getAllCertificados,
    getCertificadosByNivel,
    resetAndAddCertificados
};
