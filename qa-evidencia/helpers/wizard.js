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
