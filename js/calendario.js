// Calendario JavaScript for Liga MX Website
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
});

// Variables globales del calendario
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Datos de ejemplo de partidos
const matchesData = {
    "2025-09-07": [
        {
            home: "Club América",
            away: "Monterrey", 
            time: "19:30",
            stadium: "Estadio Azteca",
            type: "important",
            importance: 5
        }
    ],
    "2025-09-08": [
        {
            home: "Cruz Azul",
            away: "Pumas UNAM",
            time: "17:00", 
            stadium: "Estadio Azul",
            type: "derby",
            importance: 4
        }
    ],
    "2025-09-11": [
        {
            home: "Tigres UANL",
            away: "Santos Laguna",
            time: "21:00",
            stadium: "Estadio Universitario", 
            type: "normal",
            importance: 3
        }
    ],
    "2025-09-14": [
        {
            home: "Guadalajara",
            away: "Atlas",
            time: "20:00",
            stadium: "Estadio Akron",
            type: "derby", 
            importance: 5
        }
    ],
    "2025-09-15": [
        {
            home: "Toluca",
            away: "Pachuca",
            time: "19:00",
            stadium: "Estadio Nemesio Díez",
            type: "normal",
            importance: 3
        }
    ],
    "2025-09-18": [
        {
            home: "León",
            away: "Tijuana", 
            time: "18:30",
            stadium: "Estadio León",
            type: "normal",
            importance: 2
        }
    ],
    "2025-09-21": [
        {
            home: "Necaxa",
            away: "FC Juárez",
            time: "17:30",
            stadium: "Estadio Victoria",
            type: "normal",
            importance: 2
        },
        {
            home: "Querétaro",
            away: "Mazatlán FC", 
            time: "19:30",
            stadium: "Estadio Corregidora",
            type: "normal",
            importance: 2
        }
    ],
    "2025-09-22": [
        {
            home: "Puebla",
            away: "Atlético San Luis",
            time: "16:00", 
            stadium: "Estadio Cuauhtémoc",
            type: "normal",
            importance: 2
        }
    ],
    "2025-09-25": [
        {
            home: "Club América",
            away: "Cruz Azul",
            time: "20:30",
            stadium: "Estadio Azteca",
            type: "important",
            importance: 5
        }
    ],
    "2025-09-28": [
        {
            home: "Monterrey",
            away: "Tigres UANL", 
            time: "19:00",
            stadium: "Estadio BBVA",
            type: "derby",
            importance: 5
        }
    ]
};

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Inicializar calendario
function initializeCalendar() {
    setupCalendarControls();
    setupFilterButtons();
    generateCalendar(currentMonth, currentYear);
}

// Configurar controles del calendario
function setupCalendarControls() {
    const prevButton = document.getElementById('prevMonth');
    const nextButton = document.getElementById('nextMonth');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            generateCalendar(currentMonth, currentYear);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            generateCalendar(currentMonth, currentYear);
        });
    }
}

// Configurar botones de filtro
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            
            const filterType = button.getAttribute('data-filter');
            filterMatches(filterType);
        });
    });
}

// Generar calendario
function generateCalendar(month, year) {
    const currentMonthElement = document.getElementById('currentMonth');
    if (currentMonthElement) {
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    }
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1).getDay();
    // Último día del mes
    const lastDate = new Date(year, month + 1, 0).getDate();
    // Último día del mes anterior
    const prevLastDate = new Date(year, month, 0).getDate();
    
    // Fecha actual para resaltar
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();
    
    // Agregar días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = createDayElement(prevLastDate - i, true, false);
        calendarDays.appendChild(dayElement);
    }
    
    // Agregar días del mes actual
    for (let date = 1; date <= lastDate; date++) {
        const isToday = isCurrentMonth && date === todayDate;
        const dayElement = createDayElement(date, false, isToday);
        
        // Agregar partidos si los hay
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        const dayMatches = matchesData[dateString];
        
        if (dayMatches) {
            dayMatches.forEach(match => {
                const matchElement = createMatchElement(match);
                dayElement.appendChild(matchElement);
            });
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Completar con días del siguiente mes
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 filas x 7 días
    
    for (let date = 1; date <= remainingCells; date++) {
        const dayElement = createDayElement(date, true, false);
        calendarDays.appendChild(dayElement);
    }
}

// Crear elemento de día
function createDayElement(date, isOtherMonth, isToday) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date;
    
    dayElement.appendChild(dayNumber);
    
    return dayElement;
}

// Crear elemento de partido
function createMatchElement(match) {
    const matchElement = document.createElement('div');
    matchElement.className = 'match-event';
    
    // Agregar clase según el tipo de partido
    if (match.type) {
        matchElement.classList.add(match.type);
    }
    
    // Crear contenido del partido
    matchElement.innerHTML = `
        <i class="fas fa-futbol"></i>
        <div>
            <div style="font-weight: 700;">${match.home.split(' ')[match.home.split(' ').length - 1]} vs ${match.away.split(' ')[match.away.split(' ').length - 1]}</div>
            <div style="font-size: 0.7rem; opacity: 0.9;">${match.time}</div>
        </div>
    `;
    
    // Agregar evento click para mostrar detalles
    matchElement.addEventListener('click', () => {
        showMatchDetails(match);
    });
    
    return matchElement;
}

// Filtrar partidos
function filterMatches(filterType) {
    const matchEvents = document.querySelectorAll('.match-event');
    
    matchEvents.forEach(matchEvent => {
        if (filterType === 'all') {
            matchEvent.style.display = 'flex';
        } else {
            if (matchEvent.classList.contains(filterType)) {
                matchEvent.style.display = 'flex';
            } else {
                matchEvent.style.display = 'none';
            }
        }
    });
}

// Mostrar detalles del partido
function showMatchDetails(match) {
    // Crear modal con detalles del partido
    const modal = document.createElement('div');
    modal.className = 'match-modal';
    modal.innerHTML = `
        <div class="match-modal-content">
            <div class="modal-header">
                <h3>Detalles del Partido</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="match-teams-detail">
                    <div class="team-detail">
                        <div class="team-logo-large">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h4>${match.home}</h4>
                    </div>
                    <div class="vs-large">VS</div>
                    <div class="team-detail">
                        <div class="team-logo-large">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h4>${match.away}</h4>
                    </div>
                </div>
                <div class="match-details">
                    <p><i class="fas fa-clock"></i> Hora: ${match.time}</p>
                    <p><i class="fas fa-map-marker-alt"></i> Estadio: ${match.stadium}</p>
                    <p><i class="fas fa-star"></i> Importancia: ${'★'.repeat(match.importance)}${'☆'.repeat(5 - match.importance)}</p>
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
    
    const modalContent = modal.querySelector('.match-modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        position: relative;
    `;
    
    // Cerrar modal
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.body.appendChild(modal);
}

// Exportar funciones para uso global
window.calendarApp = {
    generateCalendar,
    setupFilterButtons,
    showMatchDetails,
    matchesData
};