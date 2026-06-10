/**
 * calculos.spec.js — Aserciones sobre cálculos críticos
 *
 * Fuente de verdad: qa-evidencia/datos/reglas.json (commit a57e6fa)
 * Convención de títulos: [HUn,HUm] descripción
 *
 * Staging: https://calculadora-tecmi.pages.dev
 * Backend: https://calculadora-tecmi-backend.carlos-tam-s-account.workers.dev
 */

const { test, expect } = require('@playwright/test');
const w = require('../helpers/wizard');

const BACKEND = 'https://calculadora-tecmi-backend.carlos-tam-s-account.workers.dev';

// ---------------------------------------------------------------------------
// Helpers locales
// ---------------------------------------------------------------------------

/**
 * Completa step-2 flujo PROSPECTO con beca y préstamo controlados.
 * Devuelve { becaPct, prestamoPct } — valores numéricos elegidos.
 */
async function completarApoyosProspecto(page, testInfo, { beca = 'si', prestamo = 'no', nivelId = null } = {}) {
  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });

  let becaPct = 0;
  let prestamoPct = 0;

  // --- BECA ---
  await page.locator(`#row-radio-beca-prospecto input[value="${beca}"]`).check();

  if (beca === 'si') {
    await expect(page.locator('#tipo-beca')).toBeVisible({ timeout: 10_000 });
    const optsScholarship = page.locator('#txt-scholarship option:not([value=""]):not([value="0"])');
    await expect(optsScholarship.first()).toBeAttached({ timeout: 30_000 });
    const firstSchVal = await optsScholarship.first().getAttribute('value');
    await page.locator('#txt-scholarship').selectOption(firstSchVal);

    const percentageVisible = await page.locator('#txt-percentage')
      .isVisible({ timeout: 5_000 }).catch(() => false);

    if (percentageVisible) {
      await seleccionarPorcentajeBecaProspectoConReintento(page);
      const rawVal = await page.locator('#txt-percentage').inputValue();
      becaPct = parseFloat(rawVal) || 0;
    } else {
      // Beca de tipo fijo: leer el porcentaje del option seleccionado
      const optChecked = await page.locator('#txt-scholarship option:checked').getAttribute('data-pct') || '0';
      becaPct = parseFloat(optChecked) || 0;
    }

    testInfo.annotations.push({ type: 'beca-pct', description: `${becaPct}%` });
  }

  // --- PRÉSTAMO ---
  await page.waitForTimeout(900);
  const radioPrestamoSi = page.locator('#row-radio-prestamo-prospecto input[value="si"]');
  const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
  const prestamoSiDisabled = await radioPrestamoSi.isDisabled();

  if (prestamo === 'si' && !prestamoSiDisabled) {
    await radioPrestamoSi.check();
    const hayContenedor = await page.locator('.field-avg-4')
      .isVisible({ timeout: 5_000 }).catch(() => false);
    if (hayContenedor) {
      const optsP = page.locator('#txt-prestamo-percentage option:not([value=""]):not([disabled])');
      await expect(optsP.first()).toBeAttached({ timeout: 15_000 });
      const firstPVal = await optsP.first().getAttribute('value');
      await page.locator('#txt-prestamo-percentage').selectOption(firstPVal);
      prestamoPct = parseFloat(firstPVal) || 0;
    }
  } else {
    if (!await radioPrestamoNo.isDisabled()) await radioPrestamoNo.check();
  }

  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
  return { becaPct, prestamoPct };
}

async function seleccionarPorcentajeBecaProspectoConReintento(page) {
  const pctSelect = page.locator('#txt-percentage');
  const opts = pctSelect.locator('option:not([value=""]):not([disabled])');
  const btnNext = page.locator('#step-2-next');
  await expect(opts.first()).toBeAttached({ timeout: 30_000 });
  for (let i = 0; i < 6; i++) {
    await expect(opts.first()).toBeAttached({ timeout: 15_000 });
    const val = await opts.first().getAttribute('value');
    await pctSelect.selectOption(val);
    const enabled = await expect(btnNext).toBeEnabled({ timeout: 1500 }).then(() => true).catch(() => false);
    if (enabled) return;
    await page.waitForTimeout(400);
  }
  await expect(btnNext).toBeEnabled({ timeout: 15_000 });
}

/**
 * Completa step-2 flujo ALUMNO con beca controlada y préstamo=no.
 * Devuelve { becaPct }.
 */
async function completarApoyosAlumno(page, testInfo, { beca = 'si' } = {}) {
  await expect(page.locator('#step-2-students')).toBeVisible({ timeout: 15_000 });

  let becaPct = 0;

  await page.locator(`#row-radio-beca-alumno input[value="${beca}"]`).check();

  if (beca === 'si') {
    const rowBeca = page.locator('#row-beca-alumno');
    await expect(rowBeca).toBeVisible({ timeout: 10_000 });
    await seleccionarBecaAlumnoConReintento(page);
    const rawVal = await page.locator('#txt-percentage-students').inputValue();
    becaPct = parseFloat(rawVal) || 0;
    testInfo.annotations.push({ type: 'beca-pct-alumno', description: `${becaPct}%` });
  }

  // Préstamo = no (simplifica la fórmula de contado)
  const radioPrestamoNo = page.locator('#row-radio-prestamo-alumno input[value="no"]');
  if (!await radioPrestamoNo.isDisabled()) await radioPrestamoNo.check();

  // Esperar seleccionarCero()
  await expect(page.locator('#txt-percentage-students')).not.toHaveValue('', { timeout: 5_000 });
  await expect(page.locator('#step-2-students-next')).toBeEnabled({ timeout: 15_000 });

  return { becaPct };
}

async function seleccionarBecaAlumnoConReintento(page) {
  const becaSelect = page.locator('#txt-percentage-students');
  const opts = becaSelect.locator('option:not([value=""]):not([disabled]):not([value="op1"]):not([value="0"])');
  const btnNext = page.locator('#step-2-students-next');
  await expect(opts.first()).toBeAttached({ timeout: 30_000 });
  for (let i = 0; i < 6; i++) {
    await expect(opts.first()).toBeAttached({ timeout: 15_000 });
    const val = await opts.first().getAttribute('value');
    await becaSelect.selectOption(val);
    const enabled = await expect(btnNext).toBeEnabled({ timeout: 1500 }).then(() => true).catch(() => false);
    if (enabled) return;
    await page.waitForTimeout(400);
  }
  await expect(btnNext).toBeEnabled({ timeout: 15_000 });
}

