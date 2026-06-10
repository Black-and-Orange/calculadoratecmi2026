# Paquete de Evidencia QA — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generar `qa-evidencia/EVIDENCIA-QA.pdf` + reporte HTML de Playwright con evidencia (screenshots y aserciones) de las HUs de Sprints 1–4 ejecutadas contra staging.

**Architecture:** Suite Playwright independiente en `qa-evidencia/` (no toca frontend/backend). Helpers compartidos navegan el wizard; specs de recorrido capturan screenshots por paso; specs de cálculo validan consistencia aritmética del resultado. Un generador compila resultados JSON + matriz HU → HTML → PDF vía Chromium.

**Tech Stack:** Node 18+, @playwright/test (Chromium), staging `https://calculadora-tecmi.pages.dev`.

**Spec:** `docs/superpowers/specs/2026-06-09-evidencia-qa-design.md`

**Hechos verificados del código (no re-derivar):**
- La matrícula solo se valida por formato en frontend: `/^[A-Za-z0-9]{8}$/` (`frontend/js/main.js:329`). Usar `QA000001`.
- Perfil: `button[data-perfil="alumno"]` / `button[data-perfil="prospecto"]` en `#step-0`.
- Pasos del wizard (`frontend/index.html`): `#step-0` → `#step-dp` (datos) → `#step-1` (nivel, selects encadenados) → `#step-2` (apoyos prospecto) o `#step-2-students` (apoyos alumno) → `#step-3` (seguros) → `#step-4` (T&C: `#check-terminos`, `#check-privacidad`) → submit `#step-4-next` → `resultado.html`.
- Botones siguiente: `#step-dp-next`, `#step-1-next`, `#step-2-next`, `#step-2-students-next`, `#step-3-next`.
- Resultado (`frontend/resultado.html`): `#colegiatura`, `#apoyoFinanciamiento`, `#totalContado`, `#primerPago`, `#mensualidades`, `#totalFinanciado`, `#beca`.
- Selects de nivel: `#select-grade`, `#select-plan`, `#select-campus`, `#select-period`, `#select-subjects` (+ condicionales `#select-formato`, `#select-certificado`, `#select-semanas`, `#select-ingles`). Se pueblan async desde la API.
- Préstamo prospecto: `#txt-prestamo-percentage`; alumno: `#txt-prestamo-percentage-students`. Fix del tope 20% en profesional niveles 2/4 con beca: commit `a054003`.

**Reglas de degradación (aplican a TODOS los tasks):** si un flujo no se puede automatizar, el spec correspondiente se marca con `test.fixme()` y una anotación del motivo — aparece en el reporte como pendiente. Nunca borrar el caso ni ajustar una aserción para que pase.

---

## File Structure

```
qa-evidencia/
├── package.json
├── playwright.config.js
├── .gitignore                  # node_modules, resultados/, screenshots/, reporte-html/, *.pdf
├── helpers/
│   └── wizard.js               # navegación, captura, parseo de montos
├── datos/
│   ├── hu-backlog.json         # Task 0: HUs desde ClickUp (o fallback)
│   ├── reglas.json             # Task 3: reglas de cálculo extraídas del backend
│   └── matriz-hu.json          # Task 3: HU → caso de prueba → tipo evidencia
├── tests/
│   ├── recorrido-alumno.spec.js
│   ├── recorrido-prospecto.spec.js
│   ├── calculos.spec.js
│   └── resultado-acciones.spec.js
├── genera-documento.js         # Task 9: resultados + matriz + screenshots → PDF
├── screenshots/                # salida (gitignored)
├── resultados/                 # salida JSON (gitignored)
└── reporte-html/               # salida Playwright (gitignored)
```

---

### Task 0: Exportar backlog de HUs (hacer AHORA, en sesión interactiva)

Los conectores de ClickUp pueden no estar disponibles en ejecución nocturna headless. Exportar ya.

**Files:**
- Create: `qa-evidencia/datos/hu-backlog.json`

