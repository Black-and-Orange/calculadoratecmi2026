
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);

    const nombre = params.get('txt-name') || 'N/A';
    const periodo = params.get('select-period') || 'N/A';
    const campus = params.get('select-campus') || 'N/A';
    const nivel = params.get('select-grade') || 'N/A';
    const materias = params.get('select-subjects') || 'N/A';

    document.getElementById('nombre').textContent = nombre;
    document.getElementById('periodo').textContent = periodo;
    document.getElementById('campus').textContent = campus;
    document.getElementById('nivel').textContent = nivel;
    document.getElementById('materias').textContent = materias;

    let segurosData = {};

    const levelId = JSON.parse(localStorage.getItem('selectedNivel')) || 1;

    async function fetchSeguros() {
        try {
            const response = await fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/seguros');
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const data = await response.json();

            if (levelId === 3) {
                segurosData = data[1];
            } else {
                segurosData = data[0];
            }
        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
        }
    }

    await fetchSeguros();

    function formatearPesos(numero) {
        return parseFloat(numero).toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function recuperarValores() {
        const insuranceValue = JSON.parse(localStorage.getItem('insuranceValue'));
        const coverageValue = JSON.parse(localStorage.getItem('coverageValue'));
        const viveValue = JSON.parse(localStorage.getItem('viveValue'));

        return {
            insurance: insuranceValue === 'si' ? formatearPesos(segurosData.seguro_accidentes) : 'No Aplica',
            coverage: coverageValue === 'si' ? formatearPesos(segurosData.seguro_estudiantil) : 'No Aplica',
            vive: viveValue === 'si' ? formatearPesos(segurosData.cobertura_vive) : 'No Aplica'
        };
    }

    function recuperarValoresAdicionales() {
        const costoTotalRecuperado = JSON.parse(localStorage.getItem('costoTotal'));
        const finalAmountRecuperado = JSON.parse(localStorage.getItem('finalAmount'));
        const totalContadoRecuperado = JSON.parse(localStorage.getItem('totalContado'));
        const interesDivididoRecuperado = JSON.parse(localStorage.getItem('interesDividido'));
        const primeraCuotaRecuperada = JSON.parse(localStorage.getItem('primeraCuota'));
        const selectedScholarshipNameRecuperado = JSON.parse(localStorage.getItem('selectedScholarshipName'));
        const selectedScholarshipValueRecuperado = JSON.parse(localStorage.getItem('selectedScholarshipValue'));
        const selectedSupportValueRecuperado = JSON.parse(localStorage.getItem('selectedSupportValue'));
        const prestamoRecuperado = JSON.parse(localStorage.getItem('selectedprestamo'));
        const totalCostRecuperado = JSON.parse(localStorage.getItem('totalCost'));
        
        let retrievedPercentage = localStorage.getItem('selectedPercentage');

        if (retrievedPercentage) {
            try {
                retrievedPercentage = JSON.parse(retrievedPercentage);
            } catch (error) {
                console.error('Error al parsear retrievedPercentage:', error);
                retrievedPercentage = null;
            }
        } else {
            retrievedPercentage = null;
        }

        return {
            costoTotal: formatearPesos(costoTotalRecuperado),
            finalAmount: formatearPesos(finalAmountRecuperado),
            totalContado: formatearPesos(totalContadoRecuperado),
            interesDividido: formatearPesos(interesDivididoRecuperado),
            primeraCuota: formatearPesos(primeraCuotaRecuperada),
            totalCost: totalContadoRecuperado+totalCostRecuperado,
            scholarshipName: selectedScholarshipNameRecuperado,
            scholarshipValue: selectedScholarshipValueRecuperado,
            supportValue: selectedSupportValueRecuperado,
            prestamoRecuperado: prestamoRecuperado,
            retrievedPercentage: retrievedPercentage
        };
    }

    function mostrarValores(valores) {
        let factorMultiplicador = 4;
        let textoMensualidades = '4 Mensualidades';

        if (nivel === 'Preparatoria Tetramestral') {
            factorMultiplicador = 3;
            textoMensualidades = '3 Mensualidades';
        }
        
        const totalfinanciado = parseFloat(valores.interesDividido.replace(/[^0-9.-]+/g, "")) * factorMultiplicador + parseFloat(valores.primeraCuota.replace(/[^0-9.-]+/g, ""));

        if (colegiatura) {
            colegiatura.textContent = valores.costoTotal;
        }
        if (apoyoFinanciamiento) {
            apoyoFinanciamiento.textContent = `-${valores.finalAmount}`;
        }
        if (totalContado) {
            totalContado.textContent = formatearPesos(valores.totalCost);
        }
        if (primerPago) {
            primerPago.textContent = valores.primeraCuota;
        }
        if (mensualidades) {
            mensualidades.textContent = valores.interesDividido;
        }
        if (totalFinanciado) {
            totalFinanciado.textContent = formatearPesos(totalfinanciado);
        }
        if (mensualidadesText) {
            mensualidadesText.textContent = textoMensualidades;
        }
        if (apoyoFinanciero && valores.scholarshipName) {
            apoyoFinanciero.textContent = valores.scholarshipName;
        }

        if (apoyoFinanciero.textContent === 'Elige' || apoyoFinanciero.textContent === "null") {
            apoyoFinanciero.textContent = `Apoyo Estudiantil`;
        }
        if (seguroAccidentes) {
            seguroAccidentes.textContent = valores.insurance;
        }
        if (coberturaEstudiantil) {
            coberturaEstudiantil.textContent = valores.coverage;
        }
        if (vive) {
            vive.textContent = valores.vive;
        }
        if (apoyoEstudiantil) {
            apoyoEstudiantil.textContent = `${valores.supportValue}%`;
        }
        if (prestamoPorcentaje) {
            prestamoPorcentaje.textContent = `${valores.prestamoRecuperado}`;
        }
        if (apoyoEstudiantil.textContent === "null%") {
            apoyoEstudiantil.textContent = `0%`;
        }
        if (prestamoPorcentaje.textContent === "null") {
            prestamoPorcentaje.textContent = `0%`;
        }
        if (beca) {
            beca.textContent =
                valores.scholarshipValue > 0 ? `${valores.scholarshipValue}%` :
                    valores.retrievedPercentage > 0 ? `${valores.retrievedPercentage}%` :
                        "0%";
        }

        hideZeroPercentages();
    }

    function hideZeroPercentages() {
        const elementBeca = document.getElementById('beca');
        const elementLabelBeca = document.getElementById('label-beca');

        const elementApoyo = document.getElementById('apoyoEstudiantil');
        const elementLabelApoyo = document.getElementById('label-apoyoEstudiantil');

        const elementPrestamo = document.getElementById('prestamoPorcentaje');
        const elementLabelPrestamo = document.getElementById('label-prestamo');

        const apoyos = document.getElementById('apoyos');

        if (elementBeca.innerText === '0%') {
            elementBeca.classList.add('hidden');
            elementLabelBeca.classList.add('hidden');
        }

        if (elementApoyo.innerText === '0%') {
            elementApoyo.classList.add('hidden');
            elementLabelApoyo.classList.add('hidden');
        }

        if (elementPrestamo.innerText === '0%') {
            elementPrestamo.classList.add('hidden');
            elementLabelPrestamo.classList.add('hidden');
        }

        if (elementBeca.innerText === '0%' && elementApoyo.innerText === '0%' && elementPrestamo.innerText === '0%') {
            apoyos.classList.add('hidden');
        }
    }

    function actualizarPlanContado(valores) {
        const bloquePlanContado = document.querySelector('.sub-tables');
        const apoyoFinanciamiento = document.getElementById('apoyoFinanciamiento');


        if (parseFloat(valores.finalAmount.replace(/[^0-9.-]+/g, "")) === 0) {
            // Ocultar fila de apoyo financiero
            apoyoFinanciamiento.closest('tr').style.display = 'none';
            // Modificar el bloque para mostrar solo la colegiatura y total contado
            bloquePlanContado.innerHTML = `
            <div
                class="relative overflow-hidden border-2 border-solid border-secondary-color-3 rounded-[6px] h-full">
                <table class="w-full">
                    <tr>
                        <th class="bg-secondary-color-3 text-white p-[11px]" colspan="2">
                            <p class="text-[24px] lg:text-[30px] leading-[26px] lg:leading-[38px] mb-0">Plan
                                de contado</p>
                        </th>
                    </tr>
                    <tr>
                        <td class="px-[10px] md:px-[20px] py-[10px]">
                            <p id="colegiaturaText" class="text-[18px] lg:text-[23px] leading-[24px] lg:leading-[31px] font-semibold mb-0">
                                Total Contado</p>
                            <p id="colegiaturaText" class="text-[18px] lg:text-[23px] leading-[24px] lg:leading-[31px] font-semibold mb-0">
                                Colegiatura 2025</p>
                        </td>
                        <td class="px-[10px] md:px-[20px] py-[10px]">
                            <p id="colegiatura" class="text-[20px] lg:text-[28px] leading-[28px] lg:leading-[36px] font-bold mb-0 text-right">
                                ${formatearPesos(valores.totalCost)}</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
        } else {
            const valores = recuperarValores();
    const valoresAdicionales = recuperarValoresAdicionales();
            mostrarValores({ ...valores, ...valoresAdicionales });
        }
    }

    const valores = recuperarValores();
    const valoresAdicionales = recuperarValoresAdicionales();

    mostrarValores({ ...valores, ...valoresAdicionales });
    actualizarPlanContado(valoresAdicionales);



    const tituloPorNivel = {
        'Preparatoria Semestral': 'Impulsa tu futuro desde hoy',
        'Preparatoria Tetramestral': 'Avanza con determinación hacia tu futuro profesional',
        'Profesional Semestral': 'Encuentra una carrera pensada para ti'
    };

    const beneficiosPorNivel = {
        'Preparatoria Semestral': [
            {
                title: "Certificaciones",
                description: "Te ofrecemos 3 certificaciones que te preparan con habilidades para el futuro: Tecnología (Python), Creatividad e Innovación y Finanzas personales.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-1.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Interculturalidad",
                description: "Aprende en un entorno global donde te desarrollas junto a una comunidad multicultural por medio de programas como el verano intercultural.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-2.svg",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Vivencia Estudiantil",
                description: "Participarás en proyectos y eventos que fomentan tu desarrollo académico y personal, como ser parte de una Sociedad Estudiantil donde harás nuevas amigas y amigos, o en la competencia de robótica FIRST, que te brindará la oportunidad para destacar a nivel internacional.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-3.svg",
                colorClass: "border-secondary-color-1 bg-secondary-color-1"
            },
            {
                title: "Propósito de Vida",
                description: "Descubre tu propósito a través de un acompañamiento apreciativo y el Plan Vocacional Tecmilenio.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-4.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            }
        ],
        'Preparatoria Tetramestral': [
            {
                title: "Duración",
                description: "Completarás tu preparatoria tetramestral en dos años para avanzar con mayor agilidad en tu camino educativo.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/duracion.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Certificación en Tecnología",
                description: "Aprende lenguaje de programación Python e impulsa tu camino hacia la innovación tecnológica.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/certificaci%C3%B3n_tecnolog%C3%ADa.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            },
            {
                title: "Interculturalidad",
                description: "Aprende en un entorno intercultural, donde tendrás la oportunidad de aprender un segundo o tercer idioma.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-2.svg",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Vivencia Estudiantil",
                description: "Participarás en proyectos y eventos que fomentan tu desarrollo académico y personal, como las Sociedades Estudiantiles.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-3.svg",
                colorClass: "border-secondary-color-1 bg-secondary-color-1"
            },
            {
                title: "Propósito de Vida",
                description: "Descubre tu propósito a través de un acompañamiento apreciativo y el Plan Vocacional Tecmilenio.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-4.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            }
        ],
        'Profesional Semestral': [
            {
                title: "Personalización",
                description: "Puedes personalizar hasta el 40% de tu plan de estudios y alinear tus aprendizajes a tus metas profesionales.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/personalizacion.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Empleabilidad",
                description: "Recibe una formación integral que te prepara para el éxito profesional con las habilidades técnicas y humanas más demandadas del mercado laboral. Esto a través de herramientas como la Plataforma de Éxito Profesional.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/empleabilidad.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            },
            {
                title: "Acompañamiento",
                description: "Contarás con una red de apoyo que te guiará a lo largo de tu carrera para desarrollarte como profesionista y persona.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/acompañamiento.png",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Vivencia Estudiantil",
                description: "Asiste a eventos nacionales e internacionales e intégrate a grupos estudiantiles, deportivos, artísticos, sociales, como Interhalcones, ARTFEST, entre otros.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-3.svg",
                colorClass: "border-secondary-color-1 bg-secondary-color-1"
            },
            {
                title: "Docentes expertos",
                description: "Estudia clases impartidas por profesores con relación en la industria.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/profesores.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Interculturalidad",
                description: "Vive una experiencia intercultural con más de 75 instituciones con prestigio internacional.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/benefits-icon-2.svg",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Insignias Digitales",
                description: "Recibe reconocimientos que validan tus habilidades y conocimientos adquiridos de manera segura y fácil de compartir.",
                icon: "https://universidad.tecmilenio.mx/hubfs/calculadora-ago24/certific.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            }
        ]
    };


    function actualizarBeneficios(nivel) {
        const benefitsWrapper = document.getElementById('benefits-wrappers');
        benefitsWrapper.innerHTML = ''; // Limpiar el contenedor de beneficios
        const titleBenefit = document.getElementById('titleBenefit');
        titleBenefit.innerText = tituloPorNivel[nivel] || 'N/A';

        const beneficios = beneficiosPorNivel[nivel] || [];

        beneficios.forEach((beneficio, index) => {
            const benefitItem = document.createElement('div');
            benefitItem.className = "px-4 w-full md:w-1/2 xl:w-1/4 relative mt-24 benefit-card-elem";

            benefitItem.innerHTML = `
                <div class="border-2 border-solid ${beneficio.colorClass} rounded-[6px] relative px-[20px] py-[30px] h-full benefits-item">
                    <div class="${beneficio.colorClass} w-[96px] h-[96px] inline-block mx-auto absolute rounded-full -top-[75px] left-1/2 -translate-x-1/2">
                        <img class="w-[45px] h-[45px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            src="${beneficio.icon}">
                    </div>
                    <p class="font-bold text-[18px] leading-[26px]">${beneficio.title}</p>
                    <p class="text-[16px] leading-[24px]">${beneficio.description}</p>
                </div>
            `;

            benefitsWrapper.appendChild(benefitItem);
        });

        // Si hay 5 beneficios, cambiar la disposición
        if (beneficios.length === 5) {
            benefitsWrapper.classList.add('benefits-3-2');
        } else {
            benefitsWrapper.classList.remove('benefits-3-2');
        }
    }

    const nivelSeleccionado = nivel;

    actualizarBeneficios(nivelSeleccionado);


    // Estilos para el nivel "Profesional Semestral"
    const linkStyle = {
        'Profesional Semestral': 'css/style-universidad.css'
    };

    // Función para agregar el link al head
    function agregarEstiloProfesionalSemestral() {
        if (nivelSeleccionado === 'Profesional Semestral') {
            // Verifica si el estilo ya ha sido agregado para evitar duplicados
            if (!document.querySelector('link[href="' + linkStyle['Profesional Semestral'] + '"]')) {
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = linkStyle['Profesional Semestral'];
                document.head.appendChild(linkElement);
            }
        }
    }

    agregarEstiloProfesionalSemestral();

    // Obtener la fecha actual
    const fechaActual = new Date();

    // Crear una copia de la fecha actual para calcular la fecha de vencimiento
    const fechaVencimiento = new Date(fechaActual);

    // Sumar 5 días a la fecha de vencimiento
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);

    // Formatear la fecha en el formato "dd/mm/yyyy"
    const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaVencimientoFormateada = fechaVencimiento.toLocaleDateString('es-ES', opcionesFormato);

    // Seleccionar el elemento y actualizar su contenido
    document.getElementById('fechaVencimiento').textContent = `Vigencia de la propuesta: ${fechaVencimientoFormateada}`;



});
