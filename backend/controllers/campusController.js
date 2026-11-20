const campusModel = require('../models/campus');
const campusNivelModel = require('../models/campusNivel');
const seguroNivelCampusModel = require('../models/segurosNivelCampus');

const getAllCampus = (req, res) => {
    campusModel.getAllCampuses((err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
};

const getCampusesByNivel = (req, res) => {
    const nivelId = req.params.nivelId;
    
    campusModel.getCampusesByNivel(nivelId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
};



const getCampusById = (req, res) => {
    const id = req.params.id;
    campusModel.getCampusById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Campus no encontrado' });
        res.status(200).json(results[0]);
    });
};

const createCampusWithNivel = (req, res) => {
    const { nombre, categoria_coleg, nivel_id } = req.body;

    // Liga el campus al nivel con su categoría; si ya estaba ligado, actualiza la categoría.
    const ligar = (campus_id) => {
        campusNivelModel.findByCampusNivel(campus_id, nivel_id, (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existing && existing.length > 0) {
                campusNivelModel.updateCampusNivelCategoria(campus_id, nivel_id, categoria_coleg, (e) =>
                    e ? res.status(500).json({ error: e.message }) : res.status(200).json({ campus_id, reused: true }));
            } else {
                campusNivelModel.createCampusNivel({ campus_id, nivel_id, categoria_coleg }, (e) =>
                    e ? res.status(500).json({ error: e.message }) : res.status(201).json({ campus_id }));
            }
        });
    };

    // Reusa la fila de campus si el nombre ya existe (evita duplicados); si no, la crea.
    campusModel.getCampusByNombre(nombre, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows && rows.length > 0) {
            ligar(rows[0].id);
        } else {
            campusModel.createCampus({ nombre, categoria_coleg }, (e, result) => {
                if (e) return res.status(500).json({ error: e.message });
                ligar(result.insertId);
            });
        }
    });
};

const updateCampusWithNivel = (req, res) => {
    const campus_id = req.params.id;
    const { nombre, categoria_coleg, nivel_id } = req.body;

    const ops = [];

    // El NOMBRE es propiedad del campus (compartido entre niveles).
    if (nombre !== undefined) {
        ops.push(new Promise((resolve, reject) => {
            campusModel.updateCampus(campus_id, { nombre }, (err) => (err ? reject(err) : resolve()));
        }));
    }

    // La CATEGORÍA es POR NIVEL: se guarda en campus_nivel para ese (campus, nivel),
    // así editar un nivel NO afecta a los demás. Requiere nivel_id.
    if (categoria_coleg !== undefined && nivel_id !== undefined) {
        ops.push(new Promise((resolve, reject) => {
            campusNivelModel.updateCampusNivelCategoria(campus_id, nivel_id, categoria_coleg, (err) => (err ? reject(err) : resolve()));
        }));
    }

    Promise.all(ops)
        .then(() => res.json({ message: 'Campus actualizado' }))
        .catch(err => res.status(500).json({ error: err.message }));
};

const deleteCampusWithNivel = (req, res) => {
    const campus_id = req.params.id;
    const nivel_id = req.query.nivel_id || (req.body && req.body.nivel_id);
    if (!nivel_id) {
        return res.status(400).json({ error: 'nivel_id es requerido para quitar el campus por nivel' });
    }

    // 1. Quita SOLO la liga de ese nivel (no afecta su presencia en otros niveles).
    campusNivelModel.deleteByCampusNivel(campus_id, nivel_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. Limpia la excepción de precio (VIVE) de ese campus en ese nivel.
        seguroNivelCampusModel.removeByCampusNivel(campus_id, nivel_id, () => {

            // 3. Si el campus ya no se usa en NINGÚN nivel, borra la fila completa.
            campusNivelModel.countByCampus(campus_id, (e, rows) => {
                if (e) return res.status(500).json({ error: e.message });
                const n = rows && rows[0] ? rows[0].n : 0;
                if (n === 0) {
                    seguroNivelCampusModel.removeByCampus(campus_id, () => {
                        campusModel.deleteCampus(campus_id, () =>
                            res.json({ message: 'Campus eliminado (ya no se usaba en ningún nivel)' }));
                    });
                } else {
                    res.json({ message: `Campus quitado del nivel ${nivel_id} (sigue en ${n} nivel(es))` });
                }
            });
        });
    });
};

module.exports = {
    getAllCampus,
    getCampusesByNivel,
    getCampusById,
    createCampusWithNivel,
    updateCampusWithNivel,
    deleteCampusWithNivel
};
