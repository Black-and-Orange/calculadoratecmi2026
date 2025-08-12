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
const pagosBimestralesRoutes = require('./routes/pagosBimestralesRoutes');
const configuracionVigenciaRoutes = require('./routes/configuracionVigenciaRoutes');
const cotizacionesRoutes = require('./routes/cotizacionesRoutes');

const app = express();

// Configuración CORS más flexible para producción
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como aplicaciones móviles o Postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            // Desarrollo local
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:5501',
            'http://127.0.0.1:5501',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3002',
            'http://127.0.0.1:3002',
            
            // Dominios de testingbo.com
            'https://administrador-becas.testingbo.com',
            'https://tecmilenio-calculadora-backend.testingbo.com',
            'https://calculadora.testingbo.com',
            
            // Dominios de tecmilenio.mx
            'https://universidad.tecmilenio.mx',
            'https://tecmilenio.mx',
        ];
        
        // Verificar si el origin está en la lista de permitidos
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // También permitir subdominios de testingbo.com y tecmilenio.mx
            if (origin.includes('.testingbo.com') || origin.includes('.tecmilenio.mx')) {
                callback(null, true);
            } else {
                console.log('CORS bloqueado para origin:', origin);
                callback(new Error('No permitido por CORS'));
            }
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200 // Para compatibilidad con algunos navegadores
};

app.use(cors(corsOptions));

// Middleware para logging de requests (útil para debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
});

app.use(bodyParser.json());

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
app.use('/api/pagos-bimestrales', pagosBimestralesRoutes);
app.use('/api/configuracion-vigencia', configuracionVigenciaRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
