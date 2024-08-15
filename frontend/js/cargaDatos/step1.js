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
        grade: { url: 'http://localhost:3008/api/nivel', property: 'descripcion' },
        plan: { baseUrl: 'http://localhost:3008/api/planes/nivel/', property: 'descripcion' },
        campus: { baseUrl: 'http://localhost:3008/api/campus/nivel/', property: 'nombre' },
        period: { baseUrl: 'http://localhost:3008/api/periodo/nivel/', property: 'periodo_descripcion' },
        subjects: { baseUrl: 'http://localhost:3008/api/materias/nivel/', property: 'numero' }
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
            const response = await fetch(`http://localhost:3008/api/costos/nivel/${nivelId}`);
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

            selectElement.innerHTML = '<option value="">Elige</option>';

            data.forEach(item => {
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

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    if (selectors.grade !== null) {
        loadOptions(selectors.grade, apiConfigs.grade.url, apiConfigs.grade.property);
    }

    selectors.grade.addEventListener('change', async () => {
        localStorage.clear();
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
                        apiUrl = 'http://localhost:3008/api/creditos/nivel/2';
                        property = 'credito';
                        selectors.subjectsLabel.textContent = 'Créditos';
                    } else {
                        selectors.subjectsLabel.textContent = 'Materias';
                    }

                    loadOptions(selectors[key], apiUrl, property);
                }
            });

            updateCosto();
        }
    });

    Object.keys(selectors).forEach(key => {
        if (selectors[key] !== null) {
            selectors[key].addEventListener('change', updateCosto);
        }
    });
});
