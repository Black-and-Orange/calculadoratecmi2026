# Handoff — Flujo "Me interesa estudiar en Tecmilenio" (Calculadora Tecmilenio)

> Documento de traspaso para continuar el proyecto en una nueva conversación.
> Última actualización: 2026-06-30. Rama: `feat/rediseno-paso1-alumno`.

---

## 1. Objetivo del proyecto

**Calculadora Tecmilenio** (cliente de Black-n-Orange) es una calculadora de
cotizaciones de colegiaturas/becas. En **Fase 3** se habilitó el uso directo de
dos perfiles desde la pantalla inicial:

- **Alumno** ("Soy alumno de Tecmilenio", HU1–41) → identifica por matrícula.
- **Prospecto** ("Me interesa estudiar en Tecmilenio", HU42–80) → identifica por
  datos personales (nombre, apellidos, fecha nac., teléfono, correo).

**Objetivo de esta tanda de trabajo:** implementar el flujo **"Me interesa
estudiar en Tecmilenio"** (prospecto) según un PDF de diseño, **reutilizando
exactamente la arquitectura del rediseño del alumno** (paso 1 combinado de 4
pasos) — sin romper el flujo alumno. Luego se sumaron ajustes pedidos por el
cliente (promedio, colegiatura, hoja de resultados por perfil).

---

## 2. Contexto y antecedentes (trabajo previo)

Antes de esta tanda ya existía (en esta rama u otras de Fase 3):

- **Rediseño del paso 1 del alumno:** wizard de 4 pasos donde el **paso 1 combina
  datos personales + nivel de estudios** en una sola pantalla tipo grid. Se
  gobierna con la clase CSS `.flujo-alumno` (en `#wizard-row`) + lógica en
  `main.js`. Las etiquetas duales `.lbl-def`/`.lbl-alu` y la barra de 4 pasos
  (`.steps-alumno`) son parte de ese rediseño.
- **Rediseño del paso 3 (seguros):** `step3.js` renderiza por radios tres
  coberturas — **VIVE**, **Seguro contra accidente** y **Cobertura de
  Colegiatura** — con sus reglas de negocio. (Ojo: ver deuda de tests, §7.)
- **Rediseño de la hoja de resultados** (`resultado.html`) a estilo documento:
  hero + "Mi información ingresada" + tabla itemizada de colegiatura + planes
  (contado/financiamiento) + vigencia + condiciones; con modal "Nueva cotización".
- **Hallazgo de seguridad pendiente:** el `.env` de la BD es recuperable en el
  historial de `main` → rotar credenciales + limpiar historial (fuera de alcance
  de esta tanda, pero importante).

---

## 3. Decisiones tomadas (esta tanda)

1. **Reutilización, no duplicación.** El PDF de "me interesa" es el **mismo**
   rediseño de 4 pasos que ya tenía el alumno. En vez de duplicar, se **generalizó
   el mecanismo** para que ambos perfiles compartan el paso 1 combinado:
   - `main.js`: `moveStep`, `btnNextStep` y el gate de campus pasan de
     "solo alumno" a **perfil-agnósticos**. Como el alumno ya tomaba esa rama, su
     comportamiento queda **byte-idéntico**; lo nuevo solo se activa para prospecto.
   - `wizard.css`: se añadió `#datos-prospecto` a las reglas grid (la clase
     `.flujo-alumno` es histórica; hoy la usan ambos perfiles).
   - Los **campos dinámicos por nivel** (`step1.js`) ya eran perfil-agnósticos →
     funcionan para prospecto sin tocar nada.

2. **Promedio académico en el paso 2 del prospecto** (confirmado por el cliente,
   jcordova): el PDF lo muestra visible. Se hizo **visible y obligatorio solo en
   prospecto**; se dejó de forzar a 100 y las becas vuelven a filtrarse por el
   promedio real. El alumno (`#step-2-students`) no lo lleva.

3. **Cobertura de Colegiatura bloqueada como VIVE:** cuando es obligatoria por
   política (presenciales de prepa/profesional semestral) queda pre-marcada "Sí" y
   **deshabilitada**, igual que VIVE. Aplica a **ambos perfiles** (la
   obligatoriedad depende del nivel/formato, no del perfil). Alinea con HU25/HU63.

