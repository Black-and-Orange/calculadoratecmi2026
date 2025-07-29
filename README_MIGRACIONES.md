# Migraciones de Base de Datos

## Orden de ejecución

Para agregar los nuevos campos a la tabla `cotizaciones`, ejecuta las siguientes migraciones en orden:

### 1. Agregar campo costos_por_bimestre
```sql
-- Ejecutar: agregar_costos_por_bimestre.sql
ALTER TABLE cotizaciones ADD COLUMN costos_por_bimestre JSON AFTER total_seguros;
CREATE INDEX idx_costos_por_bimestre ON cotizaciones(costos_por_bimestre);
```

### 2. Agregar campo configuraciones_por_periodo
```sql
-- Ejecutar: agregar_configuraciones_periodo.sql
ALTER TABLE cotizaciones ADD COLUMN configuraciones_por_periodo JSON AFTER costos_por_bimestre;
CREATE INDEX idx_configuraciones_periodo ON cotizaciones(configuraciones_por_periodo);
```

## Estructura final de la tabla

Después de ejecutar ambas migraciones, la tabla `cotizaciones` tendrá los siguientes campos nuevos:

- `costos_por_bimestre` (JSON) - Para almacenar los costos por bimestre para nivel 13
- `configuraciones_por_periodo` (JSON) - Para almacenar las configuraciones de certificados y semanas por período

## Notas importantes

- Ejecuta las migraciones en el orden especificado
- Los campos son de tipo JSON para permitir almacenar estructuras de datos complejas
- Se han agregado índices para optimizar las consultas
- Las migraciones son seguras y no afectan datos existentes 