# Panel de Administración - Calculadora Tecmilenio

## Descripción

Este directorio contiene todos los archivos relacionados con el panel de administración de la calculadora de colegiaturas de Tecmilenio. El panel permite gestionar todos los parámetros del sistema, ver cotizaciones y configurar la vigencia de las propuestas.

## Estructura de Archivos

```
admin/
├── README.md                    # Este archivo
├── login.html                   # Página de inicio de sesión
├── panel.html                   # Panel principal de administración
├── css/
│   ├── login.css               # Estilos para la página de login
│   └── panel.css               # Estilos para el panel principal
└── js/
    ├── apiConfig.js            # Configuración de la API
    ├── admin.js                # Funcionalidades generales del admin
    ├── admin-cotizaciones-panel.js  # Gestión de cotizaciones
    └── control/                # Módulos de control para cada entidad
        ├── controlCampus.js
        ├── controlBecas.js
        ├── controlBeneficios.js
        ├── controlPlanes.js
        ├── controlApoyos.js
        ├── controlApoyosFijos.js
        ├── controlCreditos.js
        ├── controlPrestamos.js
        ├── controlInteres.js
        ├── controlCostos.js
        ├── controlFormato.js
        ├── controlFormatoAsociado.js
        ├── controlMaterias.js
        ├── controlCertificados.js
        ├── controlIngles.js
        ├── controlSemanas.js
        ├── controlPeriodo.js
        ├── controlSeguros.js
        ├── controlPagosBimestrales.js
        └── tabs.js
```

## Funcionalidades

### 1. Autenticación
- **login.html**: Página de inicio de sesión
- Sistema de autenticación con tokens JWT
- Protección de rutas del panel

### 2. Gestión de Niveles Educativos
- Configuración de todos los niveles (1-13)
- Gestión de campus por nivel
- Configuración de programas por nivel
- Gestión de períodos académicos

### 3. Gestión de Beneficios Financieros
- **Becas**: Configuración de becas fijas y variables
- **Apoyos Estudiantiles**: Porcentajes y montos fijos
- **Préstamos**: Configuración de préstamos educativos
- **Intereses**: Tasas de interés por nivel

### 4. Gestión Académica
- **Materias**: Número de materias por nivel
- **Certificados**: Certificados por nivel
- **Créditos**: Sistema de créditos para niveles específicos
- **Semanas SEDI**: Semanas de Desarrollo Integral
- **Inglés**: Certificados de inglés

### 5. Gestión de Costos
- **Costos por materia**: Configuración de precios
- **Formatos**: Presencial/En línea
- **Formatos Asociados**: Costos adicionales
- **Seguros**: Accidentes, estudiantil y cobertura VIVE

### 6. Sistema Bimestral (Nivel 13)
- **Pagos Bimestrales**: Configuración especial para nivel 13
- Gestión de fechas de vencimiento
- Configuración de porcentajes por pago

### 7. Administración de Cotizaciones
- **Vista de cotizaciones**: Lista todas las cotizaciones generadas
- **Filtros**: Por fecha y nivel educativo
- **Exportación**: Descarga en formato CSV
- **Detalles**: Vista completa de cada cotización
- **Eliminación**: Borrado de cotizaciones

### 8. Configuración de Vigencia
- **Días de vigencia**: Configuración de validez de propuestas
- Actualización dinámica de fechas de vencimiento

## Uso

### Acceso al Panel
1. Navegar a `http://localhost:5500/admin/login.html`
2. Ingresar credenciales de administrador
3. Ser redirigido automáticamente al panel principal

### Navegación
- **Secciones colapsables**: Cada sección se puede mostrar/ocultar
- **Pestañas por nivel**: Gestión organizada por nivel educativo
- **Acciones CRUD**: Crear, leer, actualizar y eliminar registros

### Exportación de Datos
- **CSV de cotizaciones**: Descarga completa de todas las cotizaciones
- **Filtros aplicados**: Los datos exportados respetan los filtros activos
- **Información detallada**: Incluye todos los campos de la cotización

## Dependencias

### Frontend
- **Bootstrap 4.5.2**: Framework CSS
- **Font Awesome 6.0.0**: Iconos
- **jQuery 3.5.1**: Manipulación del DOM
- **Popper.js**: Componentes Bootstrap

### Backend
- **API REST**: Todas las operaciones se realizan vía API
- **Autenticación JWT**: Sistema de tokens
- **Base de datos MySQL**: Almacenamiento persistente

## Seguridad

- **Autenticación requerida**: Todas las páginas del admin requieren login
- **Tokens JWT**: Sesiones seguras con expiración
- **Validación de datos**: Validación tanto en frontend como backend
- **CORS configurado**: Acceso restringido a dominios autorizados

## Mantenimiento

### Archivos Importantes
- **apiConfig.js**: Configuración de la API (actualizar URL si es necesario)
- **panel.html**: Página principal del administrador
- **login.html**: Página de autenticación

### Actualizaciones
- Los archivos de control son modulares y independientes
- Cada entidad tiene su propio archivo de gestión
- Las actualizaciones no afectan la calculadora principal

## Notas Técnicas

- **Módulos ES6**: Uso de import/export para organización del código
- **Responsive**: Panel adaptado para diferentes tamaños de pantalla
- **Caché**: Sistema de caché para optimizar consultas a la API
- **Error Handling**: Manejo de errores en todas las operaciones 