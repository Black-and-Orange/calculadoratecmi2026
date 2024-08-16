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
            scholarshipName: selectedScholarshipNameRecuperado,
            scholarshipValue: selectedScholarshipValueRecuperado,
            supportValue: selectedSupportValueRecuperado,
            retrievedPercentage: retrievedPercentage
        };
    }

    function mostrarValores(valores) {
        let factorMultiplicador = 4;
        let textoMensualidades = '4 Mensualidades';

        if (nivel == 'Preparatoria Tetramestral') {
            factorMultiplicador = 3;
            textoMensualidades = '3 Mensualidades';
        }

        const totalfinanciado = parseFloat(valores.interesDividido.replace(/[^0-9.-]+/g,"")) * factorMultiplicador + parseFloat(valores.primeraCuota.replace(/[^0-9.-]+/g,""));

        if (colegiatura) {
            colegiatura.textContent = valores.costoTotal;
        }
        if (apoyoFinanciamiento) {
            apoyoFinanciamiento.textContent = `-${valores.finalAmount}`;
        }
        if (totalContado) {
            totalContado.textContent = valores.totalContado;
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
        if (apoyoFinanciero) {
            apoyoFinanciero.textContent = `${valores.scholarshipName}`;
        }
        if (apoyoFinanciero.textContent == 'Elige') {
            apoyoFinanciero.textContent = `Apoyo Estudiantil`;
        }
        if (apoyoFinanciero.textContent == "null") {
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
        if (apoyoEstudiantil.textContent == "null%") {
            apoyoEstudiantil.textContent = `0%`;
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

        if (elementBeca.innerText == '0%') {
            elementBeca.classList.add('hidden');
            elementLabelBeca.classList.add('hidden');
        }

        if (elementApoyo.innerText == '0%') {
            elementApoyo.classList.add('hidden');
            elementLabelApoyo.classList.add('hidden');
        }
    }

    const valores = recuperarValores();
    const valoresAdicionales = recuperarValoresAdicionales();

    mostrarValores({ ...valores, ...valoresAdicionales });

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
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-1.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Interculturalidad",
                description: "Aprende en un entorno global donde te desarrollas junto a una comunidad multicultural por medio de programas como el verano intercultural.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-2.svg",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Vivencia Estudiantil",
                description: "Participarás en proyectos y eventos que fomentan tu desarrollo académico y personal, como ser parte de una Sociedad Estudiantil donde harás nuevas amigas y amigos, o en la competencia de robótica FIRST, que te brindará la oportunidad para destacar a nivel internacional.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-3.svg",
                colorClass: "border-secondary-color-1 bg-secondary-color-1"
            },
            {
                title: "Propósito de Vida",
                description: "Descubre tu propósito a través de un acompañamiento apreciativo y el Plan Vocacional Tecmilenio.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-4.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            }
        ],
        'Preparatoria Tetramestral': [
            {
                title: "Duración",
                description: "Completarás tu preparatoria tetramestral en dos años para avanzar con mayor agilidad en tu camino educativo.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/duracion.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Certificación en Tecnología",
                description: "Aprende lenguaje de programación Python e impulsa tu camino hacia la innovación tecnológica.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/certificaci%C3%B3n_tecnolog%C3%ADa.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            },
            {
                title: "Interculturalidad",
                description: "Aprende en un entorno intercultural, donde tendrás la oportunidad de aprender un segundo o tercer idioma.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-2.svg",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Vivencia Estudiantil",
                description: "Participarás en proyectos y eventos que fomentan tu desarrollo académico y personal, como las Sociedades Estudiantiles.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-3.svg",
                colorClass: "border-secondary-color-1 bg-secondary-color-1"
            },
            {
                title: "Propósito de Vida",
                description: "Descubre tu propósito a través de un acompañamiento apreciativo y el Plan Vocacional Tecmilenio.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-4.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            }
        ],
        'Profesional Semestral': [
            {
                title: "Personalización",
                description: "Puedes personalizar hasta el 40% de tu plan de estudios y alinear tus aprendizajes a tus metas profesionales.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/personalizacion.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Empleabilidad",
                description: "Recibe una formación integral que te prepara para el éxito profesional con las habilidades técnicas y humanas más demandadas del mercado laboral. Esto a través de herramientas como la Plataforma de Éxito Profesional.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/empleabilidad.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            },
            {
                title: "Acompañamiento",
                description: "Contarás con una red de apoyo que te guiará a lo largo de tu carrera para desarrollarte como profesionista y persona.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/acompañamiento.svg",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Vivencia Estudiantil",
                description: "Asiste a eventos nacionales e internacionales e intégrate a grupos estudiantiles, deportivos, artísticos, sociales, como Interhalcones, ARTFEST, entre otros.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-3.svg",
                colorClass: "border-secondary-color-1 bg-secondary-color-1"
            },
            {
                title: "Docentes expertos",
                description: "Estudia clases impartidas por profesores con relación en la industria.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/profesores.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Interculturalidad",
                description: "Vive una experiencia intercultural con más de 75 instituciones con prestigio internacional.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-2.svg",
                colorClass: "border-main-color-2 bg-main-color-2"
            },
            {
                title: "Insignias Digitales",
                description: "Recibe reconocimientos que validan tus habilidades y conocimientos adquiridos de manera segura y fácil de compartir.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/certific.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
            }
        ]
    };


    function actualizarBeneficios(nivel) {
        const benefitsWrapper = document.getElementById('benefits-wrappers');
        const titleBenefit = document.getElementById('titleBenefit');
        benefitsWrapper.innerHTML = '';
        titleBenefit.innerText = '';
        titleBenefit.innerText = tituloPorNivel[nivel] || 'N/A';

        const beneficios = beneficiosPorNivel[nivel] || [];

        beneficios.forEach(beneficio => {
            const benefitItem = document.createElement('div');
            benefitItem.className = "px-4 w-full md:w-1/2 xl:w-1/4 relative mt-24";

            benefitItem.innerHTML = `
                <div class="border-2 border-solid ${beneficio.colorClass} rounded-[6px] relative px-[20px] py-[30px] h-full benefits-item">
                    <div class="${beneficio.colorClass} w-[96px] h-[96px] inline-block mx-auto absolute rounded-full -top-[75px] left-1/2 -translate-x-1/2">
                        <img class="w-[45px] h-[45px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            src="${beneficio.icon}">
                    </div>
                    <p class="font-bold text-[18px] leading-[26px]">${beneficio.title}</p>
                    <p>${beneficio.description}</p>
                </div>
            `;

            benefitsWrapper.appendChild(benefitItem);
        });
    }

    const nivelSeleccionado = nivel;
    console.log(nivelSeleccionado);

    actualizarBeneficios(nivelSeleccionado);
});