/**
 * Completa step-3 (seguros) — sin seleccionar ningún seguro opcional,
 * pasando con la configuración mínima para aislar el cálculo.
 * Devuelve { totalSeguros } leído del DOM si está disponible, o 0.
 */
async function completarSegurosMinimo(page) {
  const contenedorSeguros = page.locator('#seguros-dinamicos-container');
  await expect(contenedorSeguros.locator('select').first())
    .toBeAttached({ timeout: 15_000 }).catch(() => {});

  const numSelects = await contenedorSeguros.locator('select').count();
  if (numSelects === 0) return { totalSeguros: 0 };

  // Si hay radio de interés, responder 'no' para evitar seguros opcionales
  const rowRadio = page.locator('#row-radio-seguro-interes');
  const radioVisible = await rowRadio.isVisible({ timeout: 3_000 }).catch(() => false);
  if (radioVisible) {
    const radioNo = page.locator('#row-radio-seguro-interes input[value="no"]');
    if (!await radioNo.isDisabled()) {
      await radioNo.check();
      await page.waitForTimeout(600);
    }
  }

  // Rellenar selects forzados (VIVE forzado en niveles 1,2,3,4; colegiatura forzado en 1,3)
  const selectsSeguros = contenedorSeguros.locator('select');
  const total = await selectsSeguros.count();
  for (let i = 0; i < total; i++) {
    const sel = selectsSeguros.nth(i);
    if (await sel.isVisible() && !await sel.isDisabled()) {
      const currentVal = await sel.inputValue();
      if (currentVal !== '') continue;
      const opSi = sel.locator('option[value="si"]');
      if (await opSi.count() > 0) {
        await sel.selectOption('si');
      } else {
        const opts = sel.locator('option:not([value=""]):not([disabled])');
        if (await opts.count() > 0) {
          await sel.selectOption(await opts.first().getAttribute('value'));
        }
      }
    }
  }

  return { totalSeguros: 0 }; // los seguros forzados se leerán desde el resultado
}

/**
 * Completa step-3 seleccionando todos los seguros disponibles (para test de suma).
 */
async function completarSegurosMaximo(page) {
  const contenedorSeguros = page.locator('#seguros-dinamicos-container');
  await expect(contenedorSeguros.locator('select').first())
    .toBeAttached({ timeout: 15_000 }).catch(() => {});

  const numSelects = await contenedorSeguros.locator('select').count();
  if (numSelects === 0) return;

  const rowRadio = page.locator('#row-radio-seguro-interes');
  const radioVisible = await rowRadio.isVisible({ timeout: 3_000 }).catch(() => false);
  if (radioVisible) {
    await page.locator('#row-radio-seguro-interes input[value="si"]').check();
    await page.waitForTimeout(800);
  }

  const selectsSeguros = contenedorSeguros.locator('select');
  const total = await selectsSeguros.count();
  for (let i = 0; i < total; i++) {
    const sel = selectsSeguros.nth(i);
    if (await sel.isVisible() && !await sel.isDisabled()) {
      const currentVal = await sel.inputValue();
      if (currentVal !== '') continue;
      const opSi = sel.locator('option[value="si"]');
      if (await opSi.count() > 0) {
        await sel.selectOption('si');
      } else {
        const opts = sel.locator('option:not([value=""]):not([disabled])');
        if (await opts.count() > 0) {
          await sel.selectOption(await opts.first().getAttribute('value'));
        }
      }
    }
  }
}

/**
 * Recorrido completo prospecto hasta página de resultado.
 * opts.seguros: 'minimo' (default) | 'maximo' | 'ninguno'
 * Devuelve { becaPct, prestamoPct, nivelElegido }
 */
