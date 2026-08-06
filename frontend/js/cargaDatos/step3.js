import { API_BASE_URL } from '../apiConfig.js';
import { clasificarSeguro } from '../utils/shared-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const segurosContainer = document.getElementById('seguros-dinamicos-container');
    const anuncioPoliza = document.getElementById('anuncioPoliza');
    const btnNext = document.getElementById('step-3-next');

    let segurosData = [];

    // ── Reglas de negocio (confirmadas con cliente; ver memoria calculadora-tecmi-paso3-seguros) ──
    const VIVE_FORZADA = [1, 2, 3, 4];                 // VIVE pre-marcada "sí"
    const VIVE_OCULTA = [6, 7, 8, 9, 10, 11, 12];      // VIVE no se muestra
    const COLEGIATURA_NIVELES = [1, 2, 3, 4];          // dónde aplica colegiatura

    const getLevelId = () => {
        try { return JSON.parse(localStorage.getItem('selectedNivel')); } catch (e) { return null; }
    };
    const getFormatCode = () => localStorage.getItem('codigoFormato');
    // Sin formato (p.ej. prepa) se trata como presencial, igual que la lógica previa.
    const esPresencial = () => { const f = getFormatCode(); return !f || f === 'P'; };

    // Clasificación canónica de seguros (fuente única en shared-utils, compartida con
    // el desglose de la Hoja de Resultados). Se conserva el nombre local `tipoSeguro`.
    const tipoSeguro = clasificarSeguro;

    // <select> oculto = fuente de verdad que lee calculateInsuranceCost (id intacto).
    const crearSelectOculto = (idSeguro, valor) => {
        const sel = document.createElement('select');
        sel.id = `select-seguro-${idSeguro}`;
        sel.name = `select-seguro-${idSeguro}`;
        sel.style.display = 'none';
        ['', 'si', 'no'].forEach(v => { const o = document.createElement('option'); o.value = v; sel.appendChild(o); });
        sel.value = valor || '';
        sel.addEventListener('change', () => { calculateInsuranceCost(); actualizarBoton(); });
        return sel;
    };
    const setOculto = (sel, v) => { if (sel && sel.value !== v) { sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true })); } };

    const crearRadios = (name, valor, disabled, opciones, onChange) => {
        const grp = document.createElement('div');
        grp.className = 'radio-group';
        opciones.forEach(({ v, txt }) => {
            const lbl = document.createElement('label');
            lbl.className = 'radio-opcion';
            const inp = document.createElement('input');
            inp.type = 'radio'; inp.name = name; inp.value = v;
            if (valor === v) inp.checked = true;
            if (disabled) inp.disabled = true;
            inp.addEventListener('change', () => onChange(v));
            lbl.appendChild(inp);
            lbl.appendChild(document.createTextNode(' ' + txt));
            grp.appendChild(lbl);
        });
        return grp;
    };

    const bloque = (titulo) => {
        const div = document.createElement('div');
        div.className = 'seguro-bloque';
        const h = document.createElement('p');
        h.className = 'font-semibold seguro-titulo';
        h.textContent = titulo;
        div.appendChild(h);
        return div;
    };
    const parrafo = (texto, clase) => {
        const p = document.createElement('p');
        p.className = clase || 'seguro-desc';
        p.textContent = texto;
        return p;
    };

    // ── VIVE: Sí/No, pre-marcado según reglas, NO editable (disabled siempre) ──
    function renderVive(seguro, levelId) {
        const valor = 'si'; // solo se renderiza en niveles forzados (ver generarSelectsSeguros)
        const div = bloque('Cobertura VIVE');
        div.appendChild(parrafo('Permite enriquecer tu experiencia estudiantil ofreciéndote una oferta de talleres extracurriculares, vivir eventos memorables en campus y asistir a eventos nacionales.'));
        const sel = crearSelectOculto(seguro.id_seguro, valor);
        div.appendChild(crearRadios(`vive-${seguro.id_seguro}`, valor, true, [{ v: 'si', txt: 'Sí' }, { v: 'no', txt: 'No' }], () => {}));
        div.appendChild(sel);
        segurosContainer.appendChild(div);
    }

    // ── Seguro contra accidente: contratar/propio + dropdown condicional + nota póliza ──
    function renderAccidente(grupo) {
        const div = bloque('Seguro de accidentes');
        div.appendChild(parrafo('Todos los estudiantes deberán contar con un seguro de accidentes, ya sea contratado con Tecmilenio o particular.'));
        div.appendChild(parrafo('¿Cuentas con un seguro propio o deseas contratar con Tecmilenio?', 'seguro-pregunta'));

        // Un <select> oculto por cada seguro del grupo = fuente de verdad del cálculo
        // (calculateInsuranceCost lee select-seguro-{id} con valor 'si'/'no').
        const ocultos = {};
        grupo.forEach(s => { ocultos[s.id_seguro] = crearSelectOculto(s.id_seguro, ''); });

        // Aplica la selección del dropdown a los ocultos: el elegido = 'si', el
        // resto = 'no'. Sin elegir (idElegido vacío) → todos '' para que el botón
        // "Continuar" siga deshabilitado hasta que se elija una opción.
        const aplicarSeleccion = (idElegido) => {
            grupo.forEach(s => {
                const v = idElegido ? (String(s.id_seguro) === idElegido ? 'si' : 'no') : '';
                setOculto(ocultos[s.id_seguro], v);
            });
        };

        // Dropdown "Selecciona el seguro de tu interés" (solo al elegir contratar),
        // con TODAS las opciones del grupo (accidentes, premium, gastos médicos…).
        const wrapSelect = document.createElement('div');
        wrapSelect.className = 'seguro-interes-wrap hidden';
        const lblSel = document.createElement('label');
        lblSel.className = 'font-semibold';
        lblSel.textContent = 'Selecciona el seguro de tu interés';
        const visibleSelect = document.createElement('select');
        visibleSelect.className = 'seguro-interes-select';
        const ph = document.createElement('option'); ph.value = ''; ph.textContent = 'Selecciona'; visibleSelect.appendChild(ph);
        grupo.forEach(s => {
            const opt = document.createElement('option');
            opt.value = String(s.id_seguro);
            opt.textContent = s.nombre_seguro;
            visibleSelect.appendChild(opt);
        });
        visibleSelect.addEventListener('change', () => aplicarSeleccion(visibleSelect.value));
        wrapSelect.appendChild(lblSel);
        wrapSelect.appendChild(visibleSelect);

        // Nota de póliza: dentro del bloque, justo bajo accidente; solo con seguro propio.
        const notaPoliza = document.createElement('p');
        notaPoliza.className = 'seguro-poliza hidden';
        notaPoliza.textContent = 'Deberás presentar una copia de tu póliza vigente con una cobertura mínima de $150,000';

        const radios = crearRadios('accidente-grupo', '', false, [
            { v: 'tecmilenio', txt: 'Deseo contratarlo con Tecmilenio' },
            { v: 'propio', txt: 'Cuento con mi propio seguro' }
        ], (v) => {
            if (v === 'tecmilenio') {
                wrapSelect.classList.remove('hidden');
                notaPoliza.classList.add('hidden');
                aplicarSeleccion(visibleSelect.value); // '' si aún no elige → botón deshabilitado
            } else {
                wrapSelect.classList.add('hidden');
                notaPoliza.classList.remove('hidden');
                grupo.forEach(s => setOculto(ocultos[s.id_seguro], 'no')); // propio: ninguno contratado
            }
        });

        div.appendChild(radios);
        div.appendChild(wrapSelect);
        div.appendChild(notaPoliza);
        grupo.forEach(s => div.appendChild(ocultos[s.id_seguro]));
        segurosContainer.appendChild(div);
    }

    // ── Cobertura de Colegiatura: Sí/No + texto. Cuando es obligatoria por política
    //    (presenciales de prepa/prof-semestral) queda pre-marcada "Sí" y BLOQUEADA,
    //    igual que VIVE; en el resto de casos sigue siendo seleccionable. ──
    function renderColegiatura(seguro, levelId) {
        const preseleccionada = esPresencial() && COLEGIATURA_NIVELES.includes(levelId);
        const valor = preseleccionada ? 'si' : '';
        const div = bloque('Cobertura de Colegiatura');

        const exclusiva = document.createElement('p');
        exclusiva.className = 'seguro-desc';
        exclusiva.innerHTML = '<strong>Cobertura exclusiva para alumnos de Tecmilenio.</strong> Por política de nuestra institución, la contratación de esta cobertura es obligatoria para los estudiantes presenciales de Preparatoria y Profesional Semestral. Cubre el pago del 100% de las colegiaturas en caso de fallecimiento del padre o tutor.';
        div.appendChild(exclusiva);

        const nota = document.createElement('p');
        nota.className = 'seguro-nota';
        nota.innerHTML = '<strong>Nota:</strong> Responsable del pago de colegiaturas.';
        div.appendChild(nota);

        const sel = crearSelectOculto(seguro.id_seguro, valor);
        // disabled = preseleccionada: bloqueada "Sí" cuando es obligatoria (como VIVE);
        // editable cuando no aplica la obligatoriedad.
        div.appendChild(crearRadios(`colegiatura-${seguro.id_seguro}`, valor, preseleccionada, [{ v: 'si', txt: 'Sí' }, { v: 'no', txt: 'No' }], (v) => setOculto(sel, v)));
        div.appendChild(sel);
        segurosContainer.appendChild(div);
    }

    // Render principal: en el orden del PDF (VIVE → accidente → colegiatura).
    function generarSelectsSeguros(seguros) {
        if (!segurosContainer) return;
        segurosContainer.innerHTML = '';
        const levelId = getLevelId();
        const buscar = (t) => seguros.find(s => s.estado && s.nombre_seguro && tipoSeguro(s) === t);

        const vive = buscar('vive');
        const colegiatura = buscar('colegiatura');
        // Grupo del bloque "Seguro de accidentes": todos los seguros del nivel que
        // NO sean VIVE ni Colegiatura/Estudiantil (es decir, accidentes + "otros",
        // como premium o gastos médicos elite). Así, cualquier seguro que el admin
        // agregue en el catálogo (que no sea VIVE/Colegiatura) aparece como opción
        // del desplegable, sin volver a tocar código.
        const grupoAccidente = seguros.filter(s => s.estado && s.nombre_seguro &&
            (tipoSeguro(s) === 'accidente' || tipoSeguro(s) === 'otro'));

        // VIVE solo se muestra donde está forzada (1-4): pre-marcada "Sí" y bloqueada.
        // En el resto (5, 13, 6-12) no aplica → no se renderiza.
        if (vive && VIVE_FORZADA.includes(levelId)) renderVive(vive, levelId);
        if (grupoAccidente.length && esPresencial()) renderAccidente(grupoAccidente);
        if (colegiatura && COLEGIATURA_NIVELES.includes(levelId)) renderColegiatura(colegiatura, levelId);

        if (!segurosContainer.children.length) {
            segurosContainer.innerHTML = '<p class="text-muted">No hay seguros disponibles para este nivel.</p>';
        }

        calculateInsuranceCost();
        actualizarBoton();
    }

    // Continuar habilitado solo cuando todo lo requerido está respondido (sí/no).
    function actualizarBoton() {
        if (!btnNext) return;
        const selects = Array.from(segurosContainer.querySelectorAll('select[id^="select-seguro-"]'));
        const ok = selects.every(s => s.value === 'si' || s.value === 'no');
        btnNext.disabled = !ok;
    }

    // Función para cargar seguros desde el backend
    async function fetchSeguros() {
        const levelId = getLevelId();
        if (!levelId) {
            console.warn('No hay nivel seleccionado');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/seguros/nivel/${levelId}`);
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const segurosArray = await response.json();
            if (Array.isArray(segurosArray) && segurosArray.length > 0) {
                segurosData = segurosArray;
                generarSelectsSeguros(segurosData);
            } else {
                segurosData = [];
                segurosContainer.innerHTML = '<p class="text-muted">No hay seguros disponibles para este nivel.</p>';
            }
        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
            segurosContainer.innerHTML = '<p class="text-danger">Error al cargar los seguros.</p>';
        }
    }

    // Función para calcular el costo de seguros (MOTOR DE CÁLCULO: se conserva intacto)
    function calculateInsuranceCost() {
        const levelId = getLevelId() || 1;
        let totalCost = 0;
        let totalConInteres = window.totalConInteres || 0;

        // Obtener seguros seleccionados desde localStorage (más confiable que buscar en DOM)
        const segurosSeleccionados = JSON.parse(localStorage.getItem('segurosSeleccionados') || '{}');

        // Iterar sobre todos los seguros disponibles
        segurosData.forEach(seguro => {
            if (!seguro.nombre_seguro) return;
            if (!seguro.estado) return; // Saltar seguros deshabilitados

            // Lógica especial para VIVE: no aplicar en niveles 6-12 (pero sí en 13)
            if (seguro.nombre_seguro && seguro.nombre_seguro.toLowerCase().includes('vive')) {
                if (levelId >= 6 && levelId <= 12) {
                    return; // No sumar VIVE en niveles 6-12
                }
                // El nivel 13 (Ejecutivo Bimestral MAPS) SÍ puede tener VIVE
            }

            // Verificar si el seguro está seleccionado (desde localStorage o DOM)
            const seleccionado = segurosSeleccionados[seguro.id_seguro];
            const selectElement = document.getElementById(`select-seguro-${seguro.id_seguro}`);

            // Usar localStorage primero, luego DOM como respaldo
            const estaSeleccionado = (seleccionado && seleccionado.valor === 'si') ||
                                    (selectElement && selectElement.value === 'si');

            if (estaSeleccionado) {
                totalCost += parseFloat(seguro.valor) || 0;
            }
        });

        const divisor = (levelId === 1 || levelId === 2 || levelId === 4) ? 5 : (levelId === 10) ? 3 : 4;
        const interesDividido = totalConInteres / divisor;
        const primeraCuota = interesDividido + totalCost;

        localStorage.setItem('interesDividido', JSON.stringify(interesDividido));
        localStorage.setItem('primeraCuota', JSON.stringify(primeraCuota));
        localStorage.setItem('totalCost', totalCost.toString());

        // Actualizar valores de seguros seleccionados en localStorage (desde DOM si está disponible)
        const segurosSeleccionadosActualizados = {};
        segurosData.forEach(seguro => {
            if (!seguro.nombre_seguro) return;
            const selectElement = document.getElementById(`select-seguro-${seguro.id_seguro}`);
            if (selectElement) {
                segurosSeleccionadosActualizados[seguro.id_seguro] = {
                    nombre: seguro.nombre_seguro,
                    valor: selectElement.value
                };
            } else {
                // Si no hay elemento DOM, usar el valor de localStorage
                const seleccionado = segurosSeleccionados[seguro.id_seguro];
                if (seleccionado) {
                    segurosSeleccionadosActualizados[seguro.id_seguro] = seleccionado;
                }
            }
        });
        localStorage.setItem('segurosSeleccionados', JSON.stringify(segurosSeleccionadosActualizados));
    }

    // Inicializar cuando el step 3 se muestre
    const step3 = document.getElementById('step-3');
    if (step3) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (!step3.classList.contains('hidden')) {
                        fetchSeguros();
                    }
                }
            });
        });

        observer.observe(step3, { attributes: true, attributeFilter: ['class'] });

        // También inicializar si ya está visible
        if (!step3.classList.contains('hidden')) {
            fetchSeguros();
        }

        // Escuchar cambios de nivel
        window.addEventListener('storage', (e) => {
            if (e.key === 'selectedNivel' && !step3.classList.contains('hidden')) {
                fetchSeguros();
            }
        });
    }

    // Exponer función para uso externo si es necesario
    window.calculateInsuranceCost = calculateInsuranceCost;
});
