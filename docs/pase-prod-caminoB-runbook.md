# Runbook — Pase a prod: Camino B (campus editable por nivel)

Objetivo: llevar a producción la categoría de campus **por nivel** (editar/eliminar/agregar
sin afectar otros niveles), con su de-dup y el cierre de campus, **verificando con la batería**
`test/suite_validacion_caminoB.sh` en cada etapa.

**Importante:** este pase es **datos + código de backend/admin**. NO toca el front del alumno
→ **no se re-publica HubSpot**. El worker/backend se despliega por push a `fase-3` (como los pases anteriores).

## Qué se pushea
- **Migraciones BD** (orden): `migrations/2026-11-19_campus_nivel_categoria.sql`,
  `migrations/2026-11-19_campus_dedup.sql`, y el cierre de los 3 campus
  (Tijuana Río, Satélite, Las Américas — ver nota abajo).
- **Backend:** `models/campus.js`, `models/campusNivel.js`, `models/segurosNivelCampus.js`,
  `controllers/campusController.js`.
- **Admin:** `admin/js/control/controlCampus.js` (editar y eliminar mandan `nivel_id`).
- **Front del alumno:** sin cambios.

## Secuencia

### 0. Respaldo de prod (innegociable)
```
mysqldump -h <EC2> -u <user> -p<pass> --single-transaction --set-gtid-purged=OFF \
  database_calculadora_prueba > prod_backup_PRE_caminoB.sql
# y respaldo específico de las tablas tocadas:
mysqldump ... database_calculadora_prueba campus campus_nivel seguro_nivel_campus > rollback_caminoB.sql
```

### 1. Ensayo en CLON (dry-run) — obligatorio antes de tocar prod
```
# cargar dump de prod en un clon local
mysql -h 127.0.0.1 -u root -e "DROP DATABASE IF EXISTS calc_clone; CREATE DATABASE calc_clone CHARACTER SET utf8mb4;"
mysql -h 127.0.0.1 -u root calc_clone < prod_backup_PRE_caminoB.sql
# aplicar migraciones (ajustar nombre de BD)
mysql -h 127.0.0.1 -u root calc_clone < migrations/2026-11-19_campus_nivel_categoria.sql
mysql -h 127.0.0.1 -u root calc_clone < migrations/2026-11-19_campus_dedup.sql
# (cierre de campos por NOMBRE, no por id, para que aplique en cualquier entorno):
mysql -h 127.0.0.1 -u root calc_clone <<'SQL'
SET FOREIGN_KEY_CHECKS=0; START TRANSACTION;
DELETE cn FROM campus_nivel cn JOIN campus c ON c.id=cn.campus_id WHERE c.nombre IN ('Tijuana Rio','Satélite','Las Américas');
DELETE FROM seguro_nivel_campus WHERE id_campus IN (SELECT id FROM campus WHERE nombre IN ('Tijuana Rio','Satélite','Las Américas'));
DELETE FROM campus WHERE nombre IN ('Tijuana Rio','Satélite','Las Américas');
COMMIT; SET FOREIGN_KEY_CHECKS=1;
SQL
# levantar un backend local apuntando al clon y correr la suite en modo FULL:
#   (backend con DATABASE=calc_clone en dbConfig o vía copia)
MODE=full API_BASE=http://localhost:3008/api DB_NAME=calc_clone bash test/suite_validacion_caminoB.sh
# -> debe dar 23 PASS / 0 FAIL
```

### 2. Aplicar en prod — ORDEN EN 3 FASES (elimina la ventana de precios incorrectos)
Clave: el de-dup deja `campus.categoria_coleg` con un valor canónico (una sola categoría por nombre),
que ya NO sirve al código viejo. Por eso el de-dup debe ir DESPUÉS del deploy del código nuevo.

```
# FASE 1 (BD): solo agregar columna + poblar. Aún NO de-dup.
#   Antes del de-dup, cada nivel apunta a su fila de campus con su categoría -> el código
#   viejo sigue devolviendo la categoría correcta por nivel. Cero cambio de comportamiento.
mysql -h <EC2> -u <user> -p<pass> database_calculadora_prueba < migrations/2026-11-19_campus_nivel_categoria.sql

# FASE 2 (CÓDIGO): deploy de backend+admin -> push a fase-3 (CI despliega el worker).
#   El código nuevo ya lee la categoría de campus_nivel (la columna ya existe y está poblada).

# FASE 3 (BD): de-dup + cierre de 3 campus. Ya con el código nuevo en vivo.
#   El código nuevo usa la liga -> el valor canónico/stale de campus.categoria_coleg es irrelevante.
mysql -h <EC2> -u <user> -p<pass> database_calculadora_prueba < migrations/2026-11-19_campus_dedup.sql
mysql -h <EC2> -u <user> -p<pass> database_calculadora_prueba <<'SQL'
SET FOREIGN_KEY_CHECKS=0; START TRANSACTION;
DELETE cn FROM campus_nivel cn JOIN campus c ON c.id=cn.campus_id WHERE c.nombre IN ('Tijuana Rio','Satélite','Las Américas');
DELETE FROM seguro_nivel_campus WHERE id_campus IN (SELECT id FROM campus WHERE nombre IN ('Tijuana Rio','Satélite','Las Américas'));
DELETE FROM campus WHERE nombre IN ('Tijuana Rio','Satélite','Las Américas');
COMMIT; SET FOREIGN_KEY_CHECKS=1;
SQL
```
Con este orden NO hay ventana donde el alumno vea una categoría/precio incorrecto.
Aun así, hacerlo en **horario de bajo tráfico**. Tras el deploy, los admins deben **refrescar** la
página del admin (hard refresh) para cargar el JS nuevo (editar/eliminar ahora mandan `nivel_id`).

### 3. Verificar en PROD (solo lectura — no modifica nada)
```
API_BASE=https://api-tecmi.blnolabs.dev/api \
  DB_HOST=<EC2> DB_USER=<user> DB_PASS=<pass> DB_NAME=database_calculadora_prueba \
  MODE=readonly \
  bash test/suite_validacion_caminoB.sh
# -> bloques A (integridad), B (regresión) y D (vs sheets) deben pasar. C se omite (no se toca prod).
```
Además: una cotización real en `universidad.tecmilenio.mx/calculadora` (campus + plan de pagos).

### Rollback
Si algo falla: restaurar `rollback_caminoB.sql` (campus, campus_nivel, seguro_nivel_campus) en prod
y revertir el deploy del backend (revert del commit en `fase-3`).

## Notas
- El cierre de campus se hace **por nombre** (no por id) para que aplique igual en clon y prod,
  cuyos ids pueden diferir.
- La suite es idempotente y auto-revierte en modo full; en readonly no escribe nada.
- Credenciales de prod: NO se guardan en el repo; pasarlas por variable de entorno al correr.