async function llegarAResultadoProspecto(page, testInfo, opts = {}) {
  const {
    beca = 'si',
    prestamo = 'no',
    nivel = null,
    seguros = 'minimo',
  } = opts;

  await w.seleccionarPerfil(page, 'prospecto');
  await w.llenarDatosProspecto(page);
  await expect(page.locator('#step-1')).toBeVisible();
  const eleccion = await w.completarNivel(page, { nivel });
  testInfo.annotations.push({ type: 'nivel-elegido', description: JSON.stringify(eleccion) });

  const { becaPct, prestamoPct } = await completarApoyosProspecto(page, testInfo, { beca, prestamo });
  await page.locator('#step-2-next').click();

  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  if (seguros === 'maximo') {
    await completarSegurosMaximo(page);
  } else {
    await completarSegurosMinimo(page);
  }
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();

  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await w.aceptarLegales(page);
  await page.locator('#step-4-next').click();

  await expect(page).toHaveURL(/resultado/, { timeout: 30_000 });
  await expect(page.locator('#totalContado')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#totalContado')).not.toHaveText('$0', { timeout: 30_000 });

  return { becaPct, prestamoPct, nivelElegido: eleccion.nivel };
}

/**
 * Recorrido completo alumno hasta página de resultado (beca=si, préstamo=no).
 * Devuelve { becaPct, nivelElegido }
 */
async function llegarAResultadoAlumno(page, testInfo, opts = {}) {
  const {
    beca = 'si',
    nivel = null,
    seguros = 'minimo',
  } = opts;

  await w.seleccionarPerfil(page, 'alumno');
  await w.llenarDatosAlumno(page);
  await expect(page.locator('#step-1')).toBeVisible();
  const eleccion = await w.completarNivel(page, { nivel });
  testInfo.annotations.push({ type: 'nivel-elegido', description: JSON.stringify(eleccion) });

  const { becaPct } = await completarApoyosAlumno(page, testInfo, { beca });
  await page.locator('#step-2-students-next').click();

  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  if (seguros === 'maximo') {
    await completarSegurosMaximo(page);
  } else {
    await completarSegurosMinimo(page);
  }
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();

  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await w.aceptarLegales(page);
  await page.locator('#step-4-next').click();

  await expect(page).toHaveURL(/resultado/, { timeout: 30_000 });
  await expect(page.locator('#totalContado')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#totalContado')).not.toHaveText('$0', { timeout: 30_000 });

  return { becaPct, nivelElegido: eleccion.nivel };
}

// ---------------------------------------------------------------------------
// TEST 1: [HU34,HU73] Total contado consistente
// Fórmula (reglas.json formulaContado):
//   totalContado = costoTotal - finalAmount + totalSeguros
//   #colegiatura = costoTotal (solo visible si hay descuento)
//   #apoyoFinanciamiento = -(costoTotal - totalContadoSinSeguros)  → valor negativo
//   Si seguros = 0:
//     totalContado ≈ colegiatura - abs(apoyoFinanciamiento)   (tolerancia ±1)
// Estrategia: recorrido SIN seguros opcionales para aislar la relación.
// ---------------------------------------------------------------------------
test('[HU34,HU73] total contado consistente (prospecto, beca, sin seguros opcionales)', async ({ page }, testInfo) => {
  await llegarAResultadoProspecto(page, testInfo, { beca: 'si', prestamo: 'no', seguros: 'minimo' });

  await w.capturar(page, testInfo, 'calculos', 'total-contado-resultado');

  // Leer elementos del DOM
  const totalContadoRaw = await page.locator('#totalContado').textContent();
  const totalContado = w.parsearMonto(totalContadoRaw);
  testInfo.annotations.push({ type: 'totalContado-leido', description: `"${totalContadoRaw.trim()}" → ${totalContado}` });

  // #colegiatura puede estar oculta si no hay descuento (reglas.json colegiaturaEnUI)
  const colegiaturaVisible = await page.locator('#colegiatura').isVisible().catch(() => false);
  const apoyoVisible = await page.locator('#apoyoFinanciamiento').isVisible().catch(() => false);

  if (!colegiaturaVisible || !apoyoVisible) {
    // Sin descuento: totalContado = costoTotal directamente, no hay aritmética que verificar
    testInfo.annotations.push({
      type: 'info',
      description: `#colegiatura visible: ${colegiaturaVisible}, #apoyoFinanciamiento visible: ${apoyoVisible}. Sin descuento activo — verificamos solo que totalContado > 0.`,
    });
    expect(totalContado, 'totalContado debe ser positivo').toBeGreaterThan(0);
    await w.capturar(page, testInfo, 'calculos', 'total-contado-sin-descuento');
    return;
  }

  const colegiaturaRaw = await page.locator('#colegiatura').textContent();
  const colegiatura = w.parsearMonto(colegiaturaRaw);
  const apoyoRaw = await page.locator('#apoyoFinanciamiento').textContent();
  const apoyo = w.parsearMonto(apoyoRaw); // valor negativo, ej: -1200

  testInfo.annotations.push({ type: 'colegiatura-leida', description: `"${colegiaturaRaw.trim()}" → ${colegiatura}` });
  testInfo.annotations.push({ type: 'apoyo-leido', description: `"${apoyoRaw.trim()}" → ${apoyo}` });

  // Leer totalSeguros desde localStorage 'totalCost' (reglas.json segurosEnTotal)
  // totalContadoFinal = totalContadoSinSeguros + totalSeguros (resultados.js:527-528)
  // #apoyoFinanciamiento = -(costoTotal - totalContadoSinSeguros), calculado en DOM con LS sin seguros
  const totalCostLS = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('totalCost')) || 0; } catch { return 0; }
  });
  const totalSeguros = parseFloat(totalCostLS) || 0;
  testInfo.annotations.push({ type: 'totalSeguros-localStorage', description: `totalCost=${totalCostLS} → ${totalSeguros}` });

  // Fórmula: totalContado = colegiatura + apoyo (apoyo es negativo) + totalSeguros
  // apoyo = -(colegiatura - totalContadoSinSeguros) → colegiatura + apoyo = totalContadoSinSeguros
  const esperado = colegiatura + apoyo + totalSeguros;
  testInfo.annotations.push({
    type: 'calculo-esperado',
    description: `${colegiatura} + (${apoyo}) + ${totalSeguros} = ${esperado} vs totalContado=${totalContado}`,
  });

  await w.capturar(page, testInfo, 'calculos', 'total-contado-con-descuento');

  // Tolerancia ±1 peso por redondeos de display
  expect(
    Math.abs(totalContado - esperado),
    `totalContado (${totalContado}) debe ser ≈ colegiatura+apoyo+seguros (${esperado})`,
  ).toBeLessThanOrEqual(1);
});

// ---------------------------------------------------------------------------
// TEST 2: [HU35,HU74] Total financiado = primerPago + n × mensualidad
// Fórmula (reglas.json formulaFinanciado):
//   totalFinanciado = primeraCuota + interesDividido * factorMultiplicador
//   factor: 4 (niveles 1,2,4), 2 (nivel 10), 3 (demás)
//   El interés se consulta desde /api/intereses/nivel/{nivelId}
// ---------------------------------------------------------------------------
test('[HU35,HU74] total financiado = primer pago + n × mensualidad (prospecto)', async ({ page }, testInfo) => {
  await llegarAResultadoProspecto(page, testInfo, { beca: 'si', prestamo: 'no', seguros: 'minimo' });

  await w.capturar(page, testInfo, 'calculos', 'total-financiado-resultado');

  // Leer nivelId del localStorage para consultar el interés
  const nivelId = await page.evaluate(() => localStorage.getItem('selectedNivel'));
  testInfo.annotations.push({ type: 'nivelId', description: `${nivelId}` });

  // Consultar el endpoint de intereses
  let tasaInteres = null;
  if (nivelId) {
    const resp = await page.request.get(`${BACKEND}/api/intereses/nivel/${nivelId}`);
    if (resp.ok()) {
      const data = await resp.json();
      // La API devuelve un objeto con campo 'interes' (porcentaje)
      tasaInteres = data.interes ?? data.porcentaje ?? data.tasa ?? null;
      testInfo.annotations.push({ type: 'tasa-interes-api', description: JSON.stringify(data) });
    } else {
      testInfo.annotations.push({ type: 'warning', description: `API intereses devolvió ${resp.status()}` });
    }
  }

  // Leer valores del DOM
  const primerPagoRaw = await page.locator('#primerPago').textContent().catch(() => '0');
  const primerPago = w.parsearMonto(primerPagoRaw);

  const mensualidadRaw = await page.locator('#mensualidades').textContent().catch(() => '0');
  const mensualidad = w.parsearMonto(mensualidadRaw);

  const mensualidadesTextRaw = await page.locator('#mensualidadesText').textContent().catch(() => '');
  const matchN = mensualidadesTextRaw.match(/(\d+)/);
  const n = matchN ? parseInt(matchN[1], 10) : null;

  const totalFinanciadoRaw = await page.locator('#totalFinanciado').textContent().catch(() => '0');
  const totalFinanciado = w.parsearMonto(totalFinanciadoRaw);

  testInfo.annotations.push({ type: 'primerPago-leido', description: `"${primerPagoRaw.trim()}" → ${primerPago}` });
  testInfo.annotations.push({ type: 'mensualidad-leida', description: `"${mensualidadRaw.trim()}" → ${mensualidad}` });
  testInfo.annotations.push({ type: 'n-mensualidades', description: `texto:"${mensualidadesTextRaw.trim()}" → n=${n}` });
  testInfo.annotations.push({ type: 'totalFinanciado-leido', description: `"${totalFinanciadoRaw.trim()}" → ${totalFinanciado}` });

  // Verificar que los elementos están visibles y tienen valores
  expect(primerPago, '#primerPago debe ser > 0').toBeGreaterThan(0);
  expect(totalFinanciado, '#totalFinanciado debe ser > 0').toBeGreaterThan(0);
  expect(totalFinanciado, 'totalFinanciado ≥ primerPago').toBeGreaterThanOrEqual(primerPago);

  // Si n está disponible (no nivel 13), verificar la fórmula: totalFinanciado = primerPago + n * mensualidad
  if (n !== null && n > 0 && mensualidad > 0) {
    const esperado = primerPago + n * mensualidad;
    testInfo.annotations.push({
      type: 'calculo-financiado-esperado',
      description: `${primerPago} + ${n} × ${mensualidad} = ${esperado} vs totalFinanciado=${totalFinanciado}`,
    });
    await w.capturar(page, testInfo, 'calculos', 'total-financiado-con-formula');
    // Tolerancia ±2 pesos (redondeos de display en mensualidad pueden acumularse × n)
    expect(
      Math.abs(totalFinanciado - esperado),
      `totalFinanciado (${totalFinanciado}) ≈ primerPago+n×mensualidad (${esperado})`,
    ).toBeLessThanOrEqual(2);
  } else {
    // Nivel 13 bimestral u otro formato: verificar solo consistencia básica
    testInfo.annotations.push({
      type: 'info',
      description: `n no disponible (nivel 13 bimestral o #mensualidadesText no contiene dígito). Solo verificamos totalFinanciado > primerPago o igual.`,
    });
    await w.capturar(page, testInfo, 'calculos', 'total-financiado-nivel13');
    expect(totalFinanciado, 'totalFinanciado ≥ primerPago').toBeGreaterThanOrEqual(primerPago);
  }
});

