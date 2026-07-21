// Documento de cotización (resultado.html — estilo documento).
// Cablea la tabla itemizada "Colegiatura" (importes de seguros, préstamo y beca) y
// ajusta detalles del documento. La colegiatura, los planes y "Mi información
// ingresada" (#info-grid) los puebla resultados.js; aquí solo se completa lo nuevo.
import { API_BASE_URL } from '../apiConfig.js';

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
        // Costo del seguro de un tipo SOLO si está seleccionado en "sí".
        const costoTipo = (pred) => {
            const s = (seguros || []).find(seg => {
                const n = (seg.nombre_seguro || '').toLowerCase();
                const sel = segSel[seg.id_seguro];
                return sel && sel.valor === 'si' && pred(n);
            });
            return s ? num(s.valor) : null;
        };
        const aplica = (id, costo) => setText(id, costo ? fmt(costo) : 'No Aplica');

        aplica('tc-accidentes', costoTipo(n => n.includes('accidente')));
        aplica('tc-cobertura', costoTipo(n => n.includes('estudiantil') || n.includes('colegiatura')));
        aplica('tc-vive', costoTipo(n => n.includes('vive')));
    }

    // ── Pago Fijo de préstamo estudiantil: $65 por cada 10% (nota legal) ──
    function cablearPrestamo() {
        const pct = num(leer('prestamoPorcentaje') ?? leer('selectedprestamo') ?? 0);
        const pagoFijo = (pct / 10) * 65;
        setText('tc-prestamo', pagoFijo > 0 ? fmt(pagoFijo) : 'No Aplica');
    }

    // ── Beca: se muestra el % (descuento); si no hay, "No Aplica" ──
    function cablearBeca() {
        const pct = num(leer('becaPorcentaje') ?? leer('selectedPercentage') ?? 0);
        const filaBeca = document.getElementById('fila-beca');
        if (pct > 0) {
            setText('tc-beca', `-${pct}%`);
            if (filaBeca) filaBeca.classList.remove('hidden');
        } else {
            setText('tc-beca', 'No Aplica');
        }
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

    // ── Beneficios de estudiar en Tecmilenio: solo en el flujo prospecto ("Me interesa") ──
    function cablearBeneficios() {
        const dp = leer('datosPersonales') || {};
        const perfil = dp.perfil || leer('perfilUsuario');
        const sec = document.getElementById('cotiz-beneficios');
        if (sec) sec.classList.toggle('hidden', perfil !== 'prospecto');
    }

    cablearInfo();
    cablearSeguros();
    cablearPrestamo();
    cablearBeca();
    cablearBeneficios();
    normalizarVigencia();
});
