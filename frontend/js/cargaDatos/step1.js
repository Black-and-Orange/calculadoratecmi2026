import { API_BASE_URL } from '../apiConfig.js';

// Espera a que el DOM se haya cargado completamente
document.addEventListener('DOMContentLoaded', () => {

    // Selectores de elementos del DOM (todos en plural para coincidir con los endpoints y apiConfigs)
    const selectors = {
        grade: document.getElementById('select-grade'),
        planes: document.getElementById('select-plan'),
        campus: document.getElementById('select-campus'),
        periodo: document.getElementById('select-period'),
        materias: document.getElementById('select-subjects'),
        certificados: document.getElementById('select-certificado'),
        semanas: document.getElementById('select-semanas'),
        ingles: document.getElementById('select-ingles'),
        divCertificado: document.querySelector('#select-certificado').closest('div.flex-wrap'),
        divSemanas: document.querySelector('#select-semanas').closest('div.flex-wrap'),
        divIngles: document.querySelector('#select-ingles').closest('div.flex-wrap'),
        divMaterias: document.querySelector('#select-subjects').closest('div.flex-wrap'),
        formatoDiv: document.getElementById('div-formato'),
        formatoSelect: document.getElementById('select-formato')
    };

    // Configuración de URLs y propiedades de la API (todas las claves en plural)
    const apiConfigs = {
        grade: { url: `${API_BASE_URL}/nivel`, property: 'descripcion' },
        planes: { baseUrl: `${API_BASE_URL}/planes/nivel/`, property: 'descripcion' },
        campus: { baseUrl: `${API_BASE_URL}/campus/nivel/`, property: 'nombre' },
        periodo: { baseUrl: `${API_BASE_URL}/periodo/nivel/`, property: 'periodo_descripcion' },
        materias: { baseUrl: `${API_BASE_URL}/materias/nivel/`, property: 'numero' },
        certificados: { baseUrl: `${API_BASE_URL}/certificados/nivel/`, property: 'num_certificados' },
        semanas: { baseUrl: `${API_BASE_URL}/semanas/nivel/`, property: 'num_semanas' },
        ingles: { baseUrl: `${API_BASE_URL}/ingles/nivel/`, property: 'num_ingles' }
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
            }).catch((error) => {
                console.error('Error al limpiar el caché:', error);
            });
        }
    };

    // Escucha los cambios en el selector de formato y guarda el código en localStorage
    selectors.formatoSelect.addEventListener('change', () => {
        const formatoSeleccionado = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex];
        const codigoFormato = formatoSeleccionado.getAttribute('codigo') || '';   
        localStorage.setItem('codigoFormato', codigoFormato);
    });



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

        const costoCertificados = (numeroCertificados * valorCertificado) * costoUnidad;
        const costoSemanasSEDI = (numeroSemanasSEDI * valorSemanaSEDI) * costoUnidad;
        const costoCursosIngles = (numeroCursosIngles * valorCursoIngles) * costoUnidad;

        return costoCertificados + costoSemanasSEDI + costoCursosIngles;
    };

    // Obtiene los costos de materia desde la API
    const fetchCostosMateria = async (nivelId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/costos/nivel/${nivelId}`);
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
        const numeroMaterias = parseFloat(selectors.materias.value);
        const claveGenerada = costosMateria.find(item => item.clave === createKeyFromSelectors()) || { costo: 0 };
        const costoMateria = claveGenerada.costo;
        let costoTotal;

        // --- CORRECCIÓN NIVEL 13 ---
        if (mappedLevel === 13) {
            // Obtener períodos seleccionados del select múltiple
            const selectMultiple = document.getElementById('select-periodos-multiple');
            let periodosSeleccionados = [];
            if (selectMultiple) {
                periodosSeleccionados = Array.from(selectMultiple.selectedOptions).map(opt => ({
                    codigo: opt.value,
                    mes: opt.textContent,
                    index: parseInt(opt.getAttribute('data-index'))
                }));
            }
            // Si no hay selección, costo 0
            if (periodosSeleccionados.length === 0) {
                costoTotal = 0;
            } else {
                // Sumar el costo de cada período seleccionado
                costoTotal = 0;
                periodosSeleccionados.forEach(periodo => {
                    // Generar clave para cada período
                    let periodKey = periodo.codigo;
                    const nivelKey = selectors.grade.options[selectors.grade.selectedIndex].getAttribute('nivel_ed') || '';
                    const planKey = selectors.planes.options[selectors.planes.selectedIndex].getAttribute('tipo_plan') || '';
                    let campusKey = '';
                    const formatoSeleccionado = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].value;
                    if (formatoSeleccionado && formatoSeleccionado.includes('Presencial')) {
                        campusKey = selectors.campus.options[selectors.campus.selectedIndex].getAttribute('categoria_coleg') || '';
                    } else if (formatoSeleccionado) {
                        campusKey = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].getAttribute('codigo') || '';
                    } else {
                        campusKey = selectors.campus.options[selectors.campus.selectedIndex].getAttribute('categoria_coleg') || '';
                    }
                    const claveFinal = `${periodKey}${nivelKey}${planKey}${campusKey}`;
                    const costoPeriodo = (costosMateria.find(item => item.clave === claveFinal) || { costo: 0 }).costo;
                    // Calcular créditos para este período
                    const numeroCertificados = parseInt(selectors.certificados.value) || 0;
                    const numeroSemanasSEDI = parseInt(selectors.semanas.value) || 0;
                    const totalCreditos = (numeroCertificados * 10) + (numeroSemanasSEDI * 1);
                    // Sumar el costo de los créditos de este período
                    const totalContadoBimestre = totalCreditos * costoPeriodo;
                    costoTotal += totalContadoBimestre;
                    // Guardar el total contado de este bimestre en localStorage
                    localStorage.setItem('totalContado_' + periodKey, JSON.stringify(totalContadoBimestre));
                });
            }
        } else if (mappedLevel === 2 || mappedLevel === 6 || mappedLevel === 10 || mappedLevel === 11 || mappedLevel === 12) {
            costoTotal = calcularCostoCreditos(numeroMaterias, costoMateria);
        } else if (mappedLevel === 4) {
            const numeroCertificados = parseInt(selectors.certificados.value);
            const valorCertificado = parseInt(selectors.certificados.options[selectors.certificados.selectedIndex].getAttribute('valor_certificado')) || 10;
            const numeroSemanasSEDI = parseInt(selectors.semanas.value);
            const valorSemanaSEDI = parseInt(selectors.semanas.options[selectors.semanas.selectedIndex].getAttribute('valor_semana_sedi')) || 2;
            const numeroCursosIngles = parseInt(selectors.ingles.value);
            const valorCursoIngles = parseInt(selectors.ingles.options[selectors.ingles.selectedIndex].getAttribute('valor_curso_ingles')) || 10;
            const costoUnidad = parseInt(claveGenerada.costo);
            costoTotal = calcularCostoTotalCertificadosSemanasIngles(numeroCertificados, valorCertificado, numeroSemanasSEDI, valorSemanaSEDI, numeroCursosIngles, valorCursoIngles, costoUnidad);
        } else if (mappedLevel === 5) {
            const formatoSeleccionado = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].textContent;
            const formatoAsociado = await fetchCostosFormato();
            const formato = formatoAsociado.find(item => item.descripcion === formatoSeleccionado);
            if (formato) {
                costoFormatoAsociado = parseFloat(formato.costo);
            } else {
                costoFormatoAsociado = 0;
            }
            costoTotal = calcularCostoTotal(numeroMaterias, costoFormatoAsociado);
        } else {
            costoTotal = calcularCostoTotal(numeroMaterias, costoMateria);
        }

        // Guardar el costo total y el nivel seleccionado en localStorage
        localStorage.setItem('costoTotal', JSON.stringify(costoTotal));
        window.costoTotal = costoTotal;
        window.selectedLevelId = mappedLevel;
    };

    // Función para validar que los períodos seleccionados sean consecutivos
    const validarPeriodosConsecutivos = () => {
        const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
        const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-index'))).sort((a, b) => a - b);
        
        if (selectedIndexes.length === 0) {
            // No hay períodos seleccionados, limpiar mensaje de error
            const errorMsg = document.getElementById('periodos-error-msg');
            if (errorMsg) errorMsg.remove();
            return true;
        }
        
        // Verificar que sean consecutivos
        let sonConsecutivos = true;
        for (let i = 1; i < selectedIndexes.length; i++) {
            if (selectedIndexes[i] !== selectedIndexes[i-1] + 1) {
                sonConsecutivos = false;
                break;
            }
        }
        
        // Mostrar o ocultar mensaje de error
        let errorMsg = document.getElementById('periodos-error-msg');
        if (!sonConsecutivos) {
            if (!errorMsg) {
                errorMsg = document.createElement('p');
                errorMsg.id = 'periodos-error-msg';
                errorMsg.className = 'text-sm text-red-600 mt-2';
                errorMsg.textContent = 'Solo puedes seleccionar períodos consecutivos';
                const container = document.getElementById('periodos-checkbox-container');
                if (container) container.appendChild(errorMsg);
            }
        } else {
            if (errorMsg) errorMsg.remove();
        }
        
        return sonConsecutivos;
    };

    // Función para obtener los períodos seleccionados
    const obtenerPeriodosSeleccionados = () => {
        const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => ({
            codigo: cb.value,
            mes: cb.getAttribute('data-mes'),
            index: parseInt(cb.getAttribute('data-index'))
        })).sort((a, b) => a.index - b.index);
    };

    // Función para crear la interfaz de selección múltiple de períodos
    const crearInterfazPeriodosMultiples = (bimestresUnicos) => {
        const periodoContainer = selectors.periodo.parentElement;
        const periodoLabel = periodoContainer.previousElementSibling.querySelector('label');
        
        // Cambiar el label
        if (periodoLabel) periodoLabel.textContent = 'Períodos:';
        
        // Ocultar el select original
        selectors.periodo.style.display = 'none';
        
        // Crear contenedor para checkboxes si no existe
        let checkboxContainer = document.getElementById('periodos-checkbox-container');
        if (!checkboxContainer) {
            checkboxContainer = document.createElement('div');
            checkboxContainer.id = 'periodos-checkbox-container';
            checkboxContainer.className = 'flex flex-wrap gap-4 mt-2';
            periodoContainer.appendChild(checkboxContainer);
        }
        
        // Limpiar contenedor y crear checkboxes
        checkboxContainer.innerHTML = '';
        bimestresUnicos.forEach((bim, index) => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'flex items-center';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `periodo-${bim.codigo}`;
            checkbox.value = bim.codigo;
            checkbox.setAttribute('data-mes', bim.mes);
            checkbox.setAttribute('data-index', index);
            checkbox.className = 'mr-2';
            
            const label = document.createElement('label');
            label.htmlFor = `periodo-${bim.codigo}`;
            label.textContent = bim.mes;
            label.className = 'text-sm cursor-pointer';
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            checkboxContainer.appendChild(checkboxDiv);
            
            // Agregar evento para validar períodos consecutivos
            checkbox.addEventListener('change', () => {
                validarPeriodosConsecutivos();
                updateCosto();
            });
        });
        
        // Agregar mensaje de ayuda
        let helpText = document.getElementById('periodos-help-text');
        if (!helpText) {
            helpText = document.createElement('p');
            helpText.id = 'periodos-help-text';
            helpText.className = 'text-sm text-gray-600 mt-2';
            helpText.textContent = 'Selecciona períodos consecutivos únicamente';
            checkboxContainer.appendChild(helpText);
        }
    };

    // Función para obtener el costo de los formatos asociados
    const fetchCostosFormato = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/formatoAsociado`);
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
        let periodKey = '';
        const nivelKey = selectors.grade.options[selectors.grade.selectedIndex].getAttribute('nivel_ed') || '';
        const planKey = selectors.planes.options[selectors.planes.selectedIndex].getAttribute('tipo_plan') || '';

        if (parseInt(localStorage.getItem('selectedNivel')) === 13) {
            // Para nivel 13, usar el primer período seleccionado como clave
            const periodosSeleccionados = obtenerPeriodosSeleccionados();
            if (periodosSeleccionados.length > 0) {
                periodKey = periodosSeleccionados[0].codigo;
            } else {
                periodKey = selectors.periodo.value;
            }
        } else {
            periodKey = selectors.periodo.options[selectors.periodo.selectedIndex].getAttribute('periodo_codigo') || '';
        }

        let campusKey = '';
        const formatoSeleccionado = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].value;
        if (formatoSeleccionado && formatoSeleccionado.includes('Presencial')) {
            campusKey = selectors.campus.options[selectors.campus.selectedIndex].getAttribute('categoria_coleg') || '';
        } else if (formatoSeleccionado) {
            campusKey = selectors.formatoSelect.options[selectors.formatoSelect.selectedIndex].getAttribute('codigo') || '';
        } else {
            campusKey = selectors.campus.options[selectors.campus.selectedIndex].getAttribute('categoria_coleg') || '';
        }

        const claveFinal = `${periodKey}${nivelKey}${planKey}${campusKey}`;
        return claveFinal;
    };


    const loadFormatoOptions = async (nivel) => {

        try {
            // Definir la URL del endpoint según el nivel seleccionado
            let url = nivel == 5
                ? `${API_BASE_URL}/formatoAsociado`  // Endpoint para nivel 5
                : `${API_BASE_URL}/formato/nivel/${nivel}`;  // Endpoint para otros niveles

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener los formatos');

            const data = await response.json();
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
    const loadOptions = async (selectElement, apiUrl, property, sort = true, skipUpdateCosto = false) => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            let data = await response.json();

            // Si es el select de periodos, ordenar por el primer mes
            if (selectElement === selectors.periodo) {
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

            // Solo actualizar costo si no se especifica skipUpdateCosto
            if (!skipUpdateCosto) {
                updateCosto();
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const toggleAdditionalSelectors = (show, nivel = null) => {
        const display = show ? 'flex' : 'none';
        const displayMaterias = show ? 'none' : 'flex';
        selectors.divCertificado.style.display = display;
        selectors.divSemanas.style.display = display;
        // Solo mostrar inglés si no es nivel 13
        selectors.divIngles.style.display = (show && nivel !== 13) ? 'flex' : 'none';
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

    // 1. Crear el select múltiple de períodos para nivel 13
    function crearSelectPeriodosMultiples(bimestresUnicos) {
        const periodoContainer = selectors.periodo.parentElement;
        const periodoLabel = periodoContainer.previousElementSibling.querySelector('label');
        if (periodoLabel) periodoLabel.textContent = 'Períodos:';
        selectors.periodo.style.display = 'none';

        // Eliminar el select múltiple anterior si existe
        let selectMultiple = document.getElementById('select-periodos-multiple');
        if (selectMultiple) selectMultiple.remove();
        // Eliminar mensaje de ayuda/error anterior
        let helpText = document.getElementById('periodos-help-text');
        if (helpText) helpText.remove();
        let errorMsg = document.getElementById('periodos-error-msg');
        if (errorMsg) errorMsg.remove();

        // Crear el select múltiple
        selectMultiple = document.createElement('select');
        selectMultiple.id = 'select-periodos-multiple';
        selectMultiple.multiple = true;
        selectMultiple.size = 2; // Compacto, parece dropdown
        selectMultiple.className = 'select-multiple-periodos';
        selectMultiple.style.width = '100%';
        selectMultiple.style.minHeight = '100px';
        selectMultiple.style.maxHeight = '100px';
        selectMultiple.style.marginTop = '0.5rem';
        selectMultiple.style.overflowY = 'auto';

        bimestresUnicos.forEach((bim, index) => {
            const option = document.createElement('option');
            option.value = bim.codigo;
            option.textContent = bim.mes;
            option.setAttribute('data-index', index);
            selectMultiple.appendChild(option);
        });
        periodoContainer.appendChild(selectMultiple);

        // Ya NO agregar mensaje de ayuda

        // Evento de validación
        selectMultiple.addEventListener('change', () => {
            validarPeriodosConsecutivosSelect();
            updateCosto();
        });
    }

    // 2. Validar consecutividad en el select múltiple
    function validarPeriodosConsecutivosSelect() {
        const selectMultiple = document.getElementById('select-periodos-multiple');
        const selectedOptions = Array.from(selectMultiple.selectedOptions);
        const selectedIndexes = selectedOptions.map(opt => parseInt(opt.getAttribute('data-index'))).sort((a, b) => a - b);
        let sonConsecutivos = true;
        for (let i = 1; i < selectedIndexes.length; i++) {
            if (selectedIndexes[i] !== selectedIndexes[i-1] + 1) {
                sonConsecutivos = false;
                break;
            }
        }
        // Mensaje de error
        let errorMsg = document.getElementById('periodos-error-msg');
        if (!sonConsecutivos && selectedIndexes.length > 1) {
            if (!errorMsg) {
                errorMsg = document.createElement('p');
                errorMsg.id = 'periodos-error-msg';
                errorMsg.className = 'text-sm text-red-600 mt-2';
                errorMsg.textContent = 'Solo puedes seleccionar períodos consecutivos';
                selectMultiple.parentElement.appendChild(errorMsg);
            }
        } else {
            if (errorMsg) errorMsg.remove();
        }
        // Deshabilitar botón siguiente si no es válido
        const btnSiguiente = document.getElementById('step-1-next');
        if (btnSiguiente) btnSiguiente.disabled = (!sonConsecutivos || selectedIndexes.length === 0);
        return sonConsecutivos && selectedIndexes.length > 0;
    }

    // 3. Obtener períodos seleccionados del select múltiple
    function obtenerPeriodosSeleccionadosSelect() {
        const selectMultiple = document.getElementById('select-periodos-multiple');
        if (!selectMultiple) return [];
        return Array.from(selectMultiple.selectedOptions).map(opt => ({
            codigo: opt.value,
            mes: opt.textContent,
            index: parseInt(opt.getAttribute('data-index'))
        })).sort((a, b) => a.index - b.index);
    }

    // Reemplazar la creación de checkboxes por el select múltiple en el evento de cambio de nivel
    selectors.grade.addEventListener('change', async () => {
        resetFormFields(formElement);
        localStorage.clear();
        clearCache();

        const selectedLevel = selectors.grade.value;
        const mappedLevel = levelMapping[selectedLevel];
        const periodoLabel = selectors.periodo.parentElement.previousElementSibling.querySelector('label') || document.querySelector('label[for="select-period"]');

        // Siempre deja el label en 'Periodo:'
        if (periodoLabel) periodoLabel.textContent = 'Periodo:';

        // Eliminar el select múltiple si existe (al cambiar a cualquier nivel)
        let selectMultiple = document.getElementById('select-periodos-multiple');
        if (selectMultiple) selectMultiple.remove();
        let helpText = document.getElementById('periodos-help-text');
        if (helpText) helpText.remove();
        let errorMsg = document.getElementById('periodos-error-msg');
        if (errorMsg) errorMsg.remove();

        if (mappedLevel === 13) {
            fetch(`${API_BASE_URL}/pagos-bimestrales/nivel/13`)
                .then(res => res.json())
                .then(pagos => {
                    const bimestresUnicos = [];
                    const codigosVistos = new Set();
                    pagos.forEach(pago => {
                        if (!codigosVistos.has(pago.codigo)) {
                            bimestresUnicos.push({ mes: pago.mes, codigo: pago.codigo });
                            codigosVistos.add(pago.codigo);
                        }
                    });
                    const ordenMeses = [
                        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                    ];
                    bimestresUnicos.sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));
                    crearSelectPeriodosMultiples(bimestresUnicos);
                    validarPeriodosConsecutivosSelect();
                });
            selectors.periodo.style.display = 'none';
            // Mostrar selects de semanas y certificados, ocultar materias e inglés
            toggleAdditionalSelectors(true, 13);
            loadOptions(selectors.certificados, `${API_BASE_URL}/certificados/nivel/13`, 'num_certificados', true, true);
            loadOptions(selectors.semanas, `${API_BASE_URL}/semanas/nivel/13`, 'num_semanas', true, true);
            selectors.divMaterias.style.display = 'none';
            // Cargar otros selects necesarios para nivel 13
            loadOptions(selectors.planes, `${API_BASE_URL}/planes/nivel/13`, 'descripcion', true, true);
            loadOptions(selectors.campus, `${API_BASE_URL}/campus/nivel/13`, 'nombre', true, true);
            // Mostrar y cargar opciones de formato para nivel 13
            toggleFormatoDiv(true);
            await loadFormatoOptions(13);
            // Actualizar costo al final
            updateCosto();
            return;
        } else {
            // Restaurar el select original para otros niveles
            selectors.periodo.style.display = 'block';
            const periodoLabel = selectors.periodo.parentElement.previousElementSibling.querySelector('label');
            if (periodoLabel) periodoLabel.textContent = 'Periodo:';
            selectors.periodo.parentElement.style.display = 'block';
            const bimestreSelect = document.getElementById('select-bimestre');
            if (bimestreSelect) bimestreSelect.style.display = 'none';
            toggleAdditionalSelectors(false);
        }

        if (mappedLevel >= 5) {
            toggleFormatoDiv(true);
            await loadFormatoOptions(mappedLevel);
        } else {
            toggleFormatoDiv(false);
        }

        if (mappedLevel === 4) {
            toggleAdditionalSelectors(true, 4);
            loadOptions(selectors.certificados, `${API_BASE_URL}/certificados/nivel/${mappedLevel}`, 'num_certificados', true, true);
            loadOptions(selectors.semanas, `${API_BASE_URL}/semanas/nivel/${mappedLevel}`, 'num_semanas', true, true);
            loadOptions(selectors.ingles, `${API_BASE_URL}/ingles/nivel/${mappedLevel}`, 'num_ingles', true, true);
        } else {
            toggleAdditionalSelectors(false);
        }

        if (mappedLevel) {
            localStorage.setItem('selectedNivel', JSON.stringify(mappedLevel));
        }

        if (mappedLevel) {
            Object.keys(apiConfigs).forEach(key => {
                if (key !== 'grade' && selectors[key] !== null) {
                    let apiUrl = apiConfigs[key].baseUrl + mappedLevel;
                    let property = apiConfigs[key].property;
                    // Lógica especial para créditos/certificados según el nivel
                    if (key === 'materias') {
                        if ([2, 6, 10, 12].includes(mappedLevel)) {
                            apiUrl = `${API_BASE_URL}/creditos/nivel/${mappedLevel}`;
                            property = 'credito';
                            selectors.divMaterias.querySelector('label').textContent = 'Créditos:';
                        } else if ([5, 8, 9].includes(mappedLevel)) {
                            apiUrl = `${API_BASE_URL}/certificados/nivel/${mappedLevel}`;
                            property = 'num_certificados';
                            selectors.divMaterias.querySelector('label').textContent = 'Certificados:';
                        } else {
                            selectors.divMaterias.querySelector('label').textContent = 'Materias:';
                        }
                    }
                    if (key === 'periodo') {
                        loadOptions(selectors.periodo, apiUrl, property, false, true);
                    } else {
                        loadOptions(selectors[key], apiUrl, property, true, true);
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

    // Cuando el usuario seleccione un bimestre, guarda el mes (texto) en localStorage para mostrarlo en resultados
    const bimestreSelect = document.getElementById('select-bimestre');
    if (bimestreSelect) {
        bimestreSelect.addEventListener('change', () => {
            // Guarda el texto visible (mes) en localStorage
            const mesSeleccionado = bimestreSelect.options[bimestreSelect.selectedIndex].textContent;
            localStorage.setItem('bimestreSeleccionado', JSON.stringify(mesSeleccionado));
            updateCosto();
        });
    }

    // Cambiar la función de obtención de períodos seleccionados en el submit
    if (formElement) {
        formElement.addEventListener('submit', (event) => {
            if (parseInt(localStorage.getItem('selectedNivel')) === 13) {
                const periodosSeleccionados = obtenerPeriodosSeleccionadosSelect();
                if (periodosSeleccionados.length > 0) {
                    localStorage.setItem('periodosSeleccionados', JSON.stringify(periodosSeleccionados));
                }
            }
        });
    }
});