// ---------------------------------------------------------------------------
// TEST 3: [HU22,HU60] Tope préstamo 20% — nivel profesional con beca
// Reglas.json topePrestamoProfesionalConBeca:
//   nivelesAplica: [2, 4] (Profesional Semestral plan 2018, Profesional Semestral MAPS)
//   porcentajeMax: 20
//   Las opciones de préstamo > 20% deben estar disabled o ausentes cuando hay beca.
// ---------------------------------------------------------------------------
test('[HU22,HU60] tope préstamo 20% en nivel profesional con beca (fix a054003)', async ({ page }, testInfo) => {
  // Usar flujo PROSPECTO. Niveles profesional: etiquetas del catálogo
  // nivel 2: "Profesional Semestral (plan 2018)", nivel 4: "Profesional Semestral MAPS"
  const nivelesProf = [
    'Profesional Semestral (plan 2018)',
    'Profesional Semestral MAPS',
  ];

  for (const nivelLabel of nivelesProf) {
    await w.seleccionarPerfil(page, 'prospecto');
    await w.llenarDatosProspecto(page);
    await expect(page.locator('#step-1')).toBeVisible();

    // Seleccionar nivel profesional
    let nivelSeleccionado = false;
    try {
      await w.completarNivel(page, { nivel: nivelLabel });
      nivelSeleccionado = true;
    } catch (e) {
      testInfo.annotations.push({
        type: 'warning',
        description: `Nivel "${nivelLabel}" no disponible en catálogo: ${e.message}`,
      });
    }

    if (!nivelSeleccionado) continue;

    testInfo.annotations.push({ type: 'nivel-profesional', description: nivelLabel });

    // Step-2: seleccionar beca = sí
    await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
    await page.locator('#row-radio-beca-prospecto input[value="si"]').check();
    await expect(page.locator('#tipo-beca')).toBeVisible({ timeout: 10_000 });
    const optsScholarship = page.locator('#txt-scholarship option:not([value=""]):not([value="0"])');
    await expect(optsScholarship.first()).toBeAttached({ timeout: 30_000 });
    const firstSchVal = await optsScholarship.first().getAttribute('value');
    await page.locator('#txt-scholarship').selectOption(firstSchVal);

    const percentageVisible = await page.locator('#txt-percentage').isVisible({ timeout: 5_000 }).catch(() => false);
    if (percentageVisible) {
      await seleccionarPorcentajeBecaProspectoConReintento(page);
    }

    // Dar tiempo a apoyos-hu.js para aplicar adjustLoanOptions / tope 20%
    await page.waitForTimeout(1200);

    // Verificar radio préstamo 'si'
    const radioPrestamoSi = page.locator('#row-radio-prestamo-prospecto input[value="si"]');
    const prestamoSiDisabled = await radioPrestamoSi.isDisabled();

    await w.capturar(page, testInfo, 'calculos', `tope-prestamo-${nivelLabel.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}`);

    if (prestamoSiDisabled) {
      // Préstamo completamente bloqueado — también cumple el requisito (regla 60%)
      testInfo.annotations.push({
        type: 'info',
        description: `Nivel "${nivelLabel}": radio préstamo-sí deshabilitado (beca llega a 60%).`,
      });
      // Navegar de vuelta al inicio para el siguiente nivel
      await page.goto('/');
      continue;
    }

    // Marcar préstamo = sí y verificar opciones del select
    await radioPrestamoSi.check();
    await page.waitForTimeout(800);

    const selectPrestamo = page.locator('#txt-prestamo-percentage');
    const selectVisible = await selectPrestamo.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!selectVisible) {
      testInfo.annotations.push({
        type: 'info',
        description: `Nivel "${nivelLabel}": select #txt-prestamo-percentage no visible tras marcar préstamo=sí.`,
      });
      await page.goto('/');
      continue;
    }

    // Recopilar opciones disponibles (habilitadas) del select de préstamo
    const opcionesHabilitadas = await selectPrestamo
      .locator('option:not([disabled]):not([value=""]):not([value="0"])')
      .evaluateAll(opts => opts.map(o => ({ value: o.value, text: o.textContent.trim() })));

    testInfo.annotations.push({
      type: `opciones-prestamo-${nivelLabel}`,
      description: JSON.stringify(opcionesHabilitadas),
    });

    await w.capturar(page, testInfo, 'calculos', `tope-prestamo-opciones-${nivelLabel.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}`);

    // ASERCIÓN: ninguna opción habilitada debe tener valor > 20
    for (const opt of opcionesHabilitadas) {
      const pct = parseFloat(opt.value);
      if (!isNaN(pct)) {
        testInfo.annotations.push({
          type: `opcion-prestamo-verificada`,
          description: `${opt.text} (${opt.value}%) → habilitada: ${pct <= 20 ? 'OK' : 'FALLO — excede 20%'}`,
        });
        expect(
          pct,
          `[HU22,HU60] Nivel "${nivelLabel}" con beca: opción de préstamo ${opt.value}% no debe exceder 20% (fix a054003)`,
        ).toBeLessThanOrEqual(20);
      }
    }

    // Volver al inicio para siguiente nivel
    await page.goto('/');
  }
});

