document.addEventListener('DOMContentLoaded', () => {
    
    const viveDiv = document.getElementById('div-vive');
    const selectInsurance = document.getElementById('select-insurance');
    const selectCoverage = document.getElementById('select-coverage');
    const selectVive = document.getElementById('select-vive');

    let segurosData;

    async function fetchSeguros() {
        const levelId = JSON.parse(localStorage.getItem('selectedNivel'));
        const selectedFormatCode = localStorage.getItem('codigoFormato');
        console.log('levelId:', levelId, 'selectedFormatCode:', selectedFormatCode);
        if (levelId >= 6 && levelId <= 12) {
            viveDiv.style.display = 'none'; 
        }

        if (
            (levelId === 1 || levelId === 2 || levelId === 3 || levelId === 4 || levelId === 6 || levelId === 7 || levelId === 12) 
            && (selectedFormatCode === 'P' || selectedFormatCode === null)
        ) {
            desbloquearSelects();
        } else {
            bloquearSelects();
        }

        try {
            const response = await fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/seguros/nivel/' + levelId);
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const segurosDataArray = await response.json(); 
    
            console.log('segurosDataArray:', segurosDataArray);

            if (segurosDataArray.length > 0) {
                segurosData = segurosDataArray[0];
                console.log('segurosData:', segurosData);
            }
    
        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
        }
    }
    
    function bloquearSelects() {
        selectInsurance.value = "no";
        selectInsurance.disabled = true;
        
        selectCoverage.value = "no";
        selectCoverage.disabled = true;
        
        selectVive.value = "no";
        selectVive.disabled = true;
    }

    function desbloquearSelects() {
        selectInsurance.disabled = false;
        // selectCoverage.disabled = false;
        // selectVive.disabled = false;
    }

    async function calculateInsuranceCost() {
        console.log('Calculando costo de seguros...');
        
        const anuncioPoliza = document.getElementById('anuncioPoliza');
        let totalCost = 0;
        let totalConInteres = window.totalConInteres;

        await fetchSeguros();

        if (!segurosData) {
            console.error('No se cargaron los datos de seguros correctamente.');
            return;
        }
        

        const levelId = JSON.parse(localStorage.getItem('selectedNivel')) || 1;

        if (selectInsurance.value === 'si') {
            totalCost += parseFloat(segurosData.seguro_accidentes);
            anuncioPoliza.style.display = "none";
        } else {
            anuncioPoliza.style.display = "flex";
            totalCost += 0;
        }

        if (selectCoverage.value === 'si') {
            totalCost += parseFloat(segurosData.seguro_estudiantil);
        }else {
            totalCost += 0;
        }

        if (selectVive.value === 'si' && !(levelId >= 6 && levelId <= 12)) {
            totalCost += parseFloat(segurosData.cobertura_vive);
        } else {
            totalCost += 0;
        }

        const divisor = (levelId === 1 || levelId === 2 || levelId === 4) ? 5 : (levelId === 10) ? 3 : 4;
        console.log('divisor:', divisor);
        
        const interesDividido = totalConInteres / divisor;
        console.log(totalCost);
        
        const primeraCuota = interesDividido + totalCost;

        localStorage.setItem('interesDividido', JSON.stringify(interesDividido));
        localStorage.setItem('primeraCuota', JSON.stringify(primeraCuota));
        localStorage.setItem('totalCost', totalCost);

        localStorage.setItem('insuranceValue', JSON.stringify(selectInsurance.value));
        localStorage.setItem('coverageValue', JSON.stringify(selectCoverage.value));
        localStorage.setItem('viveValue', JSON.stringify(selectVive.value));
    }

    document.getElementById('select-insurance').addEventListener('change', () => {
        calculateInsuranceCost();
    });

    document.getElementById('select-coverage').addEventListener('change', () => {
        calculateInsuranceCost();
    });

    document.getElementById('select-vive').addEventListener('change', () => {
        calculateInsuranceCost();
    });

    document.getElementById('step-3-next').addEventListener('click', function (event) {
        const insuranceSelect = document.getElementById('select-insurance');
        const insuranceMsg = document.getElementById('select-insurance-msg');

        if (insuranceSelect.value === "") {
            event.preventDefault();
            insuranceMsg.style.display = 'block';
        } else {
            insuranceMsg.style.display = 'none';
        }
    });

    // calculateInsuranceCost();

});
