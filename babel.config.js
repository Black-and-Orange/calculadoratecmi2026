// Solo para Jest: permite probar los módulos ES del frontend/admin (import/export)
// sin tocar el código de producción. No se usa en build ni en deploy.
module.exports = { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] };