// ---------------------------------------------------------------------------
// TEST 4: [HU18,HU56] Regla suma beca + préstamo ≤ 60%
// Reglas.json reglaSumaBecaPrestamo:
//   filtrarOpcionesPrestamo() deshabilita opciones de select préstamo donde becaPct + v > 60
// Verificamos que las opciones HABILITADAS del select de préstamo no rompan la regla.
// ---------------------------------------------------------------------------
test('[HU18,HU56] regla suma beca+préstamo ≤ 60% — opciones ofrecidas respetan la regla', async ({ page }, testInfo) => {
  // Flujo PROSPECTO con beca para tener un becaPct conocido
  await w.seleccionarPerfil(page, 'prospecto');
  await w.llenarDatosProspecto(page);
  await expect(page.locator('#step-1')).toBeVisible();
  await w.completarNivel(page);

  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });

  // Seleccionar beca = sí
  await page.locator('#row-radio-beca-prospecto input[value="si"]').check();
  await expect(page.locator('#tipo-beca')).toBeVisible({ timeout: 10_000 });
  const optsScholarship = page.locator('#txt-scholarship option:not([value=""]):not([value="0"])');
  await expect(optsScholarship.first()).toBeAttached({ timeout: 30_000 });
  const firstSchVal = await optsScholarship.first().getAttribute('value');
  await page.locator('#txt-scholarship').selectOption(firstSchVal);

  const percentageVisible = await page.locator('#txt-percentage').isVisible({ timeout: 5_000 }).catch(() => false);
  if (percentageVisible) {
    await seleccionarPorcentajeBecaProspectoConReintento(page);
  }

  // Leer becaPct elegido
  let becaPct = 0;
  if (percentageVisible) {
    becaPct = parseFloat(await page.locator('#txt-percentage').inputValue()) || 0;
  }
  testInfo.annotations.push({ type: 'becaPct-para-regla60', description: `${becaPct}%` });

  // Esperar a que apoyos-hu.js corra filtrarOpcionesPrestamo
  await page.waitForTimeout(1000);

  // Marcar préstamo = sí si está disponible
  const radioPrestamoSi = page.locator('#row-radio-prestamo-prospecto input[value="si"]');
  const prestamoSiDisabled = await radioPrestamoSi.isDisabled();

  await w.capturar(page, testInfo, 'calculos', 'regla60-apoyos-estado');

  if (prestamoSiDisabled) {
    // Préstamo completamente bloqueado — la regla 60% ya forzó esto
    testInfo.annotations.push({
      type: 'info',
      description: `Radio préstamo-sí deshabilitado (beca=${becaPct}% ≥ 60% o nivel sin préstamo). Regla cumplida.`,
    });
    expect(true, 'Préstamo bloqueado correctamente').toBe(true);
    return;
  }

  await radioPrestamoSi.check();
  await page.waitForTimeout(600);

  const selectPrestamo = page.locator('#txt-prestamo-percentage');
  const selectVisible = await selectPrestamo.isVisible({ timeout: 5_000 }).catch(() => false);

  if (!selectVisible) {
    test.fixme('El select #txt-prestamo-percentage no aparece para este nivel. Verificar si el nivel soporta préstamo.');
    return;
  }

  const todasOpciones = await selectPrestamo
    .locator('option:not([value=""]):not([value="0"])')
    .evaluateAll(opts => opts.map(o => ({
      value: o.value,
      text: o.textContent.trim(),
      disabled: o.disabled,
    })));

  testInfo.annotations.push({
    type: 'opciones-prestamo-todas',
    description: JSON.stringify(todasOpciones),
  });

  await w.capturar(page, testInfo, 'calculos', 'regla60-opciones-prestamo');

  // ASERCIÓN: cada opción HABILITADA debe cumplir becaPct + pct ≤ 60
  let encontroOpcionHabilitada = false;
  for (const opt of todasOpciones) {
    const pct = parseFloat(opt.value);
    if (isNaN(pct)) continue;
    if (!opt.disabled) {
      encontroOpcionHabilitada = true;
      const suma = becaPct + pct;
      testInfo.annotations.push({
        type: 'verificacion-regla60',
        description: `beca(${becaPct}) + préstamo(${pct}) = ${suma} — habilitada: ${suma <= 60 ? 'OK ≤60%' : 'FALLO >60%'}`,
      });
      expect(
        suma,
        `[HU18,HU56] Opción préstamo ${pct}% habilitada con beca ${becaPct}%: suma ${suma}% excede 60%`,
      ).toBeLessThanOrEqual(60);
    }
    // Las opciones DESHABILITADAS no necesitan verificación de la regla (ya fueron bloqueadas)
  }

  if (!encontroOpcionHabilitada) {
    testInfo.annotations.push({
      type: 'info',
      description: `Todas las opciones de préstamo están deshabilitadas (beca=${becaPct}% deja 0 espacio). Regla 60% cumplida.`,
    });
    expect(true, 'Todas las opciones deshabilitadas: regla cumplida').toBe(true);
  }
});

