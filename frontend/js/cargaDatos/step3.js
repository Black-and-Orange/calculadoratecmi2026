document.addEventListener('DOMContentLoaded', () => {
    const levelId = JSON.parse(localStorage.getItem('selectedNivel')) || 1;
    const viveDiv = document.getElementById('div-vive');
    // Verificar si el nivel está entre 6 y 12 para ocultar "viveDiv"
    if (levelId >= 6 && levelId <= 12) {
        viveDiv.style.display = 'none'; // Ocultar div
    } else {
        viveDiv.style.display = 'flex'; // Mostrar div si no está en ese rango
    }

    let segurosData;

    async function fetchSeguros() {
        console.log('levelId:', levelId);
    
        try {
            const response = await fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/seguros/nivel/' + levelId);
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const segurosDataArray = await response.json(); // Recibimos un array
    
            console.log('segurosDataArray:', segurosDataArray);
    
            // Asegúrate de que no está vacío
            if (segurosDataArray.length > 0) {
                segurosData = segurosDataArray[0]; // Tomamos el primer seguro
    
                console.log('segurosData:', segurosData);
            }
    
            
        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
        }
    }
    
    async function calculateInsuranceCost() {
        const selectInsurance = document.getElementById('select-insurance');
        const selectCoverage = document.getElementById('select-coverage');
        const selectVive = document.getElementById('select-vive');
        const anuncioPoliza = document.getElementById('anuncioPoliza');

        let totalCost = 0;
        let totalConInteres = window.totalConInteres;

        // Esperar a que los seguros se carguen
        await fetchSeguros();

        if (!segurosData) {
            console.error('No se cargaron los datos de seguros correctamente.');
            return;
        }

        if (selectInsurance.value === 'si') {
            totalCost += parseFloat(segurosData.seguro_accidentes);
            anuncioPoliza.style.display = "none";
        } else {
            anuncioPoliza.style.display = "flex";
        }

        if (selectCoverage.value === 'si') {
            totalCost += parseFloat(segurosData.seguro_estudiantil);
        }

        // Solo sumar cobertura "vive" si el nivel no está entre 6 y 12
        if (selectVive.value === 'si' && !(levelId >= 6 && levelId <= 12)) {
            totalCost += parseFloat(segurosData.cobertura_vive);
        }

        const divisor = (levelId === 3 || levelId === 5 || levelId === 1 || levelId === 4) ? 5 : 4;
        console.log('divisor:', divisor);
        
        const interesDividido = totalConInteres / divisor;
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
});
