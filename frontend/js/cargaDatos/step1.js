import { API_BASE_URL } from '../apiConfig.js';
import { esNivelBimestralMaps, creditosPorCertificado } from '../utils/shared-utils.js';

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
        divCertificado: document.querySelector('#select-certificado').closest('div.flex-wrap'),
        divSemanas: document.querySelector('#select-semanas').closest('div.flex-wrap'),
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
        semanas: { baseUrl: `${API_BASE_URL}/semanas/nivel/`, property: 'num_semanas' }
    };

    let levelMapping = {};

    // Función auxiliar para ocultar el tooltip de créditos
    const ocultarTooltipCreditos = () => {
        const tooltipCreditos = document.getElementById('tooltip-creditos');
        if (tooltipCreditos) {
            tooltipCreditos.classList.add('hidden');
            tooltipCreditos.style.setProperty('display', 'none', 'important');
            tooltipCreditos.style.setProperty('visibility', 'hidden', 'important');
            tooltipCreditos.style.setProperty('opacity', '0', 'important');
            // También ocultar el tooltiptext
            const tooltiptext = tooltipCreditos.querySelector('.tooltiptext');
            if (tooltiptext) {
                tooltiptext.style.setProperty('visibility', 'hidden', 'important');
                tooltiptext.style.setProperty('opacity', '0', 'important');
            }
            // Debug: console.log('Tooltip de créditos ocultado');
        }
    };
    
    // Función auxiliar para mostrar el tooltip de créditos (solo nivel 2)
    const mostrarTooltipCreditos = (nivel) => {
        const tooltipCreditos = document.getElementById('tooltip-creditos');
        if (tooltipCreditos && nivel === 2) {
            tooltipCreditos.classList.remove('hidden');
            // Establecer explícitamente los estilos para que sea visible y funcione el hover
            tooltipCreditos.style.setProperty('display', 'inline-block', 'important');
            tooltipCreditos.style.setProperty('visibility', 'visible', 'important');
            tooltipCreditos.style.setProperty('opacity', '1', 'important');
            // Asegurar que el tooltiptext también esté listo para mostrarse
            const tooltiptext = tooltipCreditos.querySelector('.tooltiptext');
            if (tooltiptext) {
                tooltiptext.style.removeProperty('visibility');
                tooltiptext.style.removeProperty('opacity');
            }
            // Debug: console.log('Tooltip de créditos mostrado para nivel 2');
        } else if (tooltipCreditos) {
            // Debug: console.log('Ocultando tooltip - nivel no es 2, es:', nivel);
            ocultarTooltipCreditos();
        }
    };

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
    const calcularCostoTotal = (numeroMaterias, costoMateria, esLineal = false) => {
        // Cálculo LINEAL (niveles con calculo_materias='lineal', ej. "... - Nuevo Plan"):
        // nº materias × costo por materia, sin tope ni tabla escalonada.
        if (esLineal) {
            return numeroMaterias * costoMateria;
        }
        // Cálculo ESCALONADO (niveles actuales; se mantiene exactamente igual):
        if ([1, 2, 3, 4, 5, 6].includes(numeroMaterias)) {
            return numeroMaterias * costoMateria;
        } // PENDIENTE-FASE3 (confirmar con cliente): materias 7 u 8 se cobran como 6.
        // ¿Promoción intencional o error? Ver auditoría de cálculo 2026-06-09.
        else if (numeroMaterias === 7 || numeroMaterias === 8) {
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
        const costoMateria = parseFloat(claveGenerada.costo);
        let costoTotal;

        // --- CORRECCIÓN NIVEL 13 ---
        if (esNivelBimestralMaps(mappedLevel)) {
            // Obtener períodos seleccionados de los checkboxes
            let periodosSeleccionados = obtenerPeriodosSeleccionadosSelect();
            // Obtener configuración por período
            const configuracionesPorPeriodo = obtenerConfiguracionPorPeriodo();
            
            // Si no hay selección, costo 0
            if (periodosSeleccionados.length === 0) {
                costoTotal = 0;
            } else {
                // Sumar el costo de cada período seleccionado
                costoTotal = 0;
                
                periodosSeleccionados.forEach((periodo, index) => {
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
                    
                    const costoPeriodo = parseFloat((costosMateria.find(item => item.clave === claveFinal) || { costo: 0 }).costo);
                    
                    // Obtener certificados y semanas específicos para este período
                    const configPeriodo = configuracionesPorPeriodo[periodKey] || { certificados: 0, semanas: 0 };
                    const numeroCertificados = configPeriodo.certificados;
                    const numeroSemanasSEDI = configPeriodo.semanas;
                    
                    const totalCreditos = (numeroCertificados * creditosPorCertificado(mappedLevel)) + (numeroSemanasSEDI * 1);
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
            // PENDIENTE-FASE3: pesos hardcodeados (cert=10, semana=2, inglés=10); deberían venir del admin.
        const valorCertificado = parseInt(selectors.certificados.options[selectors.certificados.selectedIndex].getAttribute('valor_certificado')) || 10;
            const numeroSemanasSEDI = parseInt(selectors.semanas.value);
            const valorSemanaSEDI = parseInt(selectors.semanas.options[selectors.semanas.selectedIndex].getAttribute('valor_semana_sedi')) || 2;
            // "Certificado de idioma" (inglés) se eliminó del formulario → no aporta al costo (0, 0).
            const costoUnidad = parseFloat(claveGenerada.costo);

            costoTotal = calcularCostoTotalCertificadosSemanasIngles(numeroCertificados, valorCertificado, numeroSemanasSEDI, valorSemanaSEDI, 0, 0, costoUnidad);
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
            // El tipo de cálculo de materias lo define la configuración del nivel
            // (columna `calculo_materias`): 'lineal' → nº materias × costo; 'escalonado' → tabla previa.
            const esLineal = selectors.grade.options[selectors.grade.selectedIndex]?.getAttribute('calculo_materias') === 'lineal';
            costoTotal = calcularCostoTotal(numeroMaterias, costoMateria, esLineal);
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
        if (periodoLabel) periodoLabel.textContent = 'Períodos';
        
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
        const isNivel13 = esNivelBimestralMaps(parseInt(localStorage.getItem('selectedNivel')));
        
        let periodKey = '';
        const nivelKey = selectors.grade.options[selectors.grade.selectedIndex].getAttribute('nivel_ed') || '';
        const planKey = selectors.planes.options[selectors.planes.selectedIndex].getAttribute('tipo_plan') || '';

        if (isNivel13) {
            // Para nivel 13, usar el primer período seleccionado como clave
            const periodosSeleccionados = obtenerPeriodosSeleccionadosSelect();
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

    // Función para reorganizar las opciones del select de niveles
    const swapOptions = (selectElement) => {
        if (selectElement.options.length >= 4) {
            // 1. Intercambiar las opciones 2 y 3 (como estaba originalmente)
            const option2 = selectElement.options[2];
            const option3 = selectElement.options[3];
            selectElement.insertBefore(option3, option2);
            
            // 2. Buscar la opción del nivel 13 (Ejecutivo bimestral MAPS)
            let nivel13Option = null;
            let nivel4Index = -1;
            

            
            // Encontrar la opción del nivel 13 y la posición del nivel 4 usando atributos + value exacto
            for (let i = 0; i < selectElement.options.length; i++) {
                const option = selectElement.options[i];
                const value = option.value;
                
                // Nivel 13: value exacto "Ejecutivo MAPS Bimestral"
                if (value === 'Ejecutivo Bimestral MAPS') {
                    nivel13Option = option;
                } 
                // Nivel 4: value exacto "Profesional Semestral MAPS"
                else if (value === 'Profesional Semestral MAPS') {
                    nivel4Index = i;
                }
            }
            
            // Si encontramos ambas opciones, mover el nivel 13 después del nivel 4
            if (nivel13Option && nivel4Index !== -1) {
                // Remover la opción del nivel 13 de su posición actual
                nivel13Option.remove();
                
                // Insertar después del nivel 4
                const nivel4Option = selectElement.options[nivel4Index];
                selectElement.insertBefore(nivel13Option, nivel4Option.nextSibling);
            }
        }
    };

    // Cargar las opciones del select de nivel
    // Niveles que NO deben aparecer en el flujo "Me interesa" (prospecto). En "Soy alumno" sí se muestran.
    const NIVELES_OCULTOS_PROSPECTO = ['Profesional Asociado', 'Ejecutivo', 'Maestría y Especialidades', 'Connect Presencial Matutino'];

    // Muestra u oculta esos niveles según el perfil actual. Se aplica al cargar el dropdown
    // y cada vez que se elige/cambia el perfil (main.js llama a window.aplicarFiltroNivelesPorPerfil).
    const aplicarFiltroNivelesPorPerfil = () => {
        if (!selectors.grade) return;
        const ocultar = localStorage.getItem('perfilUsuario') === 'prospecto';
        Array.from(selectors.grade.options).forEach(opt => {
            if (NIVELES_OCULTOS_PROSPECTO.includes((opt.value || '').trim())) {
                opt.hidden = ocultar;
                opt.disabled = ocultar;
                // Si estaba seleccionado y ahora se oculta, limpiar la selección.
                if (ocultar && opt.selected) selectors.grade.value = '';
            }
        });
    };
    window.aplicarFiltroNivelesPorPerfil = aplicarFiltroNivelesPorPerfil;

    const loadGradeOptions = async () => {
        try {
            await loadOptions(selectors.grade, apiConfigs.grade.url, apiConfigs.grade.property);

            // Una vez cargadas las opciones, intercambiar opciones 2 y 3, y mover nivel 13 después del nivel 4
            swapOptions(selectors.grade);

            // Ocultar los niveles no disponibles para prospecto (si el perfil ya está definido).
            aplicarFiltroNivelesPorPerfil();

        } catch (error) {
            console.error('Error cargando las opciones del nivel:', error);
        }
    };



    // Carga las opciones en un elemento <select> desde la API y las ordena si es necesario
    const loadOptions = async (selectElement, apiUrl, property, sort = true, skipUpdateCosto = false, filterFn = null) => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            let data = await response.json();

            // Filtro opcional sobre los datos (p. ej. planes nuevos de Preparatoria en el flujo prospecto)
            if (typeof filterFn === 'function') {
                data = data.filter(filterFn);
            }

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
                    // Tipo de cálculo de materias del nivel: 'escalonado' (default) o 'lineal'.
                    option.setAttribute('calculo_materias', item.calculo_materias || 'escalonado');
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
        
        // Para el nivel bimestral (13 / 15), ocultar completamente los selects globales ya que cada período tiene sus propios controles
        if (esNivelBimestralMaps(nivel)) {
            selectors.divCertificado.style.display = 'none';
            selectors.divSemanas.style.display = 'none';
        } else {
        selectors.divCertificado.style.display = display;
        selectors.divSemanas.style.display = display;
        }
        
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
                // Conservar el nombre completo y los datos personales (matrícula,
                // nombre, apellidos): ahora viven en el mismo paso que el nivel,
                // así que NO deben borrarse al cambiar de nivel.
                const esDatoPersonal = input.closest('#datos-alumno, #datos-prospecto');
                if (input.id !== 'txt-name' && !esDatoPersonal) {
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

    // 1. Crear checkboxes de períodos para nivel 13
    async function crearSelectPeriodosMultiples(bimestresUnicos) {
        const periodoContainer = selectors.periodo.parentElement;
        selectors.periodo.style.display = 'none';

        // Ocultar el contenedor original para que no interfiera con el layout
        periodoContainer.style.display = 'none';
        // En la rejilla alumno, ocultar la CELDA completa del periodo para que no
        // deje una columna vacía (así "Formato de estudios" sube junto a "programa").
        const periodoCell = selectors.periodo.closest('.campo-cell');
        if (periodoCell) periodoCell.style.display = 'none';
        
        // Ocultar el label original del período
        const periodoLabelOriginal = document.querySelector('label[for="select-period"]');
        if (periodoLabelOriginal) {
            periodoLabelOriginal.style.display = 'none';
        }

        // Eliminar elementos anteriores si existen
        let selectMultiple = document.getElementById('select-periodos-multiple');
        if (selectMultiple) selectMultiple.remove();
        let checkboxContainer = document.getElementById('periodos-checkbox-container');
        if (checkboxContainer) checkboxContainer.remove();
        let helpText = document.getElementById('periodos-help-text');
        if (helpText) helpText.remove();
        let errorMsg = document.getElementById('periodos-error-msg');
        if (errorMsg) errorMsg.remove();

        // Crear contenedor principal para períodos que ocupe toda la fila
        const periodosRowContainer = document.createElement('div');
        periodosRowContainer.id = 'periodos-row-container';
        periodosRowContainer.className = 'periodos-row-container';

        // Crear label para períodos
        const periodosLabel = document.createElement('label');
        periodosLabel.textContent = 'Selecciona los periodos de tu interés';
        periodosLabel.className = 'font-semibold periodos-label';
        periodosRowContainer.appendChild(periodosLabel);

        // Crear contenedor para checkboxes
        checkboxContainer = document.createElement('div');
        checkboxContainer.id = 'periodos-checkbox-container';
        checkboxContainer.className = 'periodos-cards periodos-checkbox-container';

        // Cargar opciones de Certificados y Semanas SEDI (nivel 13) una sola vez.
        let certificadosData = [], semanasData = [];
        const nivelBim = JSON.parse(localStorage.getItem('selectedNivel')) || 13;
        try {
            [certificadosData, semanasData] = await Promise.all([
                fetch(`${API_BASE_URL}/certificados/nivel/${nivelBim}`).then(res => res.json()),
                fetch(`${API_BASE_URL}/semanas/nivel/${nivelBim}`).then(res => res.json())
            ]);
        } catch (err) {
            console.error('No se pudieron cargar las opciones de períodos:', err);
        }

        // Llena un <select> conservando el atributo de valor que usa el cálculo.
        const llenarSelectPeriodo = (select, data, prop, attr, attrDefault) => {
            select.innerHTML = '<option value="">Selecciona</option>';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[prop];
                option.textContent = item[prop];
                option.setAttribute(attr, item[attr] || attrDefault);
                select.appendChild(option);
            });
        };

        // Una TARJETA por período: checkbox + Certificados + Semanas SEDI juntos.
        bimestresUnicos.forEach((bim, index) => {
            const card = document.createElement('div');
            card.className = 'periodo-card';
            card.id = `periodo-card-${bim.codigo}`;

            // Encabezado: <label> nativo, al hacer clic en el mes se marca el checkbox.
            const header = document.createElement('label');
            header.className = 'periodo-card-header';
            header.htmlFor = `periodo-${bim.codigo}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `periodo-${bim.codigo}`;
            checkbox.value = bim.codigo;
            checkbox.setAttribute('data-mes', bim.mes);
            checkbox.setAttribute('data-index', index);
            checkbox.className = 'periodo-checkbox';

            const mesSpan = document.createElement('span');
            mesSpan.textContent = bim.mes;
            mesSpan.className = 'periodo-checkbox-label';

            header.appendChild(checkbox);
            header.appendChild(mesSpan);
            card.appendChild(header);

            // Campo Certificados (deshabilitado hasta marcar el período).
            const certDiv = document.createElement('div');
            certDiv.className = 'periodo-campo';
            const certLabel = document.createElement('label');
            certLabel.textContent = 'Certificados';
            certLabel.className = 'periodo-campo-label';
            certLabel.htmlFor = `certificados-${bim.codigo}`;
            const certSelect = document.createElement('select');
            certSelect.id = `certificados-${bim.codigo}`;
            certSelect.className = 'periodo-campo-select';
            certSelect.disabled = true;
            llenarSelectPeriodo(certSelect, certificadosData, 'num_certificados', 'valor_certificado', 10);
            certDiv.appendChild(certLabel);
            certDiv.appendChild(certSelect);
            card.appendChild(certDiv);

            // Campo Semanas SEDI (deshabilitado hasta marcar el período).
            // Solo se crea si el nivel tiene semanas SEDI configuradas. Posgrado MAPS no
            // las usa (colegiatura = solo certificados), por lo que se omite el selector.
            let semSelect = null;
            if (semanasData.length > 0) {
                const semDiv = document.createElement('div');
                semDiv.className = 'periodo-campo';
                const semLabel = document.createElement('label');
                semLabel.textContent = 'Semanas SEDI';
                semLabel.className = 'periodo-campo-label';
                semLabel.htmlFor = `semanas-${bim.codigo}`;
                semSelect = document.createElement('select');
                semSelect.id = `semanas-${bim.codigo}`;
                semSelect.className = 'periodo-campo-select';
                semSelect.disabled = true;
                llenarSelectPeriodo(semSelect, semanasData, 'num_semanas', 'valor_semana_sedi', 1);
                semDiv.appendChild(semLabel);
                semDiv.appendChild(semSelect);
                card.appendChild(semDiv);
                semSelect.addEventListener('change', () => { updateCosto(); validarPeriodosConsecutivosCheckboxes(); });
            }

            // Al marcar/desmarcar: resaltar la tarjeta y habilitar/limpiar sus selects.
            checkbox.addEventListener('change', () => {
                const activo = checkbox.checked;
                card.classList.toggle('active', activo);
                certSelect.disabled = !activo;
                if (semSelect) semSelect.disabled = !activo;
                if (!activo) { certSelect.value = ''; if (semSelect) semSelect.value = ''; }
                validarPeriodosConsecutivosCheckboxes();
                updateCosto();
            });
            certSelect.addEventListener('change', () => { updateCosto(); validarPeriodosConsecutivosCheckboxes(); });

            checkboxContainer.appendChild(card);
        });

        // Agregar mensaje de ayuda
        const helpTextDiv = document.createElement('div');
        helpTextDiv.id = 'periodos-help-text';
        helpTextDiv.className = 'periodos-help-text';
        helpTextDiv.textContent = 'Selecciona períodos consecutivos únicamente';
        checkboxContainer.appendChild(helpTextDiv);

        periodosRowContainer.appendChild(checkboxContainer);
        
        // Insertar como hijo DIRECTO de #step-1 (la rejilla en alumno / el contenedor
        // en prospecto), justo después del bloque que contiene al campus. En alumno el
        // campus va anidado (#row-campus-periodo > .campo-cell > … > select), así que
        // subimos hasta el ancestro que sea hijo directo de #step-1; si no, al final.
        const step1 = document.getElementById('step-1');
        let anchor = selectors.campus;
        while (anchor && anchor.parentElement && anchor.parentElement.id !== 'step-1') {
            anchor = anchor.parentElement;
        }
        if (step1 && anchor && anchor.parentElement && anchor.parentElement.id === 'step-1') {
            step1.insertBefore(periodosRowContainer, anchor.nextSibling);
        } else if (step1) {
            step1.appendChild(periodosRowContainer);
        }
    }

    // Función para mostrar la configuración de un período específico
    async function mostrarConfiguracionPeriodo(codigo, mes, index) {
        const configContainer = document.getElementById('configuraciones-periodos');
        if (!configContainer) return;

        // Mostrar el contenedor si está oculto
        configContainer.style.display = 'grid';
        configContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        configContainer.style.gap = '16px';

        // Verificar si ya existe la configuración para este período
        let periodoConfig = document.getElementById(`config-periodo-${codigo}`);
        if (periodoConfig) {
            periodoConfig.style.display = 'block';
            return;
        }

        // Crear la configuración del período
        periodoConfig = document.createElement('div');
        periodoConfig.id = `config-periodo-${codigo}`;
        periodoConfig.className = 'periodo-config';

        // Título del período
        const titulo = document.createElement('h4');
        titulo.textContent = `Configuración: ${mes}`;
        titulo.className = 'periodo-config-titulo';
        periodoConfig.appendChild(titulo);

        // Contenedor para los controles
        const controlesContainer = document.createElement('div');
        controlesContainer.className = 'periodo-controles-container';

        // Cargar opciones de certificados (nivel bimestral actual: 13 / 15)
        const nivelBim = JSON.parse(localStorage.getItem('selectedNivel')) || 13;
        const certificadosData = await fetch(`${API_BASE_URL}/certificados/nivel/${nivelBim}`).then(res => res.json());
        const semanasData = await fetch(`${API_BASE_URL}/semanas/nivel/${nivelBim}`).then(res => res.json());

        // Select de certificados
        const certificadosDiv = document.createElement('div');
        certificadosDiv.className = 'periodo-certificados-div';

        const certificadosLabel = document.createElement('label');
        certificadosLabel.textContent = 'Certificados';
        certificadosLabel.className = 'periodo-certificados-label';

        const certificadosSelect = document.createElement('select');
        certificadosSelect.id = `certificados-${codigo}`;
        certificadosSelect.className = 'periodo-certificados-select';

        // Agregar opciones de certificados
        certificadosSelect.innerHTML = '<option value="">Seleccionar</option>';
        certificadosData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.num_certificados;
            option.textContent = item.num_certificados;
            option.setAttribute('valor_certificado', item.valor_certificado || 10);
            certificadosSelect.appendChild(option);
        });

        certificadosDiv.appendChild(certificadosLabel);
        certificadosDiv.appendChild(certificadosSelect);

        // Select de semanas
        const semanasDiv = document.createElement('div');
        semanasDiv.className = 'periodo-semanas-div';

        const semanasLabel = document.createElement('label');
        semanasLabel.textContent = 'Semanas SEDI';
        semanasLabel.className = 'periodo-semanas-label';

        const semanasSelect = document.createElement('select');
        semanasSelect.id = `semanas-${codigo}`;
        semanasSelect.className = 'periodo-semanas-select';

        // Agregar opciones de semanas
        semanasSelect.innerHTML = '<option value="">Seleccionar</option>';
        semanasData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.num_semanas;
            option.textContent = item.num_semanas;
            option.setAttribute('valor_semana_sedi', item.valor_semana_sedi || 1);
            semanasSelect.appendChild(option);
        });

        semanasDiv.appendChild(semanasLabel);
        semanasDiv.appendChild(semanasSelect);

        // Agregar eventos para actualizar costo y validar
        certificadosSelect.addEventListener('change', () => {
            updateCosto();
            validarPeriodosConsecutivosCheckboxes();
        });
        semanasSelect.addEventListener('change', () => {
            updateCosto();
            validarPeriodosConsecutivosCheckboxes();
        });

        controlesContainer.appendChild(certificadosDiv);
        controlesContainer.appendChild(semanasDiv);
        periodoConfig.appendChild(controlesContainer);

        configContainer.appendChild(periodoConfig);
    }

    // Función para ocultar la configuración de un período
    function ocultarConfiguracionPeriodo(codigo) {
        const periodoConfig = document.getElementById(`config-periodo-${codigo}`);
        if (periodoConfig) {
            periodoConfig.style.display = 'none';
        }

        // Verificar si hay configuraciones visibles
        const configContainer = document.getElementById('configuraciones-periodos');
        if (configContainer) {
            const configuracionesVisibles = configContainer.querySelectorAll('.periodo-config');
            let hayConfiguracionesVisibles = false;
            
            configuracionesVisibles.forEach(config => {
                if (config.style.display !== 'none') {
                    hayConfiguracionesVisibles = true;
                }
            });
            
            if (!hayConfiguracionesVisibles) {
                configContainer.style.display = 'none';
            } else {
                configContainer.style.display = 'grid';
                configContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
                configContainer.style.gap = '16px';
            }
        }
    }

    // Función para obtener certificados y semanas por período
    function obtenerConfiguracionPorPeriodo() {
        const configuraciones = {};
        const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
        
        checkboxes.forEach((checkbox) => {
            const codigo = checkbox.value;
            const mes = checkbox.getAttribute('data-mes');
            const certificadosSelect = document.getElementById(`certificados-${codigo}`);
            const semanasSelect = document.getElementById(`semanas-${codigo}`);
            
            const certificados = certificadosSelect ? parseInt(certificadosSelect.value) || 0 : 0;
            const semanas = semanasSelect ? parseInt(semanasSelect.value) || 0 : 0;
            
            configuraciones[codigo] = {
                certificados: certificados,
                semanas: semanas,
                mes: mes
            };
        });
        
        return configuraciones;
    }

    // 2. Validar consecutividad y configuración completa en los checkboxes
    function validarPeriodosConsecutivosCheckboxes() {
        const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
        const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-index'))).sort((a, b) => a - b);
        
        let sonConsecutivos = true;
        for (let i = 1; i < selectedIndexes.length; i++) {
            if (selectedIndexes[i] !== selectedIndexes[i-1] + 1) {
                sonConsecutivos = false;
                break;
            }
        }

        // Validar configuración de cada período seleccionado
        let configuracionCompleta = true;
        let mensajeError = '';
        
        if (selectedIndexes.length > 0) {
            checkboxes.forEach(checkbox => {
                const codigo = checkbox.value;
                const certificadosSelect = document.getElementById(`certificados-${codigo}`);
                const semanasSelect = document.getElementById(`semanas-${codigo}`);
                
                if (!certificadosSelect) {
                    configuracionCompleta = false;
                    mensajeError = '⚠️ Falta cargar la configuración de períodos';
                } else if (!certificadosSelect.value || (semanasSelect && !semanasSelect.value)) {
                    configuracionCompleta = false;
                    mensajeError = '⚠️ Debes completar la configuración de todos los períodos seleccionados';
                }
            });
        }

        // Mostrar mensaje de error solo para períodos no consecutivos (inmediatamente)
        let errorMsg = document.getElementById('periodos-error-msg');
        const checkboxContainer = document.getElementById('periodos-checkbox-container');
        
        if (!sonConsecutivos && selectedIndexes.length > 1) {
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.id = 'periodos-error-msg';
                errorMsg.className = 'periodos-error-msg';
                errorMsg.textContent = '⚠️ Solo puedes seleccionar períodos consecutivos';
                checkboxContainer.appendChild(errorMsg);
            }
        } else {
            // Solo remover el mensaje de consecutividad, no otros mensajes
            if (errorMsg && errorMsg.textContent.includes('consecutivos')) {
                errorMsg.remove();
            }
        }

        // Deshabilitar botón siguiente si no es válido
        // NO deshabilitar el botón automáticamente - permitir que se ejecute la validación
        // El botón se controlará desde main.js cuando se intente avanzar

        return sonConsecutivos && selectedIndexes.length > 0 && configuracionCompleta;
    }

    // Función para validar y mostrar errores solo cuando se intente avanzar
    function validarPeriodosConErrores() {
        const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
        const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-index'))).sort((a, b) => a - b);
        
        let sonConsecutivos = true;
        for (let i = 1; i < selectedIndexes.length; i++) {
            if (selectedIndexes[i] !== selectedIndexes[i-1] + 1) {
                sonConsecutivos = false;
                break;
            }
        }

        // Validar configuración de cada período seleccionado
        let configuracionCompleta = true;
        let mensajeError = '';
        
        if (selectedIndexes.length > 0) {
            checkboxes.forEach(checkbox => {
                const codigo = checkbox.value;
                const certificadosSelect = document.getElementById(`certificados-${codigo}`);
                const semanasSelect = document.getElementById(`semanas-${codigo}`);
                

                
                if (!certificadosSelect) {
                    configuracionCompleta = false;
                    mensajeError = '⚠️ Falta cargar la configuración de períodos';
                } else if (!certificadosSelect.value || (semanasSelect && !semanasSelect.value)) {
                    configuracionCompleta = false;
                    mensajeError = '⚠️ Debes completar la configuración de todos los períodos seleccionados';
                }
            });
        }
        


        // Mostrar mensaje de error solo para configuración incompleta (no consecutividad)
        let errorMsg = document.getElementById('periodos-error-msg');
        const checkboxContainer = document.getElementById('periodos-checkbox-container');
        

        
        if (selectedIndexes.length === 0) {
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.id = 'periodos-error-msg';
                errorMsg.className = 'periodos-error-msg';
                errorMsg.textContent = '⚠️ Este campo es necesario';
                checkboxContainer.appendChild(errorMsg);
            } else {
                errorMsg.textContent = '⚠️ Este campo es necesario';
            }
            return false;
        } else if (!configuracionCompleta) {
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.id = 'periodos-error-msg';
                errorMsg.className = 'periodos-error-msg';
                errorMsg.textContent = mensajeError;
                checkboxContainer.appendChild(errorMsg);
            } else {
                errorMsg.textContent = mensajeError;
            }
            return false;
        } else {
            // Solo remover mensajes de configuración, no de consecutividad
            if (errorMsg && !errorMsg.textContent.includes('consecutivos')) {
                errorMsg.remove();
            }
            return true;
        }
        
        // Asegurar que el botón esté habilitado para que pueda recibir eventos
        const btnSiguiente = document.getElementById('step-1-next');
        if (btnSiguiente) {
            btnSiguiente.disabled = false;
        }
    }

    // Hacer la función disponible globalmente para main.js
    window.validarPeriodosConErrores = validarPeriodosConErrores;

    // 3. Obtener períodos seleccionados de los checkboxes
    function obtenerPeriodosSeleccionadosSelect() {
        const checkboxes = document.querySelectorAll('#periodos-checkbox-container input[type="checkbox"]:checked');
        
        if (!checkboxes.length) {
            return [];
        }
        
        const periodos = Array.from(checkboxes).map(cb => ({
            codigo: cb.value,
            mes: cb.getAttribute('data-mes'),
            index: parseInt(cb.getAttribute('data-index'))
        })).sort((a, b) => a.index - b.index);
        
        return periodos;
    }

    // Reemplazar la creación de checkboxes por el select múltiple en el evento de cambio de nivel
    selectors.grade.addEventListener('change', async () => {
        resetFormFields(formElement);
        // El perfil (HU1) y los datos personales (HU4/42) se capturan antes
        // que el nivel; deben sobrevivir al reseteo
        const perfilUsuario = localStorage.getItem('perfilUsuario');
        const datosPersonales = localStorage.getItem('datosPersonales');
        localStorage.clear();
        if (perfilUsuario) localStorage.setItem('perfilUsuario', perfilUsuario);
        if (datosPersonales) localStorage.setItem('datosPersonales', datosPersonales);
        clearCache();

        // Ocultar el tooltip de créditos al cambiar de nivel (siempre ocultar primero)
        ocultarTooltipCreditos();

        const selectedLevel = selectors.grade.value;
        const mappedLevel = levelMapping[selectedLevel];
        
        // Si no hay nivel seleccionado o es vacío, asegurar que el tooltip esté oculto y salir
        if (!selectedLevel || !mappedLevel || selectedLevel === '') {
            ocultarTooltipCreditos();
            return;
        }
        
        // Asegurar que el tooltip esté oculto al inicio (se mostrará después si es nivel 2)
        ocultarTooltipCreditos();
        const periodoLabel = selectors.periodo.parentElement.previousElementSibling.querySelector('label') || document.querySelector('label[for="select-period"]');

        // Cambiar el label según el nivel
        if (periodoLabel) {
            if (esNivelBimestralMaps(mappedLevel)) {
                periodoLabel.textContent = 'Períodos';
            } else {
                periodoLabel.textContent = 'Periodo';
            }
        }

        // Eliminar elementos anteriores si existen (al cambiar a cualquier nivel)
        let selectMultiple = document.getElementById('select-periodos-multiple');
        if (selectMultiple) selectMultiple.remove();
        let periodosRowContainer = document.getElementById('periodos-row-container');
        if (periodosRowContainer) periodosRowContainer.remove();
        let checkboxContainer = document.getElementById('periodos-checkbox-container');
        if (checkboxContainer) checkboxContainer.remove();
        let configContainer = document.getElementById('configuraciones-periodos');
        if (configContainer) configContainer.remove();
        let helpText = document.getElementById('periodos-help-text');
        if (helpText) helpText.remove();
        let errorMsg = document.getElementById('periodos-error-msg');
        if (errorMsg) errorMsg.remove();
        
        // Restaurar el label original del período
        const periodoLabelOriginal = document.querySelector('label[for="select-period"]');
        if (periodoLabelOriginal) {
            periodoLabelOriginal.style.display = '';
        }
        // Restaurar la celda del periodo y su select (pudieron ocultarse para el nivel 13).
        const periodoCellRestore = selectors.periodo.closest('.campo-cell');
        if (periodoCellRestore) periodoCellRestore.style.display = '';
        selectors.periodo.style.display = '';
        if (selectors.periodo.parentElement) selectors.periodo.parentElement.style.display = '';

        if (esNivelBimestralMaps(mappedLevel)) {
            fetch(`${API_BASE_URL}/pagos-bimestrales/nivel/${mappedLevel}`)
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
                    validarPeriodosConsecutivosCheckboxes();
                });
            selectors.periodo.style.display = 'none';
            // Ocultar selects globales ya que cada período tendrá sus propios controles
            toggleAdditionalSelectors(true, mappedLevel);
            selectors.divMaterias.style.display = 'none';
            // Cargar otros selects necesarios para el nivel bimestral (13 / 15)
            loadOptions(selectors.planes, `${API_BASE_URL}/planes/nivel/${mappedLevel}`, 'descripcion', true, true);
            loadOptions(selectors.campus, `${API_BASE_URL}/campus/nivel/${mappedLevel}`, 'nombre', true, true);
            // Mostrar y cargar opciones de formato para el nivel bimestral
            toggleFormatoDiv(true);
            await loadFormatoOptions(mappedLevel);
            // Actualizar costo al final
            updateCosto();
            return;
        } else {
            // Restaurar el select original para otros niveles
            selectors.periodo.style.display = 'block';
            const periodoLabel = selectors.periodo.parentElement.previousElementSibling.querySelector('label');
            if (periodoLabel) periodoLabel.textContent = 'Periodo';
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
                            selectors.divMaterias.querySelector('label').textContent = 'Créditos';
                            // Solo mostrar el tooltip para el nivel 2 (Profesional Semestral)
                            if (mappedLevel === 2) {
                                mostrarTooltipCreditos(mappedLevel);
                            } else {
                                ocultarTooltipCreditos();
                            }
                        } else if ([5, 8, 9].includes(mappedLevel)) {
                            apiUrl = `${API_BASE_URL}/certificados/nivel/${mappedLevel}`;
                            property = 'num_certificados';
                            selectors.divMaterias.querySelector('label').textContent = 'Certificados';
                            ocultarTooltipCreditos();
                        } else {
                            selectors.divMaterias.querySelector('label').textContent = 'Materias';
                            ocultarTooltipCreditos();
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
            
            // Verificación final: asegurar que el tooltip solo esté visible para nivel 2
            const currentMappedLevel = parseInt(localStorage.getItem('selectedNivel')) || null;
            if (currentMappedLevel !== 2) {
                ocultarTooltipCreditos();
            }
        }
    });

    // Itera sobre los selectores y añade eventos
    Object.keys(selectors).forEach(key => {

        if (selectors[key] !== null) {
            selectors[key].addEventListener('change', () => {
                updateCosto();
                if (key === 'grade') {
                    // lockSubjectsSelectIfPrepa(parseInt(localStorage.getItem('selectedNivel')));
                    // Verificar y ajustar tooltip después de cambiar el nivel
                    setTimeout(() => {
                        const currentLevel = selectors.grade.value;
                        const currentMappedLevel = levelMapping[currentLevel];
                        if (currentMappedLevel !== 2) {
                            ocultarTooltipCreditos();
                        }
                    }, 100);
                }
            });
        }
    });
    // Asegurar que el tooltip de créditos esté oculto al cargar la página
    ocultarTooltipCreditos();
    
    // Inicializa el formulario y carga el mapeo de niveles al cargar la página y enlaza eventos
    initializeLevelMapping().then(() => {
        loadGradeOptions();
        // Asegurar que el tooltip de créditos esté oculto después de cargar
        setTimeout(() => {
            ocultarTooltipCreditos();
            // Verificar el nivel actual y ajustar el tooltip
            const currentLevel = selectors.grade.value;
            const currentMappedLevel = levelMapping[currentLevel];
            if (currentMappedLevel !== 2) {
                ocultarTooltipCreditos();
            }
        }, 200);
    });

    // Selecciona el formulario y agrega el evento de reseteo
    const formElement = document.querySelector('form');
    if (formElement) {
        formElement.addEventListener('reset', () => {
            resetFormFields(formElement);
            const perfilUsuario = localStorage.getItem('perfilUsuario');
            const datosPersonales = localStorage.getItem('datosPersonales');
            localStorage.clear();
            if (perfilUsuario) localStorage.setItem('perfilUsuario', perfilUsuario);
            if (datosPersonales) localStorage.setItem('datosPersonales', datosPersonales);
            // Ocultar el tooltip de créditos al resetear el formulario
            ocultarTooltipCreditos();
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
            if (esNivelBimestralMaps(parseInt(localStorage.getItem('selectedNivel')))) {
                const periodosSeleccionados = obtenerPeriodosSeleccionadosSelect();
                const configuracionesPorPeriodo = obtenerConfiguracionPorPeriodo();
                if (periodosSeleccionados.length > 0) {
                    localStorage.setItem('periodosSeleccionados', JSON.stringify(periodosSeleccionados));
                    localStorage.setItem('configuracionesPorPeriodo', JSON.stringify(configuracionesPorPeriodo));
                }
            }
        });
    }
});
