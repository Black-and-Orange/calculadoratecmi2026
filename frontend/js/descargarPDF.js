// Requiere que jsPDF, html2canvas y FileSaver estén cargados en el HTML
function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('contenido');

    let viewportElem = document.querySelector("#viewportElem");
    viewportElem.setAttribute('content', 'width=1440');

    const bodyElem = document.querySelectorAll('body');
    bodyElem.forEach(el => {
        el.classList.add("capture");
    });
    const containerElems = document.querySelectorAll('.container');
    containerElems.forEach(el => {
        el.classList.add("capture-container");
    });
    const sectionElems = document.querySelectorAll('section');
    sectionElems.forEach(el => {
        el.style.paddingBottom = "15px";
        el.style.paddingTop = "15px";
        el.style.width = "1440px";
        el.style.margin = "0 auto";
        el.style.position = "relative";
        el.style.zIndex = "10";
    });
    const headerElems = document.querySelectorAll('header');
    headerElems.forEach(el => {
        el.style.width = "1440px";
        el.style.margin = "0 auto";
    });
    const benefitCards = document.querySelectorAll('.benefit-card-elem');
    benefitCards.forEach(el => {
        el.style.width = "25%";
    });
    const subTables = document.querySelectorAll('.sub-tables');
    subTables.forEach(el => {
        el.style.width = "50%";
    });
    const bannerFormElem = document.querySelector('.banner-form-section');
    if (bannerFormElem) bannerFormElem.style.minHeight = "0px";

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

    html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'letter', true);
        const pageWidth = 612;
        const pageHeight = 792;
        let imgHeight = 790;
        const imgWidth = (canvas.width * imgHeight) / canvas.height;
        let heightLeft = imgHeight;
        let position = 0;
        const marginX = (pageWidth - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', marginX, 0, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
        pdf.internal.scaleFactor = 10;
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', marginX, 0, imgWidth, imgHeight, '', 'FAST');
            heightLeft -= pageHeight;
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
    }).catch((error) => {
        console.error('Error al intentar generar el PDF:', error);
    });
} 