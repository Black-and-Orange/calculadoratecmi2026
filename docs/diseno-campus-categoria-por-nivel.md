# Diseño — Categoría de campus editable por nivel (Camino B)

Fecha: 2026-11-19 · Entorno de trabajo: **LOCAL** (`database_calculadora_prueba` @ 127.0.0.1)

## Objetivo / por qué
Que la **categoría de colegiatura** de un campus sea **independiente por nivel**: si se
edita la categoría de un campus en un nivel, **NO** debe cambiar en los demás niveles.
Hoy la categoría vive en la fila de `campus` (compartida entre niveles), así que editar
una afecta a todos los que comparten esa fila. Esto ya causó cotizaciones rotas en prod
(ej. Guadalupe→C+ afectó a Prepa Tetramestral, que no tiene costo C+).

## Alcance
- **SOLO campus.** No se tocan seguros, costos, periodos ni fechas.
- Todo se desarrolla y valida en **local** primero; el pase a prod es un paso posterior aparte.

## No-objetivos
- No cambiar el modelo de costos (sigue por categoría A/B/C/CC/…).
- No tocar el front del alumno (ver nota de compatibilidad).
- No validar todavía que la categoría elegida tenga costo (posible mejora futura: avisar en el admin).

## Dónde vive hoy la categoría (estado actual)
- `campus(id, nombre, categoria_coleg)` — la categoría está aquí (por fila, compartida).
- `campus_nivel(id, campus_id, nivel_id)` — solo liga, SIN categoría.
- Lectura del dropdown: `campusModel.getCampusesByNivel` hace `SELECT campus.categoria_coleg ... JOIN campus_nivel WHERE nivel_id=?`.
- Edición admin: `updateCampusWithNivel` actualiza `campus.categoria_coleg` por `campus.id` → **afecta a todos los niveles ligados a esa fila**.
- Front `step1.js`: lee `categoria_coleg` del `<option>`, que se llena con `item.categoria_coleg` de ese mismo endpoint.

## Enfoque elegido: Opción 2 (categoría en `campus_nivel` + de-dup)
Mover la categoría a la liga y colapsar los campus duplicados para que cada campus
aparezca **una sola vez** y se edite por nivel.

Alternativa descartada — Opción 1 (mínima): solo agregar la categoría a `campus_nivel`
sin de-dup. Logra la independencia, pero el admin seguiría mostrando campus repetidos
(Chihuahua ×3, Aguascalientes ×8), que es parte del desorden que el cliente quiere evitar.

## Cambios

### 1. Base de datos (migración, en local)
- `ALTER TABLE campus_nivel ADD COLUMN categoria_coleg VARCHAR(255) NULL;`
- Poblar: por cada liga, copiar la categoría de su fila de campus actual
  (`UPDATE campus_nivel cn JOIN campus c ON c.id=cn.campus_id SET cn.categoria_coleg=c.categoria_coleg;`).
  Así se preserva el comportamiento actual como punto de partida.
- **De-dup** de campus: para cada `nombre` repetido, conservar una fila "canónica",
  re-apuntar `campus_nivel.campus_id` y `seguro_nivel_campus.id_campus` a la canónica,
  y borrar las filas duplicadas sobrantes. (La categoría ya quedó a salvo en `campus_nivel`.)
- Dejar `campus.categoria_coleg` poblada (con la de la fila canónica) por compatibilidad.
- `NOT NULL` + default razonable en `campus_nivel.categoria_coleg` al final.

### 2. Backend (3 toques)
- `models/campus.js getCampusesByNivel`: devolver `campus_nivel.categoria_coleg` (alias `categoria_coleg`).
- `controllers/campusController.js updateCampusWithNivel`: enviar la categoría a
  `campus_nivel` para ese `(campus_id, nivel_id)`, NO a la fila de campus.
- `createCampusWithNivel`: al ligar, guardar la categoría en la liga.
- (Modelo nuevo/ajuste en `campusNivel.js` para update/insert de la categoría por liga.)

### 3. Admin (`admin/js/control/controlCampus.js`)
- Ya trabaja por nivel y ya manda `nivel_id` (`level`). Ajuste menor para que la edición
  de categoría apunte a la liga. El listado ya muestra la categoría del endpoint (que ya
  será por nivel) → se ve correcto sin más cambios.

### Compatibilidad (cero riesgo para el alumno)
- El front **no se toca**: sigue leyendo `categoria_coleg` del endpoint, que ahora trae el
  valor por nivel. → no se re-publica HubSpot.
- Orden del pase a prod (después, aparte): migración primero, deploy después; con
  `campus.categoria_coleg` aún poblada, el código viejo sigue sirviendo en el intermedio.

## Qué queda al constructor
- Nombre exacto del modelo/función para update de categoría en `campus_nivel`.
- Regla para elegir la fila canónica en el de-dup (p. ej. el `id` menor por nombre).
- Pruebas: editar categoría de un campus en un nivel y verificar que otro nivel con el
  mismo campus NO cambió; cotización de un nivel afectado sigue resolviendo costo.

## Validación (en local)
- Migración sobre una copia; 0 huérfanos FK; conteos coherentes.
- Prueba funcional: cambiar categoría de "Chihuahua" en Prepa Semestral y confirmar que
  en Ejecutivo (que comparte Chihuahua) NO cambió.
- Levantar backend+admin local y editar desde el admin.