- [ ] **Step 1:** Con el MCP de ClickUp, listar las tareas de la lista `901702892781` y guardar `[{ "hu": "HU4", "titulo": "...", "epica": "...", "estado": "..." }, ...]` en `qa-evidencia/datos/hu-backlog.json`.
- [ ] **Step 2 (fallback si ClickUp falla):** construir el JSON desde `PLAN_SPRINTS.md` (épicas + rangos HU por sprint) y los mensajes de commit (`git log --oneline`), marcando `"titulo": "(título no disponible — derivado de PLAN_SPRINTS.md)"`.
- [ ] **Step 3:** Verificar: `node -e "const j=require('./qa-evidencia/datos/hu-backlog.json'); console.log(j.length)"` → imprime un número ≥ 60.
- [ ] **Step 4:** Commit: `git add qa-evidencia/datos/hu-backlog.json && git commit -m "qa: backlog de HUs para matriz de trazabilidad"`

### Task 1: Scaffolding de Playwright

**Files:**
- Create: `qa-evidencia/package.json`, `qa-evidencia/playwright.config.js`, `qa-evidencia/.gitignore`

- [ ] **Step 1:** Crear `qa-evidencia/package.json`:

```json
{
  "name": "qa-evidencia-calculadora-tecmi",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "documento": "node genera-documento.js"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0"
  }
}
```

- [ ] **Step 2:** Crear `qa-evidencia/.gitignore`:

```
node_modules/
resultados/
screenshots/
reporte-html/
*.pdf
test-results/
```

- [ ] **Step 3:** Crear `qa-evidencia/playwright.config.js`:

```js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000,
  retries: 2, // staging puede tener latencia; 2 reintentos antes de fallo real
  workers: 3,
  use: {
    baseURL: process.env.BASE_URL || 'https://calculadora-tecmi.pages.dev',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['html', { outputFolder: 'reporte-html', open: 'never' }],
    ['json', { outputFile: 'resultados/resultados.json' }],
    ['list'],
  ],
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'movil', use: { ...devices['iPhone 14'] } },
  ],
});
```

- [ ] **Step 4:** Instalar: `cd qa-evidencia && npm install && npx playwright install chromium`
- [ ] **Step 5:** Verificar: `npx playwright test --list` → "no tests found" (aún no hay specs) sin error de config.
- [ ] **Step 6:** Commit: `git add qa-evidencia && git commit -m "qa: scaffolding Playwright para evidencia"`

### Task 2: Helpers del wizard + smoke test

**Files:**
- Create: `qa-evidencia/helpers/wizard.js`
- Create: `qa-evidencia/tests/recorrido-alumno.spec.js` (solo el smoke por ahora)

- [ ] **Step 1:** Crear `qa-evidencia/helpers/wizard.js`:

