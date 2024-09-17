const certificadosModel = require('../models/certificados');
const certificadosNivelModel = require('../models/certificadosNivel');

const getAllCertificados = (req, res) => {
    certificadosModel.getAllCertificados((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
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

const getCertificadoById = (req, res) => {
    const id = req.params.id;
    certificadosModel.getCertificadoById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Certificado no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createCertificadoWithNivel = (req, res) => {
    const { num_certificados, nivel_id } = req.body;
    // Validar si los campos están presentes antes de proceder
    if (!num_certificados || !nivel_id) {
        return res.status(400).json({ error: 'El número de certificado y el nivel son requeridos' });
    }

    // Intentar crear la certificado
    certificadosModel.createCertificado({ num_certificados }, (err, result) => {
        if (err) {
            console.error('Error al crear la certificado:', err);  // Log de error para depuración
            return res.status(500).json({ error: 'Error al crear la certificado' });
        }
        const certificado_id = result.insertId;
        
        certificadosNivelModel.createCertificadosNivel({ certificado_id, nivel_id }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al crear la relación certificado-nivel' });
            }
            // Si todo fue bien, devolver el ID de la certificado creada

            res.status(201).json({ certificado_id });
        });
    });
};


const updateCertificadoWithNivel = (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    // Filtrar solo los campos permitidos para la actualización
    const allowedCertificadoUpdates = ['num_certificados'];
    const allowedCertificadoNivelUpdates = ['nivel_id'];
    const apoyoFieldsToUpdate = {};
    const apoyoNivelFieldsToUpdate = {};

    allowedCertificadoUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoFieldsToUpdate[field] = updates[field];
        }
    });

    allowedCertificadoNivelUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            apoyoNivelFieldsToUpdate[field] = updates[field];
        }
    });

    const apoyoUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoFieldsToUpdate).length > 0) {
            certificadosModel.updateCertificado(id, apoyoFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    const apoyoNivelUpdatePromise = new Promise((resolve, reject) => {
        if (Object.keys(apoyoNivelFieldsToUpdate).length > 0) {
            certificadosNivelModel.updateCertificadosNivel(id, apoyoNivelFieldsToUpdate, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        } else {
            resolve({ affectedRows: 0 });
        }
    });

    Promise.all([apoyoUpdatePromise, apoyoNivelUpdatePromise])
        .then(results => {
            const [apoyoResult, apoyoNivelResult] = results;
            if (apoyoResult.affectedRows > 0 || apoyoNivelResult.affectedRows > 0) {
                res.json({ message: 'Certificado y/o nivel actualizado' });
            } else {
                res.status(404).json({ error: 'Certificado y/o nivel no encontrado' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteCertificadoWithNivel = (req, res) => {
    const certificado_id = req.params.id;

    // Eliminar los registros de la tabla certificados_nivel que dependen del certificado_id
    certificadosNivelModel.deleteCertificadosNivel(certificado_id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Una vez eliminados los registros de certificados_nivel, elimina el apoyo en certificadosestudiantiles
        certificadosModel.deleteCertificado(certificado_id, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Certificado y relaciones de nivel eliminados' });
        });
    });
};


module.exports = {
    getAllCertificados,
    getCertificadoById,
    getCertificadosByNivel,
    createCertificadoWithNivel,
    updateCertificadoWithNivel,
    deleteCertificadoWithNivel
};
