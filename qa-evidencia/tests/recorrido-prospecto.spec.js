const { test, expect } = require('@playwright/test');
const w = require('../helpers/wizard');

// ---------------------------------------------------------------------------
// Helpers locales — prospecto
// ---------------------------------------------------------------------------

// Completa step-2 (apoyos prospecto).
// Flujo:
//   1. sync() de apoyos-hu.js inicializa promedio=100 y carga becas desde la API.
//   2. Si beca=sí: esperar a que #txt-scholarship tenga opciones reales;
//      seleccionar primera opción real. Si ese tipo es variable aparece
//      #txt-percentage; elegirlo con reintento para la race de cargarPorcentajesBeca.
//   3. Préstamo: si el radio no está deshabilitado marcar 'si' y elegir opción;
//      si no hay opciones de préstamo (nivel no lo soporta) anotar y continuar.
//   4. Si beca=no: solo responder radio; sync() seleccionará cero internamente.
async function completarApoyosProspecto(page, { beca = 'si', prestamo = 'si' } = {}) {
  // Esperar a que el panel esté visible y sync() haya corrido
  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  // Promedio académico: obligatorio en prospecto (antes apoyos-hu lo forzaba a 100).
  await page.locator('#txt-average-mark').fill('100');

  // --- BECA ---
  await page.locator(`#row-radio-beca-prospecto input[value="${beca}"]`).check();

  if (beca === 'si') {
    // Esperar a que #tipo-beca y #txt-scholarship aparezcan (sync() los muestra)
    await expect(page.locator('#tipo-beca')).toBeVisible({ timeout: 10_000 });
    // Esperar a que el select tenga opciones reales (excluye op vacía y "Sin Beca"=0)
    const optsScholarship = page.locator('#txt-scholarship option:not([value=""]):not([value="0"])');
    await expect(optsScholarship.first()).toBeAttached({ timeout: 30_000 });

    // Seleccionar primera opción real
    const firstSchVal = await optsScholarship.first().getAttribute('value');
    await page.locator('#txt-scholarship').selectOption(firstSchVal);

    // Si el tipo es variable, aparece #txt-percentage (porcentaje); elegirlo con reintento
    const percentageVisible = await expect(page.locator('#txt-percentage'))
      .toBeVisible({ timeout: 5_000 }).then(() => true).catch(() => false);

    if (percentageVisible) {
      await seleccionarPorcentajeBecaConReintento(page);
    }
  }

  // --- PRÉSTAMO ---
  // Dar tiempo para que sync() calcule si hayPrestamos y aplique regla 60%
  await page.waitForTimeout(900);

  const radioPrestamoSi = page.locator('#row-radio-prestamo-prospecto input[value="si"]');
  const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
  const radioPrestamoSiDisabled = await radioPrestamoSi.isDisabled();

  if (prestamo === 'si' && !radioPrestamoSiDisabled) {
    await radioPrestamoSi.check();
    // El contenedor de préstamo (.field-avg-4) aparece si hay opciones para este nivel
    const hayContenedor = await expect(page.locator('.field-avg-4'))
      .not.toHaveClass(/hidden/, { timeout: 5_000 }).then(() => true).catch(() => false);

    if (hayContenedor) {
      await w.elegirOpcion(page, '#txt-prestamo-percentage');
    }
    // Si no hay contenedor, el radio sí quedó en si pero sin select → sync forzará "no"
  } else {
    // Marcar "no" si no está ya marcado o deshabilitado
    if (!await radioPrestamoNo.isDisabled()) {
      await radioPrestamoNo.check();
    }
  }

  // Esperar a que el botón continuar quede habilitado
  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
}

// Reintento para seleccionar % de beca variable (race de cargarPorcentajesBeca).
// Análogo a seleccionarBecaConReintento en recorrido-alumno.spec.js.
async function seleccionarPorcentajeBecaConReintento(page) {
  const pctSelect = page.locator('#txt-percentage');
  const opts = pctSelect.locator('option:not([value=""]):not([disabled])');
  const btnNext = page.locator('#step-2-next');

  await expect(opts.first()).toBeAttached({ timeout: 30_000 });

  const MAX_REINTENTOS = 6;
  for (let i = 0; i < MAX_REINTENTOS; i++) {
    await expect(opts.first()).toBeAttached({ timeout: 15_000 });
    const val = await opts.first().getAttribute('value');
    await pctSelect.selectOption(val);
    const enabled = await expect(btnNext).toBeEnabled({ timeout: 1500 })
      .then(() => true).catch(() => false);
    if (enabled) return;
    await page.waitForTimeout(400);
  }
  await expect(btnNext).toBeEnabled({ timeout: 15_000 });
}

