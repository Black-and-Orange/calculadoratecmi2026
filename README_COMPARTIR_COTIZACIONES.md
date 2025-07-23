# Funcionalidad de Compartir Cotizaciones

## Descripción
Se ha implementado una nueva funcionalidad que permite compartir cotizaciones de Tecmilenio a través de WhatsApp usando URLs únicas con ID de cotización.

## Características Implementadas

### 1. **Backend - Endpoint para Obtener Cotización por ID**
- **Ruta:** `GET /api/cotizaciones/:id`
- **Controlador:** `getCotizacionById` en `cotizacionesController.js`
- **Modelo:** `getCotizacionById` en `cotizaciones.js`
- **Funcionalidad:** Obtiene todos los datos de una cotización específica incluyendo información del nivel

### 2. **Página de Visualización de Cotización**
- **Archivo:** `frontend/cotizacion.html`
- **JavaScript:** `frontend/js/cotizacion.js`
- **Funcionalidad:** 
  - Carga cotización desde el backend usando solo el ID
  - Muestra toda la información de la cotización
  - Maneja diferentes niveles académicos
  - Incluye botón de WhatsApp para re-compartir

### 3. **Integración con WhatsApp**
- **Función modificada:** `enviarWhatsApp` en `resultados.js`
- **Funcionalidad:** 
  - Guarda el ID de la cotización en localStorage
  - Genera URL única para compartir
  - Envía mensaje con enlace directo a la cotización

## Flujo de Funcionamiento

### 1. **Creación de Cotización**
1. Usuario completa el formulario en `index.html`
2. Se redirige a `resultado.html` con parámetros en URL
3. Se guarda la cotización en la base de datos
4. Se almacena el ID de la cotización en localStorage

### 2. **Compartir por WhatsApp**
1. Usuario presiona botón "Enviar por WhatsApp"
2. Se abre modal para ingresar número de teléfono
3. Se genera URL única: `cotizacion.html?id=123`
4. Se envía mensaje de WhatsApp con el enlace

### 3. **Visualización de Cotización Compartida**
1. Receptor hace clic en el enlace
2. Se carga `cotizacion.html` con el ID de la URL
3. Se hace petición al backend para obtener datos
4. Se muestra la cotización completa

## Archivos Modificados/Creados

### Backend
- `controllers/cotizacionesController.js` - Agregada función `getCotizacionById`
- `models/cotizaciones.js` - Agregada función `getCotizacionById`
- `routes/cotizacionesRoutes.js` - Agregada ruta `GET /:id`

### Frontend
- `resultado.html` - Agregados scripts para PDF y WhatsApp
- `js/cargaDatos/resultados.js` - Modificada función de guardar y WhatsApp
- `cotizacion.html` - **NUEVO** - Página para visualizar cotizaciones compartidas
- `js/cotizacion.js` - **NUEVO** - Lógica para cargar cotización desde backend
- `js/descargarPDF.js` - **NUEVO** - Función modularizada para generar PDF

## Ventajas de esta Implementación

### 1. **Persistencia de Datos**
- Las cotizaciones se guardan permanentemente en la base de datos
- No se pierde información al compartir

### 2. **Acceso Universal**
- Cualquier persona puede ver la cotización con solo el enlace
- No requiere acceso al localStorage del usuario original

### 3. **Escalabilidad**
- Fácil de extender para agregar más funcionalidades
- Estructura modular y mantenible

### 4. **Experiencia de Usuario**
- Proceso de compartir simple e intuitivo
- Visualización consistente en cualquier dispositivo

## URLs de Ejemplo

### URL de Resultados (actual)
```
http://127.0.0.1:5500/Calculadora/frontend/resultado.html?txt-name=Vane&select-grade=Ejecutivo+MAPS+Bimestral&...
```

### URL de Cotización Compartida (nueva)
```
http://127.0.0.1:5500/Calculadora/frontend/cotizacion.html?id=123
```

## Consideraciones Técnicas

### 1. **Seguridad**
- Las cotizaciones son públicas por ID
- Considerar implementar autenticación si es necesario

### 2. **Rendimiento**
- Las cotizaciones se cargan desde la base de datos
- Optimizar consultas para grandes volúmenes

### 3. **Mantenimiento**
- Los datos se mantienen sincronizados entre localStorage y base de datos
- Fácil de depurar y mantener

## Próximos Pasos Sugeridos

1. **Implementar autenticación** para cotizaciones privadas
2. **Agregar estadísticas** de cotizaciones compartidas
3. **Implementar expiración** de cotizaciones antiguas
4. **Agregar funcionalidad** de edición de cotizaciones
5. **Implementar notificaciones** cuando se comparte una cotización

## Pruebas

### Para Probar la Funcionalidad:
1. Crear una cotización en `index.html`
2. En `resultado.html`, presionar "Enviar por WhatsApp"
3. Ingresar un número de teléfono
4. Verificar que se envíe el enlace correcto
5. Abrir el enlace en una nueva pestaña/ventana
6. Verificar que se muestre la cotización completa

### Para Probar el Endpoint:
```bash
curl http://localhost:3008/api/cotizaciones/123
```

## Notas Importantes

- El sistema mantiene compatibilidad total con la funcionalidad existente
- No se pierde información del localStorage
- La experiencia de usuario se mantiene igual para el flujo normal
- Se agrega funcionalidad adicional sin afectar el código existente 