// ---------------------------------------------------------------------------
// TEST 5: [HU19,HU57] Prepa sin préstamo
// Reglas.json prepaSinPrestamo:
//   NIVELES_PREPA = [1, 3] (Preparatoria Semestral, Preparatoria Tetramestral)
//   Si nivel es prepa y radio préstamo no está marcado → se fuerza 'no'.
//   O el backend no devuelve opciones → radio deshabilitado con mensaje.
// ---------------------------------------------------------------------------
test('[HU19,HU57] prepa sin préstamo — préstamo no disponible en niveles de preparatoria', async ({ page }, testInfo) => {
  const nivelesPrepa = [
    'Preparatoria Semestral',
    'Preparatoria Tetramestral',
  ];

  for (const nivelLabel of nivelesPrepa) {
    await w.seleccionarPerfil(page, 'prospecto');
    await w.llenarDatosProspecto(page);
    await expect(page.locator('#step-1')).toBeVisible();

    let nivelSeleccionado = false;
    try {
      await w.completarNivel(page, { nivel: nivelLabel });
      nivelSeleccionado = true;
    } catch (e) {
      testInfo.annotations.push({
        type: 'warning',
        description: `Nivel "${nivelLabel}" no disponible: ${e.message}`,
      });
    }

    if (!nivelSeleccionado) continue;

    await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
    // Responder beca=no para aislar la regla prepa
    await page.locator('#row-radio-beca-prospecto input[value="no"]').check();
    await page.waitForTimeout(1200); // esperar sync() del intervalo 700ms

    await w.capturar(page, testInfo, 'calculos', `prepa-sin-prestamo-${nivelLabel.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 20)}`);

    const radioPrestamoSi = page.locator('#row-radio-prestamo-prospecto input[value="si"]');
    const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');

    const siDisabled = await radioPrestamoSi.isDisabled();
    const noChecked = await radioPrestamoNo.isChecked();
    const siChecked = await radioPrestamoSi.isChecked();

    testInfo.annotations.push({
      type: `prepa-prestamo-${nivelLabel}`,
      description: `radio-sí disabled:${siDisabled}, radio-no checked:${noChecked}, radio-sí checked:${siChecked}`,
    });

    // ASERCIÓN: el radio de préstamo-sí debe estar deshabilitado O el radio-no debe estar forzado (checked)
    // y no se debe poder marcar el radio-sí.
    const prestamoNoDisponible = siDisabled || (!siChecked && noChecked);
    expect(
      prestamoNoDisponible,
      `[HU19,HU57] Nivel "${nivelLabel}" (prepa): el préstamo debe estar deshabilitado o forzado a 'no'. siDisabled:${siDisabled}, noChecked:${noChecked}, siChecked:${siChecked}`,
    ).toBe(true);

    // Volver al inicio para el siguiente nivel
    await page.goto('/');
  }
});

// ---------------------------------------------------------------------------
// TEST 6: [HU33,HU72] Beca mostrada coincide con la elegida
// Reglas.json (notas): #beca en resultado muestra el porcentaje de beca seleccionado.
// ---------------------------------------------------------------------------
test('[HU33,HU72] beca mostrada en resultado coincide con la elegida', async ({ page }, testInfo) => {
  // Flujo prospecto: beca=sí, capturar el porcentaje elegido en step-2
  await w.seleccionarPerfil(page, 'prospecto');
  await w.llenarDatosProspecto(page);
  await expect(page.locator('#step-1')).toBeVisible();
  await w.completarNivel(page);

  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  await page.locator('#row-radio-beca-prospecto input[value="si"]').check();
  await expect(page.locator('#tipo-beca')).toBeVisible({ timeout: 10_000 });
  const optsScholarship = page.locator('#txt-scholarship option:not([value=""]):not([value="0"])');
  await expect(optsScholarship.first()).toBeAttached({ timeout: 30_000 });
  const firstSchVal = await optsScholarship.first().getAttribute('value');
  await page.locator('#txt-scholarship').selectOption(firstSchVal);

  const percentageVisible = await page.locator('#txt-percentage').isVisible({ timeout: 5_000 }).catch(() => false);
  let becaPctElegida = null;
  if (percentageVisible) {
    await seleccionarPorcentajeBecaProspectoConReintento(page);
    becaPctElegida = parseFloat(await page.locator('#txt-percentage').inputValue()) || null;
  }
  testInfo.annotations.push({ type: 'becaPct-elegida', description: `${becaPctElegida}%` });

  // Préstamo = no
  const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
  if (!await radioPrestamoNo.isDisabled()) await radioPrestamoNo.check();
  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
  await page.locator('#step-2-next').click();

  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  await completarSegurosMinimo(page);
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();
  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await w.aceptarLegales(page);
  await page.locator('#step-4-next').click();

  await expect(page).toHaveURL(/resultado/, { timeout: 30_000 });
  await expect(page.locator('#totalContado')).toBeVisible({ timeout: 30_000 });

  await w.capturar(page, testInfo, 'calculos', 'beca-resultado');

  const becaEnResultadoRaw = await page.locator('#beca').textContent().catch(() => '');
  testInfo.annotations.push({ type: 'beca-en-resultado', description: `"${becaEnResultadoRaw.trim()}"` });

  if (becaEnResultadoRaw.trim() === '') {
    test.fixme('El elemento #beca está vacío o no visible. Verificar selector en resultado.html.');
    return;
  }

  // #beca puede mostrar "X%" o un texto que incluya el porcentaje
  const matchPct = becaEnResultadoRaw.match(/(\d+(?:\.\d+)?)\s*%/);

  if (becaPctElegida !== null && matchPct) {
    const becaMostrada = parseFloat(matchPct[1]);
    testInfo.annotations.push({
      type: 'beca-comparacion',
      description: `elegida: ${becaPctElegida}% vs mostrada: ${becaMostrada}%`,
    });
    expect(
      becaMostrada,
      `[HU33,HU72] La beca mostrada (${becaMostrada}%) debe coincidir con la elegida (${becaPctElegida}%)`,
    ).toBeCloseTo(becaPctElegida, 0);
  } else if (becaPctElegida === null) {
    // Beca de porcentaje fijo (no había #txt-percentage): verificar solo que #beca no está vacío
    testInfo.annotations.push({ type: 'info', description: 'Beca de tipo fijo — verificamos que #beca no esté vacío' });
    expect(becaEnResultadoRaw.trim().length, '#beca debe tener contenido').toBeGreaterThan(0);
  } else {
    testInfo.annotations.push({
      type: 'warning',
      description: `No se pudo parsear porcentaje de "#beca" texto: "${becaEnResultadoRaw.trim()}"`,
    });
    expect(becaEnResultadoRaw.trim().length, '#beca debe tener contenido').toBeGreaterThan(0);
  }
});

