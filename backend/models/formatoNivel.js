// models/formatoNivel.js
const db = require('../config/dbConfig');

const getAllFormatoNiveles = (callback) => {
    db.query('SELECT * FROM formato_nivel', callback);
};

const getFormatoNivelById = (id, callback) => {
    db.query('SELECT * FROM formato_nivel WHERE id = ?', [id], callback);
};

const createFormatoNivel = (formatoNivel, callback) => {
    const { id_formato, id_nivel } = formatoNivel;
    db.query('INSERT INTO formato_nivel (id_formato, id_nivel) VALUES (?, ?)', [id_formato, id_nivel], callback);
};

const deleteFormatoNivel = (id, callback) => {
    db.query('DELETE FROM formato_nivel WHERE id = ?', [id], callback);
};

const updateFormatoNivel = (id, formatoNivel, callback) => {
    const { id_nivel } = formatoNivel;
    console.log(id_nivel);
    db.query('UPDATE formato_nivel SET id_nivel = ? WHERE id = ?', [id_nivel, id], callback);
};

module.exports = {
    getAllFormatoNiveles,
    getFormatoNivelById,
    createFormatoNivel,
    deleteFormatoNivel,
    updateFormatoNivel
};
