# Categoría de campus por nivel (Camino B) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la categoría de colegiatura de un campus sea editable e independiente por nivel (editar un nivel no afecta a otros).

**Architecture:** La categoría se mueve de `campus.categoria_coleg` (compartida por fila) a `campus_nivel.categoria_coleg` (por liga nivel-campus). Se colapsan las filas de campus duplicadas a una canónica por nombre. Backend lee/escribe la categoría en la liga; el front no cambia.

**Tech Stack:** Node/Express, mysql2 (callbacks), MySQL 8.0, admin y front en JS vanilla.

**Spec:** `docs/diseno-campus-categoria-por-nivel.md`

## Global Constraints
- **Todo en LOCAL** (`database_calculadora_prueba` @ 127.0.0.1, user root). No tocar prod en este plan.
- Alcance SOLO campus: no tocar seguros, costos, periodos, fechas.
- El proyecto no tiene runner de pruebas formal → la verificación de cada tarea es por **query SQL** y **llamada a la API** contra la BD local, y debe fallar antes del cambio y pasar después.
- Mantener `campus.categoria_coleg` poblada (compatibilidad hacia atrás).
- Respaldar las tablas tocadas antes de cada migración (`mysqldump` a /tmp).

## Review Focus
- **Editar la categoría de un campus en un nivel cambia OTRO nivel que comparte el campus** → debe quedar aislado (Task 4 lo prueba explícitamente).
- **Cotización de un nivel cuyo campus se de-duplicó deja de resolver costo** → el costo depende de la categoría (ahora de la liga); Task 6 cotiza un nivel afectado.
- **Excepción VIVE por campus (`seguro_nivel_campus`) queda huérfana tras el de-dup** (apunta a `campus.id` que se borra) → Task 2 re-apunta a la canónica y verifica 0 huérfanos.
- **Liga duplicada (campus_id,nivel_id) repetida** (Cuernavaca/8) se vuelve 2 opciones iguales en el dropdown → Task 2 colapsa ligas duplicadas.
- **Crear un campus nuevo desde el admin no guarda categoría** (quedaría NULL en la liga) → Task 4 cubre create además de update.

---

### Task 1: Migración — columna `categoria_coleg` en `campus_nivel` + poblado

**Files:**
- Create: `migrations/2026-11-19_campus_nivel_categoria.sql`
- Test: query SQL de verificación (inline, abajo)

**Interfaces:**
- Produces: columna `campus_nivel.categoria_coleg` poblada con la categoría de la fila de campus de cada liga.

- [ ] **Step 1: Verificación que FALLA** — `SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='database_calculadora_prueba' AND table_name='campus_nivel' AND column_name='categoria_coleg';` → Esperado hoy: **0**.
- [ ] **Step 2: Respaldo** — `mysqldump ... campus campus_nivel seguro_nivel_campus > /tmp/bkp_caminoB_<ts>.sql`.
- [ ] **Step 3: Migración** — en el `.sql`:
  - `ALTER TABLE campus_nivel ADD COLUMN categoria_coleg VARCHAR(255) NULL;`
  - `UPDATE campus_nivel cn JOIN campus c ON c.id=cn.campus_id SET cn.categoria_coleg=c.categoria_coleg;`
- [ ] **Step 4: Verificar que PASA** — columna existe (COUNT=1) **y** 0 ligas sin categoría: `SELECT COUNT(*) FROM campus_nivel WHERE categoria_coleg IS NULL;` → **0**. Y paridad: `SELECT COUNT(*) FROM campus_nivel cn JOIN campus c ON c.id=cn.campus_id WHERE cn.categoria_coleg<>c.categoria_coleg;` → **0**.
- [ ] **Step 5: Commit** (`git add migrations/... ; git commit -m "feat(campus): columna categoria_coleg en campus_nivel + poblado"`).

---

### Task 2: De-dup de campus a una fila canónica por nombre

**Files:**
- Create: `migrations/2026-11-19_campus_dedup.sql`
- Test: queries de integridad (inline)

**Interfaces:**
- Consumes: `campus_nivel.categoria_coleg` ya poblada (Task 1) — la categoría ya está a salvo en la liga antes de mover nada.
- Produces: `campus` con nombres únicos; `campus_nivel` y `seguro_nivel_campus` re-apuntados a la canónica (id menor por nombre); ligas duplicadas (campus_id,nivel_id) colapsadas a una.

- [ ] **Step 1: Verificación que FALLA** — `SELECT COUNT(*)-COUNT(DISTINCT nombre) FROM campus;` → hoy **>0** (hay nombres repetidos).
- [ ] **Step 2: Respaldo** (reusar/crear `/tmp/bkp_caminoB_dedup_<ts>.sql` de campus, campus_nivel, seguro_nivel_campus).
- [ ] **Step 3: Migración** (orden exacto, con `SET FOREIGN_KEY_CHECKS=0` + transacción):
  1. Tabla temporal de mapeo nombre→canónico: `canon(id)=MIN(id) GROUP BY nombre`.
  2. `UPDATE campus_nivel cn JOIN canon ... SET cn.campus_id=canon.id` (re-apunta a canónica).
  3. `UPDATE seguro_nivel_campus snc JOIN canon ... SET snc.id_campus=canon.id`.
  4. Colapsar ligas duplicadas: conservar el `MIN(id)` por (campus_id,nivel_id), borrar el resto de `campus_nivel`.
  5. Colapsar duplicados en `seguro_nivel_campus` por (id_seguro,id_nivel,id_campus) si surgieran.
  6. Borrar de `campus` las filas cuyo `id` ya no es canónico y ya no está referenciado.
  7. `SET campus.categoria_coleg` = la categoría de la liga más común de esa canónica (compatibilidad; valor informativo).
