// Espera a que el DOM se haya cargado completamente
document.addEventListener('DOMContentLoaded', () => {

    // Selectores de elementos del DOM
    const selectors = {
        grade: document.getElementById('select-grade'),
        plan: document.getElementById('select-plan'),
        campus: document.getElementById('select-campus'),
        period: document.getElementById('select-period'),
        subjects: document.getElementById('select-subjects'),
        subjectsLabel: document.querySelector('label[for="select-subjects"]'),
        certificado: document.getElementById('select-certificado'),
        semanas: document.getElementById('select-semanas'),
        ingles: document.getElementById('select-ingles'),
        divCertificado: document.querySelector('#select-certificado').closest('div.flex-wrap'),
        divSemanas: document.querySelector('#select-semanas').closest('div.flex-wrap'),
        divIngles: document.querySelector('#select-ingles').closest('div.flex-wrap'),
        divMaterias: document.querySelector('#select-subjects').closest('div.flex-wrap'),
        formatoDiv: document.getElementById('div-formato'),
        formatoSelect: document.getElementById('select-formato')
    };

    // Configuración de URLs y propiedades de la API
    const apiConfigs = {
        grade: { url: 'https://tecmilenio-calculadora-backend.testingbo.com/api/nivel', property: 'descripcion' },
        plan: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/planes/nivel/', property: 'descripcion' },
        campus: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/campus/nivel/', property: 'nombre' },
        period: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/periodo/nivel/', property: 'periodo_descripcion' },
        subjects: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/materias/nivel/', property: 'numero' },
        certificado: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/certificados/nivel/', property: 'num_certificados' },
        semanas: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/semanas/nivel/', property: 'num_semanas' },
        ingles: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/ingles/nivel/', property: 'num_ingles' }
    };

    let levelMapping = {};


    // Inicializa el mapeo de niveles obteniendo los datos desde la API
    const initializeLevelMapping = async () => {
        try {
            const response = await fetch(apiConfigs.grade.url);
            if (!response.ok) throw new Error('Error al obtener los niveles');

            const levels = await response.json();
            levels.forEach(level => {
                levelMapping[level.descripcion] = level.id_nivel;
            });

            loadOptions(selectors.grade, apiConfigs.grade.url, apiConfigs.grade.property);
        } catch (error) {
            console.error('Error fetching levels:', error);
        }
    };

    // Limpia la caché del navegador
    const clearCache = () => {
        if ('caches' in window) {
            caches.keys().then((keyList) => {
                return Promise.all(keyList.map((key) => caches.delete(key)));
            }).then(() => {
                console.log('Caché limpiado correctamente.');
            }).catch((error) => {
                console.error('Error al limpiar el caché:', error);
            });
        }
    };


    // Verifica si un valor es numérico
    const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

    // Ordena las opciones basadas en el tipo de datos (numérico o texto)
    const sortOptions = (data, property) => {
        return data.sort((a, b) => {
            const valueA = a[property];
            const valueB = b[property];

            const isANumeric = isNumeric(valueA);
            const isBNumeric = isNumeric(valueB);

            if (isANumeric && isBNumeric) {
                return parseFloat(valueA) - parseFloat(valueB);
            } else if (isANumeric) {
                return -1;
            } else if (isBNumeric) {
                return 1;
            } else {
                return valueA.toUpperCase().localeCompare(valueB.toUpperCase());
            }
        });
    };

    // Calcula el costo total basado en el número de materias y el costo por materia
    const calcularCostoTotal = (numeroMaterias, costoMateria) => {
        if ([1, 2, 3, 4, 5, 6].includes(numeroMaterias)) {
            return numeroMaterias * costoMateria;
        } else if (numeroMaterias === 7 || numeroMaterias === 8) {
            return 6 * costoMateria;
        } else {
            return 0;
        }
    };

    // Calcula el costo total basado en el número de créditos y el costo por crédito
    const calcularCostoCreditos = (numeroCreditos, costoCredito) => numeroCreditos * costoCredito;

    // Calcula el costo total basado en el número de certificados, semanas SEDI y cursos de inglés
    const calcularCostoTotalCertificadosSemanasIngles = (numeroCertificados, valorCertificado, numeroSemanasSEDI, valorSemanaSEDI, numeroCursosIngles, valorCursoIngles, costoUnidad) => {
        console.log(numeroCertificados, valorCertificado, numeroSemanasSEDI, valorSemanaSEDI, numeroCursosIngles, valorCursoIngles, costoUnidad);

        const costoCertificados = (numeroCertificados * valorCertificado) * costoUnidad;
        const costoSemanasSEDI = (numeroSemanasSEDI * valorSemanaSEDI) * costoUnidad;
        const costoCursosIngles = (numeroCursosIngles * valorCursoIngles) * costoUnidad;

        return costoCertificados + costoSemanasSEDI + costoCursosIngles;
    };

    // Obtiene los costos de materia desde la API
    const fetchCostosMateria = async (nivelId) => {
        try {
            const response = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/costos/nivel/${nivelId}`);
            if (!response.ok) throw new Error('Error al obtener los costos de materia');

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };

    // Variable para almacenar el costo del formato asociado
    let costoFormatoAsociado = 0;

    // Actualiza el costo total y lo guarda en localStorage
    const updateCosto = async () => {
        const selectedLevel = selectors.grade.value;
        const mappedLevel = levelMapping[selectedLevel];

        if (mappedLevel) {
            localStorage.setItem('selectedNivel', JSON.stringify(mappedLevel));
        }

        const costosMateria = await fetchCostosMateria(mappedLevel);
        const numeroMaterias = parseInt(selectors.subjects.value);
        const claveGenerada = costosMateria.find(item => item.clave === createKeyFromSelectors()) || { costo: 0 };
        console.log('claveGenerada', claveGenerada);

        const costoMateria = claveGenerada.costo;
        let costoTotal;

        // Casos específicos de niveles
        if (mappedLevel === 2 || mappedLevel === 6 || mappedLevel === 10 || mappedLevel === 11 || mappedLevel === 12) {
            // Cálculo basado en créditos para estos niveles
            costoTotal = calcularCostoCreditos(numeroMaterias, costoMateria);

        } else if (mappedLevel === 4) {
            // Cálculo específico para nivel 4
            const numeroCertificados = parseInt(selectors.certificado.value);
            const valorCertificado = parseInt(selectors.certificado.options[selectors.certificado.selectedIndex].getAttribute('valor_certificado')) || 10;
            const numeroSemanasSEDI = parseInt(selectors.semanas.value);
            const valorSemanaSEDI = parseInt(selectors.semanas.options[selectors.semanas.selectedIndex].getAttribute('valor_semana_sedi')) || 2;
            const numeroCursosIngles = parseInt(selectors.ingles.value);
            const valorCursoIngles = parseInt(selectors.ingles.options[selectors.ingles.selectedIndex].getAttribute('valor_curso_ingles')) || 10;
            const costoUnidad = parseInt(claveGenerada.costo);

            costoTotal = calcularCostoTotalCertificadosSemanasIngles(numeroCertificados, valorCertificado, numeroSemanasSEDI, valorSemanaSEDI, numeroCursosIngles, valorCursoIngles, costoUnidad);

        } else if (mappedLevel === 5) {
            // Cálculo para nivel 5 utilizando formato asociado
            const formatoSeleccionado = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].textContent;

            // Busca el costo del formato seleccionado en el array de formatos
            const formatoAsociado = await fetchCostosFormato();
            const formato = formatoAsociado.find(item => item.descripcion === formatoSeleccionado);

            if (formato) {
                costoFormatoAsociado = parseFloat(formato.costo);
            } else {
                costoFormatoAsociado = 0;
            }

            console.log('Costo del formato asociado:', costoFormatoAsociado);

            // Usar el costo del formato en lugar del costo de la materia
            costoTotal = calcularCostoTotal(numeroMaterias, costoFormatoAsociado);

        } else {
            // Cálculo estándar para otros niveles
            costoTotal = calcularCostoTotal(numeroMaterias, costoMateria);
        }

        // Almacena el costo total y el nivel seleccionado en localStorage
        localStorage.setItem('costoTotal', JSON.stringify(costoTotal));
        window.costoTotal = costoTotal;
        window.selectedLevelId = mappedLevel;
    };

    // Función para obtener el costo de los formatos asociados
    const fetchCostosFormato = async () => {
        try {
            const response = await fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/formatoAsociado');
            if (!response.ok) throw new Error('Error al obtener los costos de formato asociado');

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };


    // Genera una clave única basada en las opciones seleccionadas
    const createKeyFromSelectors = () => {
        const periodKey = selectors.period.options[selectors.period.selectedIndex].getAttribute('periodo_codigo') || '';
        const nivelKey = selectors.grade.options[selectors.grade.selectedIndex].getAttribute('nivel_ed') || '';
        const planKey = selectors.plan.options[selectors.plan.selectedIndex].getAttribute('tipo_plan') || '';

        // Modificación: Verifica si la opción seleccionada en el formato es "presencial"
        let campusKey = '';
        const formatoSeleccionado = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].value;

        if (formatoSeleccionado && formatoSeleccionado === 'Presencial') {
            campusKey = selectors.campus.options[selectors.campus.selectedIndex].getAttribute('categoria_coleg') || '';
        } else if (formatoSeleccionado) {
            campusKey = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].getAttribute('codigo') || '';
        } else {
            campusKey = selectors.campus.options[selectors.campus.selectedIndex].getAttribute('categoria_coleg') || '';
        }
        console.log(`${periodKey}${nivelKey}${planKey}${campusKey}`);
        return `${periodKey}${nivelKey}${planKey}${campusKey}`;
    };


    const loadFormatoOptions = async (nivel) => {

        try {
            console.log('Cargando formatos para nivel', nivel);
            // Definir la URL del endpoint según el nivel seleccionado
            let url = nivel == 5
                ? 'https://tecmilenio-calculadora-backend.testingbo.com/api/formatoAsociado'  // Endpoint para nivel 5
                : 'https://tecmilenio-calculadora-backend.testingbo.com/api/formato/nivel/' + nivel;  // Endpoint para otros niveles

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener los formatos');

            const data = await response.json();
            console.log('Formatos:', data);


            // Limpiar las opciones anteriores
            selectors.formatoSelect.innerHTML = '<option value="">Elige</option>';

            // Iterar sobre los datos recibidos para crear las opciones
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.descripcion;
                option.textContent = item.descripcion;
                option.setAttribute('codigo', item.codigo || '');
                selectors.formatoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar los formatos:', error);
        }
    };

    // Función para intercambiar las opciones 2 y 3 del select
    const swapOptions = (selectElement) => {
        if (selectElement.options.length >= 3) {

            const option2 = selectElement.options[2];
            const option3 = selectElement.options[3];

            selectElement.insertBefore(option3, option2);
        }
    };

    // Cargar las opciones del select de nivel
    const loadGradeOptions = async () => {
        try {
            await loadOptions(selectors.grade, apiConfigs.grade.url, apiConfigs.grade.property);

            // Una vez cargadas las opciones, intercambia la posición de las opciones 2 y 3
            swapOptions(selectors.grade);

        } catch (error) {
            console.error('Error cargando las opciones del nivel:', error);
        }
    };



    // Carga las opciones en un elemento <select> desde la API y las ordena si es necesario
    const loadOptions = async (selectElement, apiUrl, property, sort = true) => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            let data = await response.json();

            // Si es el select de periodos, ordenar por el primer mes
            if (selectElement === selectors.period) {
                data = data.sort((a, b) => {
                    const getFirstMonth = (periodo) => {
                        const meses = periodo[property].split(' - ');
                        return new Date(`01 ${meses[0]} 2000`).getMonth(); // Convierte el mes a número (0-11)
                    };
                    return getFirstMonth(a) - getFirstMonth(b); // Ordena por el primer mes
                });
            }
            if (selectElement !== selectors.grade && sort) {
                data = sortOptions(data, property); 
            }

            selectElement.innerHTML = '<option value="">Elige</option>';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[property];
                // Si el valor es numérico y tiene decimales .00, formatearlo para mostrarlo como entero
                let displayValue = item[property];
                if (isNumeric(displayValue) && Number(displayValue) % 1 === 0) {
                    displayValue = parseInt(displayValue);
                }
                option.textContent = displayValue;
                if (property === 'descripcion') {
                    option.setAttribute('nivel_ed', item.nivel_ed || '');
                }
                if (property === 'nombre') {
                    option.setAttribute('categoria_coleg', item.categoria_coleg || '');
                }
                if (property === 'periodo_descripcion') {
                    option.setAttribute('periodo_codigo', item.periodo_codigo || '');
                }
                if (property === 'descripcion') {
                    option.setAttribute('tipo_plan', item.tipo_plan || '');
                }
                selectElement.appendChild(option);
            });

            updateCosto();
            // lockSubjectsSelectIfPrepa(parseInt(localStorage.getItem('selectedNivel')));

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const toggleAdditionalSelectors = (show) => {
        const display = show ? 'flex' : 'none';
        const displayMaterias = show ? 'none' : 'flex';
        selectors.divCertificado.style.display = display;
        selectors.divSemanas.style.display = display;
        selectors.divIngles.style.display = display;
        selectors.divMaterias.style.display = displayMaterias;
    };

    const toggleFormatoDiv = (show) => {
        selectors.formatoDiv.style.display = show ? 'flex' : 'none';
    };

    // Resetea los campos del formulario
    const resetFormFields = (formElement) => {
        const inputs = formElement.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'number') {
                if (input.id !== 'txt-name') {
                    input.value = '';
                }
            }
        });

        const selects = formElement.querySelectorAll('select');
        selects.forEach(select => {
            if (select.id !== 'select-grade' && !select.disabled) {
                select.selectedIndex = 0;
            }
        });
    };

    // Evento que se dispara al cambiar la selección del grado
    selectors.grade.addEventListener('change', async () => {
        resetFormFields(formElement);
        localStorage.clear();
        clearCache();

        const selectedLevel = selectors.grade.value;
        const mappedLevel = levelMapping[selectedLevel];

        if (mappedLevel >= 5) {
            toggleFormatoDiv(true);
            await loadFormatoOptions(mappedLevel);
        } else {
            toggleFormatoDiv(false);

        }

        if (mappedLevel === 4) {

            toggleAdditionalSelectors(true);
            loadOptions(selectors.certificado, `${apiConfigs.certificado.baseUrl}${mappedLevel}`, apiConfigs.certificado.property);
            loadOptions(selectors.semanas, `${apiConfigs.semanas.baseUrl}${mappedLevel}`, apiConfigs.semanas.property);
            loadOptions(selectors.ingles, `${apiConfigs.ingles.baseUrl}${mappedLevel}`, apiConfigs.ingles.property);
        } else {
            toggleAdditionalSelectors(false);
        }

        if (mappedLevel) {
            localStorage.setItem('selectedNivel', JSON.stringify(mappedLevel));
        }

        if (mappedLevel) {
            Object.keys(apiConfigs).forEach(key => {
                if (key !== 'grade' && selectors[key] !== null) {
                    let apiUrl = `${apiConfigs[key].baseUrl}${mappedLevel}`;
                    let property = apiConfigs[key].property;

                    // Cambia el API y propiedad si el nivel seleccionado es "Prepa" y el campo es "subjects"
                    if (mappedLevel === 2 && key === 'subjects') {

                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/creditos/nivel/2';
                        property = 'credito';
                        selectors.subjectsLabel.textContent = 'Créditos:';
                    }

                    else if (mappedLevel === 6 && key === 'subjects') {
                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/creditos/nivel/6';
                        property = 'credito';
                        selectors.subjectsLabel.textContent = 'Créditos:';
                    }

                    else if (mappedLevel === 10 && key === 'subjects') {
                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/creditos/nivel/10';
                        property = 'credito';
                        selectors.subjectsLabel.textContent = 'Créditos:';
                    }

                    else if (mappedLevel === 12 && key === 'subjects') {
                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/creditos/nivel/12';
                        property = 'credito';
                        selectors.subjectsLabel.textContent = 'Créditos:';
                    }

                    else if (mappedLevel === 8 && key === 'subjects') {
                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/certificados/nivel/8';
                        property = 'num_certificados';
                        selectors.subjectsLabel.textContent = 'Certificados:';
                    }

                    else if (mappedLevel === 9 && key === 'subjects') {
                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/certificados/nivel/9';
                        property = 'num_certificados';
                        selectors.subjectsLabel.textContent = 'Certificados:';
                    }

                    else if (mappedLevel === 5 && key === 'subjects') {
                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/certificados/nivel/5';
                        property = 'num_certificados';
                        selectors.subjectsLabel.textContent = 'Certificados:';
                    }
                    // Comportamiento predeterminado
                    else if (key === 'subjects') {
                        selectors.subjectsLabel.textContent = 'Materias:';
                    }

                    if (key === 'period') {
                        loadOptions(selectors.period, apiUrl, property, false);
                    } else {
                        loadOptions(selectors[key], apiUrl, property);
                    }
                }
            });

            updateCosto();
        }
    });

    // Itera sobre los selectores y añade eventos
    Object.keys(selectors).forEach(key => {

        if (selectors[key] !== null) {
            selectors[key].addEventListener('change', () => {
                updateCosto();
                if (key === 'grade') {
                    // lockSubjectsSelectIfPrepa(parseInt(localStorage.getItem('selectedNivel')));
                }
            });
        }
    });
    // Inicializa el formulario y carga el mapeo de niveles al cargar la página y enlaza eventos
    initializeLevelMapping().then(loadGradeOptions);

    // Selecciona el formulario y agrega el evento de reseteo
    const formElement = document.querySelector('form');
    if (formElement) {
        formElement.addEventListener('reset', () => {
            resetFormFields(formElement);
            localStorage.clear();
        });
    }
});
