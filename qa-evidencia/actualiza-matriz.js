/**
 * actualiza-matriz.js
 * Lee resultados/resultados.json, extrae tags [HUn] de los títulos de los tests,
 * y actualiza datos/matriz-hu.json con el estado real de cada HU.
 *
 * Lógica de estado:
 *   - "fuera-de-alcance-crm" / "no-implementada" → se conserva tal cual
 *   - Si TODOS los tests que mencionan la HU pasaron:
 *       tipoEvidencia "aserción"   → "pasó"
 *       tipoEvidencia "screenshot" → "solo-visual"
 *   - Si algún test que menciona la HU falló → "falló"
 *   - Si ningún test la menciona → "pendiente-manual" (nota se conserva si existe)
 */

const fs = require('fs');
const path = require('path');

const RESULTADOS_PATH = path.join(__dirname, 'resultados', 'resultados.json');
const MATRIZ_PATH = path.join(__dirname, 'datos', 'matriz-hu.json');

// Regex que captura la lista de HUs en el título: [HU4,HU5,HU6] o [HU1]
const RE_TAGS = /\[(HU[\d]+(,HU[\d]+)*)\]/;

function extractHUs(title) {
  const m = title.match(RE_TAGS);
  if (!m) return [];
  // m[1] = "HU4,HU5,HU6" → split
  return m[1].split(',').map(s => s.trim());
}

/**
 * Walk suites recursively and collect specs.
 * Returns array of { title, status } where status:
 *   'passed' | 'failed' | 'skipped'
 * If a spec has retries and eventually passes → 'passed' (flaky but passed).
 */
function collectSpecs(suites) {
  const specs = [];
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      // A spec can have multiple tests (one per project).
      // We aggregate: if ANY test for this spec still failed after retries → failed.
      let allPassed = true;
      let anyFailed = false;
      for (const test of spec.tests || []) {
        const results = test.results || [];
        // Last result status (after retries) is what matters
        const finalStatus = results.length > 0 ? results[results.length - 1].status : 'skipped';
        if (finalStatus !== 'passed') {
          allPassed = false;
          if (finalStatus === 'failed') anyFailed = true;
        }
      }
      const status = anyFailed ? 'failed' : (allPassed ? 'passed' : 'skipped');
      specs.push({ title: spec.title, status });
    }
    specs.push(...collectSpecs(suite.suites || []));
  }
  return specs;
}

// ── Load ──────────────────────────────────────────────────────────────────────
const resultados = JSON.parse(fs.readFileSync(RESULTADOS_PATH, 'utf8'));
const matriz = JSON.parse(fs.readFileSync(MATRIZ_PATH, 'utf8'));

const specs = collectSpecs(resultados.suites || []);

// Deduplicate specs by title (multiple projects run same spec)
const specByTitle = new Map();
for (const spec of specs) {
  if (!specByTitle.has(spec.title)) {
    specByTitle.set(spec.title, spec.status);
  } else {
    // If ANY project run failed, mark as failed
    const prev = specByTitle.get(spec.title);
    if (spec.status === 'failed' || prev === 'failed') {
      specByTitle.set(spec.title, 'failed');
    }
  }
}

// Build map: HU → { passed: bool, mentioned: bool }
const huResults = new Map(); // hu → { allPassed: bool, anyFailed: bool }

for (const [title, status] of specByTitle) {
  const hus = extractHUs(title);
  for (const hu of hus) {
    if (!huResults.has(hu)) {
      huResults.set(hu, { allPassed: true, anyFailed: false, mentioned: true });
    }
    const entry = huResults.get(hu);
    if (status === 'failed') {
      entry.anyFailed = true;
      entry.allPassed = false;
    } else if (status !== 'passed') {
      entry.allPassed = false;
    }
    entry.mentioned = true;
  }
}

// ── Update matrix ─────────────────────────────────────────────────────────────
const ESTADOS_CONSERVAR = new Set(['fuera-de-alcance-crm', 'no-implementada']);

const conteo = {
  'pasó': 0,
  'solo-visual': 0,
  'falló': 0,
  'pendiente-manual': 0,
  'conservado': 0,
};

for (const entry of matriz) {
  const { hu, tipoEvidencia, nota } = entry;

  // Conservar estados especiales sin modificar
  if (ESTADOS_CONSERVAR.has(entry.estado)) {
    conteo.conservado++;
    continue;
  }

  const result = huResults.get(hu);

  if (!result) {
    // Ningún test menciona esta HU
    entry.estado = 'pendiente-manual';
    // nota se conserva si ya existía
    conteo['pendiente-manual']++;
  } else if (result.anyFailed) {
    entry.estado = 'falló';
    conteo['falló']++;
  } else if (result.allPassed) {
    if (tipoEvidencia === 'aserción') {
      entry.estado = 'pasó';
      conteo['pasó']++;
    } else {
      // screenshot u otro
      entry.estado = 'solo-visual';
      conteo['solo-visual']++;
    }
  } else {
    // Skipped o parcialmente
    entry.estado = 'pendiente-manual';
    conteo['pendiente-manual']++;
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────
fs.writeFileSync(MATRIZ_PATH, JSON.stringify(matriz, null, 2) + '\n', 'utf8');

// ── Report ────────────────────────────────────────────────────────────────────
console.log('\n=== RESUMEN DE MATRIZ HU ===');
console.log(`  pasó            : ${conteo['pasó']}`);
console.log(`  solo-visual     : ${conteo['solo-visual']}`);
console.log(`  falló           : ${conteo['falló']}`);
console.log(`  pendiente-manual: ${conteo['pendiente-manual']}`);
console.log(`  conservado (fuera-alcance/no-impl): ${conteo.conservado}`);
console.log(`  TOTAL           : ${matriz.length}`);

const pendientes = matriz.filter(e => e.estado === 'pendiente-manual').map(e => e.hu);
if (pendientes.length > 0) {
  console.log('\n=== HUs PENDIENTE-MANUAL ===');
  pendientes.forEach(hu => {
    const e = matriz.find(x => x.hu === hu);
    console.log(`  ${hu}: ${e.titulo}`);
    if (e.nota) console.log(`       nota: ${e.nota}`);
  });
}

const fallaron = matriz.filter(e => e.estado === 'falló').map(e => e.hu);
if (fallaron.length > 0) {
  console.log('\n=== HUs FALLIDAS ===');
  fallaron.forEach(hu => {
    const e = matriz.find(x => x.hu === hu);
    console.log(`  ${hu}: ${e.titulo}`);
  });
}

console.log('\nMatriz actualizada en:', MATRIZ_PATH);