- [ ] **Step 4: Verificar que PASA:**
  - `SELECT COUNT(*)-COUNT(DISTINCT nombre) FROM campus;` → **0**.
  - Huérfanos: `campus_nivel`→`campus` = 0; `seguro_nivel_campus`→`campus` = 0.
  - Ligas duplicadas (campus_id,nivel_id) = 0.
  - VIVE intacto: `seguro_nivel_campus` sigue con 4 filas de Aguascalientes VIVE resolviendo `$2600`.
  - Las categorías por nivel NO cambiaron: comparar contra respaldo (ningún `(nombre,nivel)` cambió de categoría).
- [ ] **Step 5: Commit**.

---

### Task 3: Backend — el dropdown lee la categoría de la liga

**Files:**
- Modify: `backend/models/campus.js` (`getCampusesByNivel`, ~líneas 7-15)

**Interfaces:**
- Produces: `getCampusesByNivel(nivelId)` devuelve filas `{ id, nombre, categoria_coleg }` donde `categoria_coleg` viene de `campus_nivel`.

- [ ] **Step 1: Test que FALLA** — con la BD migrada, poner (en una liga de prueba) una categoría en `campus_nivel` distinta a la de `campus`, llamar `GET /api/campus/nivel/:id` y esperar la de la liga. Hoy devuelve la de `campus` → **FALLA**.
- [ ] **Step 2: Implementar** — cambiar el SELECT a `SELECT campus.id, campus.nombre, campus_nivel.categoria_coleg FROM campus JOIN campus_nivel ON campus.id=campus_nivel.campus_id WHERE campus_nivel.nivel_id = ?`.
- [ ] **Step 3: Verificar que PASA** — el endpoint devuelve la categoría de la liga. Y dos niveles que comparten un campus pueden devolver categorías distintas.
- [ ] **Step 4: Commit**.

---

### Task 4: Backend — crear/editar guardan la categoría en la liga

**Files:**
- Modify: `backend/models/campusNivel.js` (nueva función)
- Modify: `backend/controllers/campusController.js` (`updateCampusWithNivel`, `createCampusWithNivel`)
- Test: `test/campus_categoria_por_nivel.sh` (curl contra API local)

**Interfaces:**
- Consumes: `campusNivelModel` existente.
- Produces: `updateCampusNivelCategoria(campus_id, nivel_id, categoria_coleg, cb)` que hace `UPDATE campus_nivel SET categoria_coleg=? WHERE campus_id=? AND nivel_id=?`. `createCampusNivel` acepta `categoria_coleg`.

- [ ] **Step 1: Test que FALLA (el clave)** — script: tomar un campus compartido (ej. Chihuahua) ligado a nivel A y nivel B; vía `PUT /api/campus/:id` con `{categoria_coleg:'ZZ', nivel_id:A}` cambiar solo A; aseverar que el `GET .../nivel/B` **sigue igual** y `GET .../nivel/A` cambió a 'ZZ'. Hoy (edita la fila campus) cambia AMBOS → **FALLA**.
- [ ] **Step 2: Implementar** — `updateCampusWithNivel`: cuando venga `categoria_coleg`, enrutarla a `updateCampusNivelCategoria(id /*campus_id*/, nivel_id, categoria_coleg)` en vez de a `campusModel.updateCampus`. `createCampusWithNivel`: tras `createCampusNivel`, guardar la categoría en la liga (o pasarla en el insert). Requiere que el request traiga `nivel_id` (el admin ya lo manda).
- [ ] **Step 3: Verificar que PASA** — el script del Step 1 pasa: A cambió, B intacto.
- [ ] **Step 4: Commit**.

---

### Task 5: Admin — edición/creación por nivel

**Files:**
- Modify: `admin/js/control/controlCampus.js`

**Interfaces:**
- Consumes: endpoints de Task 3/4.

- [ ] **Step 1: Revisar** que `editCampus`/alta mandan `categoria_coleg` + `nivel_id` (level) al endpoint correcto; el listado ya pinta la categoría del endpoint (ya por nivel).
- [ ] **Step 2: Ajustar** lo mínimo para que la edición de categoría use la ruta de Task 4 y el alta incluya `nivel_id`.
- [ ] **Step 3: Verificar** en el navegador (admin local): editar la categoría de un campus en un nivel y ver en el listado de OTRO nivel con el mismo campus que no cambió.
- [ ] **Step 4: Commit**.

---

### Task 6: Validación end-to-end en local

**Files:** ninguno nuevo (script/manual)

- [ ] **Step 1:** Levantar backend (3008) + admin (5501) + front (5500) apuntando a la BD local migrada.
- [ ] **Step 2: Aislamiento** — cambiar categoría de "Chihuahua" en **Preparatoria Semestral** desde el admin; confirmar que en **Ejecutivo** (comparte Chihuahua) la categoría NO cambió.
- [ ] **Step 3: Cotización** — hacer una cotización de un nivel afectado y confirmar que **resuelve costo** (la clave usa la categoría de la liga, no truena).
- [ ] **Step 4: Integridad final** — 0 huérfanos; campus con nombres únicos; VIVE Aguascalientes sigue $2600.
- [ ] **Step 5: Commit** (doc de validación con resultados).
