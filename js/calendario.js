// Calendario con Jornadas JavaScript for Liga MX Website
document.addEventListener('DOMContentLoaded', function() {
    initializeJornadas();
});

// Variables globales
let currentJornada = 1;
let jornadasData = [];

// Inicializar sistema de jornadas
async function initializeJornadas() {
    try {
        await loadJornadasData();
        setupJornadasControls();
        generateJornadasSelector();
        displayJornada(currentJornada);
    } catch (error) {
        console.error('Error inicializando jornadas:', error);
    }
}

// Cargar datos de jornadas
async function loadJornadasData() {
    try {
        const response = await fetch('data/jornadas.json');
        const data = await response.json();
        jornadasData = data.jornadas;
    } catch (error) {
        console.error('Error cargando datos de jornadas:', error);
        // Datos de fallback si no se puede cargar el JSON
        jornadasData = [];
    }
}

// Configurar controles de navegación
function setupJornadasControls() {
    const prevButton = document.getElementById('prevJornada');
    const nextButton = document.getElementById('nextJornada');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentJornada > 1) {
                currentJornada--;
                displayJornada(currentJornada);
                updateNavButtons();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentJornada < jornadasData.length) {
                currentJornada++;
                displayJornada(currentJornada);
                updateNavButtons();
            }
        });
    }
}

// Generar selector de jornadas
function generateJornadasSelector() {
    const selector = document.getElementById('jornadasSelector');
    if (!selector || !jornadasData.length) return;
    
    selector.innerHTML = '';
    
    jornadasData.forEach((jornada, index) => {
        const button = document.createElement('button');
        button.className = 'jornada-btn';
        if (index + 1 === currentJornada) {
            button.classList.add('active');
        }
        
        // Manejar jornadas especiales (dobles)
        if (jornada.tipo === 'DOBLE') {
            button.textContent = `J${jornada.numero} DOBLE`;
        } else {
            button.textContent = `J${jornada.numero}`;
        }
        
        button.addEventListener('click', () => {
            currentJornada = index + 1;
            displayJornada(currentJornada);
            updateJornadaSelector();
            updateNavButtons();
        });
        
        selector.appendChild(button);
    });
}

// Mostrar jornada específica
function displayJornada(jornadaNum) {
    const jornada = jornadasData[jornadaNum - 1];
    if (!jornada) return;
    
    // Actualizar título
    const currentJornadaElement = document.getElementById('currentJornada');
    if (currentJornadaElement) {
        if (jornada.tipo === 'DOBLE') {
            currentJornadaElement.textContent = `JORNADA ${jornada.numero} DOBLE`;
        } else {
            currentJornadaElement.textContent = `JORNADA ${jornada.numero}`;
        }
    }
    
    // Actualizar fechas
    const jornadaDatesElement = document.getElementById('jornadaDates');
    if (jornadaDatesElement) {
        jornadaDatesElement.textContent = jornada.fechas;
    }
    
    // Mostrar partidos
    displayPartidos(jornada.partidos);
    
    // Actualizar controles
    updateJornadaSelector();
    updateNavButtons();
}

// Mostrar partidos de la jornada
function displayPartidos(partidos) {
    const matchesGrid = document.getElementById('matchesGrid');
    if (!matchesGrid) return;
    
    matchesGrid.innerHTML = '';
    
    partidos.forEach(partido => {
        const partidoCard = createPartidoCard(partido);
        matchesGrid.appendChild(partidoCard);
    });
}

// Crear tarjeta de partido
function createPartidoCard(partido) {
    const card = document.createElement('div');
    card.className = 'partido-card';
    
    card.innerHTML = `
        <div class="partido-header">
            <div class="partido-dia">${partido.dia}</div>
            <div class="partido-hora">${partido.hora}</div>
        </div>
        <div class="partido-teams">
            <div class="team-partido">
                <div class="team-logo-small">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="team-name-small">${partido.local}</div>
            </div>
            <div class="vs-small">VS</div>
            <div class="team-partido">
                <div class="team-logo-small">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="team-name-small">${partido.visitante}</div>
            </div>
        </div>
        <div class="partido-estadio">
            <i class="fas fa-map-marker-alt"></i>
            ${partido.estadio}
        </div>
    `;
    
    // Agregar evento click para mostrar detalles
    card.addEventListener('click', () => {
        showPartidoDetails(partido);
    });
    
    return card;
}

// Actualizar selector de jornadas
function updateJornadaSelector() {
    const buttons = document.querySelectorAll('.jornada-btn');
    buttons.forEach((button, index) => {
        if (index + 1 === currentJornada) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Actualizar botones de navegación
function updateNavButtons() {
    const prevButton = document.getElementById('prevJornada');
    const nextButton = document.getElementById('nextJornada');
    
    if (prevButton) {
        prevButton.disabled = currentJornada <= 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentJornada >= jornadasData.length;
    }
}

// Mostrar detalles del partido
function showPartidoDetails(partido) {
    const modal = document.createElement('div');
    modal.className = 'partido-modal';
    modal.innerHTML = `
        <div class="partido-modal-content">
            <div class="modal-header">
                <h3>Detalles del Partido</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="partido-teams-detail">
                    <div class="team-detail">
                        <div class="team-logo-large">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h4>${partido.local}</h4>
                        <span class="team-type">Local</span>
                    </div>
                    <div class="vs-large">VS</div>
                    <div class="team-detail">
                        <div class="team-logo-large">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h4>${partido.visitante}</h4>
                        <span class="team-type">Visitante</span>
                    </div>
                </div>
                <div class="partido-details">
                    <p><i class="fas fa-calendar-alt"></i> <strong>Día:</strong> ${partido.dia}</p>
                    <p><i class="fas fa-clock"></i> <strong>Hora:</strong> ${partido.hora}</p>
                    <p><i class="fas fa-map-marker-alt"></i> <strong>Estadio:</strong> ${partido.estadio}</p>
                </div>
            </div>
        </div>
    `;
    
    // Estilos del modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const modalContent = modal.querySelector('.partido-modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        position: relative;
    `;
    
    // Estilos adicionales para el contenido
    const style = document.createElement('style');
    style.textContent = `
        .partido-teams-detail {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .team-detail {
            flex: 1;
        }
        
        .team-logo-large {
            width: 80px;
            height: 80px;
            background: #f8f9fa;
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: #2c5aa0;
        }
        
        .team-detail h4 {
            color: #2c5aa0;
            margin-bottom: 5px;
            font-size: 1.3rem;
        }
        
        .team-type {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .vs-large {
            font-size: 2rem;
            font-weight: 700;
            color: #666;
            padding: 0 30px;
        }
        
        .partido-details {
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .partido-details p {
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .close-modal {
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #999;
        }
        
        .close-modal:hover {
            color: #666;
        }
        
        .modal-header {
            text-align: center;
            margin-bottom: 20px;
            color: #2c5aa0;
        }
    `;
    
    document.head.appendChild(style);
    
    // Cerrar modal
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
    
    document.body.appendChild(modal);
}

// Ir a jornada específica (función de utilidad)
function goToJornada(jornadaNum) {
    if (jornadaNum >= 1 && jornadaNum <= jornadasData.length) {
        currentJornada = jornadaNum;
        displayJornada(currentJornada);
        updateJornadaSelector();
        updateNavButtons();
    }
}

// Obtener jornada actual (función de utilidad)
function getCurrentJornada() {
    return currentJornada;
}

// Exportar funciones para uso global
window.jornadasApp = {
    goToJornada,
    getCurrentJornada,
    displayJornada,
    jornadasData: () => jornadasData
};