4. **Hoja de resultados por perfil:**
   - La **matrícula** solo se muestra en alumno.
   - La sección **"Beneficios de estudiar en Tecmilenio"** (4 tarjetas) solo se
     muestra en prospecto, **al inicio del documento** (entra al PDF descargable).

5. **No tocar el motor de cálculo ni la BD** sin validar con el cliente (regla de
   Fase 3). El promedio se cambió **porque el cliente lo validó explícitamente**.

---

## 4. Estructura actual del proyecto

Todo es **vanilla JS** (sin framework de build). Tres carpetas principales:

```
frontend/            # Calculadora pública (wizard multi-paso) + hoja de resultados
  index.html         # Wizard: paso 0 (perfil) + pasos 1–4
  resultado.html     # Documento de cotización (estilo documento)
  css/
    wizard.css       # Rediseño de 4 pasos (.flujo-alumno, grid, barra de pasos)
    resultado-doc.css, resultado-dashboard.css, styles.css
  js/
    main.js                      # Navegación del wizard (perfil-agnóstica)
    apiConfig.js                 # base URL API: localhost→:3008, else→Worker staging
    cargaDatos/
      step1.js                   # Nivel de estudios + campos dinámicos + costo (perfil-agnóstico)
      step2.js                   # Apoyos PROSPECTO (promedio/beca/préstamo)
      step2-students.js          # Apoyos ALUMNO (beca/préstamo directo, sin promedio)
      step3.js                   # Seguros (VIVE/accidente/colegiatura) por radios
      apoyos-hu.js               # Reglas de apoyos/préstamos (HU18-27/56-65)
      resultados.js              # Dashboard del resultado (montos, vigencia)
      resultado-doc.js           # "Mi info", tabla itemizada, beneficios, matrícula por perfil
    nueva-cotizacion.js, cotizacion.js, descargarPDF.js, utils/shared-utils.js
admin/               # Panel de catálogos (login + CRUD vía API)
backend/             # Node + Express + MySQL (mysql2), MVC. Entry local: index.js
                     # En Cloudflare: worker.js. CORS con allowedOrigins.
qa-evidencia/        # Suite Playwright (corre contra staging por defecto)
  helpers/wizard.js  # Helpers compartidos (seleccionarPerfil, llenarDatos*, completarNivel)
  tests/             # recorrido-alumno, recorrido-prospecto, calculos, resultado-acciones
  datos/             # reglas.json (reglas de negocio con archivo:línea), matriz-hu.json
docs/                # Documentación (este handoff)
```

### Arquitectura clave del wizard (cómo funciona)

- **Paso 0** (`#step-0`): botones de perfil (`data-perfil="alumno|prospecto"`).
- **Paso 1 combinado** (`[#step-dp, #step-1]`): datos personales + nivel en una
  pantalla grid bajo el encabezado "Ayúdanos a identificarte". Los datos por
  perfil viven en `#datos-alumno` / `#datos-prospecto` (se togglean por perfil).
- **Paso 2** (apoyos): `#step-2` (prospecto, con promedio) ó `#step-2-students`
  (alumno). `main.js` elige la variante según perfil.
- **Paso 3** (`#step-3`): seguros dinámicos (`step3.js`).
- **Paso 4** (`#step-4`): legales (términos + privacidad obligatorios; contacto
  por asesor opcional **pre-marcado**, solo prospecto).
- Navegación: `main.js` `moveStep()` arma `[[stepDP, step1], step2, step3, step4]`
  y `btnNextStep` mapea el paso visible 1 a "validar datos → validar nivel".

### Mapeo niveles del PDF → catálogo del backend (`/api/nivel`)

| PDF | Catálogo (id) | Campos dinámicos (step1.js) |
|---|---|---|
| Preparatoria | Preparatoria Tetramestral (3) / Semestral (1) | Materias |
| Profesional MAPS | Profesional Semestral MAPS (4) | Certificados + Semanas de desarrollo + Certificado de idioma |
| Profesional Plan 2018 | Profesional Semestral (plan 2018) (2) | Créditos |
| Ejecutivo Bimestral MAPS | Ejecutivo Bimestral MAPS (13) | Formato + periodos múltiples (Certificados + Semanas SEDI por periodo) |
| Ejecutivo | Ejecutivo (6) | Formato + Créditos |

### Reglas de negocio (NO improvisar — ver `qa-evidencia/datos/reglas.json`)