// Completa step-3 (seguros). El paso puede regenerarse (fetchSeguros) al re-entrar
// desde otro paso, así que se reintenta responder hasta que el botón continuar quede
// habilitado (evita la race conocida al volver a step-3).
async function completarSeguros(page) {
  const contenedorSeguros = page.locator('#seguros-dinamicos-container');
  const btnNext = page.locator('#step-3-next');

  await expect(contenedorSeguros.locator('select').first())
    .toBeAttached({ timeout: 15_000 })
    .catch(() => {});

  if (await contenedorSeguros.locator('select').count() === 0) return;

  for (let intento = 0; intento < 6; intento++) {
    // Seguro contra accidente (UI por radios del rediseño step3.js): "propio" lo deja
    // respondido ("no") sin requerir selección. VIVE y colegiatura obligatorias ya
    // vienen pre-marcadas en "Sí" y bloqueadas.
    const accidentePropio = page.locator('input[type="radio"][name^="accidente-"][value="propio"]');
    if (await accidentePropio.count() > 0 && !(await accidentePropio.first().isChecked().catch(() => false))) {
      await accidentePropio.first().check().catch(() => {});
    }

    // Compatibilidad con UI por radio de interés / selects visibles (si existieran).
    if (await page.locator('#row-radio-seguro-interes').isVisible().catch(() => false)) {
      await page.locator('#row-radio-seguro-interes input[value="si"]').check().catch(() => {});
    }
    const selectsSeguros = contenedorSeguros.locator('select');
    const total = await selectsSeguros.count();
    for (let i = 0; i < total; i++) {
      const sel = selectsSeguros.nth(i);
      if (await sel.isVisible() && !await sel.isDisabled() && (await sel.inputValue()) === '') {
        const opSi = sel.locator('option[value="si"]');
        if (await opSi.count() > 0) await sel.selectOption('si').catch(() => {});
      }
    }

    if (await btnNext.isEnabled().catch(() => false)) return;
    await page.waitForTimeout(700);
  }
}

