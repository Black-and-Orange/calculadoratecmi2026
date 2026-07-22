import { API_BASE_URL } from '../apiConfig.js';

function sortSelectOptions(selectElement) {
    const optionsArray = Array.from(selectElement.options);
    optionsArray.sort((a, b) => {
        const valueA = parseFloat(a.value);
        const valueB = parseFloat(b.value);
        return valueA - valueB;
    });
    selectElement.innerHTML = '';

    optionsArray.forEach(option => selectElement.appendChild(option));
}

document.addEventListener('DOMContentLoaded', () => {
    const averageInput = document.getElementById('txt-average-mark');
    const scholarshipSelect = document.getElementById('txt-scholarship');
    const percentageSelect = document.getElementById('txt-percentage');
    const percentageSelect2 = document.getElementById('txt-percentage2');
    const tipoBeca = document.getElementById('tipo-beca');
    const supportPercentageSelect = document.getElementById('txt-support-percentage');
    const support = document.getElementById('support');
    const supportFixSelect = document.getElementById('txt-support-fix');
    const supportFix = document.getElementById('support-fix');
    const prestamoPercentageSelect = document.getElementById('txt-prestamo-percentage');
    const prestamoPercentageContainer = document.querySelector('.field-avg-4');

    const getLevelId = () => JSON.parse(localStorage.getItem('selectedNivel'));


    percentageSelect.addEventListener('change', () => {
        uptadetSelectedPercentage(percentageSelect.value);

        const numericPercentage = parseFloat(percentageSelect.value);
        const currentLevel = getLevelId();
            if (numericPercentage > 30 && [1, 2, 3, 4].includes(currentLevel)) {
                supportFix.classList.add('hidden');
                supportFixSelect.classList.add('hidden');
            } else if (numericPercentage > 40 && [6, 7, 8, 9, 10, 13].includes(currentLevel)) {
                supportFix.classList.add('hidden');
                supportFixSelect.classList.add('hidden');
            }
            else {
                supportFix.classList.remove('hidden');
                supportFixSelect.classList.remove('hidden');
            }
        
    });

    scholarshipSelect.addEventListener('change', () => {
        uptadetSelectedName(scholarshipSelect.options[scholarshipSelect.selectedIndex].text);
    
        if (isProfessionalSelected() && isScolarshipSelected()) {
            adjustLoanOptions();
        }
    
        // Obtener el texto seleccionado
        const textoSeleccionado = scholarshipSelect.options[scholarshipSelect.selectedIndex]?.text?.toLowerCase() || '';
    
        // Controlar la visibilidad de cada tooltip según el texto seleccionado
        document.getElementById('w-vive').classList.toggle('hidden2', !textoSeleccionado.includes("vive"));
        document.getElementById('w-socioeconomica').classList.toggle('hidden2', !textoSeleccionado.includes("socioeco"));
        document.getElementById('w-steam').classList.toggle('hidden2', !textoSeleccionado.includes("steam"));
    });

    supportPercentageSelect.addEventListener('change', () => {
        uptadetSuportPercentage(supportPercentageSelect.value);
    });

    supportFixSelect.addEventListener('change', () => {
        uptadetSuportFix(supportFixSelect.value);
    });

    prestamoPercentageSelect.addEventListener('change', () => {
        uptadetPrestamoPercentage(prestamoPercentageSelect.value);
    });

    function isScolarshipSelected() {
        const selectedScholarship = localStorage.getItem('selectedScholarshipName');
        return selectedScholarship && selectedScholarship !== '0';
    }

    function isProfessionalSelected() {
        return getLevelId() == 2 || getLevelId() == 4;
    }

    function adjustLoanOptions() {
        const selectedScholarship = scholarshipSelect.value;

        sortSelectOptions(supportPercentageSelect);
        sortSelectOptions(supportFixSelect);
        sortSelectOptions(prestamoPercentageSelect);
        sortSelectOptions(percentageSelect);

        document.querySelectorAll('#txt-prestamo-percentage option').forEach(optionElement => {
            let isProfessional = isProfessionalSelected();
            let currentValueNumber = Number(optionElement.value.replace('%', ''));
            let isGT20 = currentValueNumber > 20;

            if (selectedScholarship === "0") {
                optionElement.disabled = false;
            } else if (isProfessional && isScolarshipSelected() && isGT20) {
                optionElement.disabled = true;
            } else {
                optionElement.disabled = false;
            }
        });
    }

    async function fetchInteres(levelId) {
        try {
            const response = await fetch(`${API_BASE_URL}/intereses/nivel/${levelId}`);
            if (!response.ok) throw new Error('Error al obtener el interés');
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                const interes = parseFloat(data[0].interes);
                if (isNaN(interes)) {
                    console.error('El interés obtenido no es un número:', data[0].interes);
                    return 0;
                }
                return interes;
            } else {
                console.error('El formato de los datos no es el esperado o el array está vacío:', data);
                return 0;
            }
        } catch (error) {
            console.error('Error en fetchInteres:', error);
            return 0;
        }
    }

    const calculateDiscounts = (scholarshipPercentage, supportPercentage, selectedPercentage, prestamo, supportFix, costoTotal) => {
        // Suma todos los porcentajes aplicables
        let totalDescuentoPorcentual = 0;
        if (scholarshipPercentage > 0) totalDescuentoPorcentual += scholarshipPercentage;
        if (selectedPercentage > 0) totalDescuentoPorcentual += selectedPercentage;
        if (supportPercentage > 0) totalDescuentoPorcentual += supportPercentage;
        if (prestamo > 0) totalDescuentoPorcentual += prestamo;

        // Calcula el descuento porcentual total
        let descuentoPorcentual = (totalDescuentoPorcentual / 100) * costoTotal;

        // Suma el apoyo fijo
        let descuentoFijo = supportFix > 0 ? supportFix : 0;

        // Suma total de descuentos
        const totalDescuentos = descuentoPorcentual + descuentoFijo;
        
        return totalDescuentos;
    };

    const calculateFinalAmount = async () => {
        const scholarshipPercentage = parseFloat(document.getElementById('txt-percentage').value) || 0;
        const isFixedScholarshipSelected = document.getElementById('txt-scholarship').querySelector('option:checked[data-fixed="true"]');
        const supportPercentage = parseFloat(document.getElementById('txt-support-percentage').value) || 0;
        const supportFix = parseFloat(document.getElementById('txt-support-fix').value) || 0;
        const selectedPercentage = isFixedScholarshipSelected ? parseFloat(JSON.parse(localStorage.getItem('selectedPercentage'))) || 0 : 0;
        const selectedprestamo = parseFloat(JSON.parse(localStorage.getItem('selectedprestamo'))) || 0;

        const levelId = getLevelId();

        const finalAmount = calculateDiscounts(scholarshipPercentage, supportPercentage, selectedPercentage, selectedprestamo, supportFix, window.costoTotal);

        localStorage.setItem('finalAmount', JSON.stringify(finalAmount));

        const totalContado = window.costoTotal - finalAmount;
        localStorage.setItem('totalContado', JSON.stringify(totalContado));

        const interes = await fetchInteres(levelId);
        const totalConInteres = totalContado * (1 + interes / 100);

        window.totalConInteres = totalConInteres;

        return totalConInteres;
    };

    const uptadetSelectedPercentage = (value) => {
        localStorage.setItem('selectedPercentage', JSON.stringify(value));
    }

    const uptadetSelectedName = (value) => {
        localStorage.setItem('selectedScholarshipName', JSON.stringify(value));
    }

    const uptadetSuportPercentage = (value) => {
        localStorage.setItem('selectedSupportValue', JSON.stringify(value));
    }

    const uptadetSuportFix = (value) => {
        localStorage.setItem('selectedSupportFixValue', JSON.stringify(value));
    }

    const uptadetPrestamoPercentage = (value) => {
        localStorage.setItem('selectedprestamo', JSON.stringify(value));
    }

    [scholarshipSelect, percentageSelect, supportPercentageSelect, supportFixSelect, prestamoPercentageSelect, averageInput].forEach(element => {
        element.addEventListener('change', () => {
            calculateFinalAmount();
        });
    });

    // Los handlers del promedio son asíncronos: si el usuario teclea rápido (o
    // pega el valor) pueden resolverse fuera de orden y el valor viejo pisa al
    // nuevo (p.ej. ocultando las becas ya cargadas). Solo el handler más
    // reciente puede tocar el DOM.
    let promedioReqSeq = 0;

    averageInput.addEventListener('input', async () => {
        const average = parseFloat(averageInput.value);
        const reqSeq = ++promedioReqSeq;
        const vigente = () => reqSeq === promedioReqSeq;
        const promedioValido = !isNaN(average) && average >= 70 && average <= 100;

        if (!promedioValido) {
            scholarshipSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.innerHTML = '<option value="">Elige</option>';
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
            supportFixSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.classList.add('hidden');
            percentageSelect2.classList.add('hidden');
            scholarshipSelect.classList.add('hidden');
            tipoBeca.classList.add('hidden');
        }

        const levelId = getLevelId();

        try {
            // Con promedio inválido no hay nada que consultar (la API responde
            // 404 y el catch escondería el select en un momento arbitrario).
            const fixedScholarships = promedioValido
                ? await (async () => {
                    const r = await fetch(`${API_BASE_URL}/becasFijas/nivel/${levelId}/promedio?promedio=${average}`);
                    if (!r.ok) throw new Error('Error al obtener becas fijas');
                    return r.json();
                })()
                : [];

            const variableScholarships = promedioValido
                ? await (async () => {
                    const r = await fetch(`${API_BASE_URL}/becasVariables/nivel/${levelId}/promedio?promedio=${average}`);
                    if (!r.ok) throw new Error('Error al obtener becas variables');
                    return r.json();
                })()
                : [];

            if (!vigente()) return;

            // Muestra el select si hay becas disponibles (fijas o variables)

            if (variableScholarships.length > 0) {

                scholarshipSelect.classList.remove('hidden');
                tipoBeca.classList.remove('hidden');
                scholarshipSelect.innerHTML = '<option value="">Elige</option>';

                const sinBecaOption = document.createElement('option');
                sinBecaOption.value = "0";
                sinBecaOption.textContent = "Sin Beca";
                scholarshipSelect.insertBefore(sinBecaOption, scholarshipSelect.children[1]);

                if (fixedScholarships.length > 0) {
                    fixedScholarships.forEach(scholarship => {
                        const option = document.createElement('option');
                        option.value = scholarship.id;
                        option.textContent = scholarship.tipo;
                        option.dataset.porcentaje = scholarship.porcentaje;
                        option.dataset.fixed = true;
                        scholarshipSelect.appendChild(option);
                    });
                }
                if (variableScholarships.length > 0) {
                    variableScholarships.forEach(scholarship => {
                        const option = document.createElement('option');
                        option.value = scholarship.id;
                        option.textContent = scholarship.tipo;
                        option.dataset.porcentaje = scholarship.porcentaje;
                        scholarshipSelect.appendChild(option);
                    });
                }
            } else {
                scholarshipSelect.classList.add('hidden');
                tipoBeca.classList.add('hidden');
            }
            // Reemplazar (no apilar) el listener: este handler se registra en
            // cada tecleo del promedio y cierra sobre las becas recién cargadas.
            if (scholarshipSelect._becaChangeHandler) {
                scholarshipSelect.removeEventListener('change', scholarshipSelect._becaChangeHandler);
            }
            scholarshipSelect._becaChangeHandler = async () => {
                const selectedScholarshipId = scholarshipSelect.value;

                if (selectedScholarshipId === "0") {
                    percentageSelect.classList.add('hidden');
                    percentageSelect2.classList.add('hidden');
                    supportPercentageSelect.classList.add('hidden');
                    support.classList.add('hidden');
                    percentageSelect.innerHTML = '<option value="">Elige</option>';
                    //supportFixSelect.classList.add('hidden');
                    //supportFix.classList.add('hidden');
                    //supportFixSelect.innerHTML = '<option value="">Elige</option>';
                    localStorage.setItem('selectedPercentage', JSON.stringify(0));

                    document.querySelectorAll('#txt-prestamo-percentage option').forEach(optionElement => {
                        optionElement.disabled = false;
                    });

                    await calculateFinalAmount();
                } else if (selectedScholarshipId) {                    
                    const isFixedScholarship = fixedScholarships.some(scholarship => scholarship.id == selectedScholarshipId);
                    if (isFixedScholarship) {
                        percentageSelect.classList.add('hidden');
                        percentageSelect2.classList.add('hidden');
                        percentageSelect.innerHTML = '<option value="">Elige</option>';

                        const selectedOption = scholarshipSelect.options[scholarshipSelect.selectedIndex];
                        const selectedPercentage = selectedOption.dataset.porcentaje;
                        const numericPercentage = parseFloat(selectedPercentage);                        

                        localStorage.setItem('selectedPercentage', JSON.stringify(selectedPercentage));
                        localStorage.setItem('numericPercentage', JSON.stringify(numericPercentage));
                        await calculateFinalAmount();
                    } else {
                        percentageSelect.classList.remove('hidden');
                        await updatePercentageOptionsByScholarshipId(selectedScholarshipId);
                    }
                } else {
                    percentageSelect.classList.add('hidden');
                    percentageSelect2.classList.add('hidden');
                    percentageSelect.innerHTML = '<option value="">Elige</option>';
                }
            };
            scholarshipSelect.addEventListener('change', scholarshipSelect._becaChangeHandler);


            const hideScholarshipSelectForLevel5 = () => {
                const levelId = getLevelId();
                if (levelId == 5) {
                    tipoBeca.classList.add('hidden');
                }
            };


            async function updatePercentageOptionsByScholarshipId(scholarshipId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/becasVariables/rangosPorcentaje/${scholarshipId}`);
                    if (!response.ok) throw new Error('Error al obtener los rangos de porcentaje');
                    const { porcentajeMin, porcentajeMax } = await response.json();

                    const fragment = document.createDocumentFragment();
                    percentageSelect.innerHTML = '<option value="">Elige</option>';
                    for (let i = porcentajeMin; i <= porcentajeMax; i += 5) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `${i}%`;
                        fragment.appendChild(option);
                    }

                    percentageSelect.appendChild(fragment);
                } catch (error) {
                    percentageSelect.innerHTML = '<option value="">Elige</option>';
                    console.error('Error al actualizar las opciones de porcentaje:', error);
                }
            }

            const mostrarPrestamoSelectSiNivel2 = async () => {
                if (getLevelId() === 2 || getLevelId() === 4 || getLevelId() == 6 || getLevelId() == 7 || getLevelId() == 13) {
                    try {
                        const prestamoResponse = await fetch(`${API_BASE_URL}/prestamos/nivel/${levelId}`);
                        if (!prestamoResponse.ok) throw new Error('Error al obtener Prestamos');
                        const prestamos = await prestamoResponse.json();

                        prestamos.sort((a, b) => a.prestamo - b.prestamo);

                        prestamoPercentageContainer.classList.remove('hidden');
                        prestamoPercentageSelect.innerHTML = '<option value="">Elige</option>';

                        prestamos.forEach(prestamo => {
                            const option = document.createElement('option');
                            option.value = prestamo.prestamo;
                            option.textContent = prestamo.prestamo + '%';
                            prestamoPercentageSelect.appendChild(option);
                        });

                    } catch (error) {
                        console.error('Error en la carga de datos de préstamos:', error);
                        prestamoPercentageSelect.innerHTML = '<option value="">Elige</option>';
                        prestamoPercentageContainer.classList.add('hidden');
                    }
                } else {
                    prestamoPercentageContainer.classList.add('hidden');
                    prestamoPercentageSelect.innerHTML = '<option value="">Elige</option>';
                }
            };

            mostrarPrestamoSelectSiNivel2();
            hideScholarshipSelectForLevel5();

        } catch (error) {
            if (!vigente()) return;
            console.error('Error en la carga de datos:', error);
            scholarshipSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.innerHTML = '<option value="">Elige</option>';
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
            supportFixSelect.innerHTML = '<option value="">Elige</option>';
            prestamoPercentageSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.classList.add('hidden');
            percentageSelect2.classList.add('hidden');
            scholarshipSelect.classList.add('hidden');
            tipoBeca.classList.add('hidden');
        }

        if (average >= 70 && average <= 100 && levelId != 5) {
            const supportResponse = await fetch(`${API_BASE_URL}/apoyosFijos/nivel/${levelId}`);
            if (!supportResponse.ok) throw new Error('Error al obtener apoyos');
            const supports = await supportResponse.json();
            if (!vigente()) return;
            
            supports.sort((a, b) => a.valor - b.valor);

            supportFixSelect.classList.remove('hidden');
            supportFix.classList.remove('hidden');
            supportFixSelect.innerHTML = '<option value="">Elige</option>';

            supports.forEach(supportFix => {
                const option = document.createElement('option');
                option.value = supportFix.valor;
                option.textContent = `${supportFix.valor}`;
                supportFixSelect.appendChild(option);
            });
        } 
        if (average >= 70 && average <= 100 && levelId == 5) {
            const supportResponse = await fetch(`${API_BASE_URL}/apoyos/nivel/${levelId}`);
            if (!supportResponse.ok) throw new Error('Error al obtener apoyos');
            const supports = await supportResponse.json();
            if (!vigente()) return;

            supports.sort((a, b) => a.porcentaje - b.porcentaje);

            supportPercentageSelect.classList.remove('hidden');
            support.classList.remove('hidden');
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';

            supports.forEach(support => {
                const option = document.createElement('option');
                option.value = support.porcentaje;
                option.textContent = `${support.porcentaje}%`;
                supportPercentageSelect.appendChild(option);
            });
        } 
        // Para Ejecutivo MAPS Bimestral (nivel 13), siempre mostrar apoyo de porcentaje sin importar el promedio
        if (levelId == 13) {
            const supportResponse = await fetch(`${API_BASE_URL}/apoyos/nivel/${levelId}`);
            if (!supportResponse.ok) throw new Error('Error al obtener apoyos');
            const supports = await supportResponse.json();
            if (!vigente()) return;

            // Ordenar los apoyos de menor a mayor porcentaje
            supports.sort((a, b) => a.porcentaje - b.porcentaje);

            supportPercentageSelect.classList.remove('hidden');
            support.classList.remove('hidden');
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';

            supports.forEach(support => {
                const option = document.createElement('option');
                option.value = support.porcentaje;
                option.textContent = `${support.porcentaje}%`;
                supportPercentageSelect.appendChild(option);
            });
        }
        else if (average >= 70 && average <= 79 && levelId != 5) {
            const supportResponse = await fetch(`${API_BASE_URL}/apoyos/nivel/${levelId}`);
            if (!supportResponse.ok) throw new Error('Error al obtener apoyos');
            const supports = await supportResponse.json();
            if (!vigente()) return;

            // Ordenar los apoyos de menor a mayor porcentaje
            supports.sort((a, b) => a.porcentaje - b.porcentaje);

            supportPercentageSelect.classList.remove('hidden');
            support.classList.remove('hidden');
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';

            supports.forEach(support => {
                const option = document.createElement('option');
                option.value = support.porcentaje;
                option.textContent = `${support.porcentaje}%`;
                supportPercentageSelect.appendChild(option);
            });
        } 
        // Garantizar la visibilidad de los apoyos según nivel + promedio en TODOS
        // los casos (antes solo se ocultaban con promedio <70 o >100, por lo que
        // el apoyo % quedaba visible al subir el promedio de 70-79 a 80-100).
        // Regla:
        //   Apoyo % → nivel 13 (siempre) · nivel 5 (70-100) · otros niveles (70-79)
        //   Apoyo $ → niveles != 5 con promedio 70-100
        const apoyoPctAplica =
            levelId == 13 ||
            (levelId == 5 && average >= 70 && average <= 100) ||
            (levelId != 5 && average >= 70 && average <= 79);
        if (!apoyoPctAplica) {
            supportPercentageSelect.classList.add('hidden');
            support.classList.add('hidden');
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
        }

        const apoyoFijoAplica = average >= 70 && average <= 100 && levelId != 5;
        if (!apoyoFijoAplica) {
            supportFixSelect.classList.add('hidden');
            supportFix.classList.add('hidden');
            supportFixSelect.innerHTML = '<option value="">Elige</option>';
        }
    });
});
