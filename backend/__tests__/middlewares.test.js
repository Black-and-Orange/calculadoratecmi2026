const jwt = require('jsonwebtoken');
const rateLimit = require('../middlewares/rateLimit');
const validarIdNumerico = require('../middlewares/validarIdNumerico');
const authenticateToken = require('../middlewares/authenticateToken');

const mockRes = () => { const r = {}; r.status = jest.fn(() => r); r.json = jest.fn(() => r); r.setHeader = jest.fn(); return r; };

describe('getJwtSecret', () => {
  const env = process.env.JWT_SECRET;
  afterEach(() => { process.env.JWT_SECRET = env; delete globalThis.__CF_ENV; });
  test('usa el binding del Worker (globalThis.__CF_ENV) con prioridad', () => {
    globalThis.__CF_ENV = { JWT_SECRET: 'w'.repeat(32) }; process.env.JWT_SECRET = 'n'.repeat(32);
    expect(authenticateToken.getJwtSecret()).toBe('w'.repeat(32));
  });
  test('usa process.env en Node', () => { delete globalThis.__CF_ENV; process.env.JWT_SECRET = 'n'.repeat(32); expect(authenticateToken.getJwtSecret()).toBe('n'.repeat(32)); });
  test('lanza si no hay secreto (fail-closed)', () => { delete globalThis.__CF_ENV; delete process.env.JWT_SECRET; expect(() => authenticateToken.getJwtSecret()).toThrow(/no configurado/); });
});

describe('authenticateToken', () => {
  const S = 's'.repeat(32);
  beforeEach(() => { process.env.JWT_SECRET = S; delete globalThis.__CF_ENV; });
  const run = (header) => new Promise((resolve) => { const res = mockRes(); const req = { headers: header ? { authorization: header } : {} }; authenticateToken(req, res, () => resolve({ next: true, req })); setTimeout(() => resolve({ next: false, res }), 50); });
  test('sin cabecera → 403', async () => { const { next, res } = await run(); expect(next).toBe(false); expect(res.status).toHaveBeenCalledWith(403); });
  test('token válido HS256 → next con req.user', async () => { const t = jwt.sign({ user: 'qa' }, S, { algorithm: 'HS256' }); const { next, req } = await run('Bearer ' + t); expect(next).toBe(true); expect(req.user.user).toBe('qa'); });
  test('token HS512 → 403 (solo HS256)', async () => { const t = jwt.sign({ user: 'qa' }, S, { algorithm: 'HS512' }); const { next, res } = await run('Bearer ' + t); expect(next).toBe(false); expect(res.status).toHaveBeenCalledWith(403); });
  test('token con otro secreto → 403', async () => { const t = jwt.sign({ user: 'qa' }, 'x'.repeat(32), { algorithm: 'HS256' }); const { res } = await run('Bearer ' + t); expect(res.status).toHaveBeenCalledWith(403); });
  test('sin JWT_SECRET → 500 genérico sin exponer valor', async () => { delete process.env.JWT_SECRET; const { res } = await run('Bearer abc'); expect(res.status).toHaveBeenCalledWith(500); expect(JSON.stringify(res.json.mock.calls)).not.toMatch(/JWT_SECRET=/); });
});

describe('rateLimit', () => {
  beforeEach(() => rateLimit._reset());
  const mk = (ip, cf) => ({ headers: cf ? { 'cf-connecting-ip': cf } : {}, ip });
  test('permite max y bloquea el siguiente con 429 + Retry-After', () => {
    const mw = rateLimit({ bucket: 't', windowMs: 60000, max: 2 }); let n = 0;
    mw(mk('1.1.1.1'), mockRes(), () => n++); mw(mk('1.1.1.1'), mockRes(), () => n++);
    const res = mockRes(); mw(mk('1.1.1.1'), res, () => n++);
    expect(n).toBe(2); expect(res.status).toHaveBeenCalledWith(429); expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
  });
  test('CF-Connecting-IP tiene prioridad sobre req.ip', () => {
    const mw = rateLimit({ bucket: 't2', windowMs: 60000, max: 1 });
    mw(mk('9.9.9.9', '203.0.113.5'), mockRes(), () => {}); const res = mockRes(); mw(mk('8.8.8.8', '203.0.113.5'), res, () => {});
    expect(res.status).toHaveBeenCalledWith(429);
  });
  test('opciones inválidas lanzan', () => { expect(() => rateLimit({})).toThrow(); });
});

describe('validarIdNumerico', () => {
  test.each(['12', '0', '999999'])('acepta "%s"', (v) => { const res = mockRes(); let next = false; validarIdNumerico({}, res, () => { next = true; }, v); expect(next).toBe(true); });
  test.each(['abc', 'cambiar-nombres', '12a', '-1', '1.5', ''])('rechaza "%s" con 400', (v) => { const res = mockRes(); let next = false; validarIdNumerico({}, res, () => { next = true; }, v); expect(next).toBe(false); expect(res.status).toHaveBeenCalledWith(400); });
});