```js
const path = require('path');
const { expect } = require('@playwright/test');

const DATOS_PRUEBA = {
  matricula: 'QA000001',
  nombre: 'Prueba',
  apellido: 'QA',
  apellidoMaterno: 'Evidencia',
  fechaNacimiento: '2000-01-15',
  telefono: '8100000000',
  correo: 'prueba.qa@example.com',
};

let contador = 0;

// Screenshot numerado: screenshots/<proyecto>/<epica>/NN-nombre.png
async function capturar(page, testInfo, epica, nombre) {
  contador += 1;
  const archivo = path.join(
    __dirname, '..', 'screenshots', testInfo.project.name, epica,
    `${String(contador).padStart(2, '0')}-${nombre}.png`
  );
  await page.screenshot({ path: archivo, fullPage: true });
  testInfo.annotations.push({ type: 'screenshot', description: archivo });
}

async function seleccionarPerfil(page, perfil) {
  await page.goto('/');
  await page.locator(`button[data-perfil="${perfil}"]`).click();
  await expect(page.locator('#step-dp')).toBeVisible();
}

async function llenarDatosAlumno(page, datos = DATOS_PRUEBA) {
  await page.locator('#txt-matricula').fill(datos.matricula);
  await page.locator('#txt-nombre-alumno').fill(datos.nombre);
  await page.locator('#txt-apellido-alumno').fill(datos.apellido);
  await page.locator('#step-dp-next').click();
  await expect(page.locator('#step-1')).toBeVisible();
}

async function llenarDatosProspecto(page, datos = DATOS_PRUEBA) {
  await page.locator('#txt-nombre-prospecto').fill(datos.nombre);
  await page.locator('#txt-apellido-paterno').fill(datos.apellido);
  await page.locator('#txt-apellido-materno').fill(datos.apellidoMaterno);
  await page.locator('#txt-fecha-nacimiento').fill(datos.fechaNacimiento);
  await page.locator('#txt-telefono').fill(datos.telefono);
  await page.locator('#txt-correo').fill(datos.correo);
  await page.locator('#step-dp-next').click();
  await expect(page.locator('#step-1')).toBeVisible();
}

// Selects encadenados: espera a que haya opciones reales y elige por etiqueta o la primera.
async function elegirOpcion(page, selector, etiqueta = null) {
  const sel = page.locator(selector);
  const opciones = sel.locator('option:not([value=""]):not([disabled])');
  await expect(opciones.first()).toBeAttached({ timeout: 20_000 });
  if (etiqueta) {
    await sel.selectOption({ label: etiqueta });
  } else {
    await sel.selectOption(await opciones.first().getAttribute('value'));
  }
  return (await sel.locator('option:checked').textContent()).trim();
}

// Completa el paso de nivel; los selects condicionales solo si están visibles.
// Devuelve las etiquetas elegidas para el pie de foto.
async function completarNivel(page, { nivel = null } = {}) {
  const eleccion = {};
  eleccion.nivel = await elegirOpcion(page, '#select-grade', nivel);
  eleccion.plan = await elegirOpcion(page, '#select-plan');
  for (const [clave, contenedor, selector] of [
    ['formato', '#div-formato', '#select-formato'],
    ['campus', null, '#select-campus'],
    ['periodo', null, '#select-period'],
    ['materias', '#div-materiales', '#select-subjects'],
    ['certificado', '#div-certificado', '#select-certificado'],
    ['semanas', '#div-semanas', '#select-semanas'],
    ['ingles', '#div-ingles', '#select-ingles'],
  ]) {
    if (contenedor && !(await page.locator(contenedor).isVisible())) continue;
    eleccion[clave] = await elegirOpcion(page, selector);
  }
  await expect(page.locator('#step-1-next')).toBeEnabled({ timeout: 20_000 });
  await page.locator('#step-1-next').click();
  return eleccion;
}

async function aceptarLegales(page) {
  await page.locator('#check-terminos').check();
  await page.locator('#check-privacidad').check();
}

function parsearMonto(texto) {
  return parseFloat(texto.replace(/[^0-9.-]/g, ''));
}

async function leerMonto(page, selector) {
  return parsearMonto(await page.locator(selector).textContent());
}

module.exports = {
  DATOS_PRUEBA, capturar, seleccionarPerfil, llenarDatosAlumno,
  llenarDatosProspecto, elegirOpcion, completarNivel, aceptarLegales,
  parsearMonto, leerMonto,
};
```

- [ ] **Step 2:** Crear smoke test en `qa-evidencia/tests/recorrido-alumno.spec.js`:

```js
const { test, expect } = require('@playwright/test');
const w = require('../helpers/wizard');

test('[HU1] smoke: selección de perfil alumno muestra datos personales', async ({ page }, testInfo) => {
  await w.seleccionarPerfil(page, 'alumno');
  await expect(page.locator('#datos-alumno')).toBeVisible();
  await w.capturar(page, testInfo, '1-perfil', 'perfil-alumno');
});
```

- [ ] **Step 3:** Ejecutar contra staging: `cd qa-evidencia && npx playwright test --project=desktop`
  Esperado: 1 passed; existe `screenshots/desktop/1-perfil/01-perfil-alumno.png`.
  **Si el smoke falla aquí, detenerse y diagnosticar antes de continuar** (con `npx playwright test --headed` o revisando el trace): los demás tasks dependen de estos helpers.
- [ ] **Step 4:** Commit: `git add qa-evidencia && git commit -m "qa: helpers del wizard y smoke test contra staging"`

### Task 3: Extracción de reglas y matriz HU

**Files:**
- Create: `qa-evidencia/datos/reglas.json`
- Create: `qa-evidencia/datos/matriz-hu.json`

- [ ] **Step 1:** Leer `backend/controllers/becasVariablesController.js`, `prestamosController.js`, `segurosController.js`, `cotizacionesController.js`, `interesesController.js` y `frontend/js/cotizacion.js`. Extraer a `qa-evidencia/datos/reglas.json`:

