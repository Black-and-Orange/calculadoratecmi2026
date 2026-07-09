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

// Paso 1 combinado (rediseño 4 pasos): datos personales y nivel comparten
// pantalla, no hay botón intermedio "Siguiente" (#step-dp-next quedó oculto). El
// helper solo llena los datos; el nivel se completa con completarNivel() y se
// avanza con "Continuar" (#step-1-next).
async function llenarDatosAlumno(page, datos = DATOS_PRUEBA) {
  await page.locator('#txt-matricula').fill(datos.matricula);
  await page.locator('#txt-nombre-alumno').fill(datos.nombre);
  await page.locator('#txt-apellido-alumno').fill(datos.apellido);
  await expect(page.locator('#step-1')).toBeVisible();
}

async function llenarDatosProspecto(page, datos = DATOS_PRUEBA) {
  await page.locator('#txt-nombre-prospecto').fill(datos.nombre);
  await page.locator('#txt-apellido-paterno').fill(datos.apellido);
  await page.locator('#txt-apellido-materno').fill(datos.apellidoMaterno);
  await page.locator('#txt-fecha-nacimiento').fill(datos.fechaNacimiento);
  await page.locator('#txt-telefono').fill(datos.telefono);
  await page.locator('#txt-correo').fill(datos.correo);
  await expect(page.locator('#step-1')).toBeVisible();
}

// Selects encadenados: espera a que haya opciones reales (excluyendo el placeholder
// estático "op1" del HTML que precede a la carga de la API) y elige por etiqueta o la primera.
async function elegirOpcion(page, selector, etiqueta = null) {
  const sel = page.locator(selector);
  // Esperar a que aparezca al menos una opción real (no vacía, no disabled, no placeholder "op1")
  const opciones = sel.locator('option:not([value=""]):not([disabled]):not([value="op1"])');
  await expect(opciones.first()).toBeAttached({ timeout: 30_000 });
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
  // Seleccionar grade con reintento: loadGradeOptions() concurrente puede borrar
  // la selección después de que la hagamos. Esperar a que grade quede estable
  // (con un valor no vacío durante > 1s indica que las cargas concurrentes terminaron)
  // antes de proceder con los demás selects.
  for (let intento = 0; intento < 3; intento++) {
    eleccion.nivel = await elegirOpcion(page, '#select-grade', nivel);
    // Esperar 1.2s para que loadGradeOptions() (fetch ~600ms) tenga tiempo de completarse
    await page.waitForTimeout(1200);
    const gradeVal = await page.locator('#select-grade').inputValue();
    if (gradeVal) break; // Grade persiste; salir del bucle
    // Grade fue borrado por carga concurrente; reintentar
  }
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

// Paso 3 (rediseño por radios, eba4783): cada cobertura es un .seguro-bloque con
// radios visibles y un <select id="select-seguro-{id}"> OCULTO como fuente de
// verdad; #step-3-next se habilita cuando todos los ocultos tienen 'si'/'no'.
//   - VIVE y Cobertura de Colegiatura obligatoria: pre-marcadas 'si' y disabled.
//   - Accidente: radios 'tecmilenio' (+ dropdown de interés) / 'propio' (→ 'no').
//   - Colegiatura no obligatoria: radios Sí/No.
// modo 'minimo' → responde sin contratar (accidente: propio; opcionales: no).
// modo 'maximo' → contrata todo (accidente: tecmilenio + select; opcionales: sí).
async function completarSeguros(page, { modo = 'maximo' } = {}) {
  const cont = page.locator('#seguros-dinamicos-container');
  const btnNext = page.locator('#step-3-next');
  // Esperar a que fetchSeguros() pinte bloques o el mensaje "no hay seguros"
  await cont.locator('.seguro-bloque, .text-muted').first()
    .waitFor({ state: 'attached', timeout: 15_000 }).catch(() => {});

  // El paso puede regenerarse (fetchSeguros) al re-entrar desde otro paso:
  // reintentar responder hasta que el botón continuar quede habilitado.
  for (let intento = 0; intento < 6; intento++) {
    const bloques = cont.locator('.seguro-bloque');
    const total = await bloques.count();
    if (total === 0) return; // nivel sin seguros → el botón ya queda habilitado

    for (let i = 0; i < total; i++) {
      const bloque = bloques.nth(i);
      const oculto = bloque.locator('select[id^="select-seguro-"]');
      if (await oculto.count() === 0) continue;
      const valor = await oculto.inputValue().catch(() => '');
      if (valor === 'si' || valor === 'no') continue; // forzado o ya respondido

      // Bloque de accidente: radios tecmilenio/propio
      const radioTecmilenio = bloque.locator('input[type="radio"][value="tecmilenio"]');
      if (await radioTecmilenio.count() > 0) {
        if (modo === 'maximo') {
          await radioTecmilenio.check().catch(() => {});
          const selInteres = bloque.locator('select.seguro-interes-select');
          const opciones = selInteres.locator('option:not([value=""])');
          if (await opciones.count() > 0) {
            await selInteres.selectOption(await opciones.first().getAttribute('value')).catch(() => {});
          }
        } else {
          await bloque.locator('input[type="radio"][value="propio"]').check().catch(() => {});
        }
        continue;
      }

      // Bloques Sí/No (cobertura de colegiatura no obligatoria)
      const respuesta = modo === 'maximo' ? 'si' : 'no';
      const radio = bloque.locator(`input[type="radio"][value="${respuesta}"]`);
      if (await radio.count() > 0 && !(await radio.isDisabled())) {
        await radio.check().catch(() => {});
      }
    }

    if (await btnNext.isEnabled().catch(() => false)) return;
    await page.waitForTimeout(700);
  }
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
  completarSeguros, parsearMonto, leerMonto,
};