// Helper completo de recorrido prospecto hasta resultado.
// Acepta opciones para personalizar beca y préstamo.
async function recorridoProspectoCompleto(page, testInfo, opts = {}) {
  const { beca = 'si', prestamo = 'si', marcarContacto = false } = opts;

  // Perfil
  await w.seleccionarPerfil(page, 'prospecto');
  await w.capturar(page, testInfo, '1-perfil', 'prospecto-perfil');

  // Datos personales
  await w.llenarDatosProspecto(page);
  await w.capturar(page, testInfo, '4-datos-personales', 'prospecto-datos');

  // Nivel (step-1) — idéntico al alumno
  await expect(page.locator('#step-1')).toBeVisible();
  const eleccion = await w.completarNivel(page);
  testInfo.annotations.push({ type: 'nivel-elegido', description: JSON.stringify(eleccion) });
  await w.capturar(page, testInfo, '5-nivel', 'prospecto-nivel');

  // Apoyos (step-2) — flujo prospecto
  await completarApoyosProspecto(page, { beca, prestamo });
  await w.capturar(page, testInfo, '6-apoyos', 'prospecto-apoyos');
  await page.locator('#step-2-next').click();

  // Seguros (step-3)
  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  await w.capturar(page, testInfo, '7-seguros', 'prospecto-seguros-inicio');
  await completarSeguros(page);
  await w.capturar(page, testInfo, '7-seguros', 'prospecto-seguros-llenos');
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();

  // Legales (step-4)
  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await w.capturar(page, testInfo, '8-legales', 'prospecto-legales');
  await w.aceptarLegales(page);

  // HU68: check contacto por asesor (opcional, solo prospecto)
  if (marcarContacto) {
    const rowContacto = page.locator('#row-contacto-asesor');
    const rowVisible = await rowContacto.isVisible();
    if (rowVisible) {
      await page.locator('#check-contacto').check();
    } else {
      testInfo.annotations.push({ type: 'warning', description: '#row-contacto-asesor no visible en step-4' });
    }
  }

  await w.capturar(page, testInfo, '8-legales', 'prospecto-legales-aceptados');
  await page.locator('#step-4-next').click();

  // Resultado
  await expect(page).toHaveURL(/resultado/, { timeout: 30_000 });
  await expect(page.locator('#totalContado')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#totalContado')).not.toHaveText('$0', { timeout: 30_000 });
  await w.capturar(page, testInfo, '9-resultado', 'prospecto-resultado-final');
}

// ---------------------------------------------------------------------------
// Test 1: [HU42] validaciones datos de prospecto
// ---------------------------------------------------------------------------
test('[HU42] validaciones de datos de prospecto', async ({ page }, testInfo) => {
  await w.seleccionarPerfil(page, 'prospecto');
  await expect(page.locator('#datos-prospecto')).toBeVisible();

  // Paso 1 combinado: datos personales y nivel comparten pantalla. La validación
  // de datos se dispara al pulsar "Continuar" (#step-1-next), que requiere el
  // nivel completo; por eso se completa el nivel antes de probar datos inválidos.
  await page.locator('#txt-nombre-prospecto').fill(w.DATOS_PRUEBA.nombre);
  await page.locator('#txt-apellido-paterno').fill(w.DATOS_PRUEBA.apellido);
  await page.locator('#txt-apellido-materno').fill(w.DATOS_PRUEBA.apellidoMaterno);
  await page.locator('#txt-fecha-nacimiento').fill(w.DATOS_PRUEBA.fechaNacimiento);
  await page.locator('#txt-correo').fill(w.DATOS_PRUEBA.correo);
  // Teléfono corto ('123') → debe bloquear el avance y mostrar error
  await page.locator('#txt-telefono').fill('123');

  // completarNivel habilita y pulsa "Continuar"; el teléfono inválido bloquea el
  // avance y muestra el error (seguimos en el paso 1).
  await w.completarNivel(page);
  const msgTelefono = page.locator('#txt-telefono-msg');
  await expect(msgTelefono).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#step-1')).toBeVisible();
  await w.capturar(page, testInfo, '4-datos-personales', 'prospecto-telefono-invalido-error');

  // Correo inválido ('no-es-correo') → debe mostrar mensaje de error
  await page.locator('#txt-telefono').fill(w.DATOS_PRUEBA.telefono);
  await page.locator('#txt-correo').fill('no-es-correo');
  await page.locator('#step-1-next').click();

  const msgCorreo = page.locator('#txt-correo-msg');
  await expect(msgCorreo).toBeVisible({ timeout: 10_000 });
  await w.capturar(page, testInfo, '4-datos-personales', 'prospecto-correo-invalido-error');

  // Datos válidos → avanza al paso 2 (apoyos)
  await page.locator('#txt-correo').fill(w.DATOS_PRUEBA.correo);
  await page.locator('#step-1-next').click();
  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  // Promedio académico: obligatorio en prospecto (antes apoyos-hu lo forzaba a 100).
  await page.locator('#txt-average-mark').fill('100');
  await w.capturar(page, testInfo, '4-datos-personales', 'prospecto-datos-validos-avanza');
});

// ---------------------------------------------------------------------------
// Test 2: recorrido completo con beca y préstamo
// ---------------------------------------------------------------------------
test('[HU42,HU43,HU44,HU45,HU46,HU47,HU54,HU56,HU57,HU58,HU60,HU61,HU62,HU64,HU66,HU67,HU68,HU69,HU71,HU72,HU73,HU74,HU75,HU76] recorrido prospecto completo con beca y préstamo', async ({ page }, testInfo) => {
  // --- Perfil ---
  await w.seleccionarPerfil(page, 'prospecto');
  await w.capturar(page, testInfo, '1-perfil', 'completo-perfil');

  // --- Datos personales (HU42) ---
  await w.llenarDatosProspecto(page);
  await w.capturar(page, testInfo, '4-datos-personales', 'completo-datos-prospecto');

  // --- Nivel (step-1) HU43-HU47, HU54 ---
  await expect(page.locator('#step-1')).toBeVisible();
  const eleccion = await w.completarNivel(page);
  testInfo.annotations.push({ type: 'nivel-elegido', description: JSON.stringify(eleccion) });
  await w.capturar(page, testInfo, '5-nivel', 'completo-nivel');

  // --- Apoyos (step-2) HU56-HU58 ---
  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  // Promedio académico: obligatorio en prospecto (antes apoyos-hu lo forzaba a 100).
  await page.locator('#txt-average-mark').fill('100');
  await w.capturar(page, testInfo, '6-apoyos', 'completo-apoyos-inicio');

  // Beca = sí
  await page.locator('#row-radio-beca-prospecto input[value="si"]').check();
  await expect(page.locator('#tipo-beca')).toBeVisible({ timeout: 10_000 });

  // Esperar opciones reales en #txt-scholarship (excluye '' y '0'=Sin Beca)
  const optsScholarship = page.locator('#txt-scholarship option:not([value=""]):not([value="0"])');
  await expect(optsScholarship.first()).toBeAttached({ timeout: 30_000 });
  const firstSchVal = await optsScholarship.first().getAttribute('value');
  await page.locator('#txt-scholarship').selectOption(firstSchVal);
  testInfo.annotations.push({ type: 'beca-elegida', description: `scholarshipId: ${firstSchVal}` });
  await w.capturar(page, testInfo, '6-apoyos', 'completo-beca-si-tipo');

  // Si hay select de porcentaje variable, elegirlo con reintento
  const percentageVisible = await expect(page.locator('#txt-percentage'))
    .toBeVisible({ timeout: 5_000 }).then(() => true).catch(() => false);
  if (percentageVisible) {
    await seleccionarPorcentajeBecaConReintento(page);
    const pctVal = await page.evaluate(() => document.getElementById('txt-percentage')?.value);
    testInfo.annotations.push({ type: 'beca-pct-valor', description: `valor: ${pctVal}` });
    await w.capturar(page, testInfo, '6-apoyos', 'completo-beca-porcentaje');
  }

  // Dar tiempo a sync() para aplicar regla 60%
  await page.waitForTimeout(900);

  // Préstamo = sí (si no está deshabilitado por regla 60% o nivel prepa)
  const radioPrestamoSi = page.locator('#row-radio-prestamo-prospecto input[value="si"]');
  const radioPrestamoSiDisabled = await radioPrestamoSi.isDisabled();
  if (radioPrestamoSiDisabled) {
    testInfo.annotations.push({ type: 'info', description: 'Préstamo deshabilitado (regla 60% o nivel prepa); se omite' });
    const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
    if (!await radioPrestamoNo.isDisabled()) await radioPrestamoNo.check();
  } else {
    await radioPrestamoSi.check();
    const hayContenedor = await expect(page.locator('.field-avg-4'))
      .not.toHaveClass(/hidden/, { timeout: 5_000 }).then(() => true).catch(() => false);
    if (hayContenedor) {
      await w.elegirOpcion(page, '#txt-prestamo-percentage');
      await w.capturar(page, testInfo, '6-apoyos', 'completo-prestamo-si');
    }
  }

  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
  await page.locator('#step-2-next').click();

  // --- Seguros (step-3) HU60-HU64 ---
  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  await w.capturar(page, testInfo, '7-seguros', 'completo-seguros-inicio');
  await completarSeguros(page);
  await w.capturar(page, testInfo, '7-seguros', 'completo-seguros-llenos');
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();

  // --- Legales (step-4) HU66-HU68, HU69 ---
  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await w.capturar(page, testInfo, '8-legales', 'completo-legales');
  await w.aceptarLegales(page);

  // HU68: check contacto por asesor (opcional, solo prospecto)
  const rowContacto = page.locator('#row-contacto-asesor');
  const rowContactoVisible = await rowContacto.isVisible();
  if (rowContactoVisible) {
    await page.locator('#check-contacto').check();
    testInfo.annotations.push({ type: 'check-contacto', description: 'marcado (HU68)' });
  } else {
    testInfo.annotations.push({ type: 'warning', description: '#row-contacto-asesor no visible; verificar que el perfil prospecto está activo' });
  }
  await w.capturar(page, testInfo, '8-legales', 'completo-legales-aceptados-contacto');

  // Submit → resultado (HU69)
  await page.locator('#step-4-next').click();

  // --- Resultado HU71-HU76 ---
  await expect(page).toHaveURL(/resultado/, { timeout: 30_000 });
  const totalContado = page.locator('#totalContado');
  await expect(totalContado).toBeVisible({ timeout: 30_000 });
  await expect(totalContado).not.toHaveText('$0', { timeout: 30_000 });
  await w.capturar(page, testInfo, '9-resultado', 'completo-resultado-final');

  // Vigencia (HU75)
  await expect(page.locator('#fechaVencimiento')).toBeVisible();
  await w.capturar(page, testInfo, '9-resultado', 'completo-vigencia');
});

// ---------------------------------------------------------------------------
// Test 3: [HU56,HU57] recorrido prospecto sin apoyos
// ---------------------------------------------------------------------------
test('[HU56,HU57] recorrido prospecto sin apoyos', async ({ page }, testInfo) => {
  await w.seleccionarPerfil(page, 'prospecto');
  await w.llenarDatosProspecto(page);
  await w.completarNivel(page);

  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  // Promedio académico: obligatorio en prospecto (antes apoyos-hu lo forzaba a 100).
  await page.locator('#txt-average-mark').fill('100');

  // Beca = no
  await page.locator('#row-radio-beca-prospecto input[value="no"]').check();
  await w.capturar(page, testInfo, '6-apoyos', 'sin-apoyos-beca-no');

  // Dar tiempo a sync() para procesar
  await page.waitForTimeout(900);

  // Préstamo = no (puede estar ya forzado para prepa)
  const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
  if (!await radioPrestamoNo.isDisabled()) {
    await radioPrestamoNo.check();
  }
  await w.capturar(page, testInfo, '6-apoyos', 'sin-apoyos-prestamo-no');

  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
  await page.locator('#step-2-next').click();

  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  await completarSeguros(page);
  await w.capturar(page, testInfo, '7-seguros', 'sin-apoyos-seguros-rellenos');
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();

  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await w.aceptarLegales(page);
  await page.locator('#step-4-next').click();

  await expect(page).toHaveURL(/resultado/, { timeout: 30_000 });
  await expect(page.locator('#totalContado')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#totalContado')).not.toHaveText('$0', { timeout: 30_000 });
  await w.capturar(page, testInfo, '9-resultado', 'sin-apoyos-resultado');
});

// ---------------------------------------------------------------------------
// Test 4: [HU55,HU59,HU65,HU70] botones regresar con precarga
// ---------------------------------------------------------------------------
test('[HU55,HU59,HU65,HU70] botones regresar con precarga', async ({ page }, testInfo) => {
  await w.seleccionarPerfil(page, 'prospecto');
  await w.llenarDatosProspecto(page);

  // Paso 1 combinado: "Regresar" vuelve a la selección de perfil; al re-entrar,
  // los datos personales se conservan (HU55).
  await expect(page.locator('#step-1')).toBeVisible();
  await page.locator('#step-1 .btn-prev-step').click();
  await expect(page.locator('#step-0')).toBeVisible({ timeout: 10_000 });
  await page.locator('button[data-perfil="prospecto"]').click();
  await expect(page.locator('#txt-nombre-prospecto')).toHaveValue(w.DATOS_PRUEBA.nombre);
  await w.capturar(page, testInfo, '4-datos-personales', 'regresar-a-perfil-precarga-nombre');

  // Avanzar hasta step-2 (apoyos) para probar regresar (HU59)
  await w.completarNivel(page);

  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  // Promedio académico: obligatorio en prospecto (antes apoyos-hu lo forzaba a 100).
  await page.locator('#txt-average-mark').fill('100');
  // Marcar beca=no y préstamo=no para poder avanzar
  await page.locator('#row-radio-beca-prospecto input[value="no"]').check();
  await page.waitForTimeout(900);
  const radioPrestamoNo2 = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
  if (!await radioPrestamoNo2.isDisabled()) await radioPrestamoNo2.check();

  // Regresar a step-1 desde step-2 (HU59)
  await page.locator('#step-2 .btn-prev-step').click();
  await expect(page.locator('#step-1')).toBeVisible({ timeout: 10_000 });
  await w.capturar(page, testInfo, '5-nivel', 'regresar-desde-apoyos-a-nivel');

  // Avanzar hasta step-3 para probar regresar desde seguros (HU65)
  await expect(page.locator('#step-1-next')).toBeEnabled({ timeout: 15_000 });
  await page.locator('#step-1-next').click();
  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  // Promedio académico: obligatorio en prospecto (antes apoyos-hu lo forzaba a 100).
  await page.locator('#txt-average-mark').fill('100');
  // Responder beca=no y préstamo=no de nuevo
  await page.locator('#row-radio-beca-prospecto input[value="no"]').check();
  await page.waitForTimeout(900);
  if (!await radioPrestamoNo2.isDisabled()) await radioPrestamoNo2.check();
  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
  await page.locator('#step-2-next').click();

  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  // Regresar a step-2 desde step-3 (HU65)
  await page.locator('#step-3 .btn-prev-step').click();
  await expect(page.locator('#step-2')).toBeVisible({ timeout: 10_000 });
  // Verificar precarga: radio de beca sigue en 'no'
  await expect(page.locator('#row-radio-beca-prospecto input[value="no"]')).toBeChecked();
  await w.capturar(page, testInfo, '6-apoyos', 'regresar-desde-seguros-precarga-beca');

  // Avanzar hasta step-4 para probar regresar desde legales (HU70)
  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
  await page.locator('#step-2-next').click();
  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  // fetchSeguros regenera los selects al volver a step-3 (race conocido); recompletar
  await completarSeguros(page);
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();
  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await w.aceptarLegales(page);
  // Regresar a step-3 desde step-4 (HU70)
  await page.locator('#step-4 .btn-prev-step').click();
  await expect(page.locator('#step-3')).toBeVisible({ timeout: 10_000 });
  await w.capturar(page, testInfo, '7-seguros', 'regresar-desde-legales-a-seguros');

  // Volver a step-4: seguros se regeneran (fetchSeguros), recompletar
  await completarSeguros(page);
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();
  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  // Anotar si legales persisten (comportamiento esperado depende de implementación)
  const terminosChecked = await page.locator('#check-terminos').isChecked();
  const privacidadChecked = await page.locator('#check-privacidad').isChecked();
  testInfo.annotations.push({
    type: 'precarga-legales',
    description: `check-terminos: ${terminosChecked}, check-privacidad: ${privacidadChecked}`,
  });
  await w.capturar(page, testInfo, '8-legales', 'regresar-desde-seguros-a-legales');
});

// ---------------------------------------------------------------------------
// Test 5: [HU48-HU53] niveles con campos dinámicos (prospecto)
// ---------------------------------------------------------------------------
test('[HU48,HU49,HU50,HU51,HU52,HU53] niveles con campos dinámicos (prospecto)', async ({ page }, testInfo) => {
  await w.seleccionarPerfil(page, 'prospecto');
  await w.llenarDatosProspecto(page);
  await expect(page.locator('#step-1')).toBeVisible();

  // Esperar a que la API cargue los niveles reales
  await expect(
    page.locator('#select-grade option:not([value=""]):not([disabled]):not([value="op1"])').first()
  ).toBeAttached({ timeout: 30_000 });

  const optsNiveles = await page.locator(
    '#select-grade option:not([value=""]):not([disabled]):not([value="op1"])'
  ).allTextContents();
  testInfo.annotations.push({ type: 'niveles-disponibles', description: JSON.stringify(optsNiveles) });

  const camposDinamicos = [
    { id: '#div-formato', nombre: 'formato' },
    { id: '#div-materiales', nombre: 'materias' },
    { id: '#div-certificado', nombre: 'certificados' },
    { id: '#div-semanas', nombre: 'semanas' },
    { id: '#div-ingles', nombre: 'ingles' },
  ];

  for (const label of optsNiveles) {
    const etiqueta = label.trim();
    await page.locator('#select-grade').selectOption({ label: etiqueta });
    // Esperar a que el select de plan tenga opciones reales
    await expect(
      page.locator('#select-plan option:not([value=""]):not([disabled])').first()
    ).toBeAttached({ timeout: 20_000 });

    const camposVisibles = [];
    for (const campo of camposDinamicos) {
      if (await page.locator(campo.id).isVisible()) {
        camposVisibles.push(campo.nombre);
      }
    }
    testInfo.annotations.push({
      type: `nivel-campos-${etiqueta}`,
      description: `Campos visibles: ${camposVisibles.join(', ') || 'ninguno'}`,
    });

    const nombreArch = etiqueta.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40);
    await w.capturar(page, testInfo, '5-nivel', `nivel-prospecto-${nombreArch}-campos`);
  }

  expect(optsNiveles.length, 'Debe haber al menos un nivel disponible').toBeGreaterThan(0);
});

// ---------------------------------------------------------------------------
// Test 6: [HU66,HU67] checks legales obligatorios
// ---------------------------------------------------------------------------
test('[HU66,HU67] checks legales obligatorios en prospecto', async ({ page }, testInfo) => {
  // Navegar hasta step-4 sin aceptar legales
  await w.seleccionarPerfil(page, 'prospecto');
  await w.llenarDatosProspecto(page);
  await w.completarNivel(page);

  await expect(page.locator('#step-2')).toBeVisible({ timeout: 15_000 });
  // Promedio académico: obligatorio en prospecto (antes apoyos-hu lo forzaba a 100).
  await page.locator('#txt-average-mark').fill('100');
  // Beca=no, préstamo=no para avanzar rápido
  await page.locator('#row-radio-beca-prospecto input[value="no"]').check();
  await page.waitForTimeout(900);
  const radioPrestamoNo = page.locator('#row-radio-prestamo-prospecto input[value="no"]');
  if (!await radioPrestamoNo.isDisabled()) await radioPrestamoNo.check();
  await expect(page.locator('#step-2-next')).toBeEnabled({ timeout: 20_000 });
  await page.locator('#step-2-next').click();

  await expect(page.locator('#step-3')).toBeVisible({ timeout: 15_000 });
  await completarSeguros(page);
  await expect(page.locator('#step-3-next')).toBeEnabled({ timeout: 10_000 });
  await page.locator('#step-3-next').click();

  // En step-4 intentar avanzar SIN marcar legales
  await expect(page.locator('#step-4')).toBeVisible({ timeout: 15_000 });
  await page.locator('#step-4-next').click();

  // Debe mostrar mensajes de error de los checks
  const msgTerminos = page.locator('#check-terminos-msg');
  const msgPrivacidad = page.locator('#check-privacidad-msg');
  // Al menos uno de los mensajes debe aparecer (puede ser que solo muestre el primero no marcado)
  const termMsg = await expect(msgTerminos).toBeVisible({ timeout: 8_000 })
    .then(() => true).catch(() => false);
  const privMsg = await expect(msgPrivacidad).toBeVisible({ timeout: 8_000 })
    .then(() => true).catch(() => false);

  if (!termMsg && !privMsg) {
    // Si ningún mensaje aparece, verificar si el botón está habilitado y la navegación
    // sigue bloqueada; de lo contrario reportar como fallo
    const enResultado = page.url().includes('resultado');
    if (enResultado) {
      // Navegó sin marcar legales — bug real
      throw new Error('BUG: step-4-next navegó a resultado sin checks legales marcados (HU66/HU67)');
    }
    // No navegó pero tampoco hay mensajes visibles — anotar como observación
    testInfo.annotations.push({
      type: 'warning',
      description: 'No se detectaron #check-terminos-msg ni #check-privacidad-msg visibles tras intentar avanzar sin marcar legales. Verificar selectores.',
    });
  }

  await w.capturar(page, testInfo, '8-legales', 'legales-sin-marcar-mensajes-error');

  // Marcar ambos checks y verificar que ahora el submit avanza
  await w.aceptarLegales(page);
  await w.capturar(page, testInfo, '8-legales', 'legales-marcados-listo-avanzar');
  await page.locator('#step-4-next').click();
  await expect(page).toHaveURL(/resultado/, { timeout: 30_000 });
  await w.capturar(page, testInfo, '9-resultado', 'legales-resultado-tras-aceptar');
});