```json
{
  "commit": "<git rev-parse --short HEAD>",
  "topePrestamoProfesionalConBeca": { "porcentajeMax": 20, "nivelesAplica": [2, 4], "fuente": "ruta/archivo.js:línea" },
  "formulaContado": { "descripcion": "totalContado = colegiatura - apoyos", "fuente": "ruta/archivo.js:línea" },
  "formulaFinanciado": { "descripcion": "totalFinanciado = primerPago + n * mensualidad (+ intereses si aplica)", "fuente": "ruta/archivo.js:línea" },
  "notas": ["cualquier regla que no se pudo determinar, con motivo"]
}
```

Cada entrada DEBE citar archivo:línea real. Si una fórmula difiere de lo esbozado arriba, escribir la real — este JSON es la fuente de verdad para las aserciones del Task 6.

- [ ] **Step 2:** Generar `qa-evidencia/datos/matriz-hu.json` cruzando `hu-backlog.json` con los specs planeados:

```json
[
  { "hu": "HU1", "titulo": "...", "epica": "Selección de perfil", "caso": "recorrido-alumno.spec.js > [HU1] ...", "tipoEvidencia": "screenshot", "estado": "planificado" },
  { "hu": "HU30", "titulo": "...", "epica": "Resultado", "caso": null, "tipoEvidencia": "n/a", "estado": "fuera-de-alcance-crm" }
]
```

Reglas: toda HU del backlog aparece exactamente una vez; HUs de CRM (HU30, HU42, HU69 parte envío) → `fuera-de-alcance-crm`; HUs no implementadas → `no-implementada`; el resto referencia el título de un test de los Tasks 4–7 (el título del test empieza con `[HUn]` o `[HUn,HUm]`).

- [ ] **Step 3:** Verificar: `node -e "const m=require('./qa-evidencia/datos/matriz-hu.json'), b=require('./qa-evidencia/datos/hu-backlog.json'); if(m.length!==b.length) throw new Error('faltan HUs'); console.log('OK', m.length)"`
- [ ] **Step 4:** Commit: `git add qa-evidencia/datos && git commit -m "qa: reglas de negocio extraídas y matriz de trazabilidad"`

### Task 4: Specs de recorrido — Alumno

**Files:**
- Modify: `qa-evidencia/tests/recorrido-alumno.spec.js`

- [ ] **Step 1:** Añadir el recorrido completo. Patrón (el agente añade variantes análogas):

```js
test('[HU4,HU5,HU6] recorrido alumno completo con beca y préstamo', async ({ page }, testInfo) => {
  await w.seleccionarPerfil(page, 'alumno');
  await w.capturar(page, testInfo, '4-datos-personales', 'alumno-datos-vacios');
  await w.llenarDatosAlumno(page);
  await w.capturar(page, testInfo, '5-nivel', 'alumno-nivel-inicial');
  const eleccion = await w.completarNivel(page);
  testInfo.annotations.push({ type: 'configuracion', description: JSON.stringify(eleccion) });
  await expect(page.locator('#step-2-students')).toBeVisible();
  await page.locator('#row-radio-beca-alumno input[type="radio"]').first().check();
  await page.locator('#row-radio-prestamo-alumno input[type="radio"]').first().check();
  if (await page.locator('#row-beca-alumno').isVisible()) {
    await w.elegirOpcion(page, '#txt-percentage-students');
  }
  if (await page.locator('#prestamo-students-container').isVisible()) {
    await w.elegirOpcion(page, '#txt-prestamo-percentage-students');
  }
  await w.capturar(page, testInfo, '6-apoyos', 'alumno-apoyos-elegidos');
  await page.locator('#step-2-students-next').click();
  await expect(page.locator('#step-3')).toBeVisible();
  await w.capturar(page, testInfo, '7-seguros', 'alumno-seguros');
  await page.locator('#step-3-next').click();
  await w.aceptarLegales(page);
  await w.capturar(page, testInfo, '8-legales', 'alumno-legales-aceptados');
  await page.locator('#step-4-next').click();
  await page.waitForURL(/resultado/);
  await expect(page.locator('#totalContado')).not.toHaveText('$0', { timeout: 30_000 });
  await w.capturar(page, testInfo, '9-resultado', 'alumno-resultado');
});
```

Nota: los radios de beca/préstamo no tienen ID individual en el HTML — el agente debe inspeccionar `#row-radio-beca-alumno` en el DOM real y ajustar el selector si `input[type="radio"]` no aplica.

