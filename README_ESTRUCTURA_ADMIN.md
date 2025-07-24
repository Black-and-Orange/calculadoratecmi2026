# Estructura del Proyecto - Calculadora Tecmilenio

## Descripción General

El proyecto de la calculadora de colegiaturas de Tecmilenio ha sido reorganizado para separar completamente la funcionalidad del administrador de la calculadora principal. Esto permite un mejor mantenimiento, seguridad y organización del código.

## Nueva Estructura de Directorios

```
Calculadora/
├── README_ESTRUCTURA_ADMIN.md    # Este archivo
├── README_SISTEMA_UNIFICADO.md   # Documentación del sistema principal
├── README_COTIZACIONES.md        # Documentación de cotizaciones
├── README_COMPARTIR_COTIZACIONES.md # Documentación de cotizaciones compartidas
├── frontend/                     # Calculadora principal (público)
│   ├── index.html               # Página principal de la calculadora
│   ├── resultado.html           # Página de resultados
│   ├── cotizacion-compartida.html # Página de cotizaciones compartidas
│   ├── css/                     # Estilos de la calculadora
│   │   ├── styles.css
│   │   ├── style-icbi.css
│   │   ├── style-profesional-asociado.css
│   │   └── style-universidad.css
│   ├── js/                      # JavaScript de la calculadora
│   │   ├── apiConfig.js
│   │   ├── main.js
│   │   ├── cotizacion.js
│   │   ├── cotizacion-compartida.js
│   │   ├── descargarPDF.js
│   │   ├── utils/
│   │   │   ├── shared-utils.js
│   │   │   └── data-protection.js
│   │   └── cargaDatos/
│   │       ├── step1.js
│   │       ├── step2.js
│   │       ├── step3.js
│   │       └── resultados.js
│   └── img/                     # Imágenes de la calculadora
├── admin/                       # Panel de administración (privado)
│   ├── README.md               # Documentación del admin
│   ├── login.html              # Página de login
│   ├── panel.html              # Panel principal
│   ├── css/                    # Estilos del admin
│   │   ├── login.css
│   │   └── panel.css
│   └── js/                     # JavaScript del admin
│       ├── apiConfig.js
│       ├── admin.js
│       ├── admin-cotizaciones-panel.js
│       └── control/            # Módulos de control
│           ├── tabs.js
│           ├── controlCampus.js
│           ├── controlBecas.js
│           ├── controlBeneficios.js
│           ├── controlPlanes.js
│           ├── controlApoyos.js
│           ├── controlApoyosFijos.js
│           ├── controlCreditos.js
│           ├── controlPrestamos.js
│           ├── controlInteres.js
│           ├── controlCostos.js
│           ├── controlFormato.js
│           ├── controlFormatoAsociado.js
│           ├── controlMaterias.js
│           ├── controlCertificados.js
│           ├── controlIngles.js
│           ├── controlSemanas.js
│           ├── controlPeriodo.js
│           ├── controlSeguros.js
│           └── controlPagosBimestrales.js
└── backend/                     # API y base de datos
    ├── index.js
    ├── package.json
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middlewares/
    └── sql/
```

## Separación de Responsabilidades

### Frontend (Público)
- **Propósito**: Calculadora de colegiaturas para usuarios finales
- **Acceso**: Público, sin autenticación requerida
- **Funcionalidades**:
  - Formulario de cálculo de colegiaturas
  - Visualización de resultados
  - Cotizaciones compartidas
  - Descarga de PDF
  - Envío por WhatsApp

### Admin (Privado)
- **Propósito**: Panel de administración del sistema
- **Acceso**: Requiere autenticación de administrador
- **Funcionalidades**:
  - Gestión de todos los parámetros del sistema
  - Administración de cotizaciones
  - Configuración de vigencia
  - Exportación de datos

### Backend (API)
- **Propósito**: Servicios API para ambos sistemas
- **Acceso**: Solo vía API, protegido por CORS
- **Funcionalidades**:
  - Endpoints para la calculadora
  - Endpoints para el administrador
  - Autenticación JWT
  - Base de datos MySQL

