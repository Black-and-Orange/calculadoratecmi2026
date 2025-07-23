# Sistema de Cotizaciones - Calculadora Tecmilenio

## Descripción

Se ha implementado un sistema completo para guardar automáticamente cada cotización generada en la calculadora de colegiaturas de Tecmilenio. Esto permite:

- **Almacenamiento automático**: Cada vez que se muestra una hoja de resultados, se guarda la cotización en la base de datos
- **Panel de administración**: Interfaz para ver, filtrar y gestionar todas las cotizaciones
- **Exportación a CSV**: Descarga de reportes en formato CSV para análisis posterior
- **Estadísticas**: Métricas generales sobre el uso de la calculadora

## Archivos Creados/Modificados

### Backend

#### Nuevos archivos:
- `backend/models/cotizaciones.js` - Modelo para la tabla de cotizaciones
- `backend/controllers/cotizacionesController.js` - Controlador para operaciones CRUD
- `backend/routes/cotizacionesRoutes.js` - Rutas de la API
- `backend/sql/create_cotizaciones_table.sql` - Script SQL para crear la tabla

#### Archivos modificados:
- `backend/index.js` - Agregadas las rutas de cotizaciones

### Frontend

#### Nuevos archivos:
- `frontend/js/admin-cotizaciones-panel.js` - JavaScript para la administración de cotizaciones integrada en el panel

#### Archivos modificados:
- `frontend/js/cargaDatos/resultados.js` - Agregada función para guardar cotizaciones automáticamente
- `frontend/panel.html` - Integrada sección de administración de cotizaciones

## Instalación

### 1. Crear la tabla en la base de datos

Ejecuta el script SQL en tu base de datos MySQL:

```sql
-- Crear tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estudiante VARCHAR(255) NOT NULL,
    nivel_id INT NOT NULL,
    periodo VARCHAR(100),
    campus VARCHAR(255),
    materias DECIMAL(10,2),
    certificados DECIMAL(10,2),
    semanas_sedi DECIMAL(10,2),
    ingles DECIMAL(10,2),
    programa VARCHAR(255),
    formato VARCHAR(100),
    costo_total DECIMAL(12,2),
    total_contado DECIMAL(12,2),
    total_financiado DECIMAL(12,2),
    primera_cuota DECIMAL(12,2),
    mensualidades DECIMAL(12,2),
    beca_nombre VARCHAR(255),
    beca_porcentaje DECIMAL(5,2),
    apoyo_estudiantil_porcentaje DECIMAL(5,2),
    apoyo_estudiantil_fijo DECIMAL(12,2),
    prestamo_porcentaje DECIMAL(5,2),
    seguro_accidentes DECIMAL(12,2),
    seguro_estudiantil DECIMAL(12,2),
    cobertura_vive DECIMAL(12,2),
    total_seguros DECIMAL(12,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_usuario VARCHAR(45),
    user_agent TEXT,
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_nivel_id (nivel_id),
    INDEX idx_nombre_estudiante (nombre_estudiante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Reiniciar el servidor backend

```bash
cd Calculadora/backend
npm start
```

## Funcionalidades

### Guardado Automático de Cotizaciones

- **Cuándo se ejecuta**: Cada vez que se carga la página de resultados (`resultado.html`)
- **Datos guardados**: Todos los parámetros de la cotización incluyendo:
  - Información del estudiante
  - Nivel y programa seleccionado
  - **Información académica específica por nivel**:
    - **Nivel 4**: Certificados, Semanas SEDI, Inglés
    - **Nivel 13**: Certificados, Semanas SEDI (sistema bimestral)
    - **Otros niveles**: Materias
  - Costos y descuentos aplicados
  - Seguros seleccionados
  - Fecha y hora de creación
  - IP del usuario y User Agent

### Panel de Administración

**URL**: `http://localhost:5500/panel.html` (sección "Administración de Cotizaciones")

#### Características:
- **Vista de tabla**: Lista todas las cotizaciones con información básica
- **Columna de unidades**: Muestra información académica específica por nivel
- **Filtros**: Por rango de fechas y por nivel educativo
- **Estadísticas**: Métricas generales del uso
- **Acciones**: Ver detalles completos y eliminar cotizaciones
- **Exportación**: Descarga en formato CSV con información detallada por nivel

#### Funcionalidades del panel:
1. **Actualizar**: Recarga los datos de la tabla
2. **Filtrar**: Aplica filtros por fecha o nivel
3. **Exportar CSV**: Descarga un archivo CSV con todos los datos
4. **Ver detalles**: Muestra información completa de una cotización
5. **Eliminar**: Borra una cotización específica

### API Endpoints

#### Crear cotización
```
POST /api/cotizaciones
```

#### Obtener todas las cotizaciones
```
GET /api/cotizaciones
```

#### Obtener cotizaciones por fecha
```
GET /api/cotizaciones/por-fecha?fechaInicio=2024-01-01&fechaFin=2024-12-31
```

#### Obtener cotizaciones por nivel
```
GET /api/cotizaciones/por-nivel/:nivelId
```

#### Obtener estadísticas
```
GET /api/cotizaciones/estadisticas
```

#### Eliminar cotización
```
DELETE /api/cotizaciones/:id
```

## Estructura de Datos