- [ ] **Step 2:** Añadir variantes como tests separados (mismo patrón, distinta configuración): sin beca ni préstamo; segundo nivel de estudios disponible (`completarNivel(page, { nivel: <etiqueta del 2º option> })` — leer las etiquetas reales del select en un test previo con `page.locator('#select-grade option').allTextContents()` y anotarlas); validación de matrícula inválida (`fill('ABC')` → esperar `#txt-matricula-msg` visible, screenshot).
- [ ] **Step 3:** Ejecutar: `npx playwright test recorrido-alumno --project=desktop` → todos passed (o `fixme` anotado con motivo).
- [ ] **Step 4:** Commit: `git add qa-evidencia/tests && git commit -m "qa: recorridos de evidencia track alumno"`

### Task 5: Specs de recorrido — Prospecto

**Files:**
- Create: `qa-evidencia/tests/recorrido-prospecto.spec.js`

- [ ] **Step 1:** Igual que Task 4 pero con `seleccionarPerfil(page, 'prospecto')`, `llenarDatosProspecto`, paso de apoyos `#step-2` (radios `#row-radio-beca-prospecto`, `#row-radio-prestamo-prospecto`; selects `#txt-scholarship`, `#txt-percentage`, `#txt-prestamo-percentage`; botón `#step-2-next`). Épica de captura: `screenshots/<proyecto>/4-datos-personales/prospecto-*`.
- [ ] **Step 2:** Variantes: con beca y préstamo; sin apoyos; validaciones de campos (teléfono < 10 dígitos → `#txt-telefono-msg`; correo inválido → `#txt-correo-msg`); cada validación con screenshot.
- [ ] **Step 3:** Ejecutar: `npx playwright test recorrido-prospecto --project=desktop` → passed.
- [ ] **Step 4:** Commit: `git add qa-evidencia/tests && git commit -m "qa: recorridos de evidencia track prospecto"`

### Task 6: Specs de cálculos críticos (aserciones)

**Files:**
- Create: `qa-evidencia/tests/calculos.spec.js`

- [ ] **Step 1:** Crear helper local `llegarAResultado(page, opciones)` dentro del spec que reuse los helpers de `wizard.js` para llegar a `resultado.html` con una configuración dada (perfil, beca sí/no, préstamo sí/no).
- [ ] **Step 2:** Tests de consistencia aritmética (los valores esperados NO se inventan: salen de `datos/reglas.json`; si la fórmula extraída difiere, usar la extraída y citarla en la anotación):

```js
test('[HU38] total contado = colegiatura - apoyos', async ({ page }, testInfo) => {
  await llegarAResultado(page, { perfil: 'prospecto', beca: true, prestamo: false });
  const colegiatura = await w.leerMonto(page, '#colegiatura');
  const apoyo = await w.leerMonto(page, '#apoyoFinanciamiento');
  const total = await w.leerMonto(page, '#totalContado');
  expect(total).toBeCloseTo(colegiatura - apoyo, 0);
  await w.capturar(page, testInfo, 'calculos', 'contado-consistente');
});

test('[HU39] total financiado = primer pago + mensualidades', async ({ page }, testInfo) => {
  await llegarAResultado(page, { perfil: 'prospecto', beca: false, prestamo: false });
  const primerPago = await w.leerMonto(page, '#primerPago');
  const mensualidad = await w.leerMonto(page, '#mensualidades');
  const n = parseInt((await page.locator('#mensualidadesText').textContent()).match(/\d+/)[0], 10);
  const total = await w.leerMonto(page, '#totalFinanciado');
  // Ajustar según la fórmula real de datos/reglas.json (intereses, redondeos)
  expect(total).toBeCloseTo(primerPago + n * mensualidad, 0);
  await w.capturar(page, testInfo, 'calculos', 'financiado-consistente');
});

test('[HU22] tope de préstamo 20% en profesional con beca (fix a054003)', async ({ page }, testInfo) => {
  // Navegar como prospecto a nivel profesional (etiqueta desde datos/reglas.json), elegir beca,
  // luego leer las opciones de #txt-prestamo-percentage:
  const opciones = await page.locator('#txt-prestamo-percentage option:not([value=""])').allTextContents();
  const porcentajes = opciones.map(t => parseInt(t, 10)).filter(Number.isFinite);
  for (const p of porcentajes) expect(p).toBeLessThanOrEqual(20);
  await w.capturar(page, testInfo, 'calculos', 'tope-prestamo-20');
});
```

