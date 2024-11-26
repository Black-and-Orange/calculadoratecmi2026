document.addEventListener('DOMContentLoaded', async () => {
    const levelId = JSON.parse(localStorage.getItem('selectedNivel')) || 1;
    const params = new URLSearchParams(window.location.search);

    const nombre = params.get('txt-name') || 'N/A';
    const periodo = params.get('select-period') || 'N/A';
    const campus = params.get('select-campus') || 'N/A';
    const nivel = params.get('select-grade') || 'N/A';
    const materias = params.get('select-subjects') || 'N/A';
    const certificados = params.get('select-certificado') || 'N/A';
    const semanas = params.get('select-semanas') || 'N/A';
    const ingles = params.get('select-ingles') || 'N/A';

    document.getElementById('nombre').textContent = nombre;
    document.getElementById('periodo').textContent = periodo;
    document.getElementById('campus').textContent = campus;
    document.getElementById('nivel').textContent = nivel;
    document.getElementById('materias').textContent = formatNumber(materias);
    document.getElementById('certificados').textContent = formatNumber(certificados);
    document.getElementById('semanas').textContent = formatNumber(semanas);
    document.getElementById('ingles').textContent = formatNumber(ingles);

    function formatNumber(num) {
        return num % 1 === 0 ? parseInt(num) : parseFloat(num).toFixed(1);
    }

    const materiasPorNivel = {
        1: 'Materias',
        2: 'Créditos',
        3: 'Materias',
        5: 'Certificados',
        6: 'Créditos',
        7: 'Materias',
        8: 'Certificados',
        9: 'Certificados',
        10: 'Créditos',
        11: 'Materias',
        12: 'Materias'
    };

    if (materiasPorNivel[levelId]) {
        document.getElementById('text-materias').textContent = materiasPorNivel[levelId];
    } 

    if (levelId == 4) {
        document.getElementById('materias-container').style.display = 'none';
        document.getElementById('certificados-container').classList.remove('hidden');
        document.getElementById('semanas-container').classList.remove('hidden');
        document.getElementById('ingles-container').classList.remove('hidden');
    }


    let segurosData;
    const viveDiv = document.getElementById('div-vive');
    const seguros = document.getElementById('seguros');

    async function fetchSeguros() {
        console.log('levelId:', levelId);

        try {
            const response = await fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/seguros/nivel/' + levelId);
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const segurosDataArray = await response.json(); // Recibimos un array

            if (segurosDataArray.length > 0) {
                segurosData = segurosDataArray[0];

                console.log('segurosData:', segurosData);
            }

            if (levelId >= 6 && levelId <= 12) {
                viveDiv.style.display = 'none';
            } else {
                viveDiv.style.display = 'flex';
            }
            
            if (recuperarValores().insurance == 'No Aplica' && recuperarValores().coverage == 'No Aplica' && recuperarValores().vive == 'No Aplica') {
                seguros.style.display = 'none';
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
        console.log(primeraCuotaRecuperada);

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
            totalCost: totalContadoRecuperado + totalCostRecuperado,
            scholarshipName: selectedScholarshipNameRecuperado,
            scholarshipValue: selectedScholarshipValueRecuperado,
            supportValue: selectedSupportValueRecuperado,
            prestamoRecuperado: prestamoRecuperado,
            retrievedPercentage: retrievedPercentage
        };
    }

    function mostrarValores(valores) {

        console.log(levelId);

        let factorMultiplicador = 3;
        let textoMensualidades = '3 Mensualidades';
        
        if (levelId === 1 || levelId === 2 || levelId === 4) {
            factorMultiplicador = 4;
            textoMensualidades = '4 Mensualidades';
        } else if (levelId === 10) {
            factorMultiplicador = 2;
            textoMensualidades = '2 Mensualidades';
        }
        

        console.log('factorMultiplicador:', factorMultiplicador);


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
            apoyoFinanciero.textContent = `Apoyo estudiantil`;
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
            apoyoEstudiantil.textContent = `${Math.round(valores.supportValue)}%`;
        }
        if (prestamoPorcentaje) {
            prestamoPorcentaje.textContent = `${valores.prestamoRecuperado}%`;
        }
        if (apoyoEstudiantil.textContent.includes("null") || apoyoEstudiantil.textContent === "0") {
            apoyoEstudiantil.textContent = `0%`;
        }
        if (prestamoPorcentaje.textContent.includes("null") || prestamoPorcentaje.textContent === "0") {
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
            apoyos.style.display = 'none';
        }

        const plan = document.getElementById('plan');

        if (getComputedStyle(apoyos).display === 'none' && getComputedStyle(seguros).display === 'none') {
            plan.style.display = 'none';
        } else {
            plan.style.display = 'flex';
        }
    }

    function actualizarPlanContado(valores) {
        const bloquePlanContado = document.querySelector('.sub-tables');
        const apoyoFinanciamiento = document.getElementById('apoyoFinanciamiento');

        if (parseFloat(valores.finalAmount.replace(/[^0-9.-]+/g, "")) === 0) {
            apoyoFinanciamiento.closest('tr').style.display = 'none';
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
        1: 'Impulsa tu futuro desde hoy',
        3: 'Avanza con determinación hacia tu futuro profesional',
        2: 'Encuentra una carrera pensada para ti',
        4: 'Encuentra una carrera diseñada para ti',
        5: 'Logra más con una carrera diseñada para tu desarrollo como profesionista',
        6: 'Encuentra una carrera ejecutiva diseñada a tu medida',
        7: 'Invierte en una educación para crecer como persona y como profesionista',
        8: 'Invierte en una educación para crecer como persona y como profesionista',
        9: 'Crece como líder para transformar a tu equipo y tu entorno',
        10: 'Invierte en una educación para crecer como persona y como profesionista',
        11: 'Crece como líder para transformar a tu equipo y tu entorno',
        12: 'Invierte en una educación para crecer como persona y como profesionista',
    };
    let beneficiosPorNivel = {};
    async function obtenerBeneficios(nivel) {
        const url = `https://tecmilenio-calculadora-backend.testingbo.com/api/beneficios/nivel/${nivel}`;
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            beneficiosPorNivel = data;
            return data;
        } catch (error) {
            console.error('Hubo un problema con la solicitud fetch:', error);
            return [];
        }
    }
    await obtenerBeneficios(levelId);
    function actualizarBeneficios(nivel) {
        const benefitsWrapper = document.getElementById('benefits-wrappers');
        benefitsWrapper.innerHTML = ''; // Limpiar el contenedor de beneficios
        const titleBenefit = document.getElementById('titleBenefit');
        titleBenefit.innerText = tituloPorNivel[nivel] || 'N/A';
        const beneficios = beneficiosPorNivel || [];
        beneficios.forEach((beneficio, index) => {
            const benefitItem = document.createElement('div');
            benefitItem.className = "px-4 w-full md:w-1/2 xl:w-1/4 relative mt-24 benefit-card-elem";
            benefitItem.innerHTML = `
                <div class="border-2 border-solid border-secondary-color-2 rounded-[6px] relative px-[20px] py-[30px] h-full benefits-item">
                    <div class="bg-secondary-color-2 w-[96px] h-[96px] inline-block mx-auto absolute rounded-full -top-[75px] left-1/2 -translate-x-1/2">
                        <img class="w-[45px] h-[45px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            src="${beneficio.icono}">
                    </div>
                    <p class="font-bold text-[18px] leading-[26px]">${beneficio.nombre}</p>
                    <p class="text-[16px] leading-[24px]">${beneficio.descripcion}</p>
                </div>
            `;
            benefitsWrapper.appendChild(benefitItem);
        });

        if (beneficios.length === 5) {
            benefitsWrapper.classList.add('benefits-3-2');
        } else {
            benefitsWrapper.classList.remove('benefits-3-2');
        }
    }

    actualizarBeneficios(levelId);

    const styleMap = {
        2: 'css/style-universidad.css',
        4: 'css/style-universidad.css',
        5: 'css/style-profesional-asociado.css',
        6: 'css/style-universidad.css',
        7: 'css/style-universidad.css',
        8: 'css/style-universidad.css',
        9: 'css/style-icbi.css',
        10: 'css/style-universidad.css',
        11: 'css/style-icbi.css',
        12: 'css/style-universidad.css',

    };

    function agregarEstiloPorNivel() {
        if (styleMap[levelId]) {
            const estiloHref = styleMap[levelId];

            if (!document.querySelector('link[href="' + estiloHref + '"]')) {
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = estiloHref;
                document.head.appendChild(linkElement);
            }
        }
    }
    agregarEstiloPorNivel();
    const fechaActual = new Date();
    const fechaVencimiento = new Date(fechaActual);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);
    const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaVencimientoFormateada = fechaVencimiento.toLocaleDateString('es-ES', opcionesFormato);
    document.getElementById('fechaVencimiento').textContent = `Vigencia de la propuesta: ${fechaVencimientoFormateada}`;
});
