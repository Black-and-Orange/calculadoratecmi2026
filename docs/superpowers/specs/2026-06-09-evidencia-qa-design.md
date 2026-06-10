# Diseño: Paquete de Evidencia QA — Calculadora Tecmi (Sprints 1–4)

**Fecha:** 9 de junio de 2026
**Autor:** Carlos (con Claude)
**Destinatarios del entregable:** Jazmín (Black & Orange) y equipo de Tecmilenio
**Enfoque elegido:** Híbrido ligero — tests Playwright con aserciones solo para
cálculos críticos; el resto del wizard se evidencia con recorridos
automatizados de screenshots sin aserciones.

## Objetivo

Producir un paquete formal de evidencia de pruebas (Test Execution Report) que
demuestre que las HUs entregadas en los Sprints 1–4 funcionan en staging, sin
que el equipo de Tecmi tenga que usar la aplicación. El paquete se genera
durante la noche con agentes y queda listo para enviar por correo.

## Alcance

- **Incluye:** HUs implementadas en Sprints 1–4 (ver `PLAN_SPRINTS.md` y los
  commits `5de3ff0`, `99f207c`, `9f56149`, `f2f697d`, más fixes posteriores
  hasta `a054003`).
- **Excluye:** HUs del bloque CRM diferido (HU30, HU42, HU69 en su parte de
  envío a CRM) y cualquier HU no implementada. Se listan como "fuera de
  alcance" en el resumen ejecutivo, no se omiten en silencio.
- **Ambiente:** staging — frontend `https://calculadora-tecmi.pages.dev`,
  backend Worker `calculadora-tecmi-backend.carlos-tam-s-account.workers.dev`,
  BD de pruebas. Nunca producción.

## Estructura del entregable

```
qa-evidencia/
├── EVIDENCIA-QA.pdf          # documento formal para Jazmín
├── reporte-html/             # reporte navegable de Playwright (anexo)
├── tests/                    # specs de Playwright (reusables para QA de julio)
└── screenshots/              # PNG organizados por épica/HU
```

El PDF contiene, en este orden:

1. **Resumen ejecutivo (1 página):** qué se probó, ambiente, commit, fecha de
   ejecución, total de casos (pasados / fallados / evidencia-solo-visual /
   pendientes), y el bloque CRM diferido como exclusión explícita.
2. **Matriz de trazabilidad:** tabla HU → caso de prueba → tipo de evidencia
   (aserción / screenshot) → resultado → referencia al screenshot.
3. **Evidencia por épica:** screenshots agrupados siguiendo las 9 épicas del
   plan de sprints, con pie de foto indicando configuración y paso.

## Componente 1: Tests con aserciones (cálculos críticos)

~12–15 casos Playwright que validan números contra valores esperados:

- Becas por nivel de estudios, incluyendo el tope de préstamo 20% en
  profesional niveles 2/4 con beca (fix del commit `a054003` — evidencia
  explícita).
- Préstamos: montos permitidos y mensualidades resultantes.
- Seguros y coberturas: suma correcta al total.
- Contado vs. financiado: tabla de mensualidades en formato tabular.

**Fuente de los valores esperados:** las reglas de negocio se extraen de
`backend/controllers` (y modelos relacionados) antes de escribir las
aserciones. Ningún valor esperado se inventa: si una regla no se puede
determinar desde el código ni la BD de staging, el caso baja a
evidencia-solo-visual y se anota.

## Componente 2: Recorridos de screenshots (resto del wizard)

Scripts Playwright sin aserciones que navegan y capturan pantalla por paso:

- Track **Alumno** completo y track **Prospecto** completo:
  perfil → legales → barra de pasos → datos personales → nivel de estudios →
  apoyos/préstamos → seguros → T&C → resultado.
- Variantes de configuración: distintos niveles de estudio (selects
  encadenados y campos dinámicos), con/sin beca, con/sin seguro, descarga de
  PDF de cotización, cotización compartida (WhatsApp), botón "nueva
  cotización".
- Viewports: desktop (1440px) y móvil (390px) — responsive es criterio del QA
  de julio.

## Ejecución nocturna (workflow multi-agente)

Fases del workflow (el usuario pidió explícitamente varios agentes en la
noche):

1. **Extracción:** un agente lee `backend/controllers` y la estructura del
   wizard en `frontend/js`, y produce: (a) las reglas de cálculo con valores
   esperados, (b) la lista de configuraciones a recorrer, (c) el mapeo
   HU → caso de prueba.
2. **Escritura en paralelo:** agentes por épica escriben los specs (aserciones
   para cálculos, recorridos para lo demás).
3. **Ejecución:** la suite corre contra staging; reintento simple en fallos de
   red/timing antes de marcar fallo real.
4. **Compilación:** un agente arma matriz + resumen + PDF + organiza
   screenshots y reporte HTML.

**Reglas de degradación (nunca silenciar):**

- Flujo no automatizable (p. ej. requiere dato que no existe en staging) →
  baja a "pendiente de evidencia manual" y aparece así en la matriz.
- Test de cálculo que falla → se reporta como fallo con el valor esperado vs.
  obtenido; no se ajusta la aserción para que pase.

## Dependencias / riesgos

- **Matrícula de alumno válida (8 dígitos) en BD de staging:** necesaria para
  el track Alumno. Si el usuario no la proporciona, los agentes la buscan en
  seeds/migraciones del repo; si no aparece, el track Alumno se evidencia
  hasta la pantalla de identificación y se anota como pendiente.
- **Datos de prospecto:** se usan datos ficticios claramente marcados
  (p. ej. "Prueba QA"); quedan en la BD de staging, lo cual es aceptable.
- **Estabilidad de staging durante la noche:** si staging cae, la suite puede
  correrse contra entorno local como fallback, anotando el cambio de ambiente
  en el resumen.
- **iCloud eviction en Desktop:** todo el trabajo ocurre en
  `~/dev/CalculadoraTecmi/repo`, no en la copia del Desktop.

## Criterio de éxito

Por la mañana existe `qa-evidencia/EVIDENCIA-QA.pdf` listo para enviar, con:
matriz completa de las HUs de Sprints 1–4 (cada una con resultado o estado
anotado), screenshots de ambos tracks en desktop y móvil, y los tests de
cálculo críticos pasando (o sus fallos reportados honestamente).
