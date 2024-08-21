document.addEventListener('DOMContentLoaded', () => {
    const selectInsurance = document.getElementById('select-insurance');
    const selectCoverage = document.getElementById('select-coverage');
    const selectVive = document.getElementById('select-vive');
    const anuncioPoliza = document.getElementById('anuncioPoliza');

    let segurosData = {};

    const levelId = JSON.parse(localStorage.getItem('selectedNivel')) || 1;

    async function fetchSeguros() {
        try {
            const response = await fetch('https://tecmilenio-calculadora-backend.testingbo.com/api/seguros');
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const data = await response.json();

            // Asignación de segurosData según el levelId
            if (levelId === 3) {
                segurosData = data[1];
            } else {
                segurosData = data[0];
            }
        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
        }
    }

    function calculateInsuranceCost() {
        let totalCost = 0;
        let totalConInteres = window.totalConInteres;

        if (selectInsurance.value === 'si') {
            totalCost += parseFloat(segurosData.seguro_accidentes);
            anuncioPoliza.style.display = "none"; 
        } else {
            anuncioPoliza.style.display = "flex";
        }
        
        

        if (selectCoverage.value === 'si') {
            totalCost += parseFloat(segurosData.seguro_estudiantil);
        }

        if (selectVive.value === 'si') {
            totalCost += parseFloat(segurosData.cobertura_vive);
        }

        // Dividir según el levelId
        const divisor = levelId === 3 ? 4 : 5;
        const interesDividido = totalConInteres / divisor;

        // Sumar el costo de los seguros
        const primeraCuota = interesDividido + totalCost;

        const interesDivididoString = JSON.stringify(interesDividido);
        const primeraCuotaString = JSON.stringify(primeraCuota);

        // Almacenar los valores en localStorage
        localStorage.setItem('interesDividido', interesDivididoString);
        localStorage.setItem('primeraCuota', primeraCuotaString);

        // Almacenar el estado de las selecciones en localStorage
        localStorage.setItem('insuranceValue', JSON.stringify(selectInsurance.value));
        localStorage.setItem('coverageValue', JSON.stringify(selectCoverage.value));
        localStorage.setItem('viveValue', JSON.stringify(selectVive.value));

        // Aquí puedes actualizar el DOM o realizar otras acciones con el totalCost
    }

    fetchSeguros();

    selectInsurance.addEventListener('change', () => {
        calculateInsuranceCost();
    });

    selectCoverage.addEventListener('change', () => {
        calculateInsuranceCost();
    });

    selectVive.addEventListener('change', () => {
        calculateInsuranceCost();
    });

    document.getElementById('step-3-next').addEventListener('click', function (event) {
        var insuranceSelect = document.getElementById('select-insurance');
        var insuranceMsg = document.getElementById('select-insurance-msg');

        if (insuranceSelect.value === "") {
            event.preventDefault();  
            insuranceMsg.style.display = 'block';  
        } else {
            insuranceMsg.style.display = 'none';  
        }
    });


});
