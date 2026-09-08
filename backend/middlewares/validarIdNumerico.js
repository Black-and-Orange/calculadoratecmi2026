// Valida que el parámetro de ruta `id` sea un entero positivo (Fase 2, Block 1 / P4).
// Se usa como callback de router.param('id', ...): rechaza con 400 antes de llegar
// al controlador cualquier id no numérico (p. ej. rutas huérfanas como
// "/seguros/cambiar-nombres" que caerían en "/:id").
module.exports = function validarIdNumerico(req, res, next, value) {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return res.status(400).json({ message: 'ID inválido.' });
    }
    next();
};