## Beneficios de la Nueva Estructura

### 1. Seguridad
- **Separación física**: El admin está completamente separado del frontend público
- **Autenticación independiente**: Sistema de login específico para administradores
- **Rutas protegidas**: Acceso restringido a archivos del admin

### 2. Mantenimiento
- **Código organizado**: Cada sistema tiene su propia carpeta
- **Dependencias claras**: Cada sistema tiene sus propios archivos CSS/JS
- **Actualizaciones independientes**: Se puede actualizar un sistema sin afectar el otro

### 3. Escalabilidad
- **Módulos independientes**: Cada funcionalidad del admin es un módulo separado
- **Fácil extensión**: Agregar nuevas funcionalidades no afecta el sistema principal
- **Despliegue flexible**: Se pueden desplegar en servidores diferentes

### 4. Desarrollo
- **Equipos separados**: Diferentes equipos pueden trabajar en cada sistema
- **Testing independiente**: Cada sistema se puede probar por separado
- **Debugging más fácil**: Problemas aislados por sistema

## URLs de Acceso

### Calculadora Principal
- **Inicio**: `http://localhost:5500/frontend/index.html`
- **Resultados**: `http://localhost:5500/frontend/resultado.html`
- **Cotización Compartida**: `http://localhost:5500/frontend/cotizacion-compartida.html`

### Panel de Administración
- **Login**: `http://localhost:5500/admin/login.html`
- **Panel Principal**: `http://localhost:5500/admin/panel.html`

### API Backend
- **Base URL**: `http://localhost:3000/api`

## Migración y Compatibilidad

### Archivos Movidos
- ✅ `panel.html` → `admin/panel.html`
- ✅ `login.html` → `admin/login.html`
- ✅ `css/panel.css` → `admin/css/panel.css`
- ✅ `css/login.css` → `admin/css/login.css`
- ✅ `js/admin.js` → `admin/js/admin.js`
- ✅ `js/admin-cotizaciones-panel.js` → `admin/js/admin-cotizaciones-panel.js`
- ✅ `js/control/` → `admin/js/control/`

### Archivos Copiados
- ✅ `js/apiConfig.js` → `admin/js/apiConfig.js` (copia)

### Funcionalidad Preservada
- ✅ Todas las funcionalidades del admin siguen funcionando
- ✅ Rutas internas actualizadas correctamente
- ✅ Dependencias externas (Bootstrap, Font Awesome) mantenidas
- ✅ API endpoints sin cambios

## Configuración del Servidor

### Para Desarrollo Local
```bash
# Terminal 1: Backend API
cd Calculadora/backend
npm start

# Terminal 2: Servidor de archivos estáticos
cd Calculadora
python -m http.server 5500
# o
npx http-server -p 5500
```

### Para Producción
- **Frontend**: Servir desde `Calculadora/frontend/`
- **Admin**: Servir desde `Calculadora/admin/` (con autenticación)
- **Backend**: Servir desde `Calculadora/backend/`

## Notas Importantes

### Seguridad
- El directorio `admin/` debe estar protegido en producción
- Implementar autenticación a nivel de servidor web
- Configurar CORS apropiadamente

### Mantenimiento
- Las actualizaciones del admin no afectan la calculadora
- Cada sistema tiene su propio `apiConfig.js`
- Los estilos están completamente separados

### Desarrollo Futuro
- Agregar nuevas funcionalidades al admin sin afectar el frontend
- Implementar nuevas características en la calculadora sin tocar el admin
- Mantener la separación de responsabilidades

## Documentación Adicional

- **Admin**: Ver `admin/README.md`
- **Sistema Principal**: Ver `README_SISTEMA_UNIFICADO.md`
- **Cotizaciones**: Ver `README_COTIZACIONES.md`
- **Cotizaciones Compartidas**: Ver `README_COMPARTIR_COTIZACIONES.md` 