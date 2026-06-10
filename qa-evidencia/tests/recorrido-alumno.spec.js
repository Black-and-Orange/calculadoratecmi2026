const { test, expect } = require('@playwright/test');
const w = require('../helpers/wizard');

test('[HU1] smoke: selección de perfil alumno muestra datos personales', async ({ page }, testInfo) => {
  await w.seleccionarPerfil(page, 'alumno');
  await expect(page.locator('#datos-alumno')).toBeVisible();
  await w.capturar(page, testInfo, '1-perfil', 'perfil-alumno');
});
