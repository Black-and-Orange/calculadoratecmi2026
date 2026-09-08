// Rutas de cotizaciones montadas en una app Express aislada; el controlador se mockea
// (sin BD). Verifica los gates de autenticación e ids numéricos del Block 0 / P4.
jest.mock('../controllers/cotizacionesController', () => {
  const ok = (name) => (req, res) => res.json({ handler: name, id: req.params.id });
  return { createCotizacion: ok('create'), getAllCotizaciones: ok('all'), getCotizacionesByDateRange: ok('fecha'), getCotizacionesByNivel: ok('nivel'), getCotizacionesStats: ok('stats'), getCotizacionById: ok('byId'), deleteCotizacion: ok('delete') };
});
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const routes = require('../routes/cotizacionesRoutes');
const S = 's'.repeat(32);
beforeAll(() => { process.env.JWT_SECRET = S; });
const app = express(); app.use(express.json()); app.use('/api/cotizaciones', routes);
const tok = () => jwt.sign({ user: 'qa' }, S, { algorithm: 'HS256', expiresIn: '1h' });

describe('GET de listado requieren token', () => {
  test.each(['/', '/por-fecha', '/por-nivel/1', '/estadisticas'])('GET %s sin token → 403', async (p) => { await request(app).get('/api/cotizaciones' + p).expect(403); });
  test('GET / con token → 200 y llega al controlador', async () => { const r = await request(app).get('/api/cotizaciones').set('Authorization', 'Bearer ' + tok()).expect(200); expect(r.body.handler).toBe('all'); });
});
describe('GET /:id público con id numérico', () => {
  test('GET /7 sin token → 200 (público por diseño)', async () => { const r = await request(app).get('/api/cotizaciones/7').expect(200); expect(r.body).toEqual({ handler: 'byId', id: '7' }); });
  test.each(['abc', 'cambiar-nombres', '1.5'])('GET /%s → 400', async (id) => { await request(app).get('/api/cotizaciones/' + id).expect(400); });
});
describe('POST / con rate limit', () => {
  test('acepta 10 y limita la 11ª con 429', async () => {
    require('../middlewares/rateLimit')._reset();
    for (let i = 0; i < 10; i++) await request(app).post('/api/cotizaciones').send({}).expect(200);
    await request(app).post('/api/cotizaciones').send({}).expect(429);
  });
});