- [ ] **Step 3:** Añadir: beca mostrada en resultado (`#beca`) coincide con el porcentaje elegido en el wizard; seguro elegido incrementa el total (comparar dos corridas con/sin seguro en el mismo nivel). Total esperado: 12–15 tests con aserción entre este task y los porcentajes/validaciones de Tasks 4–5.
- [ ] **Step 4:** Ejecutar: `npx playwright test calculos --project=desktop`. Esperado: passed. **Si una aserción falla de forma consistente (no por timing), es un hallazgo real: dejarla fallando y documentar esperado vs. obtenido en la anotación.**
- [ ] **Step 5:** Commit: `git add qa-evidencia/tests && git commit -m "qa: aserciones de cálculos críticos"`

### Task 7: Acciones del resultado (PDF, compartida, nueva cotización)

**Files:**
- Create: `qa-evidencia/tests/resultado-acciones.spec.js`

- [ ] **Step 1:** Tests sobre `resultado.html` (llegar con el helper de Task 6): descarga de PDF de cotización (`page.waitForEvent('download')` al hacer clic en el botón de descarga — localizar el botón en `frontend/js/descargarPDF.js`; verificar `download.suggestedFilename()` termina en `.pdf`); enlace de cotización compartida (el botón de WhatsApp genera URL `wa.me` — verificar el `href` sin navegar fuera; abrir `cotizacion-compartida.html` con el id generado y screenshot); botón nueva cotización regresa al wizard conservando lo que indique `frontend/js/nueva-cotizacion.js`.
- [ ] **Step 2:** Screenshot de cada acción en épica `9-resultado`.
- [ ] **Step 3:** Ejecutar: `npx playwright test resultado-acciones --project=desktop` → passed o `fixme` anotado.
- [ ] **Step 4:** Commit: `git add qa-evidencia/tests && git commit -m "qa: evidencia de acciones del resultado"`

### Task 8: Ejecución completa (desktop + móvil)

- [ ] **Step 1:** `cd qa-evidencia && rm -rf screenshots resultados reporte-html && npx playwright test`
  Esperado: todos los tests en ambos proyectos; `resultados/resultados.json` y `reporte-html/index.html` generados.
- [ ] **Step 2:** Verificar conteo: `node -e "const r=require('./resultados/resultados.json'); const s=r.stats; console.log(s)"` → `unexpected: 0` idealmente; si hay fallos consistentes, son hallazgos (van al reporte).
- [ ] **Step 3:** Actualizar `datos/matriz-hu.json`: estado `planificado` → `pasó` / `falló` / `solo-visual` / `pendiente-manual` según `resultados.json`.
- [ ] **Step 4:** Commit: `git add qa-evidencia/datos && git commit -m "qa: matriz actualizada con resultados de ejecución"`

### Task 9: Generador del documento (HTML → PDF)

**Files:**
- Create: `qa-evidencia/genera-documento.js`

- [ ] **Step 1:** Crear `qa-evidencia/genera-documento.js`:

```js
// Compila EVIDENCIA-QA.pdf desde resultados.json + matriz-hu.json + screenshots.
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const matriz = require('./datos/matriz-hu.json');
const resultados = require('./resultados/resultados.json');
const reglas = require('./datos/reglas.json');

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function listaScreenshots() {
  const base = path.join(__dirname, 'screenshots');
  const out = [];
  for (const proyecto of fs.readdirSync(base)) {
    const dirP = path.join(base, proyecto);
    for (const epica of fs.readdirSync(dirP)) {
      for (const png of fs.readdirSync(path.join(dirP, epica)).sort()) {
        out.push({ proyecto, epica, png, ruta: path.join(dirP, epica, png) });
      }
    }
  }
  return out;
}

const stats = resultados.stats;
const totales = {
  paso: matriz.filter(h => h.estado === 'pasó').length,
  fallo: matriz.filter(h => h.estado === 'falló').length,
  visual: matriz.filter(h => h.estado === 'solo-visual').length,
  pendiente: matriz.filter(h => h.estado === 'pendiente-manual').length,
  fuera: matriz.filter(h => h.estado.startsWith('fuera-de-alcance') || h.estado === 'no-implementada').length,
};

const filas = matriz.map(h =>
  `<tr class="${esc(h.estado)}"><td>${esc(h.hu)}</td><td>${esc(h.titulo)}</td><td>${esc(h.epica)}</td><td>${esc(h.caso ?? '—')}</td><td>${esc(h.tipoEvidencia)}</td><td>${esc(h.estado)}</td></tr>`
).join('\n');

const shots = listaScreenshots();
const seccionesEvidencia = [...new Set(shots.map(s => s.epica))].sort().map(epica => `
  <h3>${esc(epica)}</h3>
  ${shots.filter(s => s.epica === epica).map(s => `
    <figure><img src="file://${s.ruta}" /><figcaption>${esc(s.proyecto)} — ${esc(s.png)}</figcaption></figure>`).join('\n')}