### Tabla `cotizaciones`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único autoincremental |
| nombre_estudiante | VARCHAR(255) | Nombre del estudiante |
| nivel_id | INT | ID del nivel educativo (FK a nivel.id_nivel) |
| periodo | VARCHAR(100) | Periodo seleccionado |
| campus | VARCHAR(255) | Campus seleccionado |
| materias | DECIMAL(10,2) | Número de materias |
| certificados | DECIMAL(10,2) | Número de certificados |
| semanas_sedi | DECIMAL(10,2) | Semanas SEDI |
| ingles | DECIMAL(10,2) | Nivel de inglés |
| programa | VARCHAR(255) | Programa seleccionado |
| formato | VARCHAR(100) | Formato (Presencial/En línea) |
| costo_total | DECIMAL(12,2) | Costo total de la colegiatura |
| total_contado | DECIMAL(12,2) | Total a pagar de contado |
| total_financiado | DECIMAL(12,2) | Total financiado |
| primera_cuota | DECIMAL(12,2) | Primera cuota |
| mensualidades | DECIMAL(12,2) | Valor de las mensualidades |
| beca_nombre | VARCHAR(255) | Nombre de la beca aplicada |
| beca_porcentaje | DECIMAL(5,2) | Porcentaje de beca |
| apoyo_estudiantil_porcentaje | DECIMAL(5,2) | Porcentaje de apoyo estudiantil |
| apoyo_estudiantil_fijo | DECIMAL(12,2) | Apoyo estudiantil fijo |
| prestamo_porcentaje | DECIMAL(5,2) | Porcentaje de préstamo |
| seguro_accidentes | DECIMAL(12,2) | Costo seguro de accidentes |
| seguro_estudiantil | DECIMAL(12,2) | Costo seguro estudiantil |
| cobertura_vive | DECIMAL(12,2) | Costo cobertura Vive |
| total_seguros | DECIMAL(12,2) | Total de seguros |
| fecha_creacion | TIMESTAMP | Fecha y hora de creación |
| ip_usuario | VARCHAR(45) | IP del usuario |
| user_agent | TEXT | User Agent del navegador |

### Tabla `nivel`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_nivel | INT | ID único autoincremental |
| descripcion | VARCHAR(255) | Nombre/descripción del nivel |
| nivel_ed | CHAR(4) | Código del nivel educativo |

## Uso

### Para usuarios finales
No hay cambios en la experiencia del usuario. Las cotizaciones se guardan automáticamente sin interrumpir el flujo normal.

### Para administradores
1. Acceder a `http://localhost:5500/admin-cotizaciones.html`
2. Usar los filtros para encontrar cotizaciones específicas
3. Exportar datos en CSV para análisis posterior
4. Ver estadísticas de uso de la calculadora

## Consideraciones de Seguridad

- Los errores de guardado no se muestran al usuario para no interrumpir la experiencia

## Cambios Recientes

### Integración con Base de Datos de Niveles

Se ha actualizado el sistema para que las cotizaciones se ajusten a la estructura original de nivel:

1. **Modelo de cotizaciones actualizado**: Incluye JOIN con la tabla `nivel` usando la estructura real (`id_nivel`, `descripcion`)
2. **Modelo de nivel sin cambios**: Mantiene su estructura original para no afectar otros endpoints
3. **Frontend actualizado**: Usa datos hardcodeados de `tabs.js` para compatibilidad
4. **API mejorada**: Los endpoints de cotizaciones retornan el nombre del nivel desde la BD

### Estructura de la tabla `nivel` (Real)
```sql
Field      |Type        |Null|Key|Default|Extra         |
-----------+------------+----+---+-------+--------------+
id_nivel   |int         |NO  |PRI|       |auto_increment|
descripcion|varchar(255)|NO  |   |       |              |
nivel_ed   |char(4)     |NO  |   |       |              |
```

### Beneficios de los cambios:
- **Compatibilidad**: No afecta otros endpoints existentes
- **Minimalismo**: Solo modifica cotizaciones para adaptarse a la estructura real de la BD
- **Funcionalidad**: Las cotizaciones obtienen nombres de niveles desde la BD
- **Simplicidad**: No requiere cambios en otras partes del sistema
- Se registra la IP y User Agent para auditoría
- El panel de administración no tiene autenticación (considerar agregar si es necesario)

## Mantenimiento

### Limpieza de datos
Para mantener la base de datos optimizada, considera:
- Eliminar cotizaciones antiguas periódicamente
- Crear índices adicionales según el patrón de consultas
- Hacer respaldos regulares de la tabla

### Monitoreo
- Revisar las estadísticas regularmente
- Monitorear el crecimiento de la tabla
- Verificar que las cotizaciones se estén guardando correctamente

## Troubleshooting

### Problemas comunes:

1. **No se guardan las cotizaciones**
   - Verificar que la tabla existe en la base de datos
   - Revisar los logs del servidor backend
   - Verificar la conexión a la base de datos

2. **Error en el panel de administración**
   - Verificar que el servidor backend esté corriendo
   - Revisar la consola del navegador para errores JavaScript
   - Verificar que las rutas de la API estén funcionando

3. **Problemas con la exportación CSV**
   - Verificar que haya datos para exportar
   - Revisar que el navegador permita descargas
   - Verificar la codificación de caracteres 