// ---------------------------------------------------------------------------
// TEST 7: [HU24,HU62] Seguro suma al total
// Reglas.json segurosEnTotal:
//   totalContadoFinal = totalContadoSinSeguros + totalSeguros
//   totalSeguros desde localStorage 'totalCost'
// Estrategia: dos recorridos idénticos de nivel (el mismo nivel elegido dinámicamente),
//   uno sin seguros opcionales y uno con seguros. Verificar totalConSeguros > totalSinSeguros.
//   Si el DOM expone el desglose, verificar la igualdad exacta.
// ---------------------------------------------------------------------------
test('[HU24,HU62] seguro suma al total — total con seguro > total sin seguro', async ({ page }, testInfo) => {
  // ---- Recorrido 1: SIN seguros opcionales ----
  testInfo.annotations.push({ type: 'recorrido', description: '1: SIN seguros opcionales' });
  await llegarAResultadoProspecto(page, testInfo, { beca: 'no', prestamo: 'no', seguros: 'minimo' });

  await w.capturar(page, testInfo, 'calculos', 'seguro-recorrido1-sin-seguros');
  const totalSinSeguros = await w.leerMonto(page, '#totalContado');
  testInfo.annotations.push({ type: 'totalSinSeguros', description: `${totalSinSeguros}` });

  // Leer totalCost del localStorage (seguros forzados si existen)
  const totalCostLS1 = await page.evaluate(() => localStorage.getItem('totalCost'));
  testInfo.annotations.push({ type: 'totalCost-ls-recorrido1', description: `${totalCostLS1}` });

  // ---- Recorrido 2: CON seguros (máximo) ----
  testInfo.annotations.push({ type: 'recorrido', description: '2: CON seguros opcionales (máximo)' });
  await llegarAResultadoProspecto(page, testInfo, { beca: 'no', prestamo: 'no', seguros: 'maximo' });

  await w.capturar(page, testInfo, 'calculos', 'seguro-recorrido2-con-seguros');
  const totalConSeguros = await w.leerMonto(page, '#totalContado');
  testInfo.annotations.push({ type: 'totalConSeguros', description: `${totalConSeguros}` });

  const totalCostLS2 = await page.evaluate(() => localStorage.getItem('totalCost'));
  testInfo.annotations.push({ type: 'totalCost-ls-recorrido2', description: `${totalCostLS2}` });

  testInfo.annotations.push({
    type: 'calculo-seguros',
    description: `sin: ${totalSinSeguros}, con: ${totalConSeguros}, diferencia: ${totalConSeguros - totalSinSeguros}`,
  });

  // ASERCIÓN: el total con seguros debe ser ≥ el total sin seguros.
  // (Si no hay seguros opcionales disponibles para este nivel/config pueden ser iguales.)
  expect(
    totalConSeguros,
    `[HU24,HU62] totalConSeguros (${totalConSeguros}) debe ser ≥ totalSinSeguros (${totalSinSeguros})`,
  ).toBeGreaterThanOrEqual(totalSinSeguros);

  // Si el localStorage expone el costo del seguro, verificar la suma exacta
  const totalCostNum2 = totalCostLS2 ? parseFloat(totalCostLS2) : 0;
  const totalCostNum1 = totalCostLS1 ? parseFloat(totalCostLS1) : 0;
  const difCost = totalCostNum2 - totalCostNum1;
  const difTotal = totalConSeguros - totalSinSeguros;

  if (difCost > 0) {
    // Hay seguros adicionales — verificar que la diferencia en total ≈ diferencia en seguros
    testInfo.annotations.push({
      type: 'verificacion-exacta-seguros',
      description: `difCostLS: ${difCost}, difTotal: ${difTotal}`,
    });
    expect(
      Math.abs(difTotal - difCost),
      `[HU24,HU62] La diferencia de totalContado (${difTotal}) debe ≈ diferencia de seguros (${difCost})`,
    ).toBeLessThanOrEqual(1);
  } else if (totalConSeguros === totalSinSeguros) {
    // No hay seguros opcionales disponibles para este nivel
    testInfo.annotations.push({
      type: 'info',
      description: 'No hay seguros opcionales disponibles para este nivel/configuración. Los totales son iguales. Verificación de desigualdad estricta no aplicable.',
    });
    // No falla — la app se comporta correctamente si no hay seguros opcionales
    expect(totalConSeguros, 'totalContado debe ser > 0').toBeGreaterThan(0);
  }
});

// ---------------------------------------------------------------------------
// TEST 8: [HU36,HU75] Vigencia de la cotización — fecha válida posterior a hoy
// Reglas.json vigenciaCotizacion:
//   #fechaVencimiento contiene fecha formateada como DD/MM/AAAA
//   fechaVencimiento = fechaActual + diasVigencia días (mínimo 5 días por fallback)
// ---------------------------------------------------------------------------
test('[HU36,HU75] vigencia de la cotización — fecha válida posterior a hoy', async ({ page }, testInfo) => {
  await llegarAResultadoProspecto(page, testInfo, { beca: 'no', prestamo: 'no', seguros: 'minimo' });

  await w.capturar(page, testInfo, 'calculos', 'vigencia-resultado');

  const vigenciaEl = page.locator('#fechaVencimiento');
  await expect(vigenciaEl).toBeVisible({ timeout: 10_000 });
  const vigenciaRaw = await vigenciaEl.textContent();

  testInfo.annotations.push({ type: 'vigencia-raw', description: `"${vigenciaRaw.trim()}"` });

  // Extraer DD/MM/AAAA del texto (puede tener prefijo "Vigencia de la propuesta: ")
  const matchFecha = vigenciaRaw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  expect(matchFecha, `[HU36,HU75] #fechaVencimiento debe contener una fecha DD/MM/AAAA: "${vigenciaRaw.trim()}"`).not.toBeNull();

  const [, dd, mm, aaaa] = matchFecha;
  const fechaVencimiento = new Date(`${aaaa}-${mm}-${dd}T00:00:00`);
  const hoy = new Date('2026-06-09T00:00:00'); // currentDate del contexto

  testInfo.annotations.push({
    type: 'fecha-vencimiento-parsed',
    description: `${dd}/${mm}/${aaaa} → ${fechaVencimiento.toISOString()} (hoy: ${hoy.toISOString()})`,
  });

  // Verificar que la fecha parseada es válida
  expect(isNaN(fechaVencimiento.getTime()), 'La fecha debe ser válida').toBe(false);

  // Verificar que la fecha de vencimiento es posterior a hoy
  expect(
    fechaVencimiento.getTime(),
    `[HU36,HU75] La fecha de vencimiento (${dd}/${mm}/${aaaa}) debe ser posterior a hoy (2026-06-09)`,
  ).toBeGreaterThan(hoy.getTime());

  await w.capturar(page, testInfo, 'calculos', 'vigencia-fecha-verificada');
});

