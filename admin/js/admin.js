import { API_BASE_URL } from './apiConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const becasContainer = document.getElementById('becasContainer');
    const apoyosContainer = document.getElementById('apoyosContainer');

    function fetchBecas() {
        fetch(`${API_BASE_URL}/becas`)
            .then(response => response.json())
            .then(data => {
                if (!becasContainer) return;
                becasContainer.innerHTML = '';
                data.forEach(beca => {
                    const becaElement = document.createElement('div');
                    becaElement.classList.add('beca-item');
                    becaElement.innerHTML = `
                        <p><strong>Tipo:</strong> ${beca.tipo}</p>
                        <p><strong>Promedio Min:</strong> ${beca.promedio_min}</p>
                        <p><strong>Promedio Max:</strong> ${beca.promedio_max}</p>
                        <p><strong>Porcentaje Min:</strong> ${beca.porcentaje_min}</p>
                        <p><strong>Porcentaje Max:</strong> ${beca.porcentaje_max}</p>
                        <button class="btn btn-danger btn-sm" onclick="deleteBeca(${beca.id})">Eliminar</button>
                    `;
                    becasContainer.appendChild(becaElement);
                });
            });
    }

    function fetchApoyosEstudiantiles() {
        fetch(`${API_BASE_URL}/apoyos`)
            .then(response => response.json())
            .then(data => {
                if (!apoyosContainer) return;
                apoyosContainer.innerHTML = '';
                data.forEach(apoyo => {
                    const apoyoElement = document.createElement('div');
                    apoyoElement.classList.add('apoyo-item');
                    apoyoElement.innerHTML = `
                        <p><strong>Porcentaje:</strong> ${apoyo.porcentaje}%</p>
                        <button class="btn btn-danger btn-sm" onclick="deleteApoyo(${apoyo.id})">Eliminar</button>
                    `;
                    apoyosContainer.appendChild(apoyoElement);
                });
            });
    }

    if (document.getElementById('addBecaForm')) {
        document.getElementById('addBecaForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const tipo = document.getElementById('becaTipo').value;
            const promedio_min = parseFloat(document.getElementById('becaPromedioMin').value);
            const promedio_max = parseFloat(document.getElementById('becaPromedioMax').value);
            const porcentaje_min = parseFloat(document.getElementById('becaPorcentajeMin').value);
            const porcentaje_max = parseFloat(document.getElementById('becaPorcentajeMax').value);

            fetch(`${API_BASE_URL}/becas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipo,
                    promedio_min,
                    promedio_max,
                    porcentaje_min,
                    porcentaje_max
                })
            })
            .then(response => response.json())
            .then(data => {
                fetchBecas(); 
                document.getElementById('addBecaForm').reset();
            })
            .catch(error => console.error('Error:', error));
        });
    }

    if (document.getElementById('addApoyoForm')) {
        document.getElementById('addApoyoForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const porcentaje = parseFloat(document.getElementById('apoyoPorcentaje').value);

            fetch(`${API_BASE_URL}/apoyos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ porcentaje })
            })
            .then(response => response.json())
            .then(data => {
                fetchApoyosEstudiantiles(); 
                document.getElementById('addApoyoForm').reset();
            })
            .catch(error => console.error('Error:', error));
        });
    }

    window.deleteBeca = function(id) {
        fetch(`${API_BASE_URL}/becas/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (becasContainer) fetchBecas(); 
        })
        .catch(error => console.error('Error:', error));
    };

    window.deleteApoyo = function(id) {
        fetch(`${API_BASE_URL}/apoyos/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (apoyosContainer) fetchApoyosEstudiantiles(); 
        })
        .catch(error => console.error('Error:', error));
    };

    if (becasContainer) fetchBecas();
    if (apoyosContainer) fetchApoyosEstudiantiles();
    cargarDiasVigencia();
});

// Funciones para configuración de vigencia
async function cargarDiasVigencia() {
    try {
        const response = await fetch(`${API_BASE_URL}/configuracion-vigencia/dias-vigencia`);
        const data = await response.json();
        if (document.getElementById('labelDiasActuales')) {
            document.getElementById('labelDiasActuales').textContent = `Días actuales de vigencia: ${data.dias_vigencia}`;
        }
        if (document.getElementById('diasVigencia')) {
            document.getElementById('diasVigencia').value = '';
        }
        // Calcular y mostrar la fecha de vigencia actual
        const fechaActual = new Date();
        const fechaVigencia = new Date(fechaActual);
        fechaVigencia.setDate(fechaVigencia.getDate() + data.dias_vigencia);
        const opcionesFormato = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const fechaVigenciaFormateada = fechaVigencia.toLocaleDateString('es-ES', opcionesFormato);
        if (document.getElementById('labelFechaVigencia')) {
            document.getElementById('labelFechaVigencia').textContent = `Fecha de vigencia actual: ${fechaVigenciaFormateada}`;
        }
    } catch (error) {
        console.error('Error al cargar días de vigencia:', error);
        if (document.getElementById('labelDiasActuales')) {
            document.getElementById('labelDiasActuales').textContent = 'Días actuales de vigencia: ...';
        }
        if (document.getElementById('diasVigencia')) {
            document.getElementById('diasVigencia').value = '';
        }
        if (document.getElementById('labelFechaVigencia')) {
            document.getElementById('labelFechaVigencia').textContent = 'Fecha de vigencia actual: ...';
        }
    }
}

async function actualizarDiasVigencia() {
    const diasInput = document.getElementById('diasVigencia');
    const dias = diasInput ? diasInput.value : null;
    if (!dias || dias < 1 || dias > 365) {
        window.tecToast('Por favor ingrese un número válido entre 1 y 365 días', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/configuracion-vigencia/dias-vigencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dias_vigencia: parseInt(dias) })
        });

        if (response.ok) {
            await cargarDiasVigencia();
            window.tecToast('Días de vigencia actualizados');
        } else {
            window.tecToast('Error al actualizar días de vigencia', 'error');
        }
    } catch (error) {
        window.tecToast('Error al actualizar días de vigencia', 'error');
    }
}

window.actualizarDiasVigencia = actualizarDiasVigencia;
window.cargarDiasVigencia = cargarDiasVigencia;
