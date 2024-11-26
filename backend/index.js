require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const becasFijasRoutes = require('./routes/becasFijasRoutes');
const becasVariablesRoutes = require('./routes/becasVariablesRoutes');
const beneficiosRoutes = require('./routes/beneficiosRoutes');
const apoyosRoutes = require('./routes/apoyosRoutes');
const apoyosFijosRoutes = require('./routes/apoyosFijosRoutes');
const campusRoutes = require('./routes/campusRoutes');
const costoMateriaRoutes = require('./routes/costoMateriaRoutes');
const formatoRoutes = require('./routes/formatoRoutes');
const formatoAsociadoRoutes = require('./routes/formatoAsociadoRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const nivelRoutes = require('./routes/nivelRoutes');
const periodicidadRoutes = require('./routes/periodicidadRoutes');
const periodoRoutes = require('./routes/periodoRoutes');
const planesRoutes = require('./routes/planesRoutes');
const segurosRoutes = require('./routes/segurosRoutes');
const certificadosRoutes = require('./routes/certificadosRoutes');
const inglesRoutes = require('./routes/inglesRoutes');
const semanasSEDIRoutes = require('./routes/semanasSEDIRoutes');
const interesesRoutes = require('./routes/interesesRoutes');
const creditosRoutes = require('./routes/creditosRoutes');
const prestamosRoutes = require('./routes/prestamosRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/apoyos', apoyosRoutes);
app.use('/api/apoyosFijos', apoyosFijosRoutes);
app.use('/api/becasFijas', becasFijasRoutes);
app.use('/api/becasVariables', becasVariablesRoutes);
app.use('/api/beneficios', beneficiosRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/costos', costoMateriaRoutes);
app.use('/api/formato', formatoRoutes);
app.use('/api/formatoAsociado', formatoAsociadoRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/nivel', nivelRoutes);
app.use('/api/periodicidad', periodicidadRoutes);
app.use('/api/periodo', periodoRoutes);
app.use('/api/planes', planesRoutes);
app.use('/api/seguros', segurosRoutes);
app.use('/api/certificados', certificadosRoutes);
app.use('/api/ingles', inglesRoutes);
app.use('/api/semanas', semanasSEDIRoutes);
app.use('/api/intereses', interesesRoutes);
app.use('/api/creditos', creditosRoutes);
app.use('/api/prestamos', prestamosRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
