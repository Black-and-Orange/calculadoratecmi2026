// Soporte para embeber la calculadora en un <iframe> (p. ej. la página de
// HubSpot universidad.tecmilenio.mx/calculadora). Publica la altura del
// contenido al documento contenedor para que el iframe crezca/encoja con cada
// paso del wizard y no aparezca doble barra de scroll.
//
// Solo actúa cuando la página corre DENTRO de un iframe; si se abre directo no
// hace nada. El mensaje lleva { tecmiCalc: true, height } para que el listener
// del contenedor pueda filtrarlo.
(function () {
    if (window.self === window.top) return; // no está embebida → nada que hacer

    let ultimaAltura = 0;

    const alturaActual = () => Math.max(
        document.documentElement ? document.documentElement.scrollHeight : 0,
        document.body ? document.body.scrollHeight : 0
    );

    const publicarAltura = () => {
        const h = alturaActual();
        if (h > 0 && h !== ultimaAltura) {
            ultimaAltura = h;
            try {
                window.parent.postMessage({ tecmiCalc: true, height: h }, '*');
            } catch (e) { /* contenedor no accesible */ }
        }
    };

    window.addEventListener('load', publicarAltura);
    window.addEventListener('resize', publicarAltura);
    document.addEventListener('DOMContentLoaded', publicarAltura);

    // El wizard cambia de alto al avanzar de paso / cargar datos async.
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(publicarAltura);
        const observar = () => { if (document.documentElement) ro.observe(document.documentElement); };
        document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', observar)
            : observar();
    }

    // Respaldo por si algún cambio de alto no dispara el observer.
    setInterval(publicarAltura, 800);
})();
