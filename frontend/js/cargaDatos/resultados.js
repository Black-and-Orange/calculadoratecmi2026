import { API_BASE_URL } from '../apiConfig.js';
import {
  formatearPesos,
  formatNumber,
  toIntIfPossible,
  mostrarEnteroSiEsDecimal,
  hideZeroPercentages,
  calcularTotalFinanciado,
  agregarEstiloPorNivel
} from '../utils/shared-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si es una cotización compartida (con ID en URL)
    const urlParams = new URLSearchParams(window.location.search);
    const cotizacionId = urlParams.get('id');
    
    if (cotizacionId) {
        // Redirigir a la página dedicada para cotizaciones compartidas
        window.location.href = `cotizacion-compartida.html?id=${cotizacionId}`;
        return;
    }
    const levelId = JSON.parse(localStorage.getItem('selectedNivel')) || 1;
    // Controlar overlay de loading solo para nivel 13
    const loadingOverlay = document.getElementById('loading-overlay');
    const financiamientoContent = document.getElementById('financiamiento-content');
    if (levelId == 13) {
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (financiamientoContent) financiamientoContent.style.display = 'none';
    } else {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (financiamientoContent) financiamientoContent.style.display = 'block';
    }
    const nombre = urlParams.get('txt-name') || 'N/A';
    const periodo = urlParams.get('select-period') || 'N/A';
    const campus = urlParams.get('select-campus') || 'N/A';
    const nivel = urlParams.get('select-grade') || 'N/A';
    const materias = urlParams.get('select-subjects') || 'N/A';
    const certificados = urlParams.get('select-certificado') || 'N/A';
    const semanas = urlParams.get('select-semanas') || 'N/A';
    const ingles = urlParams.get('select-ingles') || 'N/A';
    const programa = urlParams.get('select-plan') || 'N/A';
    const formato = urlParams.get('select-formato') || '';

    // Guardar siempre los datos clave en localStorage para el flujo de guardado
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('campus', campus);
    localStorage.setItem('programa', programa);

    // CÓDIGO ANTIGUO - COMENTADO PORQUE AHORA SE HACE DINÁMICAMENTE
    // document.getElementById('nombre').textContent = nombre;
    // document.getElementById('periodo').textContent = periodo;
    // document.getElementById('campus').textContent = campus;
    // document.getElementById('nivel').textContent = nivel;
    // document.getElementById('materias').textContent = formatNumber(materias);
    // document.getElementById('certificados').textContent = formatNumber(certificados);
    // document.getElementById('semanas').textContent = formatNumber(semanas);
    // document.getElementById('ingles').textContent = formatNumber(ingles);
    // if(document.getElementById('formato')) {
    //     if (formato && formato !== 'N/A') {
    //         document.getElementById('formato').textContent = formato;
    //         document.getElementById('formato').parentElement.style.display = '';
    //     } else {
    //         document.getElementById('formato').parentElement.style.display = 'none';
    //     }
    // }

    const materiasPorNivel = {
        1: 'Materias',
        2: 'Créditos',
        3: 'Materias',
        5: 'Certificados',
        6: 'Créditos',
        7: 'Materias',
        8: 'Certificados',
        9: 'Certificados',
        10: 'Créditos',
        11: 'Materias',
        12: 'Materias'
    };

    // CÓDIGO ANTIGUO - COMENTADO PORQUE AHORA SE HACE DINÁMICAMENTE
    // if (materiasPorNivel[levelId]) {
    //     document.getElementById('text-materias').textContent = materiasPorNivel[levelId];
    // } 

    // CÓDIGO ANTIGUO - COMENTADO PORQUE AHORA SE HACE DINÁMICAMENTE
    // if (levelId == 4) {
    //     document.getElementById('materias-container').style.display = 'none';
    //     document.getElementById('certificados-container').classList.remove('hidden');
    //     document.getElementById('semanas-container').classList.remove('hidden');
    //     document.getElementById('ingles-container').classList.remove('hidden');
    // }

    // --- AJUSTE PARA NIVEL 13 ---
    if (levelId == 13) {
        // Mostrar overlay de loading y ocultar contenido al inicio
        const loadingOverlay = document.getElementById('loading-overlay');
        const financiamientoContent = document.getElementById('financiamiento-content');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (financiamientoContent) financiamientoContent.style.display = 'none';
        // Ocultar cualquier posible valor residual
        const mensualidadesDiv = document.getElementById('mensualidades');
        const mensualidadesTextElem = document.getElementById('mensualidadesText');
        const primerPagoElem = document.getElementById('primerPago');
        const totalFinanciadoElem = document.getElementById('totalFinanciado');
        if (mensualidadesDiv) mensualidadesDiv.style.display = 'none';
        if (mensualidadesTextElem) mensualidadesTextElem.style.display = 'none';
        if (primerPagoElem) primerPagoElem.style.display = 'none';
        if (totalFinanciadoElem) totalFinanciadoElem.style.display = 'none';
        // Definir codigosBimestres antes de usarla
        let codigosBimestres = [];
        // Obtener períodos seleccionados desde localStorage
        const periodosSeleccionados = JSON.parse(localStorage.getItem('periodosSeleccionados') || '[]');
        
        if (periodosSeleccionados.length > 0) {
            // Mostrar múltiples períodos
            const periodosTexto = periodosSeleccionados.map(p => p.mes).join(', ');
            // CÓDIGO ANTIGUO - COMENTADO PORQUE AHORA SE HACE DINÁMICAMENTE
            // document.getElementById('periodo').textContent = periodosTexto;
            codigosBimestres = periodosSeleccionados.map(p => p.codigo);
        } else {
            // Fallback al comportamiento anterior
            let mesBimestre = periodo;
            const bimestreLocal = localStorage.getItem('bimestreSeleccionado');
            if (bimestreLocal) {
                const bimestreTexto = JSON.parse(bimestreLocal);
                if (bimestreTexto && bimestreTexto !== periodo) {
                    mesBimestre = bimestreTexto;
                }
            }
            // CÓDIGO ANTIGUO - COMENTADO PORQUE AHORA SE HACE DINÁMICAMENTE
            // document.getElementById('periodo').textContent = mesBimestre;
            const codigoBimestre = params.get('select-period') || '';
            if (codigoBimestre) codigosBimestres = [codigoBimestre];
        }
        // CÓDIGO ANTIGUO - COMENTADO PORQUE AHORA SE HACE DINÁMICAMENTE
        // document.getElementById('materias-container').style.display = 'none';
        // document.getElementById('certificados-container').classList.remove('hidden');
        // document.getElementById('semanas-container').classList.remove('hidden');
        // document.getElementById('certificados').textContent = certificados;
        // document.getElementById('semanas').textContent = semanas;

        // OCULTAR EL BLOQUE TRADICIONAL DE PLAN DE FINANCIAMIENTO
        const planFinanciamientoTrad = document.querySelector('.plan-financiamiento-tradicional');
        if (planFinanciamientoTrad) {
            planFinanciamientoTrad.style.display = 'none';
        }
        // Mostrar solo el desglose de pagos bimestrales financiados para nivel 13
        fetch(`${API_BASE_URL}/pagos-bimestrales/nivel/13`)
            .then(res => res.json())
            .then(pagos => {
                // Filtrar pagos para todos los períodos seleccionados
                const pagosBimestres = pagos.filter(p => codigosBimestres.includes(p.codigo));
                if (pagosBimestres.length === 0) {
                    const mensualidadesDiv = document.getElementById('mensualidades');
                    const mensualidadesTextElem = document.getElementById('mensualidadesText');
                    const primerPagoElem = document.getElementById('primerPago');
                    const totalFinanciadoElem = document.getElementById('totalFinanciado');
                    if (mensualidadesDiv) {
                        mensualidadesDiv.innerHTML = '<p style="color: red;">No hay pagos bimestrales para los períodos seleccionados. Por favor, regresa y realiza el cálculo nuevamente.</p>';
                        if (mensualidadesTextElem) mensualidadesTextElem.innerHTML = '';
                        if (primerPagoElem) primerPagoElem.textContent = '';
                        if (totalFinanciadoElem) totalFinanciadoElem.textContent = '';
                    }
                    setTimeout(() => { window.location.href = 'index.html'; }, 3500);
                    return;
                }
                // Agrupar pagos por bimestre (código)
                const pagosPorBimestre = {};
                pagosBimestres.forEach(pago => {
                    if (!pagosPorBimestre[pago.codigo]) {
                        pagosPorBimestre[pago.codigo] = [];
                    }
                    pagosPorBimestre[pago.codigo].push(pago);
                });
                // Ordenar los pagos dentro de cada bimestre por orden de pago
                Object.keys(pagosPorBimestre).forEach(codigo => {
                    pagosPorBimestre[codigo].sort((a, b) => a.pago_orden - b.pago_orden);
                });
                // Ordenar los códigos de bimestre según el orden de selección
                let codigosBimestresOrdenados = codigosBimestres.slice();
                if (periodosSeleccionados.length > 0) {
                    codigosBimestresOrdenados = periodosSeleccionados.map(p => p.codigo);
                }
                // Procesar pagos por bimestre en el orden correcto
                let pagosArray = [];
                let totalPagos = 0;
                let pagoGlobalIndex = 1;
                let totalSeguros = 0;
                try {
                    totalSeguros = parseFloat(JSON.parse(localStorage.getItem('totalCost'))) || 0;
                } catch (e) { totalSeguros = 0; }
                let totalContado = parseFloat(JSON.parse(localStorage.getItem('totalContado')) || 0);
                const cantidadBimestres = codigosBimestresOrdenados.length;
                
                // Array auxiliar para pagos con fecha
                const pagosConFechas = [];
                
                // Obtener el descuento total para aplicarlo proporcionalmente
                const finalAmountRecuperado = JSON.parse(localStorage.getItem('finalAmount')) || 0;
                const costoTotal = parseFloat(localStorage.getItem('costoTotal')) || 0;
                const scholarshipPercentage = parseFloat(JSON.parse(localStorage.getItem('selectedPercentage')) || 0);
                const supportPercentage = parseFloat(JSON.parse(localStorage.getItem('selectedSupportValue')) || 0);
                const supportFix = parseFloat(JSON.parse(localStorage.getItem('selectedSupportFixValue')) || 0);
                const prestamo = parseFloat(JSON.parse(localStorage.getItem('selectedprestamo')) || 0);
                
                // Obtener todos los porcentajes individuales
                codigosBimestresOrdenados.forEach((codigo, bimestreIdx) => {
                    // Obtener el costo total del bimestre específico desde localStorage
                    const costoBimestreKey = `totalContado_${codigo}`;
                    let costoBimestre = parseFloat(JSON.parse(localStorage.getItem(costoBimestreKey)) || 0);
                    
                    // Si no hay costo específico del bimestre, usar el total dividido
                    if (costoBimestre === 0) {
                        costoBimestre = cantidadBimestres > 0 ? totalContado / cantidadBimestres : 0;
                    }
                    
                    // Calcular descuento por bimestre según la fórmula del Excel
                    // Fórmula: (costoBimestre × porcentajeBeca) + (costoBimestre × porcentajeApoyo) + (costoBimestre × porcentajePrestamo) + (apoyoFijo / cantidadBimestres)
                    // O simplificado: costoBimestre × (sumaPorcentajes) + (apoyoFijo / cantidadBimestres)
                    // PENDIENTE-FASE3 (auditoría 2026-06-09): riesgo de doble descuento en nivel 13
            // (selectedPercentage ya pudo aplicarse en finalAmount). Validar con caso real del cliente.
            const descuentoBeca = costoBimestre * (scholarshipPercentage / 100);
                    const descuentoApoyo = costoBimestre * (supportPercentage / 100);
                    const descuentoPrestamo = costoBimestre * (prestamo / 100);
                    const apoyoFijoPorBimestre = cantidadBimestres > 0 ? supportFix / cantidadBimestres : 0;
                    
                    const descuentoBimestreCalculado = descuentoBeca + descuentoApoyo + descuentoPrestamo + apoyoFijoPorBimestre;
                    
                    // APLICAR DESCUENTO AL COSTO DEL BIMESTRE (usando el método del Excel)
                    const costoBimestreConDescuento = Math.max(0, costoBimestre - descuentoBimestreCalculado);
                    
                    const pagosBimestre = pagosPorBimestre[codigo] || [];
                    
                    pagosBimestre.forEach((pago, idx) => {
                        const porcentaje = parseFloat(pago.porcentaje_parcialidad) / 100;
                        let parcialidad = costoBimestreConDescuento * porcentaje;
                        let interes = 0;
                        let totalParcialidad = parcialidad;
                        
                        // Aplicar interés solo al primer pago del bimestre (idx === 0)
                        if (idx === 0 && parseFloat(pago.porcentaje_interes) > 0) {
                            // El interés se calcula sobre el costo total del bimestre CON DESCUENTO
                            interes = costoBimestreConDescuento * (parseFloat(pago.porcentaje_interes) / 100);
                            totalParcialidad += interes;
                        }
                        
                        // Agregar seguros completos al primer pago de cada bimestre (idx === 0)
                        if (idx === 0 && totalSeguros > 0) {
                            totalParcialidad += totalSeguros;
                        }
                        
                        // Asignar la fecha correcta a cada pago
                        if (pago.fecha_vencimiento) {
                            const fecha = new Date(pago.fecha_vencimiento);
                            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                            pagosConFechas.push({ fecha: fechaFormateada, valor: totalParcialidad });
                        } else {
                            pagosConFechas.push({ fecha: `Pago ${pago.pago_orden}`, valor: totalParcialidad });
                        }
                        totalPagos += totalParcialidad;
                    });
                });
                
                // Agrupar pagos por fecha
                const pagosAgrupados = {};
                pagosConFechas.forEach(pago => {
                    if (!pagosAgrupados[pago.fecha]) {
                        pagosAgrupados[pago.fecha] = 0;
                    }
                    pagosAgrupados[pago.fecha] += pago.valor;
                });
                // Para nivel 13: cambiar "Primer pago" por la primera fecha y mostrar fechas restantes
                const primerPagoElem = document.getElementById('primerPago');
                
                // Obtener las fechas ordenadas cronológicamente
                const fechasOrdenadas = Object.keys(pagosAgrupados).sort((a, b) => {
                    // Convertir fechas de formato DD/MM/YYYY a objetos Date para comparación
                    const fechaA = new Date(a.split('/').reverse().join('-'));
                    const fechaB = new Date(b.split('/').reverse().join('-'));
                    return fechaA - fechaB;
                });
                const primeraFecha = fechasOrdenadas[0];
                const fechasRestantes = fechasOrdenadas.slice(1);

                // La colegiatura de la tabla itemizada vence en la primera
                // fecha del plan de financiamiento
                const fechaColegiaturaElem = document.getElementById('fecha-colegiatura');
                if (fechaColegiaturaElem && primeraFecha) {
                    fechaColegiaturaElem.textContent = primeraFecha;
                }

                // Cambiar el texto "Primer pago" por la primera fecha
                // Buscar el elemento que contiene "Primer pago" en la misma fila que primerPagoElem
                if (primerPagoElem) {
                    const primerPagoRow = primerPagoElem.closest('tr');
                    if (primerPagoRow) {
                        const primerPagoLabel = primerPagoRow.querySelector('td:first-child p');
                        if (primerPagoLabel && primerPagoLabel.textContent.includes('Primer pago')) {
                            primerPagoLabel.textContent = primeraFecha;
                        }
                    }
                }
                
                // Mostrar el valor del primer pago
                if (primerPagoElem && pagosConFechas.length > 0) {
                    primerPagoElem.textContent = formatearPesos(pagosConFechas[0].valor || 0);
                }
                
                // Mostrar solo las fechas restantes en mensualidades
                let pagosTextHtml = '';
                let pagosValorHtml = '';
                fechasRestantes.forEach(fecha => {
                    pagosTextHtml += `<span>${fecha}</span><br>`;
                    pagosValorHtml += `<b>${formatearPesos(pagosAgrupados[fecha])}</b><br>`;
                });
                const mensualidadesTextElem = document.getElementById('mensualidadesText');
                const mensualidadesValorElem = document.getElementById('mensualidades');
                if (mensualidadesTextElem) mensualidadesTextElem.innerHTML = pagosTextHtml;
                if (mensualidadesValorElem) mensualidadesValorElem.innerHTML = pagosValorHtml;
                
                // Guardar totalPagos en localStorage después de calcular todos los pagos (fuera de los ciclos)
                localStorage.setItem('totalPagos', JSON.stringify(totalPagos));
                const totalFinanciadoElem = document.getElementById('totalFinanciado');
                if (totalFinanciadoElem) {
                    totalFinanciadoElem.textContent = formatearPesos(totalPagos);
                }
                // Al terminar de procesar y mostrar los pagos:
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                if (financiamientoContent) financiamientoContent.style.display = 'block';
                if (mensualidadesDiv) mensualidadesDiv.style.display = '';
                if (mensualidadesTextElem) mensualidadesTextElem.style.display = '';
                if (primerPagoElem) primerPagoElem.style.display = '';
                if (totalFinanciadoElem) totalFinanciadoElem.style.display = '';
                // Mostrar el total contado explícitamente para nivel 13
                const totalContadoElem = document.getElementById('colegiatura');
                if (totalContadoElem) {
                    const totalContadoRecuperado = JSON.parse(localStorage.getItem('totalContado'));
                    const finalAmountRecuperado = JSON.parse(localStorage.getItem('finalAmount'));
                    const costoTotalRecuperado = JSON.parse(localStorage.getItem('costoTotal'));
                    
                    let totalContadoFinal = totalContadoRecuperado;
                    if (finalAmountRecuperado === 0 || finalAmountRecuperado === null || finalAmountRecuperado === undefined) {
                        totalContadoFinal = costoTotalRecuperado;
                    }
                    
                    if (totalContadoFinal !== undefined && totalContadoFinal !== null) {
                        totalContadoElem.textContent = formatearPesos(totalContadoFinal);
                    }
                }
            });
    }

    // Llamar a la función para organizar campos dinámicamente
    let periodoFinal = periodo;
    
    // Para nivel 13, usar el período procesado
    if (levelId === 13) {
        const periodosSeleccionados = JSON.parse(localStorage.getItem('periodosSeleccionados') || '[]');
        if (periodosSeleccionados.length > 0) {
            periodoFinal = periodosSeleccionados.map(p => p.mes).join(', ');
        } else {
            const bimestreLocal = localStorage.getItem('bimestreSeleccionado');
            if (bimestreLocal) {
                const bimestreTexto = JSON.parse(bimestreLocal);
                if (bimestreTexto && bimestreTexto !== periodo) {
                    periodoFinal = bimestreTexto;
                }
            }
        }
    }
    
    // Calcular suma total de certificados y semanas para nivel 13
    let certificadosTotal = certificados;
    let semanasTotal = semanas;
    
    if (levelId === 13) {
        const configuracionesPorPeriodo = JSON.parse(localStorage.getItem('configuracionesPorPeriodo')) || {};
        certificadosTotal = 0;
        semanasTotal = 0;
        
        // Sumar certificados y semanas de todos los períodos seleccionados
        Object.values(configuracionesPorPeriodo).forEach(config => {
            certificadosTotal += parseInt(config.certificados) || 0;
            semanasTotal += parseInt(config.semanas) || 0;
        });
    }
    
    const datosBasicos = {
        nombre: nombre,
        periodo: periodoFinal,
        campus: campus,
        nivel: nivel,
        materias: materias,
        certificados: certificadosTotal,
        semanas: semanasTotal,
        ingles: ingles,
        programa: programa,
        formato: formato
    };
    
    organizarCamposPorNivel(levelId, datosBasicos);

    let segurosData = [];
    const viveDiv = document.getElementById('div-vive');
    const seguros = document.getElementById('seguros');

    async function fetchSeguros() {
        try {
            const response = await fetch(`${API_BASE_URL}/seguros/nivel/${levelId}`);
            if (!response.ok) throw new Error('Error al obtener los seguros');
            const segurosDataArray = await response.json(); // Recibimos un array

            if (Array.isArray(segurosDataArray) && segurosDataArray.length > 0) {
                segurosData = segurosDataArray;
            }

            // Lógica especial para VIVE: ocultar en niveles 6-13
            if (levelId >= 6 && levelId <= 13) {
                if (viveDiv) viveDiv.style.display = 'none';
            } else {
                if (viveDiv) viveDiv.style.display = 'flex';
            }
            
            // Verificar si hay algún seguro seleccionado
            const segurosSeleccionados = JSON.parse(localStorage.getItem('segurosSeleccionados') || '{}');
            const tieneSegurosSeleccionados = Object.values(segurosSeleccionados).some(s => s.valor === 'si');
            
            if (!tieneSegurosSeleccionados && seguros) {
                seguros.style.display = 'none';
            } else if (seguros) {
                seguros.style.display = '';
            }

        } catch (error) {
            console.error('Error al cargar los seguros:', error.message);
        }
    }

    await fetchSeguros();

    function recuperarValores() {
        const segurosSeleccionados = JSON.parse(localStorage.getItem('segurosSeleccionados') || '{}');
        const valores = {};

        // Crear un mapa de seguros por nombre para compatibilidad
        segurosData.forEach(seguro => {
            const seleccionado = segurosSeleccionados[seguro.id_seguro];
            if (seleccionado && seleccionado.valor === 'si') {
                // Usar el nombre del seguro como clave (normalizado)
                const nombreKey = seguro.nombre_seguro.toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '');
                valores[nombreKey] = formatearPesos(seguro.valor);
            }
        });

        // Mantener compatibilidad con código antiguo (si existe)
        const insuranceValue = segurosSeleccionados[Object.keys(segurosSeleccionados).find(k => {
            const s = segurosData.find(seg => seg.id_seguro == k);
            return s && s.nombre_seguro && s.nombre_seguro.toLowerCase().includes('accidente');
        })];
        const coverageValue = segurosSeleccionados[Object.keys(segurosSeleccionados).find(k => {
            const s = segurosData.find(seg => seg.id_seguro == k);
            return s && s.nombre_seguro && (s.nombre_seguro.toLowerCase().includes('estudiantil') || s.nombre_seguro.toLowerCase().includes('colegiatura'));
        })];
        const viveValue = segurosSeleccionados[Object.keys(segurosSeleccionados).find(k => {
            const s = segurosData.find(seg => seg.id_seguro == k);
            return s && s.nombre_seguro && s.nombre_seguro.toLowerCase().includes('vive');
        })];

        return {
            insurance: insuranceValue && insuranceValue.valor === 'si' 
                ? formatearPesos(segurosData.find(s => s.id_seguro == Object.keys(segurosSeleccionados).find(k => {
                    const seg = segurosData.find(seg => seg.id_seguro == k);
                    return seg && seg.nombre_seguro && seg.nombre_seguro.toLowerCase().includes('accidente');
                }))?.valor || 0) 
                : 'No Aplica',
            coverage: coverageValue && coverageValue.valor === 'si' 
                ? formatearPesos(segurosData.find(s => s.id_seguro == Object.keys(segurosSeleccionados).find(k => {
                    const seg = segurosData.find(seg => seg.id_seguro == k);
                    return seg && seg.nombre_seguro && (seg.nombre_seguro.toLowerCase().includes('estudiantil') || seg.nombre_seguro.toLowerCase().includes('colegiatura'));
                }))?.valor || 0) 
                : 'No Aplica',
            vive: viveValue && viveValue.valor === 'si' 
                ? formatearPesos(segurosData.find(s => s.id_seguro == Object.keys(segurosSeleccionados).find(k => {
                    const seg = segurosData.find(seg => seg.id_seguro == k);
                    return seg && seg.nombre_seguro && seg.nombre_seguro.toLowerCase().includes('vive');
                }))?.valor || 0) 
                : 'No Aplica',
            // Agregar objeto con todos los seguros para uso futuro
            todos: valores
        };
    }

    function recuperarValoresAdicionales() {
        const costoTotalRecuperado = JSON.parse(localStorage.getItem('costoTotal'));
        const finalAmountRecuperado = JSON.parse(localStorage.getItem('finalAmount'));
        const totalContadoRecuperado = JSON.parse(localStorage.getItem('totalContado'));
        const interesDivididoRecuperado = JSON.parse(localStorage.getItem('interesDividido'));
        const primeraCuotaRecuperada = JSON.parse(localStorage.getItem('primeraCuota'));

        const selectedScholarshipNameRecuperado = JSON.parse(localStorage.getItem('selectedScholarshipName'));
        const selectedScholarshipValueRecuperado = JSON.parse(localStorage.getItem('selectedScholarshipValue'));
        const selectedSupportValueRecuperado = JSON.parse(localStorage.getItem('selectedSupportValue'));
        const selectedSupportValueFijoRecuperado = JSON.parse(localStorage.getItem('selectedSupportFixValue'));
        const prestamoRecuperado = JSON.parse(localStorage.getItem('selectedprestamo'));
        const totalCostRecuperado = JSON.parse(localStorage.getItem('totalCost'));

        let retrievedPercentage = localStorage.getItem('selectedPercentage');

        if (retrievedPercentage) {
            try {
                retrievedPercentage = JSON.parse(retrievedPercentage);
            } catch (error) {
                console.error('Error al parsear retrievedPercentage:', error);
                retrievedPercentage = null;
            }
        } else {
            retrievedPercentage = null;
        }
        
        // Asegurar que totalContado sea correcto cuando no hay descuento
        let totalContadoFinal = totalContadoRecuperado;
        if (finalAmountRecuperado === 0 || finalAmountRecuperado === null || finalAmountRecuperado === undefined) {
            totalContadoFinal = costoTotalRecuperado;
        }
        
        // SUMAR SEGUROS AL TOTAL CONTADO
        const totalSeguros = parseFloat(totalCostRecuperado) || 0;
        totalContadoFinal += totalSeguros;
        
        return {
            costoTotal: formatearPesos(costoTotalRecuperado),
            finalAmount: formatearPesos(finalAmountRecuperado),
            totalContado: formatearPesos(totalContadoFinal),
            interesDividido: formatearPesos(interesDivididoRecuperado),
            primeraCuota: formatearPesos(primeraCuotaRecuperada),
            totalCost: totalCostRecuperado, // <-- solo el valor de seguros
            scholarshipName: selectedScholarshipNameRecuperado,
            scholarshipValue: selectedScholarshipValueRecuperado,
            supportValue: selectedSupportValueRecuperado,
            supportValueFix: formatearPesos(parseInt(selectedSupportValueFijoRecuperado)),
            prestamoRecuperado: prestamoRecuperado,
            retrievedPercentage: retrievedPercentage
        };
    }

    // Refuerzo: para nivel 13, bloquear sobrescritura de totalContado en el DOM
    const originalMostrarValores = mostrarValores;
    mostrarValores = function(valores) {
        // Verificar si los datos vienen del backend
        const datosDesdeBackend = localStorage.getItem('datosDesdeBackend') === 'true';
        
        if (levelId == 13) {
            
            // No actualizar totalContado en el DOM para nivel 13
            originalMostrarValores({ ...valores, skipTotalContado: true });
            // Refuerzo: mostrar el valor de localStorage en el DOM (incluyendo seguros)
            const totalContadoElem = document.getElementById('totalContado');
            const totalContadoRecuperado = JSON.parse(localStorage.getItem('totalContado'));
            const totalCostRecuperado = JSON.parse(localStorage.getItem('totalCost')); // Seguros
            
            if (totalContadoElem && totalContadoRecuperado !== undefined && totalContadoRecuperado !== null) {
                // SUMAR SEGUROS AL TOTAL CONTADO (igual que en recuperarValoresAdicionales)
                const totalSeguros = parseFloat(totalCostRecuperado) || 0;
                const totalContadoConSeguros = totalContadoRecuperado + totalSeguros;
                totalContadoElem.textContent = formatearPesos(totalContadoConSeguros);
            }
        } else {
            originalMostrarValores(valores);
        }
        
        // Si los datos vienen del backend, limpiar la marca para futuras actualizaciones
        if (datosDesdeBackend) {
            localStorage.removeItem('datosDesdeBackend');
        }
    };

    // FUNCIÓN PRINCIPAL CENTRALIZADA PARA MOSTRAR VALORES
    function mostrarValores(valores) {

        // DETERMINAR QUÉ FUNCIÓN USAR SEGÚN EL NIVEL
        if (levelId === 13) {
            mostrarValoresNivel13(valores);
        } else {
            mostrarValoresOtrosNiveles(valores);
        }
    }

    // FUNCIÓN ESPECÍFICA PARA NIVEL 13
    function mostrarValoresNivel13(valores) {
        
        // Verificar si hay cualquier tipo de descuento: beca, apoyo estudiantil, o finalAmount
        const finalAmountRecuperado = JSON.parse(localStorage.getItem('finalAmount'));
        const becaRecuperada = JSON.parse(localStorage.getItem('selectedScholarshipValue')) || 0;
        const apoyoEstudiantilRecuperado = JSON.parse(localStorage.getItem('selectedSupportValue')) || 0;
        const apoyoFijoRecuperado = JSON.parse(localStorage.getItem('selectedSupportFixValue')) || 0;
        
        const hayBeca = becaRecuperada > 0;
        const hayApoyoEstudiantil = apoyoEstudiantilRecuperado > 0;
        const hayApoyoFijo = apoyoFijoRecuperado > 0;
        const hayFinalAmount = finalAmountRecuperado && finalAmountRecuperado > 0;
        
        const hayDescuento = hayBeca || hayApoyoEstudiantil || hayApoyoFijo || hayFinalAmount;
        
        // 1. La fila Colegiatura de la hoja se muestra siempre (mockup): con
        // descuento es el costo sin ajustar; sin descuento coincide con el total.
        if (colegiatura) {
            const costoTotalRecuperado = JSON.parse(localStorage.getItem('costoTotal'));
            colegiatura.textContent = formatearPesos(costoTotalRecuperado);
            colegiatura.closest('tr').style.display = '';

            // REFUERZO: Asegurar que el valor se mantenga después de cualquier sobrescritura
            setTimeout(() => {
                const valorActual = colegiatura.textContent;
                const valorEsperado = formatearPesos(costoTotalRecuperado);
                if (valorActual !== valorEsperado) {
                    colegiatura.textContent = valorEsperado;
                }
            }, 10);
        }
        
        // 2. Mostrar/ocultar apoyo financiamiento según si hay descuento (aplica para todos los niveles)
        if (apoyoFinanciamiento) {
            // Calcular el descuento total como la diferencia entre costoTotal y totalContado
            const costoTotalRecuperado = JSON.parse(localStorage.getItem('costoTotal')) || 0;
            const totalContadoRecuperado = JSON.parse(localStorage.getItem('totalContado')) || 0;
            const descuentoTotal = costoTotalRecuperado - totalContadoRecuperado;
            
            const esCero = descuentoTotal <= 0 || Math.abs(descuentoTotal) < 0.000001;
            let tr = apoyoFinanciamiento.closest('tr');
            if (!tr && apoyoFinanciamiento.parentElement && apoyoFinanciamiento.parentElement.parentElement && apoyoFinanciamiento.parentElement.parentElement.tagName === 'TR') {
                tr = apoyoFinanciamiento.parentElement.parentElement;
            }
            if (!esCero) {
                apoyoFinanciamiento.textContent = `-${formatearPesos(descuentoTotal)}`;
                if (tr) {
                    tr.style.display = '';
                }
            } else {
                if (tr) {
                    tr.style.display = 'none';
                }
            }
        }
        
        // 3. Mostrar total contado con el valor correcto del localStorage
        const totalContadoElem = document.getElementById('totalContado');

        if (totalContadoElem) {
            // Usar valores.totalContado que ya incluye seguros (igual que en mostrarValoresOtrosNiveles)
            totalContadoElem.textContent = valores.totalContado;
            
            // 4. Cambiar el texto del label según si hay descuento
            const totalContadoText = document.getElementById('totalContadoText');
            const colegiaturaText = document.getElementById('colegiaturaText');
            
            if (totalContadoText) {
                if (!hayDescuento) {
                    // Mantener el formato de la hoja de colegiatura.
                    totalContadoText.textContent = 'Colegiatura total';
                } else {
                    totalContadoText.textContent = 'Colegiatura total';
                }
                
                // Forzar actualización visual
                totalContadoText.style.display = 'none';
                setTimeout(() => {
                    totalContadoText.style.display = '';
                }, 10);
            }
        }
        
        // 5. Ocultar línea separadora cuando no hay descuento
        const lineaSeparadora = document.querySelector('tr td[colspan="2"] hr');
        if (lineaSeparadora) {
            const trSeparadora = lineaSeparadora.closest('tr');
            if (trSeparadora) {
                if (!hayDescuento) {
                    trSeparadora.style.display = 'none';
                } else {
                    trSeparadora.style.display = '';
                }
            }
        }

        //6. Mostrar apoyos y seguros
        mostrarApoyosYSeguros(valores);
    }

    // FUNCIÓN PARA OTROS NIVELES (1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12)
    function mostrarValoresOtrosNiveles(valores) {

        // Calcular factor multiplicador según el nivel
        let factorMultiplicador = 3;
        let textoMensualidades = '3 mensualidades posteriores';
        
        if (levelId === 1 || levelId === 2 || levelId === 4) {
            factorMultiplicador = 4;
            textoMensualidades = '4 mensualidades posteriores';
        } else if (levelId === 10) {
            factorMultiplicador = 2;
            textoMensualidades = '2 mensualidades posteriores';
        }

        const totalfinanciado = calcularTotalFinanciado(valores, levelId);

        // Verificar si hay cualquier tipo de descuento: beca, apoyo estudiantil, o finalAmount
        const finalAmountRecuperado = JSON.parse(localStorage.getItem('finalAmount'));
        const becaRecuperada = JSON.parse(localStorage.getItem('selectedScholarshipValue')) || 0;
        const apoyoEstudiantilRecuperado = JSON.parse(localStorage.getItem('selectedSupportValue')) || 0;
        const apoyoFijoRecuperado = JSON.parse(localStorage.getItem('selectedSupportFixValue')) || 0;
        
        const hayBeca = becaRecuperada > 0;
        const hayApoyoEstudiantil = apoyoEstudiantilRecuperado > 0;
        const hayApoyoFijo = apoyoFijoRecuperado > 0;
        const hayFinalAmount = finalAmountRecuperado && finalAmountRecuperado > 0;
        
        const hayDescuento = hayBeca || hayApoyoEstudiantil || hayApoyoFijo || hayFinalAmount;

        // Mostrar todos los campos para otros niveles
        if (colegiatura) {
            if (hayDescuento) {
                colegiatura.textContent = valores.costoTotal;
                colegiatura.closest('tr').style.display = '';
            } else {
                colegiatura.closest('tr').style.display = 'none';
            }
        } 
        if (apoyoFinanciamiento) {
            // Calcular el descuento total como la diferencia entre costoTotal y totalContado
            const costoTotalRecuperado = JSON.parse(localStorage.getItem('costoTotal')) || 0;
            const totalContadoRecuperado = JSON.parse(localStorage.getItem('totalContado')) || 0;
            const descuentoTotal = costoTotalRecuperado - totalContadoRecuperado;
            
            const esCero = descuentoTotal <= 0 || Math.abs(descuentoTotal) < 0.000001;
            let tr = apoyoFinanciamiento.closest('tr');
            if (!tr && apoyoFinanciamiento.parentElement && apoyoFinanciamiento.parentElement.parentElement && apoyoFinanciamiento.parentElement.parentElement.tagName === 'TR') {
                tr = apoyoFinanciamiento.parentElement.parentElement;
            }
            if (!esCero) {
                apoyoFinanciamiento.textContent = `-${formatearPesos(descuentoTotal)}`;
                if (tr) {
                    tr.style.display = '';
                }
            } else {
                if (tr) {
                    tr.style.display = 'none';
                }
            }
        }
        if (totalContado) {
            totalContado.textContent = valores.totalContado;
            
            // Cambiar el texto del label según si hay descuento
            const totalContadoText = document.getElementById('totalContadoText');
            if (totalContadoText) {
                if (!hayDescuento) {
                    // Mantener el formato de la hoja de colegiatura.
                    totalContadoText.textContent = 'Colegiatura total';
                } else {
                    totalContadoText.textContent = 'Colegiatura total';
                }
            }
        }
        if (primerPago) {
            primerPago.textContent = valores.primeraCuota;
        }
        if (mensualidades) {
            mensualidades.textContent = valores.interesDividido;
        }
        if (totalFinanciado) {
            totalFinanciado.textContent = formatearPesos(totalfinanciado);
        }
        if (mensualidadesText) {
            mensualidadesText.textContent = textoMensualidades;
        }
        
        // Ocultar línea separadora cuando no hay descuento
        const lineaSeparadora = document.querySelector('tr td[colspan="2"] hr');
        if (lineaSeparadora) {
            const trSeparadora = lineaSeparadora.closest('tr');
            if (trSeparadora) {
                if (!hayDescuento) {
                    trSeparadora.style.display = 'none';
                } else {
                    trSeparadora.style.display = '';
                }
            }
        }
        
        // Mostrar apoyos y seguros
        mostrarApoyosYSeguros(valores);
    }

    // FUNCIÓN AUXILIAR PARA APOYOS Y SEGUROS (común para todos los niveles)
    function mostrarApoyosYSeguros(valores) {
        if (apoyoFinanciero && valores.scholarshipName) {
            apoyoFinanciero.textContent = valores.scholarshipName;
        }
        if (apoyoFinanciero && (apoyoFinanciero.textContent === 'Elige' || apoyoFinanciero.textContent === 'null')) {
            apoyoFinanciero.textContent = `Apoyo estudiantil`;
        }
        
        // Mostrar seguros dinámicamente
        mostrarSegurosDinamicos();
        
        if (apoyoEstudiantil) {
            apoyoEstudiantil.textContent = `${valores.supportValue}%`;
        }
        if (apoyoEstudiantilFijo) {
            apoyoEstudiantilFijo.textContent = valores.supportValueFix;
        }
        if (prestamoPorcentaje) {
            prestamoPorcentaje.textContent = `${valores.prestamoRecuperado}%`;
        }
        if (beca) {
            beca.textContent =
                valores.scholarshipValue > 0 ? `${valores.scholarshipValue}%` :
                    valores.retrievedPercentage > 0 ? `${valores.retrievedPercentage}%` :
                        "0%";
        }

        // Limpiar valores nulos o inválidos
        if (apoyoEstudiantil && (apoyoEstudiantil.textContent.includes("null") || apoyoEstudiantil.textContent === "0")) {
            apoyoEstudiantil.textContent = `0%`;
        }
        if (apoyoEstudiantilFijo && (apoyoEstudiantilFijo.textContent.includes("null") || apoyoEstudiantilFijo.textContent === "$0.00" || apoyoEstudiantilFijo.textContent === "$NaN")) {
            apoyoEstudiantilFijo.textContent = `0`;
        }
        if (prestamoPorcentaje && (prestamoPorcentaje.textContent.includes("null") || prestamoPorcentaje.textContent === "0")) {
            prestamoPorcentaje.textContent = `0%`;
        }

        hideZeroPercentages();
    }

    // Función para mostrar seguros dinámicamente en resultados
    function mostrarSegurosDinamicos() {
        const segurosContainer = document.getElementById('seguros-dinamicos-resultados');
        if (!segurosContainer) {
            console.warn('No se encontró el contenedor de seguros dinámicos');
            return;
        }

        const segurosSeleccionados = JSON.parse(localStorage.getItem('segurosSeleccionados') || '{}');
        
        // Limpiar contenedor
        segurosContainer.innerHTML = '';

        // Verificar que segurosData esté disponible
        if (!segurosData || segurosData.length === 0) {
            console.warn('No hay datos de seguros disponibles');
            const segurosSection = document.getElementById('seguros');
            if (segurosSection) {
                segurosSection.style.display = 'none';
            }
            return;
        }

        // Obtener todos los seguros seleccionados con valor "si"
        const segurosConValor = [];
        segurosData.forEach(seguro => {
            const seleccionado = segurosSeleccionados[seguro.id_seguro];
            if (seleccionado && seleccionado.valor === 'si' && seguro.valor > 0) {
                segurosConValor.push({
                    nombre: seguro.nombre_seguro,
                    valor: parseFloat(seguro.valor) || 0
                });
            }
        });

        // Si no hay seguros seleccionados, ocultar la sección completa
        if (segurosConValor.length === 0) {
            const segurosSection = document.getElementById('seguros');
            if (segurosSection) {
                segurosSection.style.display = 'none';
            }
            return;
        }

        // Mostrar la sección de seguros
        const segurosSection = document.getElementById('seguros');
        if (segurosSection) {
            segurosSection.style.display = '';
        }

        // Generar HTML para cada seguro seleccionado
        segurosConValor.forEach(seguro => {
            const div = document.createElement('div');
            div.className = 'flex flex-row justify-between subtable-padding';
            div.innerHTML = `
                <p class="text-[16px] lg:text-[22px] leading-[24px] lg:leading-[30px] mb-0 desc-left">
                    ${seguro.nombre}
                </p>
                <p class="text-[16px] lg:text-[22px] leading-[24px] lg:leading-[30px] mb-0 font-bold text-right">
                    ${formatearPesos(seguro.valor)}
                </p>
            `;
            segurosContainer.appendChild(div);
        });
    }

    function hideZeroPercentages() {
        const elementBeca = document.getElementById('beca');
        const elementLabelBeca = document.getElementById('label-beca');

        const elementApoyo = document.getElementById('apoyoEstudiantil');
        const elementLabelApoyo = document.getElementById('label-apoyoEstudiantil');

        const elementApoyoFijo = document.getElementById('apoyoEstudiantilFijo');
        const elementLabelApoyoFijo = document.getElementById('label-apoyoEstudiantilFijo');

        const elementPrestamo = document.getElementById('prestamoPorcentaje');
        const elementLabelPrestamo = document.getElementById('label-prestamo');

        const apoyos = document.getElementById('apoyos');

        if (elementBeca.innerText === '0%') {
            elementBeca.classList.add('hidden');
            elementLabelBeca.classList.add('hidden');
        }

        if (elementApoyo.innerText === '0%') {
            elementApoyo.classList.add('hidden');
            elementLabelApoyo.classList.add('hidden');
        }

        if (elementApoyoFijo.innerText === '0') {
            elementApoyoFijo.classList.add('hidden');
            elementLabelApoyoFijo.classList.add('hidden');
        }

        if (elementPrestamo.innerText === '0%') {
            elementPrestamo.classList.add('hidden');
            elementLabelPrestamo.classList.add('hidden');
        }

        if (elementBeca.innerText === '0%' && elementApoyo.innerText === '0%' && elementPrestamo.innerText === '0%' && elementApoyoFijo.innerText === '0') {
            apoyos.style.display = 'none';
        }

        const plan = document.getElementById('plan');

        if (getComputedStyle(apoyos).display === 'none' && getComputedStyle(seguros).display === 'none') {
            plan.style.display = 'none';
        } else {
            plan.style.display = 'flex';
        }
    }

    // ELIMINAR FUNCIÓN REDUNDANTE actualizarPlanContado - YA NO SE NECESITA
    // function actualizarPlanContado(valores) { ... }

    const valores = recuperarValores();
    const valoresAdicionales = recuperarValoresAdicionales();

    // USAR LA FUNCIÓN PRINCIPAL CENTRALIZADA PARA TODOS LOS NIVELES
    // Esta función automáticamente determina si es nivel 13no y usa la lógica apropiada
    mostrarValores({ ...valores, ...valoresAdicionales });

    const tituloPorNivel = {
        1: 'Impulsa tu futuro desde hoy',
        3: 'Avanza con determinación hacia tu futuro profesional',
        2: 'Encuentra una carrera pensada para ti',
        4: 'Encuentra una carrera diseñada para ti',
        5: 'Logra más con una carrera diseñada para tu desarrollo como profesionista',
        6: 'Encuentra una carrera ejecutiva diseñada a tu medida',
        7: 'Invierte en una educación para crecer como persona y como profesionista',
        8: 'Invierte en una educación para crecer como persona y como profesionista',
        9: 'Crece como líder para transformar a tu equipo y tu entorno',
        10: 'Invierte en una educación para crecer como persona y como profesionista',
        11: 'Crece como líder para transformar a tu equipo y tu entorno',
        12: 'Invierte en una educación para crecer como persona y como profesionista',
        13: 'Encuentra una carrera ejecutiva diseñada a tu medida',
    };
    let beneficiosPorNivel = {};
    async function obtenerBeneficios(nivel) {
        const url = `${API_BASE_URL}/beneficios/nivel/${nivel}`;
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            beneficiosPorNivel = data;
            return data;
        } catch (error) {
            console.error('Hubo un problema con la solicitud fetch:', error);
            return [];
        }
    }
    await obtenerBeneficios(levelId);
    function actualizarBeneficios(nivel) {
        const benefitsWrapper = document.getElementById('benefits-wrappers');
        benefitsWrapper.innerHTML = ''; // Limpiar el contenedor de beneficios
        const titleBenefit = document.getElementById('titleBenefit');
        titleBenefit.innerText = tituloPorNivel[nivel] || 'N/A';
        // Mantener las clases originales y solo agregar el margen si no existe
        if (!titleBenefit.classList.contains('mb-8')) {
            titleBenefit.classList.add('mb-8');
        }
        const beneficios = beneficiosPorNivel || [];
        beneficios.forEach((beneficio, index) => {
            const benefitItem = document.createElement('div');
            benefitItem.className = "px-4 w-full md:w-1/2 xl:w-1/4 relative mt-24 benefit-card-elem";
            benefitItem.innerHTML = `
                <div class="border-2 border-solid border-secondary-color-2 rounded-[6px] relative px-[20px] py-[30px] h-full benefits-item">
                    <div class="bg-secondary-color-2 w-[96px] h-[96px] inline-block mx-auto absolute rounded-full -top-[75px] left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <img class="w-[45px] h-[45px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            src="${beneficio.icono}">
                    </div>
                    <p class="font-bold text-[18px] leading-[26px]">${beneficio.nombre}</p>
                    <p class="text-[16px] leading-[24px]">${beneficio.descripcion}</p>
                </div>
            `;
            benefitsWrapper.appendChild(benefitItem);
        });

        if (beneficios.length === 5) {
            benefitsWrapper.classList.add('benefits-3-2');
        } else {
            benefitsWrapper.classList.remove('benefits-3-2');
        }
    }

    actualizarBeneficios(levelId);

    const styleMap = {
        2: 'css/style-universidad.css',
        4: 'css/style-universidad.css',
        5: 'css/style-profesional-asociado.css',
        6: 'css/style-universidad.css',
        7: 'css/style-universidad.css',
        8: 'css/style-universidad.css',
        9: 'css/style-icbi.css',
        10: 'css/style-universidad.css',
        11: 'css/style-icbi.css',
        12: 'css/style-universidad.css',
        13: 'css/style-universidad.css',
        // 2: `{{ get_asset_url('/calculadora-ago24/assets/css/style-universidad.css') }}`,
        // 4: `{{ get_asset_url('/calculadora-ago24/assets/css/style-universidad.css') }}`,
        // 5: `{{ get_asset_url('/calculadora-ago24/assets/css/style-profesional-asociado.css') }}`,
        // 6: `{{ get_asset_url('/calculadora-ago24/assets/css/style-universidad.css') }}`,
        // 7: `{{ get_asset_url('/calculadora-ago24/assets/css/style-universidad.css') }}`,
        // 8: `{{ get_asset_url('/calculadora-ago24/assets/css/style-universidad.css') }}`,
        // 9: `{{ get_asset_url('/calculadora-ago24/assets/css/style-icbi.css') }}`,
        // 10: `{{ get_asset_url('/calculadora-ago24/assets/css/style-icbi.css') }}`,
        // 11: `{{ get_asset_url('/calculadora-ago24/assets/css/style-icbi.css') }}`,
        // 12: `{{ get_asset_url('/calculadora-ago24/assets/css/style-universidad.css') }}`,
        // 13: `{{ get_asset_url('/calculadora-ago24/assets/css/style-universidad.css') }}`,
    };

    function agregarEstiloPorNivel() {
        if (styleMap[levelId]) {
            const estiloHref = styleMap[levelId];

            if (!document.querySelector('link[href="' + estiloHref + '"]')) {
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = estiloHref;
                document.head.appendChild(linkElement);
            }
        }
    }
    agregarEstiloPorNivel();
    document.querySelector('body').style.display = "block";
    
    async function obtenerYMostrarVigencia() {
        try {
            const response = await fetch(`${API_BASE_URL}/configuracion-vigencia/dias-vigencia`);
            const data = await response.json();
            
            const fechaActual = new Date();
            const fechaVencimiento = new Date(fechaActual);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + data.dias_vigencia);
            
            const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const fechaVencimientoFormateada = fechaVencimiento.toLocaleDateString('es-ES', opcionesFormato);
            
            document.getElementById('fechaVencimiento').textContent = `Vigencia de la propuesta: ${fechaVencimientoFormateada}`;
        } catch (error) {
            // Fallback a 5 días si hay error
    const fechaActual = new Date();
    const fechaVencimiento = new Date(fechaActual);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);
    const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaVencimientoFormateada = fechaVencimiento.toLocaleDateString('es-ES', opcionesFormato);
    document.getElementById('fechaVencimiento').textContent = `Vigencia de la propuesta: ${fechaVencimientoFormateada}`;
        }
    }

    await obtenerYMostrarVigencia();

    // Guardar cotización en la base de datos siempre que haya datos válidos
    // (ELIMINADO: ahora el guardado solo se hace al presionar el último Siguiente del formulario)

    const programaFila1 = document.getElementById('programa-fila1');
    const programaFila2 = document.getElementById('programa-fila2');
    const formatoFila1 = document.getElementById('formato-fila1');
    const formatoFila2 = document.getElementById('formato-fila2');

    // Mostrar el valor en ambos bloques solo si existen
    if (programaFila1) {
        if (!programaFila1.textContent || programaFila1.textContent === 'N/A') {
            programaFila1.textContent = programa;
        }
    }
    if (programaFila2) programaFila2.textContent = programa;
    if (formatoFila1) formatoFila1.textContent = formato;
    if (formatoFila2) formatoFila2.textContent = formato;

    const certificadosContainer = document.getElementById('certificados-container');
    const semanasContainer = document.getElementById('semanas-container');
    const inglesContainer = document.getElementById('ingles-container');
    const materiasContainer = document.getElementById('materias-container');

    const infoProgramaFila1 = document.querySelector('.info-programa-fila1');
    const infoProgramaFila2 = document.querySelector('.info-programa-fila2');
    const infoFormatoFila1 = document.querySelector('.info-formato-fila1');
    const infoFormatoFila2 = document.querySelector('.info-formato-fila2');

    // Verifica si hay algún campo visible en la segunda fila (excluyendo Programa y Materias)
    const hayAcompananteSegundaFila = [
        certificadosContainer,
        semanasContainer,
        inglesContainer
    ].some(el => el && !el.classList.contains('hidden'));

    // Verifica si Formato tiene valor
    const formatoVisible = (formato && formato !== 'N/A');

    // Solo baja Programa si hay acompañante o formato visible
    if (hayAcompananteSegundaFila || formatoVisible) {
        if (infoProgramaFila1) infoProgramaFila1.classList.add('hidden');
        if (infoProgramaFila2) infoProgramaFila2.classList.remove('hidden');
        if (formatoVisible) {
            if (infoFormatoFila1) infoFormatoFila1.classList.add('hidden');
            if (infoFormatoFila2) infoFormatoFila2.classList.remove('hidden');
        } else {
            if (infoFormatoFila1) infoFormatoFila1.classList.add('hidden');
            if (infoFormatoFila2) infoFormatoFila2.classList.add('hidden');
        }
    } else {
        if (infoProgramaFila1) infoProgramaFila1.classList.remove('hidden');
        if (infoProgramaFila2) infoProgramaFila2.classList.add('hidden');
        if (infoFormatoFila1) infoFormatoFila1.classList.add('hidden');
        if (infoFormatoFila2) infoFormatoFila2.classList.add('hidden');
    }

    // El resto del código (apoyos, becas, seguros, totales, etc.) se ejecuta siempre
    // Pero la lógica genérica de pagos (mensualidades, primerPago, totalFinanciado, etc.) solo se ejecuta si NO es nivel 13
    if (levelId != 13) {
        // ... (lógica genérica de actualización de pagos)
    }

    // Función utilitaria para calcular el total financiado según el nivel
    function calcularTotalFinanciado(valores, levelId) {
        let factorMultiplicador = 3;
        if (levelId === 1 || levelId === 2 || levelId === 4) {
            factorMultiplicador = 4;
        } else if (levelId === 10) {
            factorMultiplicador = 2;
        }
        return (
            (parseFloat(valores.interesDividido.replace(/[^0-9.-]+/g, "")) || 0) * factorMultiplicador +
            (parseFloat(valores.primeraCuota.replace(/[^0-9.-]+/g, "")) || 0)
        );
    }

    // Función para convertir a entero si termina en .00
    function toIntIfPossible(num) {
        return (typeof num === 'number' && num % 1 === 0) ? parseInt(num) : num;
    }

    function mostrarEnteroSiEsDecimal(valor) {
        if (typeof valor === 'string') valor = parseFloat(valor);
        return (typeof valor === 'number' && valor % 1 === 0) ? valor.toString() : valor;
    }

    // Función auxiliar para calcular la fecha de vigencia
    async function calcularFechaVigencia() {
        try {
            const response = await fetch(`${API_BASE_URL}/configuracion-vigencia/dias-vigencia`);
            const data = await response.json();
            
            const fechaActual = new Date();
            const fechaVencimiento = new Date(fechaActual);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + data.dias_vigencia);
            
            return fechaVencimiento;
        } catch (error) {
            // Fallback a 5 días si hay error
            const fechaActual = new Date();
            const fechaVencimiento = new Date(fechaActual);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);
            return fechaVencimiento;
        }
    }

    // Función para guardar la cotización en la base de datos
    async function guardarCotizacion() {
        try {
            const valores = recuperarValores();
            const valoresAdicionales = recuperarValoresAdicionales();
            
            // Calcular la fecha de vigencia
            const fechaVigencia = await calcularFechaVigencia();
            
            // Determinar qué campos mostrar según el nivel
            let materiasValue = 0;
            let creditosValue = 0;
            let certificadosValue = 0;
            let semanasSediValue = 0;
            let inglesValue = 0;

            const nivelesConCreditos = [2, 6, 10]; // Niveles que manejan créditos

            if (levelId === 4) {
                // Nivel 4: certificados, semanas SEDI e inglés
                certificadosValue = parseFloat(certificados) || 0;
                semanasSediValue = parseFloat(semanas) || 0;
                inglesValue = parseFloat(ingles) || 0;
                materiasValue = 0;
                creditosValue = 0;
            } else if (levelId === 13) {
                // Nivel 13: certificados y semanas SEDI (suma total de todos los períodos)
                const configuracionesPorPeriodo = JSON.parse(localStorage.getItem('configuracionesPorPeriodo')) || {};
                certificadosValue = 0;
                semanasSediValue = 0;
                
                // Sumar certificados y semanas de todos los períodos seleccionados
                Object.values(configuracionesPorPeriodo).forEach(config => {
                    certificadosValue += parseInt(config.certificados) || 0;
                    semanasSediValue += parseInt(config.semanas) || 0;
                });
                
                inglesValue = 0;
                materiasValue = 0;
                creditosValue = 0;
            } else if (levelId === 5) {
                // Nivel 5: certificados
                const numeroCertificados = parseFloat(materias) || 0;
                certificadosValue = numeroCertificados;
                materiasValue = 0;
                creditosValue = 0;
                semanasSediValue = 0;
                inglesValue = 0;
            } else if (levelId === 8) {
                // Nivel 8: certificados
                const numeroCertificados = parseFloat(materias) || 0;
                certificadosValue = numeroCertificados;
                materiasValue = 0;
                creditosValue = 0;
                semanasSediValue = 0;
                inglesValue = 0;
            } else if (levelId === 9) {
                // Nivel 9: certificados
                const numeroCertificados = parseFloat(materias) || 0;
                certificadosValue = numeroCertificados;
                materiasValue = 0;
                creditosValue = 0;
                semanasSediValue = 0;
                inglesValue = 0;
            } else if (nivelesConCreditos.includes(levelId)) {
                // Niveles de créditos
                const creditos = typeof window.creditos !== 'undefined' ? window.creditos : (typeof materias !== 'undefined' ? materias : 0);
                creditosValue = parseFloat(creditos) || 0;
                materiasValue = 0;
                certificadosValue = 0;
                semanasSediValue = 0;
                inglesValue = 0;
            } else {
                // Resto: solo materias
                materiasValue = parseFloat(materias) || 0;
                creditosValue = 0;
                certificadosValue = 0;
                semanasSediValue = 0;
                inglesValue = 0;
            }
            
            // Preparar datos de la cotización
            let totalFinanciadoFinal = 0;
            let totalPagosRecuperado = 0;
            if (levelId === 13) {
                // Recuperar el total de pagos desde localStorage
                const totalPagosLS = localStorage.getItem('totalPagos');
                if (totalPagosLS !== null && totalPagosLS !== undefined) {
                    try {
                        totalPagosRecuperado = JSON.parse(totalPagosLS);
                    } catch (e) {
                        totalPagosRecuperado = totalPagosLS;
                    }
                }
                totalFinanciadoFinal = parseFloat(totalPagosRecuperado) || 0;
            } else {
                totalFinanciadoFinal = calcularTotalFinanciado(valoresAdicionales, levelId);
            }
            let periodoGuardar = periodo;
            let costosPorBimestre = {};
            if (levelId === 13) {
                // Guardar los meses seleccionados separados por comas en el campo periodo
                try {
                    const periodosSeleccionados = JSON.parse(localStorage.getItem('periodosSeleccionados'));
                    if (Array.isArray(periodosSeleccionados)) {
                        const meses = periodosSeleccionados.map(p => p.mes).join(', ');
                        periodoGuardar = meses || 'N/A';
                        
                        // Guardar los costos específicos por bimestre
                        periodosSeleccionados.forEach(periodo => {
                            const costoKey = `totalContado_${periodo.codigo}`;
                            const costoBimestre = JSON.parse(localStorage.getItem(costoKey)) || 0;
                            costosPorBimestre[periodo.codigo] = costoBimestre;
                        });
                    }
                } catch (e) {
                    periodoGuardar = periodo;
                }
            }
            const cotizacionData = {
                nombre_estudiante: nombre,
                nivel_id: levelId,
                periodo: periodoGuardar,
                campus: campus,
                materias: toIntIfPossible(materiasValue),
                certificados: toIntIfPossible(certificadosValue),
                semanas_sedi: toIntIfPossible(semanasSediValue),
                ingles: toIntIfPossible(inglesValue),
                creditos: toIntIfPossible(creditosValue),
                programa: programa,
                formato: formato,
                costo_total: parseFloat(valoresAdicionales.costoTotal.replace(/[^0-9.-]+/g, "")) || 0,
                total_contado: parseFloat(valoresAdicionales.totalContado.replace(/[^0-9.-]+/g, "")) || 0,
                total_financiado: totalFinanciadoFinal,
                primera_cuota: parseFloat(valoresAdicionales.primeraCuota.replace(/[^0-9.-]+/g, "")) || 0,
                mensualidades: parseFloat(valoresAdicionales.interesDividido.replace(/[^0-9.-]+/g, "")) || 0,
                beca_nombre: valoresAdicionales.scholarshipName || 'N/A',
                beca_porcentaje: parseFloat(valoresAdicionales.retrievedPercentage) || 0,
                apoyo_estudiantil_porcentaje: parseFloat(valoresAdicionales.supportValue) || 0,
                apoyo_estudiantil_fijo: parseFloat(valoresAdicionales.supportValueFix.replace(/[^0-9.-]+/g, "")) || 0,
                prestamo_porcentaje: parseFloat(valoresAdicionales.prestamoRecuperado) || 0,
                seguro_accidentes: valores.insurance !== 'No Aplica' ? parseFloat(valores.insurance.replace(/[^0-9.-]+/g, "")) : 0,
                seguro_estudiantil: valores.coverage !== 'No Aplica' ? parseFloat(valores.coverage.replace(/[^0-9.-]+/g, "")) : 0,
                cobertura_vive: valores.vive !== 'No Aplica' ? parseFloat(valores.vive.replace(/[^0-9.-]+/g, "")) : 0,
                // Guardar también los seguros dinámicos completos
                seguros_dinamicos: JSON.parse(localStorage.getItem('segurosSeleccionados') || '{}'),
                total_seguros: parseFloat(valoresAdicionales.totalCost) || 0,
                costos_por_bimestre: levelId === 13 ? JSON.stringify(costosPorBimestre) : null,
                configuraciones_por_periodo: levelId === 13 ? JSON.stringify(JSON.parse(localStorage.getItem('configuracionesPorPeriodo') || '{}')) : null,
                fecha_vigencia: fechaVigencia
            };

            // Enviar datos al backend
            const response = await fetch(`${API_BASE_URL}/cotizaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cotizacionData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error en la respuesta:', errorText);
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            
            // Guardar el ID de la cotización para usar en WhatsApp
            if (result.success && result.data && result.data.id) {
                localStorage.setItem('cotizacionId', result.data.id);
                alert('¡Cotización guardada exitosamente!\nID: ' + result.data.id);
            }
            
        } catch (error) {
            console.error('Error al guardar la cotización:', error);
            // No mostrar error al usuario para no interrumpir la experiencia
        }
    }
    window.guardarCotizacion = guardarCotizacion;

    // Función para asegurar que siempre haya un ID de cotización
    async function asegurarCotizacionId() {
        let cotizacionId = localStorage.getItem('cotizacionId');
        
        // Si no hay ID, intentar guardar la cotización
        if (!cotizacionId) {
            try {
                await guardarCotizacion();
                cotizacionId = localStorage.getItem('cotizacionId');
            } catch (error) {
                console.error('Error al guardar cotización:', error);
            }
        }
        
        return cotizacionId;
    }

    // Función para forzar el guardado de cotización (para depuración)
    window.forzarGuardado = async function() {
        try {
            await guardarCotizacion();
            alert('Cotización guardada exitosamente. Revisa la consola para más detalles.');
        } catch (error) {
            console.error('Error al forzar guardado:', error);
            alert('Error al guardar la cotización. Revisa la consola para más detalles.');
        }
    };

    // Función para enviar cotización por WhatsApp
    window.enviarWhatsApp = async function() {
        // Asegurar que siempre haya un ID antes de enviar
        const cotizacionId = await asegurarCotizacionId();
        
        // Mostrar el modal personalizado
        const modal = document.getElementById('modal-whatsapp');
        const input = document.getElementById('input-numero-whatsapp');
        const error = document.getElementById('error-numero-whatsapp');
        modal.classList.add('visible');
        input.value = '';
        error.classList.add('hidden');
        input.focus();
    };

    // Listeners para el modal de WhatsApp 
    document.getElementById('btn-cerrar-whatsapp').onclick = function() {
        document.getElementById('modal-whatsapp').classList.remove('visible');
    };
    
    document.getElementById('btn-enviar-whatsapp').onclick = async function() {
        const input = document.getElementById('input-numero-whatsapp');
        const error = document.getElementById('error-numero-whatsapp');
        let numeroUsuario = input.value.replace(/\D/g, '');
        if (numeroUsuario.length !== 10) {
            error.classList.remove('hidden');
            return;
        }
        error.classList.add('hidden');
        // Lada de México (52); el número capturado es de 10 dígitos
        const numeroWhatsApp = '52'+numeroUsuario;
        
        // Asegurar que siempre haya un ID de cotización
        const cotizacionId = await asegurarCotizacionId();
        let mensaje;
        
        if (cotizacionId) {
            // Crear URL de la cotización compartible usando resultado.html
            // Ruta relativa a la página actual: funciona igual en local, staging y producción.
            const urlCotizacion = new URL(`cotizacion-compartida.html?id=${cotizacionId}`, window.location.href).href;
            mensaje = `Hola, aquí tienes tu cotización de Tecmilenio: ${urlCotizacion}`;
        } else {
            // Fallback si no hay ID de cotización
            mensaje = 'Hola, aquí tienes tu cotización de Tecmilenio.';
        }
        
        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
        window.open(urlWhatsApp, '_blank');
        document.getElementById('modal-whatsapp').classList.remove('visible');
    };

    // Guardado automático solo si no hay cotización guardada
    if (!localStorage.getItem('cotizacionId')) {
        await guardarCotizacion();
    }

    // Si tienes un botón para guardar una nueva cotización, puedes agregar esto:
    const btnGuardar = document.getElementById('btn-guardar-cotizacion');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async function() {
            localStorage.removeItem('cotizacionId');
            await guardarCotizacion();
        });
    }

    // Función para organizar campos automáticamente según el nivel
    function organizarCamposPorNivel(nivelId, datos) {
        const infoGrid = document.getElementById('info-grid');
        if (!infoGrid) {
            console.error('No se encontró el contenedor info-grid');
            return;
        }
        
        // Limpiar el grid
        infoGrid.innerHTML = '';
        
        // Función para formatear números
        function formatearNumero(valor) {
            if (valor === null || valor === undefined || valor === '') return 'N/A';
            
            // Convertir a string y limpiar
            let valorStr = valor.toString().trim();
            
            // Si ya es un string que termina en .00, convertirlo a entero
            if (valorStr.endsWith('.00')) {
                valorStr = valorStr.replace('.00', '');
            }
            
            const num = parseFloat(valorStr);
            if (isNaN(num)) return valorStr;
            
            // Si es un número entero, devolver como string sin decimales
            if (Number.isInteger(num)) {
                return num.toString();
            }
            
            // Si es decimal, mostrar con 2 decimales
            return num.toFixed(2);
        }
        
        // Definir los campos base que siempre se muestran
        const camposBase = [
            { id: 'nombre', label: 'Nombre', valor: datos.nombre || 'N/A' }
        ];
        
        // Agregar programa y formato si tienen valor (después del nombre)
        if (datos.programa && datos.programa !== 'N/A' && datos.programa !== '') {
            camposBase.push({ id: 'programa', label: 'Programa', valor: datos.programa });
        }
        
        if (datos.formato && datos.formato !== 'N/A' && datos.formato !== '') {
            camposBase.push({ id: 'formato', label: 'Formato', valor: datos.formato });
        }
        
        // Agregar periodo (después de programa y formato)
        camposBase.push({ id: 'periodo', label: 'Periodo', valor: datos.periodo || 'N/A' });
        
        // Agregar nivel solo para niveles que no sean 4 ni 13 (después del periodo)
        if (nivelId !== 4 && nivelId !== 13) {
            camposBase.push({ id: 'nivel', label: 'Nivel', valor: datos.nivel || 'N/A' });
        }
        
        // Agregar campus (después del nivel)
        camposBase.push({ id: 'campus', label: 'Campus', valor: datos.campus || 'N/A' });
        
        // Definir campos adicionales según el nivel (unidades)
        let camposAdicionales = [];
        
        if (nivelId === 4) {
            // Nivel 4: certificados, semanas SEDI e inglés
            camposAdicionales = [
                { id: 'certificados', label: 'Certificados', valor: formatearNumero(datos.certificados) },
                { id: 'semanas', label: 'Semanas de Desarrollo Integral', valor: formatearNumero(datos.semanas) },
                { id: 'ingles', label: 'Certificados de inglés', valor: formatearNumero(datos.ingles) }
            ];
        } else if (nivelId === 5) {
            // Nivel 5: certificados
            camposAdicionales = [
                { id: 'certificados', label: 'Certificados', valor: formatearNumero(datos.materias) }
            ];
        } else if (nivelId === 8) {
            // Nivel 8: certificados
            camposAdicionales = [
                { id: 'certificados', label: 'Certificados', valor: formatearNumero(datos.materias) }
            ];
        } else if (nivelId === 9) {
            // Nivel 9: certificados
            camposAdicionales = [
                { id: 'certificados', label: 'Certificados', valor: formatearNumero(datos.materias) }
            ];
        } else if (nivelId === 13) {
            // Nivel 13: certificados y semanas SEDI
            camposAdicionales = [
                { id: 'certificados', label: 'Certificados', valor: formatearNumero(datos.certificados) },
                { id: 'semanas', label: 'Semanas de Desarrollo Integral', valor: formatearNumero(datos.semanas) }
            ];
        } else {
            // Resto de niveles: usar la función getMateriasLabel para determinar el label correcto
            const materiasLabel = getMateriasLabel(nivelId);
            camposAdicionales = [
                { id: 'materias', label: materiasLabel, valor: formatearNumero(datos.materias) }
            ];
        }
        
        // Combinar todos los campos
        const todosLosCampos = [...camposBase, ...camposAdicionales];

        // Determinar la organización del grid
        const totalCampos = todosLosCampos.length;
        let gridClasses = '';
        
        if (totalCampos <= 6) {
            // Una sola fila: distribuir uniformemente
            if (totalCampos <= 2) {
                gridClasses = 'grid-cols-1 md:grid-cols-2';
            } else if (totalCampos <= 3) {
                gridClasses = 'grid-cols-1 md:grid-cols-3';
            } else if (totalCampos <= 4) {
                gridClasses = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            } else if (totalCampos <= 6) {
                gridClasses = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
            }
        } else {
            // Dos filas: primeros 4 en la primera fila, resto en la segunda
            gridClasses = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
        }
        
        // Aplicar las clases del grid
        infoGrid.className = `grid ${gridClasses} gap-4`;
        
        // Crear y agregar los elementos
        todosLosCampos.forEach((campo, index) => {
            const campoElement = crearElementoCampo(campo, index, totalCampos);
            infoGrid.appendChild(campoElement);
        });
    }

    // Función auxiliar para crear un elemento de campo
    function crearElementoCampo(campo, index, totalCampos) {
        const div = document.createElement('div');
        div.className = 'px-4 grow lg:w-auto';
        
        const htmlContent = `
            <p class="text-[19px] leading-[27px] text-secondary-color-2 font-bold mb-2">${campo.label}</p>
            <p id="${campo.id}" class="text-[21px] leading-[29px]">${campo.valor}</p>
        `;
        
        div.innerHTML = htmlContent;
        
        return div;
    }

    // Función auxiliar para obtener el label correcto según el nivel
    function getMateriasLabel(nivelId) {
        const materiasPorNivel = {
            1: 'Materias',
            2: 'Créditos',
            3: 'Materias',
            4: 'Certificados', // Nivel 4 maneja certificados, pero se maneja por separado
            5: 'Certificados',
            6: 'Créditos',
            7: 'Materias',
            8: 'Certificados',
            9: 'Certificados',
            10: 'Créditos',
            11: 'Materias',
            12: 'Materias',
            13: 'Certificados' // Nivel 13 maneja certificados, pero se maneja por separado
        };
        
        return materiasPorNivel[nivelId] || 'Materias';
    }
});