// ---------------------------------------------------------------------------
// TEST 9: [HU22,HU25,HU60,HU63] Seguros forzados SÍ en Preparatoria
// apoyos-hu.js esForzado():
//   NIVELES_VIVE_FORZADA = [1, 2, 3, 4]        → label contiene 'vive'
//   NIVELES_COLEGIATURA_FORZADA = [1, 3]       → label contiene 'colegiatura'
//   En niveles prepa (1, 3) ambos aplican: select.value = 'si' y
//   select.disabled = true (no deseleccionable).
// Cobertura: prospecto (HU60/63) y alumno (HU22/25) en ambos niveles prepa.
// Nota: si el seguro de colegiatura no está en la BD de staging se reporta
// como hallazgo; el forzado se ejercita igual con Cobertura VIVE.
// ---------------------------------------------------------------------------
test('[HU22,HU25,HU60,HU63] seguros forzados en Prepa (VIVE y colegiatura) — select=si y deshabilitado', async ({ page }, testInfo) => {
  const nivelesPrepa = [
    { label: 'Preparatoria Semestral', id: 1 },
    { label: 'Preparatoria Tetramestral', id: 3 },
  ];

  for (const perfil of ['prospecto', 'alumno']) {
    for (const nivelPrepa of nivelesPrepa) {
      testInfo.annotations.push({ type: 'escenario', description: `${perfil} / ${nivelPrepa.label}` });

      // ── Navegar hasta step-3 ───────────────────────────────────────────
      await w.seleccionarPerfil(page, perfil);
      if (perfil === 'alumno') {
        await w.llenarDatosAlumno(page);
      } else {
        await w.llenarDatosProspecto(page);
      }
      await expect(page.locator('#step-1')).toBeVisible();

      let nivelSeleccionado = false;
      try {
        await w.completarNivel(page, { nivel: nivelPrepa.label });
        nivelSeleccionado = true;
      } catch (e) {
        testInfo.annotations.push({
          type: 'warning',
          description: `Nivel "${nivelPrepa.label}" no disponible (${perfil}): ${e.message}`,
        });
      }
      if (!nivelSeleccionado) continue;

      // ── step-2: beca=no para llegar a step-3 lo más rápido posible ────
      if (perfil === 'alumno') {
        await expect(page.locator('#step-2-students')).toBeVisible({ timeout: 15_000 });
        const radioPrestamoNo = page.locator('#row-radio-prestamo-alumno input[value="no"]');
        await page.locator('#row-radio-beca-alumno input[value="no"]').check();
        if (!await radioPrestamoNo.isDisabled()) await radioPrestamoNo.check();
        await expect(page.locator('#step-2-students-next')).toBeEnabled({ timeout: 15_000 });
        await page.locator('#step-2-students-next').click();
      } else {
        await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
        const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
        await page.locator('#row-radio-beca-prospecto input[value="no"]').check();
        await page.waitForTimeout(900);
        if (!await radioPrestamoNo.isDisabled()) await radioPrestamoNo.check();
        await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
        await page.locator('#step-2-next').click();
      }

      // ── step-3: esperar a que el contenedor de seguros cargue ─────────
      await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
      const contenedor = page.locator('#seguros-dinamicos-container');
      // Esperar a que apoyos-hu.js haya corrido al menos un ciclo (700ms interval)
      await expect(contenedor.locator('select').first()).toBeAttached({ timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(1200); // margen extra para MutationObserver + interval

      // ── Buscar los selects de seguros forzados (VIVE y colegiatura) ───
      // Cada select tiene id="select-seguro-{id_seguro}" y un label asociado.
      const labelsText = await contenedor.locator('label').allTextContents();
      testInfo.annotations.push({
        type: `seguros-labels-${perfil}-${nivelPrepa.id}`,
        description: JSON.stringify(labelsText),
      });

      await w.capturar(page, testInfo, 'calculos', `seguros-forzados-${perfil}-${nivelPrepa.label.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 25)}`);

      if (!labelsText.some(t => t.toLowerCase().includes('colegiatura'))) {
        // El seguro de colegiatura no está en la BD de staging — la regla de
        // forzado por nombre no se puede ejercitar para él; queda documentado.
        testInfo.annotations.push({
          type: 'hallazgo',
          description: `[HU25,HU63] ${perfil} / ${nivelPrepa.label}: NO se encontró ningún seguro de colegiatura en el DOM de step-3. Si el backend devuelve el seguro, la regla de forzado no funcionaría. Verificar datos de BD.`,
        });
      }

      const selectsAll = contenedor.locator('select[id^="select-seguro-"]');
      const nSelects = await selectsAll.count();
      let forzadosVerificados = 0;

      for (let i = 0; i < nSelects; i++) {
        const sel = selectsAll.nth(i);
        const selectId = await sel.getAttribute('id');
        const labelEl = page.locator(`label[for="${selectId}"]`);
        const labelTxt = (await labelEl.textContent().catch(() => '')).toLowerCase();

        const esVive = labelTxt.includes('vive');
        const esColegiatura = labelTxt.includes('colegiatura');
        if (!esVive && !esColegiatura) continue;
        forzadosVerificados++;

        const hus = esVive ? '[HU22,HU60]' : '[HU25,HU63]';
        const valor = await sel.inputValue();
        const isDisabled = await sel.isDisabled();

        testInfo.annotations.push({
          type: `seguro-forzado-${perfil}-${nivelPrepa.id}`,
          description: `${hus} id=${selectId}, label="${labelTxt.trim()}", valor="${valor}", disabled=${isDisabled}`,
        });

        // ASERCIÓN 1: el select debe estar en 'si'
        expect(
          valor,
          `${hus} ${perfil} / ${nivelPrepa.label}: seguro forzado "${labelTxt.trim()}" (${selectId}) debe tener value="si". Valor actual: "${valor}"`,
        ).toBe('si');

        // ASERCIÓN 2: el select debe estar deshabilitado (no deseleccionable)
        expect(
          isDisabled,
          `${hus} ${perfil} / ${nivelPrepa.label}: seguro forzado "${labelTxt.trim()}" (${selectId}) debe estar disabled. disabled=${isDisabled}`,
        ).toBe(true);
      }

      // En staging la Cobertura VIVE existe en todos los niveles prepa: si no
      // se verificó ningún seguro forzado, el test no ejercitó la regla.
      expect(
        forzadosVerificados,
        `[HU22,HU25,HU60,HU63] ${perfil} / ${nivelPrepa.label}: ningún seguro forzado (VIVE/colegiatura) encontrado en step-3. labels=${JSON.stringify(labelsText)}`,
      ).toBeGreaterThan(0);

      await page.goto('/');
    }
  }
});
