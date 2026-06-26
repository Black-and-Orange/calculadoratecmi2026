import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const percentageSelectStudents = document.getElementById('txt-percentage-students');
    const prestamoPercentageSelectStudents = document.getElementById('txt-prestamo-percentage-students');
    const prestamoPercentageContainerStudents = document.getElementById('prestamo-students-container');

    const getLevelId = () => JSON.parse(localStorage.getItem('selectedNivel'));

    // Función para obtener todos los porcentajes de beca disponibles (combinando fijas y variables)
    const obtenerTodosLosPorcentajesBeca = async (nivelId) => {
        const porcentajes = new Set();

        try {
            // 1. Obtener becas fijas del nivel (sin filtrar por promedio)
            const becasFijasResponse = await fetch(`${API_BASE_URL}/becasFijas/nivel/${nivelId}`);
            if (!becasFijasResponse.ok) throw new Error('Error al obtener becas fijas');
            const becasFijas = await becasFijasResponse.json();

            // Agregar porcentajes de becas fijas
            becasFijas.forEach(beca => {
                const porcentaje = parseFloat(beca.porcentaje);
                if (!isNaN(porcentaje)) {
                    porcentajes.add(porcentaje);
                }
            });

            // 2. Obtener becas variables del nivel (sin filtrar por promedio)
            const becasVariablesResponse = await fetch(`${API_BASE_URL}/becasVariables/nivel/${nivelId}`);
            if (!becasVariablesResponse.ok) throw new Error('Error al obtener becas variables');
            const becasVariables = await becasVariablesResponse.json();

            // Agregar todos los porcentajes de los rangos de becas variables
            becasVariables.forEach(beca => {
                const min = parseFloat(beca.porcentaje_min);
                const max = parseFloat(beca.porcentaje_max);
                if (!isNaN(min) && !isNaN(max)) {
                    // Generar TODOS los valores del rango (incremento de 1)
                    for (let i = min; i <= max; i += 1) {
                        porcentajes.add(i);
                    }
                }
            });

            // 3. Convertir a array, ordenar y retornar
            return Array.from(porcentajes).sort((a, b) => a - b);
        } catch (error) {
            console.error('Error al obtener porcentajes de beca:', error);
            return [];
        }
    };

    // Función para cargar porcentajes de beca en el select
    const cargarPorcentajesBeca = async () => {
        if (!percentageSelectStudents) return;
        
        const levelId = getLevelId();
        if (!levelId) {
            percentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
            return;
        }

        try {
            const porcentajes = await obtenerTodosLosPorcentajesBeca(levelId);
            
            percentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
            
            if (porcentajes.length > 0) {
                porcentajes.forEach(porcentaje => {
                    const option = document.createElement('option');
                    option.value = porcentaje;
                    option.textContent = `${porcentaje}%`;
                    percentageSelectStudents.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar porcentajes de beca:', error);
            percentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
        }
    };

    // Función para cargar préstamos (sin depender de promedio)
    const cargarPrestamos = async () => {
        if (!prestamoPercentageSelectStudents) return;
        
        const levelId = getLevelId();
        if (!levelId) {
            if (prestamoPercentageContainerStudents) {
                prestamoPercentageContainerStudents.classList.add('hidden');
            }
            prestamoPercentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
            return;
        }

        try {
            const prestamoResponse = await fetch(`${API_BASE_URL}/prestamos/nivel/${levelId}`);
            if (!prestamoResponse.ok) throw new Error('Error al obtener préstamos');
            const prestamos = await prestamoResponse.json();

            if (prestamos && Array.isArray(prestamos) && prestamos.length > 0) {
                prestamos.sort((a, b) => parseFloat(a.prestamo) - parseFloat(b.prestamo));

                // La visibilidad del contenedor la controla apoyos-hu.js según
                // el radio "¿cuentas con préstamo?" (HU19)

                if (prestamoPercentageSelectStudents) {
                    prestamoPercentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';

                    prestamos.forEach(prestamo => {
                        const option = document.createElement('option');
                        option.value = prestamo.prestamo;
                        option.textContent = `${prestamo.prestamo}%`;
                        prestamoPercentageSelectStudents.appendChild(option);
                    });
                }
            } else {
                // Si no hay préstamos, ocultar el contenedor
                if (prestamoPercentageContainerStudents) {
                    prestamoPercentageContainerStudents.classList.add('hidden');
                }
                if (prestamoPercentageSelectStudents) {
                    prestamoPercentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
                }
            }
        } catch (error) {
            console.error('Error al cargar préstamos:', error);
            if (prestamoPercentageContainerStudents) {
                prestamoPercentageContainerStudents.classList.add('hidden');
            }
            prestamoPercentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
        }
    };

    // Función para obtener el interés
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

    // Función simplificada para calcular descuentos (solo porcentaje de beca + préstamo)
    const calculateDiscounts = (percentageBeca, prestamo, costoTotal) => {
        // Suma los porcentajes aplicables
        let totalDescuentoPorcentual = 0;
        if (percentageBeca > 0) totalDescuentoPorcentual += percentageBeca;
        if (prestamo > 0) totalDescuentoPorcentual += prestamo;

        // Calcula el descuento porcentual total
        const descuentoPorcentual = (totalDescuentoPorcentual / 100) * costoTotal;
        
        return descuentoPorcentual;
    };

    // Función simplificada para calcular el monto final
    const calculateFinalAmount = async () => {
        if (!percentageSelectStudents) return;
        
        const percentageBeca = parseFloat(percentageSelectStudents.value) || 0;
        const prestamo = prestamoPercentageSelectStudents ? parseFloat(prestamoPercentageSelectStudents.value) || 0 : 0;
        const levelId = getLevelId();

        if (!levelId || !window.costoTotal) {
            return;
        }

        const finalAmount = calculateDiscounts(percentageBeca, prestamo, window.costoTotal);

        localStorage.setItem('finalAmount', JSON.stringify(finalAmount));
        localStorage.setItem('selectedPercentage', JSON.stringify(percentageBeca));
        localStorage.setItem('selectedprestamo', JSON.stringify(prestamo));

        const totalContado = window.costoTotal - finalAmount;
        localStorage.setItem('totalContado', JSON.stringify(totalContado));

        const interes = await fetchInteres(levelId);
        const totalConInteres = totalContado * (1 + interes / 100);

        window.totalConInteres = totalConInteres;

        return totalConInteres;
    };

    // Event listeners (solo si los elementos existen)
    if (percentageSelectStudents) {
        percentageSelectStudents.addEventListener('change', () => {
            calculateFinalAmount();
        });
    }

    if (prestamoPercentageSelectStudents) {
        prestamoPercentageSelectStudents.addEventListener('change', () => {
            calculateFinalAmount();
        });
    }

    // Cargar datos al iniciar
    const inicializar = async () => {
        const levelId = getLevelId();
        if (levelId) {
            // Cargar ambos en paralelo para mayor eficiencia
            await Promise.all([
                cargarPorcentajesBeca(),
                cargarPrestamos()
            ]);
        } else {
            // Si no hay nivel, limpiar los selects
            if (percentageSelectStudents) {
                percentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
            }
            if (prestamoPercentageSelectStudents) {
                prestamoPercentageSelectStudents.innerHTML = '<option value="">Selecciona</option>';
            }
            if (prestamoPercentageContainerStudents) {
                prestamoPercentageContainerStudents.classList.add('hidden');
            }
        }
    };

    // Inicializar cuando el step-2-students se muestre
    const step2Students = document.getElementById('step-2-students');
    if (step2Students) {
        // Función para verificar y inicializar
        const checkAndInitialize = () => {
            if (!step2Students.classList.contains('hidden')) {
                // Pequeño delay para asegurar que el DOM esté listo
                setTimeout(() => {
                    inicializar();
                }, 200);
            }
        };

        // Observar cuando el step se muestre
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkAndInitialize();
                }
            });
        });

        observer.observe(step2Students, {
            attributes: true,
            attributeFilter: ['class']
        });

        // También inicializar si ya está visible al cargar
        checkAndInitialize();

        // También inicializar cuando cambie el nivel (por si el usuario vuelve al step 1 y cambia nivel)
        window.addEventListener('storage', (e) => {
            if (e.key === 'selectedNivel') {
                checkAndInitialize();
            }
        });

        // Escuchar eventos personalizados de cambio de step
        document.addEventListener('stepChanged', (e) => {
            if (e.detail && e.detail.step === 2) {
                checkAndInitialize();
            }
        });

        // También escuchar cuando se muestre el step desde main.js usando IntersectionObserver
        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !step2Students.classList.contains('hidden')) {
                    checkAndInitialize();
                }
            });
        }, { threshold: 0.1 });

        intersectionObserver.observe(step2Students);
    }
});