- `beca% + préstamo% ≤ 60` (`TOPE_BECA_PRESTAMO`).
- Profesional (niveles 2 y 4) con beca: préstamo topado a **20%**.
- Prepa (niveles 1 y 3): **sin préstamo** (solo profesional/posgrado lo tiene).
- **VIVE** forzada "Sí" + bloqueada en niveles 1–4; no se muestra en 6–12.
- **Colegiatura** forzada "Sí" + **bloqueada** en presenciales de prepa/prof
  (niveles 1–4 en `step3.js: COLEGIATURA_NIVELES`).
- Los seguros no reducen el costo base; se suman al total mostrado.

---

## 5. Archivos modificados (4 commits en `feat/rediseno-paso1-alumno`)

| Commit | Tipo | Archivos |
|---|---|---|
| `d168139` | feat(prospecto): 4 pasos + promedio | `main.js`, `wizard.css`, `index.html`, `apoyos-hu.js` |
| `eba4783` | feat(seguros): colegiatura bloqueada | `step3.js` |
| `504d516` | feat(resultado): hoja por perfil | `resultado.html`, `resultado-doc.css`, `resultado-doc.js` |
| `87f91f0` | test(qa): 4 pasos + promedio | `helpers/wizard.js`, `recorrido-alumno.spec.js`, `recorrido-prospecto.spec.js`, `calculos.spec.js`, `resultado-acciones.spec.js` |

**Detalle de cambios por área:**

- **`main.js`** — `moveStep`/`btnNextStep`/`syncCampusGate` perfil-agnósticos
  (ambos perfiles usan el paso 1 combinado de 4 pasos).
- **`wizard.css`** — `#datos-prospecto` añadido a las reglas grid + override
  `.hidden` para que la variante de datos del otro perfil no se filtre.
- **`index.html`** — paso 4: contacto por asesor pre-marcado; paso 2 (prospecto):
  campo **Promedio** movido al inicio, visible, label "Promedio académico actual
  (del 1 al 100)".
- **`apoyos-hu.js`** — `initProspecto`: ya no fuerza promedio=100; lo agrega al
  gate del botón (`promedioOk`, 1–100).
- **`step3.js`** — `renderColegiatura`: `disabled` pasa de `false` a
  `preseleccionada`.
- **`resultado-doc.js`** — matrícula solo si `perfil === 'alumno'`; nueva
  `cablearBeneficios()` togglea `#cotiz-beneficios.hidden` según perfil.
- **`resultado.html`** — sección de beneficios (4 tarjetas) al inicio de
  `.cotiz-sheet`, oculta por defecto.
- **`resultado-doc.css`** — estilos `.cotiz-beneficio-*`.
- **Tests** — helpers `llenarDatos*` ya no pulsan `#step-dp-next`; validaciones
  `[HU4]`/`[HU42]` vía `completarNivel`+`#step-1-next`; back-nav `[HU17]`/`[HU55]`
  va del paso 1 a `#step-0`; promedio (100) en la parte de apoyos;
  `completarSeguros` (solo en recorrido-prospecto) responde el seguro de accidente
  por radio con reintento.

> Verificado en navegador (ambos perfiles) y en local con Playwright:
> `recorrido-prospecto.spec.js` pasa **6/6 individualmente**.

---

## 6. Cómo correr en local

```bash
# Backend (necesita backend/.env con creds de la BD de pruebas — NO está en el repo)
cd backend && npm install && node index.js     # http://localhost:3008

# Frontend — OJO: debe servirse en un puerto permitido por el CORS del backend:
#   5500, 5501, 3000 o 3002  (5599 NO está permitido → "Failed to fetch")
cd frontend && python3 -m http.server 5501      # http://localhost:5501

# apiConfig.js auto-detecta: localhost → :3008, otro host → Worker de staging.
```

**Correr los tests en local** (frontend en :5501 + backend en :3008):

```bash
cd qa-evidencia && npm install && npx playwright install chromium
BASE_URL=http://localhost:5501 npx playwright test recorrido-prospecto.spec.js --project=desktop
# (por defecto BASE_URL apunta a staging: https://calculadora-tecmi.pages.dev)
```

---

## 7. Pendientes

1. **Push / merge.** Los 4 commits están **solo en local** (rama
   `feat/rediseno-paso1-alumno`). Esta rama **no auto-despliega**; solo `fase-3`
   dispara el deploy a Cloudflare (Pages + Worker). Decidir: push de la rama +
   PR, o llevar a `fase-3`.
