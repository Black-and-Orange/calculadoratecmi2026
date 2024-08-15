document.addEventListener('DOMContentLoaded', async () => {
    let segurosData = {};

    async function fetchSeguros() {
        try {
            const response = await fetch('http://localhost:3008/api/seguros');
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const data = await response.json();
            segurosData = data[0];
        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
        }
    }

    await fetchSeguros(); 
    function recuperarValores() {
        // Recuperar los valores de localStorage
        const insuranceValue = JSON.parse(localStorage.getItem('insuranceValue'));
        const coverageValue = JSON.parse(localStorage.getItem('coverageValue'));
        const viveValue = JSON.parse(localStorage.getItem('viveValue'));

        // Procesar los valores recuperados
        return {
            insurance: insuranceValue === 'si' ? `$${segurosData.seguro_accidentes}` : 'No Aplica',
            coverage: coverageValue === 'si' ? `$${segurosData.seguro_estudiantil}` : 'No Aplica',
            vive: viveValue === 'si' ? `$${segurosData.cobertura_vive}` : 'No Aplica'
        };
    }

    function recuperarValoresAdicionales() {
        // Recuperar valores de localStorage
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
            costoTotal: costoTotalRecuperado,
            finalAmount: finalAmountRecuperado,
            totalContado: totalContadoRecuperado,
            interesDividido: interesDivididoRecuperado,
            primeraCuota: primeraCuotaRecuperada,
            scholarshipName: selectedScholarshipNameRecuperado,
            scholarshipValue: selectedScholarshipValueRecuperado,
            supportValue: selectedSupportValueRecuperado,
            retrievedPercentage: retrievedPercentage
        };
    }

    function mostrarValores(valores) {

        const totalfinanciado = valores.interesDividido * 4 + valores.primeraCuota;

        if (colegiatura) {
            colegiatura.textContent = `$${valores.costoTotal}`;
        }
        if (apoyoFinanciamiento) {
            apoyoFinanciamiento.textContent = `-$${parseFloat(valores.finalAmount.toFixed(2))}`;
        }
        if (totalContado) {
            totalContado.textContent = `$${valores.totalContado}`;
        }
        if (primerPago) {
            primerPago.textContent = `$${parseFloat(valores.primeraCuota.toFixed(2))}`;
        }
        if (mensualidades) {
            mensualidades.textContent = `$${parseFloat(valores.interesDividido.toFixed(2))}`;
        }
        if (totalFinanciado) {
            totalFinanciado.textContent = `$${parseFloat(totalfinanciado.toFixed(2))}`;
        }
        if (apoyoFinanciero) {
            apoyoFinanciero.textContent = `${valores.scholarshipName}`;
        }
        if (apoyoFinanciero.textContent == 'Elige') {
            apoyoFinanciero.textContent = `Apoyo Estudiantil`;
        }
        if (apoyoFinanciero.textContent == "null") {
            apoyoFinanciero.textContent = `Sin Apoyo Estudiantil`;
        }
        if (seguroAccidentes2) {
            seguroAccidentes2.textContent = valores.insurance;
        }
        if (coberturaEstudiantil2) {
            coberturaEstudiantil2.textContent = valores.coverage;
        }
        if (vive2) {
            vive2.textContent = valores.vive;
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
                        "0";
        }

    }

    // Recuperar valores
    const valores = recuperarValores();
    const valoresAdicionales = recuperarValoresAdicionales();

    // Mostrar valores en consola
    mostrarValores({ ...valores, ...valoresAdicionales });

    // Actualizar el DOM

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

    const beneficiosPorNivel = {
        'Preparatoria Semestral': [
            {
                title: "Certificaciones",
                description: "Te ofrecemos 3 certificaciones que te preparan con habilidades para el futuro: Tecnología (Python), Creatividad e Innovación y Finanzas personales",
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
                description: "Completarás tu preparatoria tetramestral en dos años.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-1.svg",
                colorClass: "border-secondary-color-3 bg-secondary-color-3"
            },
            {
                title: "Certificación en Tecnología",
                description: "Aprende lenguaje de programación Python.",
                icon: "https://2429099.fs1.hubspotusercontent-na1.net/hubfs/2429099/calculadora-ago24/benefits-icon-4.svg",
                colorClass: "border-secondary-color-2 bg-secondary-color-2"
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
        ]
    };

    function actualizarBeneficios(nivel) {
        const benefitsSection = document.getElementById('benefits-content');
        benefitsSection.innerHTML = '';  

        const beneficios = beneficiosPorNivel[nivel] || [];

        beneficios.forEach(beneficio => {
            const benefitItem = document.createElement('div');
            benefitItem.className = "px-4 w-full md:w-1/2 xl:w-1/4 relative mt-24";
            
            benefitItem.innerHTML = `
                <div class="border-2 border-solid ${beneficio.colorClass} rounded-[6px] relative px-[20px] py-[30px] h-full">
                    <div class="${beneficio.colorClass} w-[96px] h-[96px] inline-block mx-auto absolute rounded-full -top-[75px] left-1/2 -translate-x-1/2">
                        <img class="w-[45px] h-[45px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            src="${beneficio.icon}">
                    </div>
                    <p class="font-bold text-[18px] leading-[26px]">${beneficio.title}</p>
                    <p>${beneficio.description}</p>
                </div>
            `;
            
            benefitsSection.appendChild(benefitItem);
        });
    }

    // Actualizar beneficios basados en el nivel seleccionado
    const nivelSeleccionado = nivel;  // Obtén el nivel desde los parámetros de URL o variables definidas
    console.log(nivelSeleccionado);
    
    actualizarBeneficios(nivelSeleccionado);
});
