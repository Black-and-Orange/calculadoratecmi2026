// Requiere que jsPDF, html2canvas y FileSaver estén cargados en el HTML
function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('contenido');

    let viewportElem = document.querySelector("#viewportElem");
    viewportElem.setAttribute('content', 'width=1440');

    // La hoja rediseñada (.cotiz-*) se acomoda sola a 1440; forzarle anchos
    // hace que el grid y la tabla se desborden de la tarjeta en la captura.
    const esHojaNueva = !!document.querySelector('.cotiz-planes');

    const bodyElem = document.querySelectorAll('body');
    bodyElem.forEach(el => {
        el.classList.add("capture");
    });
    const containerElems = document.querySelectorAll('.container');
    containerElems.forEach(el => {
        el.classList.add("capture-container");
    });
    const sectionElems = esHojaNueva ? [] : document.querySelectorAll('section');
    sectionElems.forEach(el => {
        el.style.paddingBottom = "15px";
        el.style.paddingTop = "15px";
        el.style.width = "1440px";
        el.style.margin = "0 auto";
        el.style.position = "relative";
        el.style.zIndex = "10";
    });
    const headerElems = esHojaNueva ? [] : document.querySelectorAll('header');
    headerElems.forEach(el => {
        el.style.width = "1440px";
        el.style.margin = "0 auto";
    });
    const benefitCards = document.querySelectorAll('.benefit-card-elem');
    benefitCards.forEach(el => {
        el.style.width = "25%";
    });
    const subTables = esHojaNueva ? [] : document.querySelectorAll('.sub-tables');
    subTables.forEach(el => {
        el.style.width = "50%";
    });
    const bannerFormElem = document.querySelector('.banner-form-section');
    if (bannerFormElem) bannerFormElem.style.minHeight = "0px";

    // Recortar los adornos que se desbordan a la derecha (igual que hace el
    // viewport en pantalla); sin esto html2canvas captura más ancho que 1440
    // y el PDF sale recortado del lado derecho.
    element.style.width = "1440px";
    element.style.margin = "0 auto";
    element.style.overflow = "hidden";

    // Ocultar temporalmente ciertos elementos
    const elementosOcultos = document.querySelectorAll('.no-print');
    elementosOcultos.forEach(el => {
        el.dataset.originalDisplay = el.style.display;
        el.style.display = 'none';
    });
    const elementosOcultosHbspt = document.querySelectorAll('.hs-tools-menu');
    elementosOcultosHbspt.forEach(el => {
        el.dataset.originalDisplay = el.style.display;
        el.style.display = 'none';
    });

    // Puntos de corte "seguros" para paginar SIN partir tarjetas/tablas: el borde
    // inferior de cada bloque de la hoja (hero + hijos directos de .cotiz-sheet).
    // Se miden con los estilos de captura ya aplicados (ancho forzado a 1440).
    const elementRect = element.getBoundingClientRect();
    const cortesCss = [];
    element.querySelectorAll('.dash-hero, .cotiz-sheet > *').forEach(b => {
        cortesCss.push(b.getBoundingClientRect().bottom - elementRect.top);
    });

    // windowWidth debe coincidir con el ancho forzado (1440) o html2canvas
    // recorta el contenido al ancho real de la ventana.
    html2canvas(element, { scale: 2, useCORS: true, width: 1440, windowWidth: 1440 }).then((canvas) => {
        const pdf = new jsPDF('p', 'pt', 'letter', true);
        const pageWidth = 612;
        const pageHeight = 792;
        const imgWidth = pageWidth;
        const pxPorPt = canvas.width / pageWidth;            // px de canvas por punto PDF
        const pageHeightPx = pageHeight * pxPorPt;           // alto de página en px de canvas
        const cssToCanvas = canvas.height / elementRect.height;
        // Cortes seguros (en px de canvas), de arriba a abajo.
        const cortes = cortesCss
            .map(c => c * cssToCanvas)
            .filter(y => y > 0 && y < canvas.height)
            .sort((a, b) => a - b);

        // Paginar hacia abajo: cada página toma lo máximo que cabe, pero se
        // retrocede al último borde de bloque que quepa para no cortar contenido.
        // Si un bloque es más alto que una página, se hace corte duro (fallback).
        let renderedY = 0;
        let primera = true;
        while (renderedY < canvas.height - 1) {
            let sliceEnd = renderedY + pageHeightPx;
            if (sliceEnd >= canvas.height) {
                sliceEnd = canvas.height;
            } else {
                const seguros = cortes.filter(y => y > renderedY + 20 && y <= sliceEnd);
                if (seguros.length) sliceEnd = seguros[seguros.length - 1];
            }
            const sliceHeightPx = Math.max(1, Math.round(sliceEnd - renderedY));

            // Recortar esa franja en un canvas propio y agregarla como página.
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeightPx;
            pageCanvas.getContext('2d').drawImage(
                canvas, 0, renderedY, canvas.width, sliceHeightPx,
                0, 0, canvas.width, sliceHeightPx
            );
            const pageImgHeight = sliceHeightPx / pxPorPt;   // alto de la franja en puntos

            if (!primera) pdf.addPage();
            pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, pageImgHeight, '', 'FAST');
            primera = false;
            renderedY = sliceEnd;
        }
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) {
            saveAs(pdf.output('bloburl'), "tecmilenio-plan-v2.pdf");
        } else {
            pdf.save('tecmilenio-plan.pdf');
        }
    }).finally(() => {
        // Restaurar la visibilidad original de los elementos
        elementosOcultos.forEach(el => {
            el.style.display = el.dataset.originalDisplay;
        });
        viewportElem.setAttribute('content', 'width=device-width, initial-scale=1.0');
        const bodyElem = document.querySelectorAll('body');
        bodyElem.forEach(el => {
            el.classList.remove("capture");
        });
        const containerElems = document.querySelectorAll('.container');
        containerElems.forEach(el => {
            el.classList.remove("capture-container");
        });
        const sectionElems = document.querySelectorAll('section');
        sectionElems.forEach(el => {
            el.style.removeProperty("padding-bottom")
            el.style.removeProperty("padding-top")
            el.style.removeProperty("width")
            el.style.removeProperty("margin")
            el.style.removeProperty("position")
            el.style.removeProperty("z-index")
        });
        const headerElems = document.querySelectorAll('header');
        headerElems.forEach(el => {
            el.style.removeProperty("width")
            el.style.removeProperty("margin")
        });
        const benefitCards = document.querySelectorAll('.benefit-card-elem');
        benefitCards.forEach(el => {
            el.style.removeProperty("width")
        });
        const subTables = document.querySelectorAll('.sub-tables');
        subTables.forEach(el => {
            el.style.removeProperty("width")
        });
        const bannerFormElem = document.querySelector('.banner-form-section');
        if (bannerFormElem) bannerFormElem.style.removeProperty("min-height")
        element.style.removeProperty("width");
        element.style.removeProperty("margin");
        element.style.removeProperty("overflow");
    }).catch((error) => {
        console.error('Error al intentar generar el PDF:', error);
    });
} 