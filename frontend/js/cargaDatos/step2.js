document.addEventListener('DOMContentLoaded', () => {
    const averageInput = document.getElementById('txt-average-mark');
    const scholarshipSelect = document.getElementById('txt-scholarship');
    const percentageSelect = document.getElementById('txt-percentage');
    const percentageSelect2 = document.getElementById('txt-percentage2');
    const supportPercentageSelect = document.getElementById('txt-support-percentage');
    const prestamoPercentageSelect = document.getElementById('txt-prestamo-percentage');
    const prestamoPercentageContainer = document.querySelector('.field-avg-4');

    // Función para obtener el levelId
    const getLevelId = () => JSON.parse(localStorage.getItem('selectedNivel'));

    // Función para actualizar el levelId
    const setLevelId = (id) => localStorage.setItem('selectedNivel', JSON.stringify(id));

    percentageSelect.addEventListener('change', () => {
        uptadetSelectedPercentage(percentageSelect.value);
    });

    scholarshipSelect.addEventListener('change', () => {
        uptadetSelectedName(scholarshipSelect.options[scholarshipSelect.selectedIndex].text);

        if (isProfessionalSelected() && isScolarshipSelected()) {
            adjustLoanOptions();
        }
    });

    supportPercentageSelect.addEventListener('change', () => {
        uptadetSuportPercentage(supportPercentageSelect.value);
    });

    prestamoPercentageSelect.addEventListener('change', () => {
        uptadetPrestamoPercentage(prestamoPercentageSelect.value);
    });

    function isScolarshipSelected() {
        const selectedScholarship = localStorage.getItem('selectedScholarshipName');
        return selectedScholarship && selectedScholarship !== '0';
    }

    function isProfessionalSelected() {
        return getLevelId() == 2;
    }

    function adjustLoanOptions() {
        const selectedScholarship = scholarshipSelect.value;

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
            const response = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/intereses/nivel/${levelId}`);
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

    const calculateDiscounts = (scholarshipPercentage, supportPercentage, selectedPercentage, prestamo, costoTotal) => {
        let finalAmount = 0;

        if (scholarshipPercentage > 0) {
            finalAmount = (scholarshipPercentage / 100) * costoTotal;
        } else if (selectedPercentage > 0) {
            finalAmount = (selectedPercentage / 100) * costoTotal;
        } else if (supportPercentage > 0) {
            finalAmount = (supportPercentage / 100) * costoTotal;
        }

        if (prestamo > 0) {
            finalAmount += (prestamo / 100) * costoTotal;
        }

        return finalAmount;
    };

    const calculateFinalAmount = async () => {
        const scholarshipPercentage = parseFloat(document.getElementById('txt-percentage').value) || 0;
        const supportPercentage = parseFloat(document.getElementById('txt-support-percentage').value) || 0;
        const isFixedScholarshipSelected = document.getElementById('txt-scholarship').querySelector('option:checked[data-fixed="true"]');
        const selectedPercentage = isFixedScholarshipSelected ? parseFloat(JSON.parse(localStorage.getItem('selectedPercentage'))) || 0 : 0;
        const selectedprestamo = parseFloat(JSON.parse(localStorage.getItem('selectedprestamo'))) || 0;

        const levelId = getLevelId();  // Obtener el levelId cuando sea necesario

        const finalAmount = calculateDiscounts(scholarshipPercentage, supportPercentage, selectedPercentage, selectedprestamo, window.costoTotal);

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

    const uptadetPrestamoPercentage = (value) => {
        localStorage.setItem('selectedprestamo', JSON.stringify(value));
    }

    [scholarshipSelect, percentageSelect, supportPercentageSelect, prestamoPercentageSelect, averageInput].forEach(element => {
        element.addEventListener('change', () => {
            calculateFinalAmount();
        });
    });

    averageInput.addEventListener('input', async () => {
        const average = parseFloat(averageInput.value).toFixed(2);

        if (isNaN(average) || average < 70 || average > 100) {
            scholarshipSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.innerHTML = '<option value="">Elige</option>';
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.classList.add('hidden');
            percentageSelect2.classList.add('hidden');
            return;
        }

        const levelId = getLevelId(); // Obtener el levelId cuando sea necesario

        try {
            const fixedScholarshipsResponse = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/becasFijas/nivel/${levelId}/promedio?promedio=${average}`);
            if (!fixedScholarshipsResponse.ok) throw new Error('Error al obtener becas fijas');
            const fixedScholarships = await fixedScholarshipsResponse.json();

            const variableScholarshipsResponse = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/becasVariables/nivel/${levelId}/promedio?promedio=${average}`);
            if (!variableScholarshipsResponse.ok) throw new Error('Error al obtener becas variables');
            const variableScholarships = await variableScholarshipsResponse.json();

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

            scholarshipSelect.addEventListener('change', async () => {
                const selectedScholarshipId = scholarshipSelect.value;

                if (selectedScholarshipId === "0") { // Si "Sin Beca" está seleccionado
                    percentageSelect.classList.add('hidden');
                    percentageSelect2.classList.add('hidden');
                    supportPercentageSelect.classList.add('hidden');
                    percentageSelect.innerHTML = '<option value="">Elige</option>';
                    supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
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

                        localStorage.setItem('selectedPercentage', JSON.stringify(selectedPercentage));
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
            });

            async function updatePercentageOptionsByScholarshipId(scholarshipId) {
                try {
                    const response = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/becasVariables/rangosPorcentaje/${scholarshipId}`);
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

            if (average >= 70 && average <= 79) {
                const supportResponse = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/apoyos/nivel/${levelId}`);
                if (!supportResponse.ok) throw new Error('Error al obtener apoyos');
                const supports = await supportResponse.json();

                supportPercentageSelect.classList.remove('hidden');
                supportPercentageSelect.innerHTML = '<option value="">Elige</option>';

                supports.forEach(support => {
                    const option = document.createElement('option');
                    option.value = support.porcentaje;
                    option.textContent = `${Math.trunc(support.porcentaje)}%`;
                    supportPercentageSelect.appendChild(option);
                });
            } else {
                supportPercentageSelect.classList.add('hidden');
                supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
            }

            const mostrarPrestamoSelectSiNivel2 = async () => {
                if (getLevelId() === 2) {
                    try {
                        const prestamoResponse = await fetch(`https://tecmilenio-calculadora-backend.testingbo.com/api/prestamos/nivel/${levelId}`);
                        if (!prestamoResponse.ok) throw new Error('Error al obtener Prestamos');
                        const prestamos = await prestamoResponse.json();

                        prestamoPercentageContainer.classList.remove('hidden');
                        prestamoPercentageSelect.innerHTML = '<option value="">Elige</option>';

                        prestamos.forEach(prestamo => {
                            const option = document.createElement('option');
                            option.value = prestamo.prestamo;
                            option.textContent = prestamo.prestamo;
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

        } catch (error) {
            console.error('Error en la carga de datos:', error);
            scholarshipSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.innerHTML = '<option value="">Elige</option>';
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
            prestamoPercentageSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.classList.add('hidden');
            percentageSelect2.classList.add('hidden');
        }
    });
});
