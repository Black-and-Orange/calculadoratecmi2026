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
