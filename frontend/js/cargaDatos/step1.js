document.addEventListener('DOMContentLoaded', () => {
    const selectors = {
        grade: document.getElementById('select-grade'),
        plan: document.getElementById('select-plan'),
        campus: document.getElementById('select-campus'),
        period: document.getElementById('select-period'),
        subjects: document.getElementById('select-subjects'),
        subjectsLabel: document.querySelector('label[for="select-subjects"]')
    };

    const apiConfigs = {
        grade: { url: 'https://tecmilenio-calculadora-backend.testingbo.com/api/nivel', property: 'descripcion' },
        plan: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/planes/nivel/', property: 'descripcion' },
        campus: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/campus/nivel/', property: 'nombre' },
        period: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/periodo/nivel/', property: 'periodo_descripcion' },
        subjects: { baseUrl: 'https://tecmilenio-calculadora-backend.testingbo.com/api/materias/nivel/', property: 'numero' }
    };

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

    // Función para detectar si un valor es numérico
    const isNumeric = (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    };

    // Función para ordenar el select, diferenciando números y textos
    const sortOptions = (data, property) => {
        return data.sort((a, b) => {
            const valueA = a[property];
            const valueB = b[property];

            const isANumeric = isNumeric(valueA);
            const isBNumeric = isNumeric(valueB);

            if (isANumeric && isBNumeric) {
                // Ordenar números de forma natural
                return parseFloat(valueA) - parseFloat(valueB);
            } else if (isANumeric) {
                // Los números van antes que los textos
                return -1;
            } else if (isBNumeric) {
                // Los textos van después que los números
                return 1;
            } else {
                // Ordenar textos alfabéticamente, ignorando mayúsculas y minúsculas
                return valueA.toUpperCase().localeCompare(valueB.toUpperCase());
            }
        });
    };

    const calcularCostoTotal = (numeroMaterias, costoMateria) => {
        if ([1, 2, 3, 4, 5, 6].includes(numeroMaterias)) {
            return numeroMaterias * costoMateria;
        } else if (numeroMaterias === 7 || numeroMaterias === 8) {
            return 6 * costoMateria;
        } else {
            return 0;
        }
    };

    const calcularCostoCreditos = (numeroCreditos, costoCredito) => {
        return numeroCreditos * costoCredito;
    };

    const fetchCostosMateria = async (nivelId) => {
        try {
            const response = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/costos/nivel/${nivelId}`);
            if (!response.ok) {
                throw new Error('Error al obtener los costos de materia');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };

    const updateCosto = async () => {
        const selectedLevel = selectors.grade.value;
        const levelMapping = {
            'Preparatoria Semestral': 1,
            'Profesional Semestral': 2,
            'Preparatoria Tetramestral': 3,
            'Profesional Modelo CIMA': 4
        };
        const mappedLevel = levelMapping[selectedLevel];

        // Guardar el nivel seleccionado en localStorage
        if (mappedLevel) {
            localStorage.setItem('selectedNivel', JSON.stringify(mappedLevel));
        }

        const costosMateria = await fetchCostosMateria(mappedLevel);

        const numeroMaterias = parseInt(selectors.subjects.value);

        const claveGenerada = costosMateria.find(item => item.clave === createKeyFromSelectors()) || { costo: 0 };
        const costoMateria = claveGenerada.costo;

        let costoTotal;
        if (mappedLevel === 2) {  // Nivel "Profesional Semestral"
            costoTotal = calcularCostoCreditos(numeroMaterias, costoMateria);
        } else {
            costoTotal = calcularCostoTotal(numeroMaterias, costoMateria);
        }

        const costoTotalString = JSON.stringify(costoTotal);

        localStorage.setItem('costoTotal', costoTotalString);

        window.costoTotal = costoTotal;
        window.selectedLevelId = mappedLevel;
    };

    const createKeyFromSelectors = () => {
        const periodKey = selectors.period.options[selectors.period.selectedIndex].getAttribute('periodo_codigo') || '';
        const nivelKey = selectors.grade.options[selectors.grade.selectedIndex].getAttribute('nivel_ed') || '';
        const planKey = selectors.plan.options[selectors.plan.selectedIndex].getAttribute('tipo_plan') || '';
        const campusKey = selectors.campus.options[selectors.campus.selectedIndex].getAttribute('categoria_coleg') || '';

        return `${periodKey}${nivelKey}${planKey}${campusKey}`;
    };

    const loadOptions = async (selectElement, apiUrl, property) => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Ordenar las opciones diferenciando números y textos
            const sortedData = sortOptions(data, property);

            selectElement.innerHTML = '<option value="">Elige</option>';

            sortedData.forEach(item => {
                const option = document.createElement('option');
                option.value = item[property];
                option.textContent = item[property];

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
            lockSubjectsSelectIfPrepa(parseInt(localStorage.getItem('selectedNivel')));

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    const lockSubjectsSelectIfPrepa = (nivelId) => {
        if (nivelId === 1 || nivelId === 3) { // Preparatoria Semestral o Tetramestral
            const lastOptionIndex = selectors.subjects.options.length - 1;

            if (lastOptionIndex > 0) { // Verificar que hay opciones disponibles
                selectors.subjects.selectedIndex = lastOptionIndex;
            }

            // Desactiva solo el select de materias
            selectors.subjects.disabled = true;
        } else {
            selectors.subjects.disabled = false;
        }
    };


    if (selectors.grade !== null) {
        loadOptions(selectors.grade, apiConfigs.grade.url, apiConfigs.grade.property);
    }

    const resetFormFields = (formElement) => {
        // Reset all input fields except for the name field
        const inputs = formElement.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'number') {
                if (input.id !== 'txt-name') { // Excluir el campo de nombre
                    input.value = '';
                }
            }
        });

        // Reset all select fields except for the level select
        const selects = formElement.querySelectorAll('select');
        selects.forEach(select => {
            if (select.id !== 'select-grade' && !select.disabled) { // Excluir el select de nivel y los deshabilitados
                select.selectedIndex = 0; // Set to the first option ("Elige")
            }
        });
    };



    const formElement = document.querySelector('form');

    selectors.grade.addEventListener('change', async () => {
        resetFormFields(formElement);
        localStorage.clear();
        clearCache();
        const selectedLevel = selectors.grade.value;
        const levelMapping = {
            'Preparatoria Semestral': 1,
            'Profesional Semestral': 2,
            'Preparatoria Tetramestral': 3,
            'Profesional Modelo CIMA': 4
        };

        const mappedLevel = levelMapping[selectedLevel];

        // Guardar el nivel seleccionado en localStorage cada vez que cambie
        if (mappedLevel) {
            localStorage.setItem('selectedNivel', JSON.stringify(mappedLevel));
        }

        if (mappedLevel) {
            Object.keys(apiConfigs).forEach(key => {
                if (key !== 'grade' && selectors[key] !== null) {
                    let apiUrl = `${apiConfigs[key].baseUrl}${mappedLevel}`;
                    let property = apiConfigs[key].property;

                    if (mappedLevel === 2 && key === 'subjects') {
                        apiUrl = 'https://tecmilenio-calculadora-backend.testingbo.com/api/creditos/nivel/2';
                        property = 'credito';
                        selectors.subjectsLabel.textContent = 'Créditos';
                    } else {
                        selectors.subjectsLabel.textContent = 'Materias';
                    }

                    loadOptions(selectors[key], apiUrl, property);
                }
            });

            lockSubjectsSelectIfPrepa(mappedLevel);
            updateCosto();
        }
    });

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (event) => {
            selectors.subjects.disabled = false;
        });
    } else {
        console.error('No se encontró un formulario en la página');
    }

    Object.keys(selectors).forEach(key => {
        if (selectors[key] !== null) {
            selectors[key].addEventListener('change', () => {
                updateCosto();
                if (key === 'grade') {
                    lockSubjectsSelectIfPrepa(parseInt(localStorage.getItem('selectedNivel')));
                }
            });
        }
    });
});
