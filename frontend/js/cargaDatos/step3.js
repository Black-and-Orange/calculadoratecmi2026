import { API_BASE_URL } from '../apiConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const segurosContainer = document.getElementById('seguros-dinamicos-container');
    const anuncioPoliza = document.getElementById('anuncioPoliza');
    const viveDiv = document.getElementById('div-vive'); // Mantener referencia por si se necesita

    let segurosData = [];
    let segurosMap = new Map(); // Para acceso rápido por id_seguro

    // Función para obtener el nivel actual
    const getLevelId = () => {
        try {
            return JSON.parse(localStorage.getItem('selectedNivel'));
        } catch (e) {
            return null;
        }
    };

    // Función para obtener el código de formato
    const getFormatCode = () => {
        return localStorage.getItem('codigoFormato');
    };

    // Función para cargar seguros desde el backend
    async function fetchSeguros() {
        const levelId = getLevelId();
        if (!levelId) {
            console.warn('No hay nivel seleccionado');
            return;
        }

        const selectedFormatCode = getFormatCode();

        // Lógica especial para VIVE: ocultar en niveles 6-13
        if (levelId >= 6 && levelId <= 13) {
            // No mostrar VIVE en estos niveles
        }

        // Lógica para habilitar/deshabilitar según nivel y formato
        // Por defecto, los seguros están habilitados
        let shouldEnableSeguros = true;
        
        // Deshabilitar solo en casos específicos:
        // 1. Niveles que no permiten seguros (5, 8, 9, 10, 11)
        if (levelId === 5 || levelId === 8 || levelId === 9 || levelId === 10 || levelId === 11) {
            shouldEnableSeguros = false;
        } 
        // 2. Para niveles 1-4, 7, 12: solo habilitar si es presencial (P) o null
        else if ((levelId === 1 || levelId === 2 || levelId === 3 || levelId === 4 || levelId === 7 || levelId === 12)) {
            if (selectedFormatCode && selectedFormatCode !== 'P') {
                shouldEnableSeguros = false;
            }
        }
        // 3. Para niveles 6 y 13: solo habilitar si es presencial (P)
        else if (levelId === 6 || levelId === 13) {
            if (selectedFormatCode !== 'P') {
                shouldEnableSeguros = false;
            }
        }
        
        // Debug: mostrar en consola para verificar
        console.log('Step 3 - Seguros:', {
            levelId,
            selectedFormatCode,
            shouldEnableSeguros
        });

        try {
            const response = await fetch(`${API_BASE_URL}/seguros/nivel/${levelId}`);
            if (!response.ok) throw new Error('Error al obtener los seguros');
            
            const segurosArray = await response.json();
            
            if (Array.isArray(segurosArray) && segurosArray.length > 0) {
                segurosData = segurosArray;
                // Crear mapa para acceso rápido
                segurosMap.clear();
                segurosData.forEach(seguro => {
            if (!seguro.nombre_seguro) return;
                    segurosMap.set(seguro.id_seguro, seguro);
                });
                
                // Generar SELECTs dinámicamente
                generarSelectsSeguros(segurosData, shouldEnableSeguros);
                
                // Calcular costos después de generar los SELECTs
                setTimeout(() => {
                    calculateInsuranceCost();
                }, 100);
            } else {
                segurosData = [];
                segurosMap.clear();
                segurosContainer.innerHTML = '<p class="text-muted">No hay seguros disponibles para este nivel.</p>';
            }
        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
            segurosContainer.innerHTML = '<p class="text-danger">Error al cargar los seguros.</p>';
        }
    }

    // Función para generar SELECTs dinámicamente
    function generarSelectsSeguros(seguros, enabled) {
        if (!segurosContainer) return;

        segurosContainer.innerHTML = ''; // Limpiar contenedor

        seguros.forEach(seguro => {
            if (!seguro.nombre_seguro) return; // dato inválido en BD (reportado a cliente)
            // Filtrar seguros deshabilitados
            if (!seguro.estado) return;

            // Lógica especial para "Cobertura VIVE": ocultar en niveles 6-12 (pero NO en 13)
            const levelId = getLevelId();
            if (seguro.nombre_seguro && seguro.nombre_seguro.toLowerCase().includes('vive')) {
                if (levelId >= 6 && levelId <= 12) {
                    return; // No mostrar VIVE en niveles 6-12
                }
                // El nivel 13 (Ejecutivo Bimestral MAPS) SÍ puede tener VIVE
            }

            const div = document.createElement('div');
            div.className = 'flex flex-wrap mb-6 flex-col md:flex-row';
            div.id = `seguro-container-${seguro.id_seguro}`;
            
            const selectId = `select-seguro-${seguro.id_seguro}`;
            const msgId = `${selectId}-msg`;

            div.innerHTML = `
                <div class="min-w-[190px] mt-2 mb-2 md:mb-0">
                    <label class="font-semibold" for="${selectId}">${seguro.nombre_seguro}:</label>
                </div>
                <div class="flex-1">
                    <div class="relative">
                        <select name="${selectId}" id="${selectId}" ${enabled ? '' : 'disabled'}>
                            <option value="">Elige</option>
                            <option value="si">Sí</option>
                            <option value="no">No aplica</option>
                        </select>
                        <div class="tooltip absolute top-[10px] right-[10px]" style="right: 5px;">
                            <i class="fa-solid fa-circle-question text-write-color-3 bg-white rounded-full"></i>
                            <span class="tooltiptext tooltip-right text-[12px] leading-[20px]">
                                ${getTooltipText(seguro.nombre_seguro)}
                            </span>
                        </div>
                    </div>
                    <p class="msg" id="${msgId}"></p>
                </div>
            `;

            segurosContainer.appendChild(div);

            // Agregar event listener al SELECT
            const selectElement = document.getElementById(selectId);
            if (selectElement) {
                selectElement.addEventListener('change', () => {
                    calculateInsuranceCost();
                    // Mostrar/ocultar anuncio de póliza para "Seguro de Accidentes"
                    if (seguro.nombre_seguro && seguro.nombre_seguro.toLowerCase().includes('accidente')) {
                        if (selectElement.value === 'si') {
                            if (anuncioPoliza) anuncioPoliza.classList.add('hidden');
                        } else {
                            if (anuncioPoliza) anuncioPoliza.classList.remove('hidden');
                        }
                    }
                });
            }
        });
    }

    // Función para obtener texto del tooltip según el nombre del seguro
    function getTooltipText(nombreSeguro) {
        const nombre = (nombreSeguro || '').toLowerCase(); // registros con nombre null en BD no deben romper
        
        if (nombre.includes('accidente')) {
            return 'Todos los estudiantes presenciales deberán contar con un seguro de accidentes, ya sea contratado con Tecmilenio o particular. Los estudiantes de Semestre Empresarial se deberá contratar el Seguro Plus como obligatorio.';
        } else if (nombre.includes('vive')) {
            return 'La Cobertura VIVE permite enriquecer tu experiencia estudiantil ofreciéndote una oferta de talleres extracurriculares, vivir eventos memorables en campus y asistir a eventos nacionales.';
        } else if (nombre.includes('estudiantil') || nombre.includes('colegiatura')) {
            return 'Cobertura estudiantil para protección durante tus estudios.';
        } else {
            return 'Selecciona si deseas incluir este seguro en tu cálculo.';
        }
    }

    // Función para calcular el costo de seguros
    async function calculateInsuranceCost() {
        const levelId = getLevelId() || 1;
        let totalCost = 0;
        let totalConInteres = window.totalConInteres || 0;

        // Obtener seguros seleccionados desde localStorage (más confiable que buscar en DOM)
        const segurosSeleccionados = JSON.parse(localStorage.getItem('segurosSeleccionados') || '{}');

        // Iterar sobre todos los seguros disponibles
        segurosData.forEach(seguro => {
            if (!seguro.nombre_seguro) return;
            if (!seguro.estado) return; // Saltar seguros deshabilitados

            // Lógica especial para VIVE: no aplicar en niveles 6-12 (pero sí en 13)
            if (seguro.nombre_seguro && seguro.nombre_seguro.toLowerCase().includes('vive')) {
                if (levelId >= 6 && levelId <= 12) {
                    return; // No sumar VIVE en niveles 6-12
                }
                // El nivel 13 (Ejecutivo Bimestral MAPS) SÍ puede tener VIVE
            }

            // Verificar si el seguro está seleccionado (desde localStorage o DOM)
            const seleccionado = segurosSeleccionados[seguro.id_seguro];
            const selectElement = document.getElementById(`select-seguro-${seguro.id_seguro}`);
            
            // Usar localStorage primero, luego DOM como respaldo
            const estaSeleccionado = (seleccionado && seleccionado.valor === 'si') || 
                                    (selectElement && selectElement.value === 'si');
            
            if (estaSeleccionado) {
                totalCost += parseFloat(seguro.valor) || 0;
            }
        });

        const divisor = (levelId === 1 || levelId === 2 || levelId === 4) ? 5 : (levelId === 10) ? 3 : 4;
        const interesDividido = totalConInteres / divisor;
        const primeraCuota = interesDividido + totalCost;

        localStorage.setItem('interesDividido', JSON.stringify(interesDividido));
        localStorage.setItem('primeraCuota', JSON.stringify(primeraCuota));
        localStorage.setItem('totalCost', totalCost.toString());

        // Actualizar valores de seguros seleccionados en localStorage (desde DOM si está disponible)
        const segurosSeleccionadosActualizados = {};
        segurosData.forEach(seguro => {
            if (!seguro.nombre_seguro) return;
            const selectElement = document.getElementById(`select-seguro-${seguro.id_seguro}`);
            if (selectElement) {
                segurosSeleccionadosActualizados[seguro.id_seguro] = {
                    nombre: seguro.nombre_seguro,
                    valor: selectElement.value
                };
            } else {
                // Si no hay elemento DOM, usar el valor de localStorage
                const seleccionado = segurosSeleccionados[seguro.id_seguro];
                if (seleccionado) {
                    segurosSeleccionadosActualizados[seguro.id_seguro] = seleccionado;
                }
            }
        });
        localStorage.setItem('segurosSeleccionados', JSON.stringify(segurosSeleccionadosActualizados));
        
        // Debug: mostrar en consola
        console.log('Cálculo de seguros:', {
            totalCost,
            segurosSeleccionados: segurosSeleccionadosActualizados,
            primeraCuota,
            interesDividido
        });
    }

    // Inicializar cuando el step 3 se muestre
    const step3 = document.getElementById('step-3');
    if (step3) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (!step3.classList.contains('hidden')) {
                        fetchSeguros();
                    }
                }
            });
        });

        observer.observe(step3, {
            attributes: true,
            attributeFilter: ['class']
        });

        // También inicializar si ya está visible
        if (!step3.classList.contains('hidden')) {
            fetchSeguros();
        }

        // Escuchar cambios de nivel
        window.addEventListener('storage', (e) => {
            if (e.key === 'selectedNivel' && !step3.classList.contains('hidden')) {
                fetchSeguros();
            }
        });
    }

    // Exponer función para uso externo si es necesario
    window.calculateInsuranceCost = calculateInsuranceCost;
});
