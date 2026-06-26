# AGENTS.md — Calculadora Tecmilenio (Fase 3)

Guía de onboarding para personas y agentes de código que retoman este
proyecto. Léela completa antes de tocar código.

## Qué es

Calculadora de cotizaciones de colegiaturas/becas de **Tecmilenio**.
Originalmente solo la usaba ventas; en **Fase 3** se habilita el **uso directo
del alumno y del prospecto**. Trabajo de **ajustes sobre la base existente**:
se conservan el motor de cálculo y la estructura de la BD (no es un rebuild ni
rediseño UX nuevo).

## Estado actual (jun 2026)

Rama de trabajo: **`fase-3`** (en `origin`). `main` = producción (no tocar
hasta el release). Sprints 0-4 implementados + paquete de QA. Desplegado en
staging:

- **Frontend (staging):** https://calculadora-tecmi.pages.dev (Cloudflare Pages)
- **Backend (staging):** https://calculadora-tecmi-backend.carlos-tam-s-account.workers.dev (Cloudflare Worker + Hyperdrive → MySQL/RDS)

**Diferido (fuera de alcance esta fase):** integración con **CRM
(HubSpot/Salesforce)** — Salesforce no está listo del lado del cliente. Las HU
con "envío a CRM" (HU30, HU42, HU69) guardan localmente; el envío a CRM es
alcance adicional.

## Arquitectura

Tres carpetas, todo vanilla (sin framework de build):

- **`frontend/`** — la calculadora pública. Wizard multi-paso, JS modular.
- **`admin/`** — panel de gestión de catálogos (login + panel), CRUD vía API.
- **`backend/`** — API REST Node + Express + MySQL (`mysql2`), patrón MVC
  (`routes/` → `controllers/` → `models/`). Entry local: `index.js`. En
  Cloudflare corre vía `worker.js` (config en `backend/wrangler.jsonc`).

### Dos tracks (clave de la Fase 3)
El usuario elige perfil en la pantalla inicial:
- **Alumno** (HU1-41): matrícula. Paso 2 = `step2-students.js` → ingresa
  **beca/préstamo directo** (sin promedio).
- **Prospecto** (HU42-80): datos personales (nombre, apellidos, fecha nac.,
  teléfono, correo). Paso 2 = `step2.js` (flujo original con apoyo/promedio).

### Mapa de archivos frontend
- `js/main.js` — navegación del wizard.
- `js/cargaDatos/step1.js` — nivel de estudios y cálculo de costo total.
- `js/cargaDatos/step2.js` — flujo **prospecto** (apoyos).
- `js/cargaDatos/step2-students.js` — flujo **alumno** (beca/préstamo directo).
- `js/cargaDatos/apoyos-hu.js` — **reglas de apoyos, préstamos y seguros**
  (HU18-27, 56-65). Aquí viven las constantes de negocio.
- `js/cargaDatos/resultados.js` — dashboard de resultado (contado/financiado,
  vigencia, seguros, beca).
- `js/nueva-cotizacion.js` — flujo de nueva cotización (conservar/desde cero).
- `js/utils/shared-utils.js` — helpers (financiado, vigencia, formato).
- `js/apiConfig.js` — base URL del API: **localhost → `:3008`**, otro host →
  Worker de staging (auto-detección).
- `css/wizard.css`, `css/resultado-dashboard.css` — estilos de la fase.

## Reglas de negocio (NO improvisar)

Documentadas con archivo:línea exactos en
**`qa-evidencia/datos/reglas.json`** — léelo antes de tocar cálculos.
Resumen:
- **beca% + préstamo% ≤ 60%** (`TOPE_BECA_PRESTAMO`). Si beca llega a 60%, el
  préstamo se fuerza a "no".
- **Profesional (niveles 2 y 4) con beca:** préstamo topado a **20%**.
- **Prepa (niveles 1 y 3):** sin préstamo por defecto.
- **Cobertura VIVE forzada** (sí, deshabilitada) en niveles 1,2,3,4. **Seguro
  de colegiatura forzado** en niveles 1,3.
- Seguros no reducen el costo base pero se suman al total mostrado.
- Vigencia: `/api/configuracion-vigencia/dias-vigencia` (fallback 5 días),
  formato DD/MM/AAAA.
- Catálogo de 13 niveles y fórmulas de contado/financiado: ver `reglas.json`.

> ⚠️ Hay notas **PENDIENTE-FASE3** en `reglas.json` (y comentarios en código)
> que requieren **confirmar con el cliente**: cobro de 7-8 materias como 6,
> posible doble descuento en nivel 13, pesos hardcodeados en nivel 4 MAPS.

## QA / trazabilidad

- `qa-evidencia/` — suite Playwright (recorridos alumno/prospecto, cálculos,
  acciones del resultado) que corre contra staging.
- `qa-evidencia/datos/matriz-hu.json` — **matriz de trazabilidad de las 80
  HUs** (estado por HU). Úsala como fuente de verdad de qué está hecho.
- `qa-evidencia/datos/hu-backlog.json` — backlog de HUs.
- Correr QA: `cd qa-evidencia && npm install && npx playwright test`
  (usa `BASE_URL` para apuntar a otro entorno).

## Cómo correr en local

```bash
# Backend
cd backend
cp .env.example .env        # llenar DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET
npm install
node index.js               # http://localhost:3008

# Frontend (otra terminal)
cd frontend
python3 -m http.server 5500 # http://localhost:5500/index.html
```

> El `.env` real **no está en el repo** (se removió por seguridad; ver
> `backend/.env.example`). Las credenciales de la BD de pruebas las tiene el
> equipo — pídelas, no las commitees. El backend usa `bcryptjs` y `mysql2`.

## Reglas de trabajo

- Trabajar siempre en `fase-3` (o ramas `feat/...` desde `fase-3`), nunca en
  `main`.
- Probar contra **staging / BD de pruebas**, no producción.
- **Commitear y pushear seguido** — el repo es la fuente de verdad.
- No reintroducir `.env` ni credenciales al repo.
- No tocar el motor de cálculo ni la estructura de BD salvo necesidad real
  validada con el cliente.
