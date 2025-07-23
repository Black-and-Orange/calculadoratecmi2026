# Sistema Unificado de Cotizaciones - Tecmilenio

## 🎯 **Descripción General**

El sistema ahora funciona de manera unificada en `resultado.html`, que puede manejar tanto el flujo normal de la calculadora como la visualización de cotizaciones compartidas mediante URLs con ID.

## 🔄 **Flujos de Funcionamiento**

### **1. Flujo Normal (sin ID en URL)**
```
Usuario calcula → Datos en localStorage → Se guarda en BD → Se genera ID → WhatsApp envía URL con ID
```

### **2. Flujo de Compartir (URL con ID)**
```
URL con ID → Backend recupera datos → Se cargan en localStorage → Se muestran cálculos completos
```

## 📋 **Componentes del Sistema**

### **Archivos Principales**
- **`resultado.html`** - Página unificada que maneja ambos flujos
- **`js/cargaDatos/resultados.js`** - Lógica principal de la calculadora
- **`js/cotizacion.js`** - Módulo para cargar cotizaciones desde el backend
- **`js/apiConfig.js`** - Configuración de la API

### **Endpoints del Backend**
- **`POST /api/cotizaciones`** - Guardar nueva cotización
- **`GET /api/cotizaciones/:id`** - Obtener cotización por ID

## ⚙️ **Funcionamiento Técnico**

### **Detección de Flujo**
```javascript
// En cotizacion.js
const urlParams = new URLSearchParams(window.location.search);
const cotizacionId = urlParams.get('id');

if (!cotizacionId) {
    // Flujo normal - no hacer nada
    return;
}
// Flujo con ID - cargar desde backend
```

### **Carga de Datos desde Backend**
```javascript
// 1. Hacer llamada al backend
const response = await fetch(`${API_BASE_URL}/cotizaciones/${cotizacionId}`);

// 2. Cargar datos en localStorage para compatibilidad
cargarDatosEnLocalStorage(cotizacion);

// 3. Marcar que los datos vienen del backend
localStorage.setItem('datosDesdeBackend', 'true');
```

### **Compatibilidad con localStorage**
- Los datos del backend se cargan en localStorage
- La lógica existente de `resultados.js` funciona sin cambios
- Se mantiene la compatibilidad con todos los cálculos

## 🔐 **Garantía de ID Único**

### **Función `asegurarCotizacionId()`**
```javascript
async function asegurarCotizacionId() {
    let cotizacionId = localStorage.getItem('cotizacionId');
    
    if (!cotizacionId) {
        await guardarCotizacion();
        cotizacionId = localStorage.getItem('cotizacionId');
    }
    
    return cotizacionId;
}
```

### **Uso en WhatsApp**
- Antes de enviar por WhatsApp, se asegura que siempre haya un ID
- Si no existe, se guarda automáticamente la cotización
- La URL siempre incluye el ID único

## 📱 **Funcionalidad de WhatsApp**

### **URLs Generadas**
```
https://tu-dominio.com/Calculadora/frontend/resultado.html?id=ABC123
```

### **Proceso de Envío**
1. Usuario hace clic en "Enviar por WhatsApp"
2. Se asegura que existe un ID de cotización
3. Se genera la URL con el ID
4. Se abre WhatsApp con el mensaje y la URL

## 🎨 **Experiencia de Usuario**

### **Flujo Normal**
- Usuario calcula normalmente
- Ve sus resultados
- Puede compartir por WhatsApp
- La URL generada permite ver la cotización completa

### **Flujo Compartido**
- Usuario recibe URL por WhatsApp
- Al abrirla, ve la cotización completa
- Todos los cálculos y datos están disponibles
- Puede compartir nuevamente la misma URL

## 🔧 **Mantenimiento**

### **Ventajas del Sistema Unificado**
- ✅ Una sola página para ambos flujos
- ✅ Mantenimiento simplificado
- ✅ Consistencia en la experiencia
- ✅ URLs únicas y persistentes
- ✅ Sin pérdida de información

### **Compatibilidad**
- ✅ Funciona con todos los niveles existentes
- ✅ Compatible con el nivel 13 (bimestral)
- ✅ Mantiene toda la funcionalidad de cálculos
- ✅ Preserva la lógica de descuentos y apoyos

## 🚀 **Despliegue**

### **Configuración de Producción**
```javascript
// En apiConfig.js
export const API_BASE_URL = 'https://tu-backend.com/api';
```

### **URLs de Producción**
- **Frontend:** `https://tu-dominio.com/Calculadora/frontend/resultado.html`
- **Backend:** `https://tu-backend.com/api/cotizaciones`

## 📊 **Estructura de Datos**

### **Datos Guardados en BD**
```javascript
{
    id: "ABC123",
    nombre_estudiante: "Juan Pérez",
    nivel_id: 13,
    periodo: "Verano 2024",
    campus: "Mérida",
    costo_total: 34000,
    total_contado: 18700,
    // ... más campos
}
```

### **Datos en localStorage**
- Todos los datos necesarios para los cálculos
- Marcador `datosDesdeBackend` para control
- ID de cotización para compartir

---

**Sistema desarrollado para Tecmilenio - Calculadora de Colegiaturas** 