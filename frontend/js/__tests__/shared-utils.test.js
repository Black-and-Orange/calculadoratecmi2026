/** @jest-environment jsdom */
// Primera prueba de módulos ES del frontend (funciones puras de shared-utils).
import {
  clasificarSeguro, esNivelBimestralMaps, creditosPorCertificado, formatearPesos,
  formatNumber, toIntIfPossible, mostrarEnteroSiEsDecimal, getTituloPorNivel, getFieldLabel,
} from '../utils/shared-utils.js';

describe('clasificarSeguro (fuente única paso 3 / desglose)', () => {
  test.each([
    ['Cobertura VIVE', 'vive'], ['Seguro de accidentes', 'accidente'],
    ['Cobertura Colegiatura', 'colegiatura'], ['Cobertura Estudiantil', 'colegiatura'],
    ['Seguro Plus', 'otro'], ['Seguro Premium', 'otro'], ['Seguro de Gastos Médicos Mayores Elite', 'otro'],
  ])('"%s" → %s', (nombre, tipo) => expect(clasificarSeguro({ nombre_seguro: nombre })).toBe(tipo));
  test('tolera nombre nulo/objeto vacío', () => { expect(clasificarSeguro({})).toBe('otro'); expect(clasificarSeguro(null)).toBe('otro'); });
});
describe('niveles bimestrales MAPS', () => {
  test.each([[13, true], [15, true], ['13', true], [1, false], [18, false]])('%s → %s', (n, e) => expect(esNivelBimestralMaps(n)).toBe(e));
  test('créditos por certificado: 15 → 1, resto → 10', () => { expect(creditosPorCertificado(15)).toBe(1); expect(creditosPorCertificado(13)).toBe(10); expect(creditosPorCertificado('15')).toBe(1); });
});
describe('formateo', () => {
  test('formatearPesos', () => { expect(formatearPesos(1234.5)).toMatch(/1,234\.50/); expect(formatearPesos('0')).toMatch(/0\.00/); });
  test('formatNumber / toIntIfPossible / mostrarEnteroSiEsDecimal', () => {
    expect(formatNumber(5)).toBe(5); expect(formatNumber(5.5)).toBe(5.5);
    expect(toIntIfPossible(8)).toBe(8); expect(toIntIfPossible(8.25)).toBe(8.25); expect(toIntIfPossible('x')).toBe('x');
    expect(mostrarEnteroSiEsDecimal('10.00')).toBe('10'); expect(mostrarEnteroSiEsDecimal(2.5)).toBe(2.5);
  });
});
describe('catálogos por nivel', () => {
  test('título y etiqueta con fallback', () => {
    expect(getTituloPorNivel(1)).toMatch(/futuro/i); expect(getTituloPorNivel(999)).toBe('N/A');
    expect(getFieldLabel(2)).toBe('Créditos'); expect(getFieldLabel(4)).toBe('Certificados'); expect(getFieldLabel(999)).toBe('Materias');
  });
});
