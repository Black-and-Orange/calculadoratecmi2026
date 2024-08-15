document.addEventListener('DOMContentLoaded', () => {
    const becasContainer = document.getElementById('becasContainer');
    const apoyosContainer = document.getElementById('apoyosContainer');

    function fetchBecas() {
        fetch('http://localhost:3008/api/becas')
            .then(response => response.json())
            .then(data => {
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
        fetch('http://localhost:3008/api/apoyos')
            .then(response => response.json())
            .then(data => {
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

    document.getElementById('addBecaForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const tipo = document.getElementById('becaTipo').value;
        const promedio_min = parseFloat(document.getElementById('becaPromedioMin').value);
        const promedio_max = parseFloat(document.getElementById('becaPromedioMax').value);
        const porcentaje_min = parseFloat(document.getElementById('becaPorcentajeMin').value);
        const porcentaje_max = parseFloat(document.getElementById('becaPorcentajeMax').value);

    
        fetch('http://localhost:3008/api/becas', {
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
            console.log('Response data:', data);
            fetchBecas(); 
            document.getElementById('addBecaForm').reset();
        })
        .catch(error => console.error('Error:', error));
    });
    

    document.getElementById('addApoyoForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const porcentaje = parseFloat(document.getElementById('apoyoPorcentaje').value);

        fetch('http://localhost:3008/api/apoyos', {
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

    window.deleteBeca = function(id) {
        fetch(`http://localhost:3008/api/becas/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            fetchBecas(); 
        })
        .catch(error => console.error('Error:', error));
    };

    window.deleteApoyo = function(id) {
        fetch(`http://localhost:3008/api/apoyos/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            fetchApoyosEstudiantiles(); 
        })
        .catch(error => console.error('Error:', error));
    };

    // Inicializar listas de becas y apoyos
    fetchBecas();
    fetchApoyosEstudiantiles();
});