2. **Deuda de tests (seguros).** Los helpers `completarSeguros` /
   `completarSegurosMinimo` se escribieron para la UI **vieja por selects** y NO
   manejan la UI **por radios** del rediseño `step3.js` (no responden el seguro de
   accidente → `#step-3-next` queda disabled). **Arreglado solo en
   `recorrido-prospecto.spec.js`.** Falta el mismo arreglo en
   **`recorrido-alumno`, `calculos` y `resultado-acciones`**. Es deuda
   pre-existente del rediseño de seguros, no de esta tanda.
3. **`[HU55]` flaky.** El test de back-nav pasa en aislamiento pero es sensible a
   una *race* de regeneración de seguros al re-entrar a `#step-3` en la corrida
   completa. Robustecer tiempos si molesta.
4. **Copy del paso 2 (prospecto).** El texto "Recuerda… tu prospecto debió…" es de
   asesor, no del aprendedor (self-service). Confirmar con cliente si se reescribe.
5. **Notas `PENDIENTE-FASE3`** (de antes, en `reglas.json`): cobro de 7–8 materias
   como 6; posible doble descuento en nivel 13; pesos hardcodeados en nivel 4 MAPS.
   Requieren confirmación del cliente.
6. **Seguridad:** rotar credenciales de BD + limpiar `.env` del historial de `main`.

---

## 8. Convenciones de código y reglas de trabajo

- **Ramas:** nunca tocar `main` (producción). Trabajar en `fase-3` o ramas
  `feat/…` que salgan de `fase-3`.
- **Commits:** mensajes en **español**, conventional commits con scope
  (`feat(prospecto): …`, `test(qa): …`). Terminar con
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **No reintroducir** `.env` ni credenciales al repo.
- **No tocar** el motor de cálculo ni la estructura de la BD sin validación
  explícita del cliente.
- **Probar contra staging / BD de pruebas**, no producción.
- **Vanilla JS**, módulos ES en `cargaDatos/*`. Sin framework de build.
- **Reutilizar antes que duplicar:** el flujo prospecto y alumno comparten el
  mismo wizard; el contenido por perfil se resuelve con toggles
  (`#datos-alumno`/`#datos-prospecto`, variante de apoyos, contacto).
- **Tooling local:** no hay ESLint ni TypeScript; validar con `node --check`.
- `.claude/` está git-ignored (config local de Claude Code).

---

## 9. Próximos pasos recomendados

1. **Revisar y subir el trabajo:** push de `feat/rediseno-paso1-alumno` + PR hacia
   `fase-3` (o merge directo según el flujo del equipo). Al llegar a `fase-3` se
   despliega a staging y ahí corre la suite QA real.
2. **Cerrar la deuda de tests de seguros:** aplicar el mismo arreglo de
   `completarSeguros` (responder el radio de accidente "propio" con reintento) en
   `recorrido-alumno`, `calculos` y `resultado-acciones`, y volver a correr la
   suite completa en local.
3. **Validar con el cliente** el copy del paso 2 ("tu prospecto") y las notas
   `PENDIENTE-FASE3`.
4. **Regresión visual** de ambos perfiles (alumno y prospecto) en la hoja de
   resultados, incluyendo el **PDF descargable** (los beneficios entran al PDF en
   prospecto).
5. Retomar el **pendiente de seguridad** (rotación de credenciales + limpieza de
   historial).

---

## 10. Inconsistencias PDF ↔ implementación (resumen)

- **Promedio:** el PDF lo muestra visible → **implementado** (visible + obligatorio
  en prospecto; el cliente lo validó).
- **Etiquetas de nivel:** el PDF usa "Profesional MAPS / Profesional Plan 2018 /
  Ejecutivo"; el catálogo del backend usa nombres equivalentes ("Profesional
  Semestral MAPS", "Profesional Semestral (plan 2018)", "Ejecutivo"). El
  **comportamiento de campos coincide**; los nombres se administran en el catálogo.
- **Orden de campos del paso 1:** la implementación pone **nivel primero**
  (campus/programa/periodo dependen del nivel); algunas capturas del PDF muestran
  otro orden. Es una decisión funcional del rediseño compartido.
- **Copy de asesor en paso 2** ("tu prospecto") — pendiente de confirmar (§7.4).
