// Sprint 3 (HU18-27 / HU56-65): capa de radios y reglas de negocio sobre los
// selects existentes de becas, préstamos y seguros. No calcula montos: setea
// los selects originales y dispara 'change' para que los módulos de cálculo
// (step2.js, step2-students.js, step3.js) reaccionen como siempre.

const NIVELES_PREPA = [1, 3];                 // Preparatoria Semestral / Tetramestral
const NIVELES_VIVE_FORZADA = [1, 2, 3, 4];    // Prepa, Prof. plan 2018, Prof. MAPS
const NIVELES_COLEGIATURA_FORZADA = [1, 3];   // Solo preparatoria
const TOPE_BECA_PRESTAMO = 60;                // beca% + préstamo% ≤ 60

const nivel = () => {
    try { return JSON.parse(localStorage.getItem('selectedNivel')); } catch { return null; }
};

const radioValor = (name) => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
};

const setRadio = (name, valor) => {
    const input = document.querySelector(`input[name="${name}"][value="${valor}"]`);
    if (input && !input.checked) {
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

const setRadioDisabled = (name, disabled) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(r => { r.disabled = disabled; });
};

const setInfo = (id, texto) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = texto || '';
    el.classList.toggle('hidden', !texto);
};

// Asegura que el select tenga una opción "0" y la selecciona (beca/préstamo = no)
const seleccionarCero = (select) => {
    if (!select) return;
    let cero = Array.from(select.options).find(o => o.value === '0');
    if (!cero) {
        cero = document.createElement('option');
        cero.value = '0';
        cero.textContent = '0%';
        cero.hidden = true; // solo de uso interno; el usuario no la ve en la lista
        select.appendChild(cero);
    }
    if (select.value !== '0') {
        select.value = '0';
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

// Deshabilita las opciones de préstamo que rompan las reglas:
// (a) beca + préstamo ≤ 60 (HU18/56)
// (b) en profesional (niveles 2 y 4) con beca, préstamo máx. 20% — regla
//     heredada de step2.js (adjustLoanOptions), que este filtro pisaría si
//     no la replica aquí porque corre periódicamente después.
const NIVELES_PROFESIONAL_TOPE_20 = [2, 4];

const prestamoExcedido = (becaPct, v) => {
    if ((becaPct + v) > TOPE_BECA_PRESTAMO) return true;
    return NIVELES_PROFESIONAL_TOPE_20.includes(nivel()) && becaPct > 0 && v > 20;
};

const filtrarOpcionesPrestamo = (select, becaPct) => {
    if (!select) return;
    Array.from(select.options).forEach(opt => {
        const v = parseFloat(opt.value);
        if (isNaN(v) || opt.value === '' || opt.value === '0') return;
        opt.disabled = prestamoExcedido(becaPct, v);
    });
    const actual = parseFloat(select.value);
    if (!isNaN(actual) && actual > 0 && prestamoExcedido(becaPct, actual)) {
        select.value = '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

// Regla común (HU18/19/56/57): si beca ≥ 60, préstamo forzado a "no"
const aplicarRegla60 = (radioPrestamoName, prestamoSelect, becaPct, infoId) => {
    if (becaPct >= TOPE_BECA_PRESTAMO) {
        setRadio(radioPrestamoName, 'no');
        setRadioDisabled(radioPrestamoName, true);
        setInfo(infoId, `Con una beca de ${TOPE_BECA_PRESTAMO}% o más no es posible solicitar préstamo estudiantil.`);
    } else {
        setRadioDisabled(radioPrestamoName, false);
        setInfo(infoId, '');
        filtrarOpcionesPrestamo(prestamoSelect, becaPct);
    }
};

/* ════════════════ ALUMNO (HU18-21) ════════════════ */
const initAlumno = () => {
    const becaSelect = document.getElementById('txt-percentage-students');
    const prestamoSelect = document.getElementById('txt-prestamo-percentage-students');
    const prestamoContainer = document.getElementById('prestamo-students-container');
    const rowBeca = document.getElementById('row-beca-alumno');
    const btnNext = document.getElementById('step-2-students-next');
    if (!becaSelect || !btnNext) return;

    const becaPct = () => parseFloat(becaSelect.value) || 0;

    const sync = () => {
        const rBeca = radioValor('radio-beca-alumno');
        const rPrestamo = radioValor('radio-prestamo-alumno');

        if (rowBeca) rowBeca.classList.toggle('hidden', rBeca !== 'si');
        if (rBeca === 'no') seleccionarCero(becaSelect);

        // El préstamo solo aplica a profesional y posgrados Y cuando el backend
        // tiene opciones para el nivel. Si no aplica, se OCULTA la pregunta (no
        // se muestra deshabilitada) y se deja en "no" para no bloquear el botón.
        const esPrepa = NIVELES_PREPA.includes(nivel());
        const hayPrestamos = prestamoSelect && Array.from(prestamoSelect.options).some(o => o.value !== '' && o.value !== '0');
        const prestamoNoAplica = esPrepa || !hayPrestamos;

        const filaPrestamo = document.getElementById('fila-prestamo-alumno');
        if (filaPrestamo) filaPrestamo.classList.toggle('hidden', prestamoNoAplica);

        if (prestamoNoAplica) {
            setRadio('radio-prestamo-alumno', 'no');
        } else {
            aplicarRegla60('radio-prestamo-alumno', prestamoSelect, becaPct(), 'radio-prestamo-alumno-info');
        }

        if (prestamoContainer) {
            prestamoContainer.classList.toggle('hidden', radioValor('radio-prestamo-alumno') !== 'si' || !hayPrestamos);
        }
        if (radioValor('radio-prestamo-alumno') === 'no' && prestamoSelect) seleccionarCero(prestamoSelect);

        // HU20: continuar habilitado solo con todo respondido
        const becaOk = rBeca === 'no' || (rBeca === 'si' && becaSelect.value !== '' && becaSelect.value !== '0');
        const rP = radioValor('radio-prestamo-alumno');
        const prestamoOk = rP === 'no' || (rP === 'si' && prestamoSelect && prestamoSelect.value !== '' && prestamoSelect.value !== '0');
        btnNext.disabled = !(becaOk && prestamoOk);
    };

    // HU19: en prepa el préstamo viene predeterminado en "no"
    document.addEventListener('stepChanged', () => {
        setTimeout(() => {
            if (NIVELES_PREPA.includes(nivel()) && !radioValor('radio-prestamo-alumno')) {
                setRadio('radio-prestamo-alumno', 'no');
            }
            sync();
        }, 400);
    });

    document.getElementById('step-2-students').addEventListener('change', sync);
    setInterval(() => {
        if (document.getElementById('step-2-students').offsetParent !== null) sync();
    }, 700);
};

/* ════════════════ PROSPECTO (HU56-59) ════════════════ */
const initProspecto = () => {
    const panel = document.getElementById('step-2');
    const promedio = document.getElementById('txt-average-mark');
    const scholarshipSelect = document.getElementById('txt-scholarship');
    const tipoBeca = document.getElementById('tipo-beca');
    const percentageSelect = document.getElementById('txt-percentage');
    const porcentajeBeca = document.getElementById('porcentaje-beca');
    const prestamoSelect = document.getElementById('txt-prestamo-percentage');
    const prestamoContainer = document.querySelector('.field-avg-4');
    const btnNext = document.getElementById('step-2-next');
    if (!panel || !btnNext) return;

    let promedioInicializado = false;

    const becaPct = () => {
        try { return parseFloat(JSON.parse(localStorage.getItem('selectedPercentage'))) || 0; } catch { return 0; }
    };

    const sync = () => {
        // HU56: las becas se muestran todas (sin filtro de promedio); se usa 100
        // internamente para reutilizar los endpoints existentes por promedio.
        if (!promedioInicializado && panel.offsetParent !== null) {
            promedioInicializado = true;
            if (promedio && promedio.value !== '100') {
                promedio.value = '100';
                promedio.dispatchEvent(new Event('input', { bubbles: true }));
                promedio.dispatchEvent(new Event('change', { bubbles: true }));
                promedio.dispatchEvent(new Event('keyup', { bubbles: true })); // main.js des-oculta .field-avg con keyup
            }
        }

        const rBeca = radioValor('radio-beca-prospecto');
        [tipoBeca, scholarshipSelect].forEach(el => el && el.classList.toggle('hidden', rBeca !== 'si'));
        if (rBeca !== 'si') {
            [porcentajeBeca, percentageSelect].forEach(el => el && el.classList.add('hidden'));
        } else if (scholarshipSelect && scholarshipSelect.value && scholarshipSelect.value !== '0'
            && percentageSelect && percentageSelect.options.length > 1) {
            // Beca variable elegida: mostrar el select de % (HU56)
            [porcentajeBeca, percentageSelect].forEach(el => el && el.classList.remove('hidden'));
        }
        if (rBeca === 'no' && scholarshipSelect) {
            const sinBeca = Array.from(scholarshipSelect.options).find(o => o.value === '0');
            if (sinBeca && scholarshipSelect.value !== '0') {
                scholarshipSelect.value = '0';
                scholarshipSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        const hayPrestamos = prestamoSelect && Array.from(prestamoSelect.options).some(o => o.value !== '' && o.value !== '0');
        if (!hayPrestamos && prestamoSelect) {
            setRadio('radio-prestamo-prospecto', 'no');
            setRadioDisabled('radio-prestamo-prospecto', true);
            setInfo('radio-prestamo-prospecto-info', 'El préstamo estudiantil no está disponible para este nivel.');
        } else {
            aplicarRegla60('radio-prestamo-prospecto', prestamoSelect, becaPct(), 'radio-prestamo-prospecto-info');
        }
        if (prestamoContainer) {
            prestamoContainer.classList.toggle('hidden', radioValor('radio-prestamo-prospecto') !== 'si' || !hayPrestamos);
        }
        if (radioValor('radio-prestamo-prospecto') === 'no' && prestamoSelect) seleccionarCero(prestamoSelect);

        // HU58: continuar habilitado solo con todo respondido
        const necesitaPorcentaje = percentageSelect && percentageSelect.offsetParent !== null;
        const becaOk = rBeca === 'no' || (rBeca === 'si' && scholarshipSelect && scholarshipSelect.value !== '' &&
            (!necesitaPorcentaje || percentageSelect.value !== ''));
        const rP = radioValor('radio-prestamo-prospecto');
        const prestamoOk = rP === 'no' || (rP === 'si' && prestamoSelect && prestamoSelect.value !== '' && prestamoSelect.value !== '0');
        btnNext.disabled = !(becaOk && prestamoOk);
    };

    panel.addEventListener('change', sync);
    setInterval(() => {
        if (panel.offsetParent !== null) sync();
        // Prepa: préstamo predeterminado en "no" (HU57)
        if (panel.offsetParent !== null && NIVELES_PREPA.includes(nivel()) && !radioValor('radio-prestamo-prospecto')) {
            setRadio('radio-prestamo-prospecto', 'no');
        }
    }, 700);
};

/* ════════════════ SEGUROS (HU22-27 / HU60-65) ════════════════ */
const initSeguros = () => {
    // El paso 3 (seguros/coberturas) ahora lo construye y gobierna step3.js:
    // render por tipo (VIVE/accidente/colegiatura) + reglas de negocio + cálculo +
    // habilitación del botón. Se desactiva esta capa para no duplicar ni forzar los
    // selects. Ver memoria calculadora-tecmi-paso3-seguros.
    return;
    /* eslint-disable no-unreachable */
    const panel = document.getElementById('step-3');
    const contenedor = document.getElementById('seguros-dinamicos-container');
    const rowRadio = document.getElementById('row-radio-seguro-interes');
    const btnNext = document.getElementById('step-3-next');
    if (!panel || !contenedor || !btnNext) return;

    const esForzado = (texto) => {
        const n = nivel();
        const t = (texto || '').toLowerCase();
        if (t.includes('vive')) return NIVELES_VIVE_FORZADA.includes(n);
        if (t.includes('colegiatura')) return NIVELES_COLEGIATURA_FORZADA.includes(n);
        return false;
    };

    const filas = () => Array.from(contenedor.querySelectorAll('select[id^="select-seguro-"]')).map(select => {
        const row = select.closest('div.flex') || select.parentElement;
        const label = (panel.querySelector(`label[for="${select.id}"]`) || {}).textContent || '';
        return { select, row: row.closest('[class*="flex-wrap"]') || row, label };
    });

    const sync = () => {
        const items = filas();
        if (items.length === 0) {
            if (rowRadio) rowRadio.classList.add('hidden');
            btnNext.disabled = false;
            return;
        }

        let hayOpcionales = false;

        items.forEach(({ select, label }) => {
            if (esForzado(label)) {
                // HU22/25/60/63: cobertura obligatoria por nivel, no se puede cambiar
                if (select.value !== 'si') {
                    select.value = 'si';
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }
                select.disabled = true;
            } else {
                hayOpcionales = true;
            }
        });

        if (rowRadio) rowRadio.classList.toggle('hidden', !hayOpcionales);

        const rInteres = radioValor('radio-seguro-interes');
        items.forEach(({ select, row, label }) => {
            if (esForzado(label)) return;
            const ocultar = hayOpcionales && rInteres !== 'si';
            if (row) row.classList.toggle('hidden', ocultar);
            // HU23/61: con seguro propio, los seguros opcionales quedan en "No aplica"
            if (rInteres === 'no' && select.value !== 'no') {
                select.value = 'no';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        // HU26/64: continuar habilitado solo con todo respondido
        const radioOk = !hayOpcionales || rInteres !== null;
        const selectsOk = items.every(({ select }) => select.value !== '');
        btnNext.disabled = !(radioOk && selectsOk);
    };

    new MutationObserver(sync).observe(contenedor, { childList: true, subtree: true });
    panel.addEventListener('change', sync);
    setInterval(() => {
        if (panel.offsetParent !== null) sync();
    }, 700);
};

document.addEventListener('DOMContentLoaded', () => {
    initAlumno();
    initProspecto();
    initSeguros();
});
