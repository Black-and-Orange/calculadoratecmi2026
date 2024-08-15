document.addEventListener('DOMContentLoaded', () => {
    const averageInput = document.getElementById('txt-average-mark');
    const scholarshipSelect = document.getElementById('txt-scholarship');
    const percentageSelect = document.getElementById('txt-percentage');
    const percentageSelect2 = document.getElementById('txt-percentage2');
    const supportPercentageSelect = document.getElementById('txt-support-percentage');

    async function fetchInteres(levelId) {
        try {
            const response = await fetch(`http://localhost:3008/api/intereses/nivel/${levelId}`);
            if (!response.ok) {
                throw new Error('Error al obtener el interés');
            }
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

    const levelId = window.selectedLevelId || 1;  // Valor por defecto 1 si no se ha seleccionado un nivel

    const calculateDiscounts = (scholarshipPercentage, supportPercentage, selectedPercentage, costoTotal) => {
        let finalAmount = 0;

        if (scholarshipPercentage > 0) {
            finalAmount = (scholarshipPercentage / 100) * costoTotal;
        } else if (selectedPercentage > 0) {
            finalAmount = (selectedPercentage / 100) * costoTotal;
        } else if (supportPercentage > 0) {
            finalAmount = (supportPercentage / 100) * costoTotal;
        }

        return finalAmount;
    };

    const calculateFinalAmount = async () => {
        const scholarshipPercentage = parseFloat(percentageSelect.value) || 0;
        const supportPercentage = parseFloat(supportPercentageSelect.value) || 0;
        const isFixedScholarshipSelected = scholarshipSelect.querySelector('option:checked[data-fixed="true"]');
        const selectedPercentage = isFixedScholarshipSelected ? parseFloat(JSON.parse(localStorage.getItem('selectedPercentage'))) || 0 : 0;

        const finalAmount = calculateDiscounts(scholarshipPercentage, supportPercentage, selectedPercentage, window.costoTotal);

        localStorage.setItem('finalAmount', JSON.stringify(finalAmount));

        const totalContado = window.costoTotal - finalAmount;
        localStorage.setItem('totalContado', JSON.stringify(totalContado));

        const interes = await fetchInteres(levelId);
        const totalConInteres = totalContado * (1 + interes / 100);

        window.totalConInteres = totalConInteres;

        return totalConInteres;
    };

    [scholarshipSelect, percentageSelect, supportPercentageSelect, averageInput].forEach(element => {
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

        try {
            const fixedScholarshipsResponse = await fetch(`http://localhost:3008/api/becasFijas/nivel/${levelId}/promedio?promedio=${average}`);
            if (!fixedScholarshipsResponse.ok) throw new Error('Error al obtener becas fijas');
            const fixedScholarships = await fixedScholarshipsResponse.json();

            const variableScholarshipsResponse = await fetch(`http://localhost:3008/api/becasVariables/nivel/${levelId}/promedio?promedio=${average}`);
            if (!variableScholarshipsResponse.ok) throw new Error('Error al obtener becas variables');
            const variableScholarships = await variableScholarshipsResponse.json();

            scholarshipSelect.innerHTML = '<option value="">Elige</option>';

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
                if (selectedScholarshipId) {
                    const isFixedScholarship = fixedScholarships.some(scholarship => scholarship.id == selectedScholarshipId);
                    if (isFixedScholarship) {
                        percentageSelect.classList.add('hidden');
                        percentageSelect2.classList.add('hidden');
                        percentageSelect.innerHTML = '<option value="">Elige</option>';

                        const selectedOption = scholarshipSelect.options[scholarshipSelect.selectedIndex];
                        const selectedPercentage = selectedOption.dataset.porcentaje;

                        localStorage.setItem('selectedPercentage', JSON.stringify(selectedPercentage));
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
                    const response = await fetch(`http://localhost:3008/api/becasVariables/rangosPorcentaje/${scholarshipId}`);
                    if (!response.ok) {
                        throw new Error('Error al obtener los rangos de porcentaje');
                    }
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
                const supportResponse = await fetch(`http://localhost:3008/api/apoyos/nivel/${levelId}`);
                if (!supportResponse.ok) throw new Error('Error al obtener apoyos');
                const supports = await supportResponse.json();

                supportPercentageSelect.classList.remove('hidden');
                supportPercentageSelect.innerHTML = '<option value="">Elige</option>';

                supports.forEach(support => {
                    const option = document.createElement('option');
                    option.value = support.porcentaje;
                    option.textContent = support.porcentaje;
                    supportPercentageSelect.appendChild(option);
                });
            } else {
                supportPercentageSelect.classList.add('hidden');
                supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
            }
        } catch (error) {
            console.error('Error en la carga de datos:', error);
            scholarshipSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.innerHTML = '<option value="">Elige</option>';
            supportPercentageSelect.innerHTML = '<option value="">Elige</option>';
            percentageSelect.classList.add('hidden');
            percentageSelect2.classList.add('hidden');
        }
    });
});
