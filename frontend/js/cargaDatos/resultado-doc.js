// Documento de cotización (resultado.html — estilo documento).
// Cablea la tabla itemizada "Colegiatura" (importes de seguros, préstamo y beca) y
// ajusta detalles del documento. La colegiatura, los planes y "Mi información
// ingresada" (#info-grid) los puebla resultados.js; aquí solo se completa lo nuevo.
import { API_BASE_URL } from '../apiConfig.js';
import { clasificarSeguro, cargarBeneficios } from '../utils/shared-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const num = (v) => { const n = parseFloat(typeof v === 'string' ? v.replace(/[^0-9.\-]/g, '') : v); return isNaN(n) ? 0 : n; };
    const fmt = (n) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return localStorage.getItem(k); } };

    const nivel = leer('selectedNivel');
    const segSel = leer('segurosSeleccionados') || {};

    // ── Mi información ingresada (campos del mockup; dinámica por nivel/programa) ──
    function cablearInfo() {
        const cont = document.getElementById('cotiz-info');
        const url = new URLSearchParams(location.search);
        const dp = leer('datosPersonales') || {};

        // Saludo del hero: "¡Hola, [Nombre]!"
        const greeting = document.getElementById('dash-greeting-nombre');
        if (greeting && dp.nombre) greeting.textContent = dp.nombre;

        if (!cont) return;
        // Toma el valor del query string (uso real) o de localStorage (respaldo/demo).
        const val = (urlKey, ...lsKeys) => {
            const u = url.get(urlKey);
            if (u) return u;
            for (const k of lsKeys) { const v = localStorage.getItem(k); if (v && v !== 'null' && v !== 'undefined') return v; }
            return '';
        };
        const nivelNombre = val('select-grade', 'selectedNivelNombre') || (leer('selectedNivel') ? 'Nivel ' + leer('selectedNivel') : '');

        // La matrícula solo aplica al flujo alumno; el prospecto ("Me interesa") no la tiene.
        const perfil = dp.perfil || leer('perfilUsuario');

        // El nivel 13 (Ejecutivo Bimestral MAPS) elige bimestres con checkboxes:
        // no viaja select-period, sino 'periodosSeleccionados' [{codigo, mes}].
        const periodoTexto = (() => {
            const directo = val('select-period', 'selectedPeriodo', 'periodo');
            if (directo) return directo;
            const bimestres = leer('periodosSeleccionados');
            if (Array.isArray(bimestres) && bimestres.length) {
                return bimestres.map(p => {
                    const anio = (p.codigo || '').match(/\d{4}/);
                    return anio ? `${p.mes} ${anio[0]}` : p.mes;
                }).join(', ');
            }
            return '';
        })();

        const campos = [];
        if (perfil === 'alumno') campos.push(['Matrícula', dp.matricula || '']);
        campos.push(
            ['Nombre', ((dp.nombre || '') + ' ' + (dp.apellidos || dp.apellido || '')).trim()],
            ['Campus', val('select-campus', 'selectedCampus', 'campus')],
            ['Nivel de estudios', nivelNombre],
            ['Programa de estudios', val('select-plan', 'selectedPrograma', 'programa')],
            ['Periodo', periodoTexto],
        );
        // Campo(s) académico(s) dinámico(s): se muestran solo los que aplican al nivel.
        [
            ['Materias', val('select-subjects', 'materias')],
            ['Certificados', val('select-certificado', 'certificados')],
            ['Semanas SEDI', val('select-semanas', 'semanasSEDI')],
        ].forEach(([l, v]) => { if (v && v !== '0') campos.push([l, v]); });

        cont.innerHTML = campos.map(([label, value]) => `
            <div class="cotiz-info-item">
                <p class="cotiz-info-label">${label}</p>
                <p class="cotiz-info-valor">${value || '—'}</p>
            </div>`).join('');
    }

    // ── Tabla itemizada: importes de seguros (costos del backend) ──
    async function cablearSeguros() {
        let seguros = [];
        if (nivel) {
            try {
                seguros = await fetch(`${API_BASE_URL}/seguros/nivel/${nivel}`).then(r => r.json());
            } catch (e) {
                console.warn('[resultado-doc] no se pudieron cargar seguros:', e.message);
            }
        }
        // Costo del seguro SELECCIONADO ('sí') cuyo tipo canónico esté en `tipos`.
        // Se clasifica con la MISMA función que usa el paso 3 (clasificarSeguro), de modo
        // que el renglón "accidentes" agrupa 'accidente' + 'otro' (premium, gastos médicos,
        // etc.) —igual que el desplegable del paso 3—, no por coincidencia del nombre.
        const costoPorTipo = (...tipos) => {
            const s = (seguros || []).find(seg => {
                const sel = segSel[seg.id_seguro];
                return sel && sel.valor === 'si' && tipos.includes(clasificarSeguro(seg));
            });
            return s ? num(s.valor) : null;
        };
        const aplica = (id, costo) => setText(id, costo ? fmt(costo) : 'No Aplica');

        aplica('tc-accidentes', costoPorTipo('accidente', 'otro'));
        aplica('tc-cobertura', costoPorTipo('colegiatura'));
        aplica('tc-vive', costoPorTipo('vive'));
    }

    // Colegiatura bruta (sin descuentos ni seguros); base de los importes % ──
    const colegiaturaBruta = () => num(leer('costoTotal') ?? 0);

    // ── Préstamo educativo (descuento): préstamo% × colegiatura bruta, en negativo ──
    function cablearPrestamo() {
        const pct = num(leer('prestamoPorcentaje') ?? leer('selectedprestamo') ?? 0);
        const importe = (pct / 100) * colegiaturaBruta();
        setText('tc-prestamo-label', pct > 0 ? `Préstamo educativo (${pct}%)` : 'Préstamo educativo');
        setText('tc-prestamo', importe > 0 ? `-${fmt(importe)}` : 'No Aplica');
    }

    // ── Beca (descuento): beca% × colegiatura bruta; la etiqueta incluye el nombre ──
    function cablearBeca() {
        const pct = num(leer('becaPorcentaje') ?? leer('selectedPercentage') ?? 0);
        const importe = (pct / 100) * colegiaturaBruta();
        const nombre = (leer('selectedScholarshipName') || '').toString().trim();
        const nombreValido = nombre && nombre !== '0' && !/^sin beca$/i.test(nombre);
        // La etiqueta muestra el % de beca asignado en vez de "(descuento)".
        const base = nombreValido ? `Costo de ${nombre}` : 'Costo de beca';
        setText('tc-beca-label', pct > 0 ? `${base} (${pct}%)` : base);
        setText('tc-beca', importe > 0 ? `-${fmt(importe)}` : 'No Aplica');
    }

    // ── Apoyo estudiantil: % (apoyo% × bruta) y monto fijo (directo, sin recalcular) ──
    function cablearApoyo() {
        const pct = num(leer('selectedSupportValue') ?? 0);
        const importePct = (pct / 100) * colegiaturaBruta();
        setText('tc-apoyo-pct', importePct > 0 ? `-${fmt(importePct)}` : 'No Aplica');

        const fijo = num(leer('selectedSupportFixValue') ?? 0);
        setText('tc-apoyo-fijo', fijo > 0 ? `-${fmt(fijo)}` : 'No Aplica');
    }

    // ── Wording de vigencia: el mockup dice "Vigencia de la cotización" ──
    // resultados.js escribe "Vigencia de la propuesta: <fecha>"; lo normalizamos
    // cuando esté listo (corre async), observando el elemento.
    function normalizarVigencia() {
        const el = document.getElementById('fechaVencimiento');
        if (!el) return;
        const arreglar = () => {
            if (el.textContent.includes('propuesta')) {
                el.textContent = el.textContent.replace('Vigencia de la propuesta', 'Vigencia de la cotización');
            }
        };
        arreglar();
        new MutationObserver(arreglar).observe(el, { childList: true, characterData: true, subtree: true });
    }

    // ── Beneficios de estudiar en Tecmilenio: solo en el flujo prospecto ("Me interesa"),
    //    y DINÁMICOS según el nivel cotizado (backend /beneficios/nivel/:id) ──
    async function cablearBeneficios() {
        const dp = leer('datosPersonales') || {};
        const perfil = dp.perfil || leer('perfilUsuario');
        const sec = document.getElementById('cotiz-beneficios');
        if (!sec) return;

        // Los beneficios solo aplican al flujo prospecto.
        const visible = perfil === 'prospecto';
        sec.classList.toggle('hidden', !visible);
        if (!visible || !nivel) return;

        const grid = sec.querySelector('.cotiz-beneficios-grid');
        if (!grid) return;

        // Beneficios reales del nivel (no los de Preparatoria hardcodeados en el HTML).
        const beneficios = await cargarBeneficios(nivel);
        if (!Array.isArray(beneficios) || !beneficios.length) {
            // Sin beneficios configurados para este nivel: no mostrar los estáticos.
            sec.classList.add('hidden');
            return;
        }
        grid.innerHTML = beneficios.map(b => `
            <div class="cotiz-beneficio-card">
                <span class="cotiz-beneficio-icono">
                    ${b.icono
                        ? `<img src="${b.icono}" alt="" style="width:30px;height:30px;object-fit:contain;">`
                        : '<i class="fa-solid fa-star" aria-hidden="true"></i>'}
                </span>
                <h3 class="cotiz-beneficio-nombre">${b.nombre || ''}</h3>
                <p class="cotiz-beneficio-texto">${b.descripcion || ''}</p>
            </div>`).join('');
    }

    // ── Oculta del desglose las filas cuyo Importe sea "No Aplica" (SOLO visual; no
    //    modifica datos ni cálculos). Deja el layout compacto sin espacios reservados;
    //    re-evalúa todas las filas para que las que sí tienen valor permanezcan visibles. ──
    function ocultarFilasNoAplica() {
        const tabla = document.getElementById('tc-prestamo')?.closest('table');
        if (!tabla) return;
        tabla.querySelectorAll('td.cotiz-importe').forEach(td => {
            const fila = td.closest('tr');
            if (!fila) return;
            const noAplica = td.textContent.trim().toLowerCase() === 'no aplica';
            fila.style.display = noAplica ? 'none' : '';
        });
    }

    cablearInfo();
    cablearPrestamo();
    cablearBeca();
    cablearApoyo();
    cablearBeneficios();
    normalizarVigencia();
    // cablearSeguros es async (fetch de seguros): al resolver, todas las celdas de
    // importe (seguros + beca/apoyo/préstamo, ya síncronas) tienen su valor final,
    // así que ese es el momento correcto para ocultar las filas "No Aplica".
    cablearSeguros().then(ocultarFilasNoAplica);
});
