/**
 * Sprint 4 — HU40/41/79/80: flujo "Nueva cotización" + saludo del hero.
 *
 * - "Conservar mis datos": conserva en localStorage SOLO `perfilUsuario` y
 *   `datosPersonales`, borra todo lo demás y redirige a index.html.
 * - "Empezar desde cero": limpia todo el localStorage y redirige a index.html.
 *
 * Este módulo NO toca el motor de cálculo (resultados.js); solo lee datos
 * ya guardados (query string / localStorage) para personalizar el saludo.
 */

const LLAVES_A_CONSERVAR = ['perfilUsuario', 'datosPersonales'];

/* ─────────────── saludo del hero ─────────────── */

function obtenerNombreEstudiante() {
    const limpiar = (v) => {
        if (!v) return '';
        const t = String(v).trim();
        return (t === '' || t.toUpperCase() === 'N/A' || t === 'null' || t === 'undefined') ? '' : t;
    };

    // 1) Query string (mismo origen de datos que usa resultados.js)
    const params = new URLSearchParams(window.location.search);
    let nombre = limpiar(params.get('txt-name'));

    // 2) localStorage 'nombre' (lo guarda resultados.js)
    if (!nombre) nombre = limpiar(localStorage.getItem('nombre'));

    // 3) datosPersonales (lo guarda main.js en el paso de datos personales)
    if (!nombre) {
        try {
            const dp = JSON.parse(localStorage.getItem('datosPersonales') || 'null');
            if (dp && dp.nombre) nombre = limpiar(dp.nombre);
        } catch (e) { /* sin datos personales */ }
    }

    return nombre;
}

function pintarSaludo() {
    const destino = document.getElementById('dash-greeting-nombre');
    if (!destino) return;

    const aplicar = (nombre) => {
        if (!nombre) return false;
        // Solo el primer nombre, capitalizado, para un saludo cercano
        const primerNombre = nombre.split(/\s+/)[0];
        destino.textContent = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1);
        return true;
    };

    if (aplicar(obtenerNombreEstudiante())) return;

    // Último recurso: esperar a que resultados.js pinte <p id="nombre"> en el resumen
    let intentos = 0;
    const reloj = setInterval(() => {
        intentos += 1;
        const enResumen = document.getElementById('nombre');
        const texto = enResumen ? enResumen.textContent : '';
        if ((texto && texto.trim() && texto.trim() !== 'N/A' && aplicar(texto)) || intentos > 20) {
            clearInterval(reloj);
        }
    }, 250);
}

/* ─────────────── modal nueva cotización ─────────────── */

function abrirModal(modal) {
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dash-modal-abierto');
}

function cerrarModal(modal) {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('dash-modal-abierto');
}

function conservarDatosYReiniciar() {
    // Guardar únicamente las llaves permitidas antes de limpiar todo
    const conservadas = {};
    LLAVES_A_CONSERVAR.forEach((llave) => {
        const valor = localStorage.getItem(llave);
        if (valor !== null) conservadas[llave] = valor;
    });

    localStorage.clear();

    Object.keys(conservadas).forEach((llave) => {
        localStorage.setItem(llave, conservadas[llave]);
    });

    // Señal one-shot para que index.html (main.js) reutilice perfil + datos
    // personales: saltar el selector de perfil y pre-llenar los campos, dejando
    // al usuario solo re-elegir el plan de estudios.
    localStorage.setItem('reusarDatos', '1');

    window.location.href = 'index.html';
}

function empezarDesdeCero() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function inicializarModal() {
    const modal = document.getElementById('modal-nueva-cotizacion');
    const btnAbrir = document.getElementById('btn-nueva-cotizacion');
    const btnAbrirHero = document.getElementById('btn-nueva-cotizacion-hero');
    const btnConservar = document.getElementById('btn-nc-conservar');
    const btnCero = document.getElementById('btn-nc-cero');

    if (!modal || !btnAbrir) return;

    btnAbrir.addEventListener('click', () => abrirModal(modal));
    if (btnAbrirHero) btnAbrirHero.addEventListener('click', () => abrirModal(modal));

    modal.querySelectorAll('[data-nc-cerrar]').forEach((elem) => {
        elem.addEventListener('click', () => cerrarModal(modal));
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && modal.classList.contains('visible')) {
            cerrarModal(modal);
        }
    });

    if (btnConservar) btnConservar.addEventListener('click', conservarDatosYReiniciar);
    if (btnCero) btnCero.addEventListener('click', empezarDesdeCero);
}

/* ─────────────── arranque ─────────────── */

function iniciar() {
    pintarSaludo();
    inicializarModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
} else {
    iniciar();
}