`).join('\n');

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; font-size: 11px; margin: 24px; }
  h1 { font-size: 20px; } h2 { font-size: 15px; margin-top: 28px; page-break-before: always; }
  h2:first-of-type { page-break-before: avoid; }
  table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ccc; padding: 3px 6px; text-align: left; }
  tr.falló td { background: #fdd; } tr.pendiente-manual td, tr.solo-visual td { background: #ffd; }
  figure { page-break-inside: avoid; margin: 12px 0; } img { max-width: 100%; border: 1px solid #ddd; }
  figcaption { color: #555; font-size: 10px; }
</style></head><body>
  <h1>Evidencia de Ejecución de Pruebas — Calculadora Tecmilenio (Fase 3, Sprints 1–4)</h1>
  <p><b>Ambiente:</b> staging (calculadora-tecmi.pages.dev) · <b>Commit:</b> ${esc(reglas.commit)} · <b>Generado por:</b> Black &amp; Orange</p>
  <h2>Resumen ejecutivo</h2>
  <p>Se ejecutaron ${stats.expected + stats.unexpected + stats.skipped} casos de prueba automatizados (desktop y móvil)
  sobre las historias de usuario entregadas en los Sprints 1–4. Resultado por HU:
  ${totales.paso} verificadas con aserciones, ${totales.visual} con evidencia visual,
  ${totales.fallo} con hallazgos, ${totales.pendiente} pendientes de verificación manual,
  ${totales.fuera} fuera de alcance de esta fase (bloque CRM diferido / no implementadas).</p>
  <h2>Matriz de trazabilidad</h2>
  <table><tr><th>HU</th><th>Título</th><th>Épica</th><th>Caso de prueba</th><th>Evidencia</th><th>Estado</th></tr>${filas}</table>
  <h2>Evidencia por épica</h2>
  ${seccionesEvidencia}
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'EVIDENCIA-QA.html'), html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'EVIDENCIA-QA.html'));
  await page.pdf({ path: path.join(__dirname, 'EVIDENCIA-QA.pdf'), format: 'Letter', printBackground: true });
  await browser.close();
  console.log('EVIDENCIA-QA.pdf generado');
})();
```

- [ ] **Step 2:** Ejecutar: `cd qa-evidencia && node genera-documento.js` → "EVIDENCIA-QA.pdf generado".
- [ ] **Step 3:** Verificar el PDF: abrirlo (o `Read` de las primeras páginas) y comprobar que el resumen, la matriz completa y screenshots legibles están presentes. Si los screenshots fullPage salen demasiado largos, recortar a viewport en `capturar()` (cambiar `fullPage: true` → `false`) y re-ejecutar Task 8.
- [ ] **Step 4:** Commit: `git add qa-evidencia/genera-documento.js && git commit -m "qa: generador de documento de evidencia (HTML -> PDF)"`

### Task 10: Verificación final del paquete

- [ ] **Step 1:** Checklist contra el criterio de éxito del spec: existe `EVIDENCIA-QA.pdf`; toda HU del backlog tiene estado en la matriz; hay screenshots desktop y móvil de ambos tracks; los tests de cálculo pasan o sus fallos están documentados con esperado vs. obtenido.
- [ ] **Step 2:** Escribir `qa-evidencia/RESUMEN-NOCHE.md`: qué se completó, qué se degradó y por qué, hallazgos (bugs reales encontrados), y qué debería revisar Carlos antes de enviar a Jazmín.
- [ ] **Step 3:** Commit final: `git add qa-evidencia && git commit -m "qa: paquete de evidencia QA Sprints 1-4 completo"`
