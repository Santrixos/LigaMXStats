// Main JavaScript file for UltraGol website by L3HO
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Global variables
let standingsData = [];
let fixturesData = [];

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupCarousel();
    setupScrollAnimations();
    loadInitialData();
    setupCounterAnimations();
    setupThemeSystem();
    setupAdvancedFeatures();
}

// Navigation functionality
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Scroll animations using Intersection Observer
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Trigger counter animations
                if (entry.target.classList.contains('stats-section')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.scroll-reveal, .stats-section, .team-card').forEach(el => {
        observer.observe(el);
    });
}

// Counter animations for statistics
function setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        counter.textContent = '0';
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            counter.textContent = Math.floor(current);
            
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    });
}

// Theme system for team colors
function setupThemeSystem() {
    const selectedTeam = localStorage.getItem('selectedTeam');
    if (selectedTeam) {
        applyTeamTheme(selectedTeam);
    }
}

function applyTeamTheme(teamId) {
    const team = teamsData.find(t => t.id === teamId);
    if (!team) return;

    const root = document.documentElement;
    root.style.setProperty('--team-primary', team.colors.primary);
    root.style.setProperty('--team-secondary', team.colors.secondary);
    
    // Add team class to body
    document.body.className = document.body.className.replace(/team-\w+/g, '');
    document.body.classList.add(`team-${team.id}`);
}

// Data loading functions
async function loadInitialData() {
    try {
        await Promise.all([
            loadTeamsData(),
            loadStandingsData(),
            loadFixturesData()
        ]);

        // Load page-specific content
        if (document.getElementById('topTeamsPreview')) {
            loadTopTeamsPreview();
        }
        if (document.getElementById('recentMatches')) {
            loadRecentMatches();
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
        showErrorMessage('Error al cargar los datos. Por favor, recarga la página.');
    }
}

async function loadTeamsData() {
    try {
        const response = await fetch('data/teams.json');
        teamsData = await response.json();
        return teamsData;
    } catch (error) {
        console.error('Error loading teams data:', error);
        return [];
    }
}

async function loadStandingsData() {
    try {
        const response = await fetch('data/standings.json');
        standingsData = await response.json();
        return standingsData;
    } catch (error) {
        console.error('Error loading standings data:', error);
        return [];
    }
}

async function loadFixturesData() {
    try {
        const response = await fetch('data/fixtures.json');
        fixturesData = await response.json();
        return fixturesData;
    } catch (error) {
        console.error('Error loading fixtures data:', error);
        return [];
    }
}

// Homepage content loaders
function loadTopTeamsPreview() {
    const container = document.getElementById('topTeamsPreview');
    if (!container || !standingsData.length) return;

    const topTeams = standingsData.slice(0, 3);
    
    container.innerHTML = topTeams.map((team, index) => `
        <div class="team-preview-card stagger-item" style="animation-delay: ${index * 0.2}s">
            <div class="team-position">${team.position}° Lugar</div>
            <div class="team-name">${team.name}</div>
            <div class="team-points">${team.points} pts</div>
            <div class="team-stats">
                <span>PJ: ${team.played}</span>
                <span>G: ${team.wins}</span>
                <span>E: ${team.draws}</span>
                <span>P: ${team.losses}</span>
            </div>
        </div>
    `).join('');
}

function loadRecentMatches() {
    const container = document.getElementById('recentMatches');
    if (!container || !fixturesData.length) return;

    const recentMatches = fixturesData
        .filter(match => match.status === 'completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    container.innerHTML = recentMatches.map((match, index) => `
        <div class="match-card stagger-item" style="animation-delay: ${index * 0.1}s">
            <div class="match-header">
                <span class="match-date">${formatDate(match.date)}</span>
                <span class="match-status completed">Finalizado</span>
            </div>
            <div class="match-teams">
                <div class="team-info">
                    <div class="team-logo"></div>
                    <span>${match.homeTeam}</span>
                </div>
                <div class="match-score">
                    ${match.homeScore} - ${match.awayScore}
                </div>
                <div class="team-info">
                    <span>${match.awayTeam}</span>
                    <div class="team-logo"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('es-ES', options);
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideLeft 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideRight 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideLeft 0.3s ease-out;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideRight 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Loading state management
function showLoading(container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-spinner"></div>
        <p class="loading-text">Cargando<span class="loading-dots"></span></p>
    `;
}

function hideLoading() {
    document.querySelectorAll('.loading-spinner, .loading-text').forEach(el => {
        el.remove();
    });
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Search and filter utilities
function searchTeams(query, teams = teamsData) {
    if (!query) return teams;
    
    const lowerQuery = query.toLowerCase();
    return teams.filter(team => 
        team.name.toLowerCase().includes(lowerQuery) ||
        team.nickname.toLowerCase().includes(lowerQuery) ||
        team.city.toLowerCase().includes(lowerQuery)
    );
}

function filterTeamsByRegion(region, teams = teamsData) {
    if (!region || region === 'all') return teams;
    
    return teams.filter(team => team.region === region);
}

// Advanced Carousel System
function setupCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentSlide = 0;
    let isTransitioning = false;
    let autoSlideInterval;
    
    // Auto-slide functionality
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    function showSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        // Remove active class from all slides and indicators
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Set previous slide
        if (slides[currentSlide]) {
            slides[currentSlide].classList.add('prev');
        }
        
        // Update current slide
        currentSlide = index;
        
        // Show new slide
        setTimeout(() => {
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
            isTransitioning = false;
        }, 100);
    }
    
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }
    
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }
    
    // Event listeners removed - buttons no longer exist
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });
    
    // Pause auto-slide on hover
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
        
        // Touch/swipe support for mobile
        let startX = 0;
        let endX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }
    }
    
    // Start auto-slide
    startAutoSlide();
}

// Advanced Features Setup
function setupAdvancedFeatures() {
    setupSearchFunctionality();
    setupFilterSystem();
    setupRealTimeUpdates();
    setupDataVisualization();
    setupTeamComparison();
    setupInteractiveStats();
}

// Real-time updates placeholder (for static website)
function setupRealTimeUpdates() {
    // Placeholder for real-time updates functionality
    // In a static website, this would typically involve periodic data refreshing
    console.log('Real-time updates system initialized (static mode)');
}

// Data visualization placeholder
function setupDataVisualization() {
    // Placeholder for data visualization features
    // Could be expanded with chart libraries in the future
    console.log('Data visualization system initialized');
}

// Enhanced Search Functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performGlobalSearch(e.target.value);
        }, 300);
    });
}

function performGlobalSearch(query) {
    if (!query) {
        hideSearchResults();
        return;
    }
    
    const results = {
        teams: searchTeams(query),
        matches: searchMatches(query),
        players: searchPlayers(query)
    };
    
    displaySearchResults(results);
}

// Display Search Results
function displaySearchResults(results) {
    let existingResults = document.getElementById('searchResults');
    
    if (!existingResults) {
        existingResults = document.createElement('div');
        existingResults.id = 'searchResults';
        existingResults.className = 'search-results';
        
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.appendChild(existingResults);
        }
    }
    
    const totalResults = results.teams.length + results.matches.length;
    
    if (totalResults === 0) {
        existingResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron resultados</p>
            </div>
        `;
        return;
    }
    
    let resultsHTML = '<div class="search-results-container">';
    
    if (results.teams.length > 0) {
        resultsHTML += '<div class="search-section">';
        resultsHTML += '<h4><i class="fas fa-shield-alt"></i> Equipos</h4>';
        results.teams.slice(0, 5).forEach(team => {
            resultsHTML += `
                <div class="search-result-item" onclick="goToTeam('${team.id}')">
                    <div class="result-icon"><i class="fas fa-shield-alt"></i></div>
                    <div class="result-info">
                        <span class="result-title">${team.name}</span>
                        <span class="result-subtitle">${team.nickname} - ${team.city}</span>
                    </div>
                </div>
            `;
        });
        resultsHTML += '</div>';
    }
    
    if (results.matches.length > 0) {
        resultsHTML += '<div class="search-section">';
        resultsHTML += '<h4><i class="fas fa-futbol"></i> Partidos</h4>';
        results.matches.slice(0, 5).forEach(match => {
            resultsHTML += `
                <div class="search-result-item">
                    <div class="result-icon"><i class="fas fa-futbol"></i></div>
                    <div class="result-info">
                        <span class="result-title">${match.homeTeam} vs ${match.awayTeam}</span>
                        <span class="result-subtitle">${formatDate(match.date)}</span>
                    </div>
                </div>
            `;
        });
        resultsHTML += '</div>';
    }
    
    resultsHTML += '</div>';
    existingResults.innerHTML = resultsHTML;
    
    // Add search results styles
    if (!document.getElementById('search-results-styles')) {
        addSearchResultsStyles();
    }
}

// Hide Search Results
function hideSearchResults() {
    const existingResults = document.getElementById('searchResults');
    if (existingResults) {
        existingResults.innerHTML = '';
    }
}

// Go to Team
function goToTeam(teamId) {
    window.location.href = `team-profile.html?team=${teamId}`;
}

// Add Search Results Styles
function addSearchResultsStyles() {
    const style = document.createElement('style');
    style.id = 'search-results-styles';
    style.textContent = `
        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .search-results-container {
            padding: 15px;
        }
        
        .search-section {
            margin-bottom: 15px;
        }
        
        .search-section h4 {
            color: #ff9933;
            font-size: 0.9rem;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .search-result-item {
            display: flex;
            align-items: center;
            padding: 8px;
            cursor: pointer;
            border-radius: 5px;
            transition: all 0.2s ease;
            gap: 10px;
        }
        
        .search-result-item:hover {
            background: rgba(255, 153, 51, 0.1);
        }
        
        .result-icon {
            width: 30px;
            height: 30px;
            background: rgba(255, 153, 51, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ff9933;
            font-size: 0.8rem;
        }
        
        .result-info {
            flex: 1;
        }
        
        .result-title {
            display: block;
            color: #333;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .result-subtitle {
            display: block;
            color: #666;
            font-size: 0.8rem;
        }
        
        .search-no-results {
            text-align: center;
            padding: 30px;
            color: #666;
        }
        
        .search-no-results i {
            font-size: 2rem;
            color: #ccc;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
}

function searchMatches(query) {
    return fixturesData.filter(match => 
        match.homeTeam.toLowerCase().includes(query.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(query.toLowerCase())
    );
}

function searchPlayers(query) {
    // This would search through player data when available
    return [];
}

// Advanced Filter System
function setupFilterSystem() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            const filterValue = e.target.dataset.value;
            applyFilter(filterType, filterValue);
        });
    });
}

function applyFilter(type, value) {
    let filteredData;
    
    switch(type) {
        case 'region':
            filteredData = filterTeamsByRegion(value);
            break;
        case 'status':
            filteredData = filterMatchesByStatus(value);
            break;
        default:
            return;
    }
    
    updateDisplayedData(filteredData, type);
}

// Enhanced Team Comparison
function compareTeams(team1Id, team2Id) {
    const team1 = standingsData.find(t => t.id === team1Id || t.name === team1Id);
    const team2 = standingsData.find(t => t.id === team2Id || t.name === team2Id);
    
    if (!team1 || !team2) return null;
    
    return {
        team1: team1,
        team2: team2,
        comparison: {
            pointsDiff: team1.points - team2.points,
            winsDiff: team1.wins - team2.wins,
            goalsDiff: (team1.goalsFor - team1.goalsAgainst) - (team2.goalsFor - team2.goalsAgainst),
            positionDiff: team2.position - team1.position
        }
    };
}

// Setup Team Comparison
function setupTeamComparison() {
    const team1Select = document.getElementById('team1Select');
    const team2Select = document.getElementById('team2Select');
    const compareBtn = document.getElementById('compareBtn');
    const comparisonResults = document.getElementById('comparisonResults');
    
    if (!team1Select || !team2Select || !compareBtn) return;
    
    // Populate team selectors
    populateTeamSelectors();
    
    compareBtn.addEventListener('click', () => {
        const team1 = team1Select.value;
        const team2 = team2Select.value;
        
        if (team1 && team2 && team1 !== team2) {
            const comparison = compareTeams(team1, team2);
            if (comparison && comparisonResults) {
                displayComparisonResults(comparison, comparisonResults);
            }
        } else {
            showErrorMessage('Por favor selecciona dos equipos diferentes');
        }
    });
}

// Populate Team Selectors
function populateTeamSelectors() {
    const team1Select = document.getElementById('team1Select');
    const team2Select = document.getElementById('team2Select');
    
    if (!team1Select || !team2Select || !standingsData.length) return;
    
    standingsData.forEach(team => {
        const option1 = document.createElement('option');
        option1.value = team.name;
        option1.textContent = team.name;
        team1Select.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = team.name;
        option2.textContent = team.name;
        team2Select.appendChild(option2);
    });
}

// Display Comparison Results
function displayComparisonResults(comparison, container) {
    const { team1, team2, comparison: stats } = comparison;
    
    container.innerHTML = `
        <div class="comparison-result">
            <div class="team-comparison-card">
                <div class="team-comparison-header">
                    <h3>Comparación de Equipos</h3>
                    <button class="close-comparison" onclick="this.parentElement.parentElement.parentElement.innerHTML = ''">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="teams-comparison">
                    <div class="team-comparison-side">
                        <div class="team-logo-comparison">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h4>${team1.name}</h4>
                        <div class="team-stats">
                            <div class="stat-item">
                                <span class="stat-label">Posición</span>
                                <span class="stat-value ${stats.positionDiff > 0 ? 'better' : stats.positionDiff < 0 ? 'worse' : 'equal'}">${team1.position}°</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Puntos</span>
                                <span class="stat-value ${stats.pointsDiff > 0 ? 'better' : stats.pointsDiff < 0 ? 'worse' : 'equal'}">${team1.points}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Victorias</span>
                                <span class="stat-value ${stats.winsDiff > 0 ? 'better' : stats.winsDiff < 0 ? 'worse' : 'equal'}">${team1.wins}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Dif. Goles</span>
                                <span class="stat-value ${stats.goalsDiff > 0 ? 'better' : stats.goalsDiff < 0 ? 'worse' : 'equal'}">${team1.goalsFor - team1.goalsAgainst > 0 ? '+' : ''}${team1.goalsFor - team1.goalsAgainst}</span>
                            </div>
                        </div>
                    </div>
                    <div class="vs-comparison">
                        <div class="vs-circle">
                            <span>VS</span>
                        </div>
                        <div class="comparison-summary">
                            ${stats.pointsDiff > 0 ? 
                                `<p><i class="fas fa-trophy text-success"></i> ${team1.name} está ${Math.abs(stats.pointsDiff)} puntos arriba</p>` :
                                stats.pointsDiff < 0 ?
                                `<p><i class="fas fa-trophy text-success"></i> ${team2.name} está ${Math.abs(stats.pointsDiff)} puntos arriba</p>` :
                                '<p><i class="fas fa-equals"></i> Empatados en puntos</p>'
                            }
                        </div>
                    </div>
                    <div class="team-comparison-side">
                        <div class="team-logo-comparison">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h4>${team2.name}</h4>
                        <div class="team-stats">
                            <div class="stat-item">
                                <span class="stat-label">Posición</span>
                                <span class="stat-value ${stats.positionDiff < 0 ? 'better' : stats.positionDiff > 0 ? 'worse' : 'equal'}">${team2.position}°</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Puntos</span>
                                <span class="stat-value ${stats.pointsDiff < 0 ? 'better' : stats.pointsDiff > 0 ? 'worse' : 'equal'}">${team2.points}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Victorias</span>
                                <span class="stat-value ${stats.winsDiff < 0 ? 'better' : stats.winsDiff > 0 ? 'worse' : 'equal'}">${team2.wins}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Dif. Goles</span>
                                <span class="stat-value ${stats.goalsDiff < 0 ? 'better' : stats.goalsDiff > 0 ? 'worse' : 'equal'}">${team2.goalsFor - team2.goalsAgainst > 0 ? '+' : ''}${team2.goalsFor - team2.goalsAgainst}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for comparison
    if (!document.getElementById('comparison-styles')) {
        addComparisonStyles();
    }
}

// Add Comparison Styles
function addComparisonStyles() {
    const style = document.createElement('style');
    style.id = 'comparison-styles';
    style.textContent = `
        .comparison-result {
            margin-top: 20px;
            animation: slideDown 0.3s ease-out;
        }
        
        .team-comparison-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: 2px solid #ff9933;
        }
        
        .team-comparison-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ff9933;
        }
        
        .team-comparison-header h3 {
            color: #ff9933;
            font-size: 1.3rem;
            font-weight: 700;
        }
        
        .close-comparison {
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .close-comparison:hover {
            background: #c82333;
            transform: scale(1.1);
        }
        
        .teams-comparison {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 20px;
            align-items: center;
        }
        
        .team-comparison-side {
            text-align: center;
        }
        
        .team-logo-comparison {
            width: 60px;
            height: 60px;
            background: rgba(255, 153, 51, 0.1);
            border-radius: 50%;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: #ff9933;
        }
        
        .team-comparison-side h4 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        
        .team-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
            font-weight: 500;
        }
        
        .stat-value {
            font-weight: 700;
            font-size: 0.9rem;
        }
        
        .stat-value.better {
            color: #28a745;
        }
        
        .stat-value.worse {
            color: #dc3545;
        }
        
        .stat-value.equal {
            color: #6c757d;
        }
        
        .vs-comparison {
            text-align: center;
        }
        
        .vs-circle {
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #ff9933, #ffaa44);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 1.2rem;
            margin: 0 auto 10px;
        }
        
        .comparison-summary {
            font-size: 0.9rem;
            color: #666;
        }
        
        .text-success {
            color: #28a745;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            .teams-comparison {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .vs-comparison {
                order: -1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Setup Interactive Statistics
function setupInteractiveStats() {
    // Animate counters when in view
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
    
    // Add click-to-refresh functionality
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
                const counter = card.querySelector('[data-count]');
                if (counter) {
                    animateSingleCounter(counter);
                }
            }, 150);
        });
        
        // Add tooltip
        card.setAttribute('title', 'Haz clic para actualizar');
    });
}

// Animate Single Counter
function animateSingleCounter(counter) {
    const target = parseInt(counter.getAttribute('data-count'));
    const duration = 1000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        counter.textContent = Math.floor(current);
        
        if (current >= target) {
            counter.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// Enhanced Filter System
function applyAdvancedFilter(type, value) {
    let filteredData;
    
    switch(type) {
        case 'region':
            filteredData = filterTeamsByRegion(value);
            updateTeamsDisplay(filteredData);
            break;
        case 'status':
            filteredData = filterMatchesByStatus(value);
            updateMatchesDisplay(filteredData);
            break;
        case 'team-performance':
            filteredData = filterTeamsByPerformance(value);
            updateTeamsDisplay(filteredData);
            break;
        default:
            return;
    }
    
    // Update filter buttons
    updateFilterButtons(type, value);
}

// Filter Teams by Performance
function filterTeamsByPerformance(performance) {
    if (!performance || performance === 'all') return standingsData;
    
    switch(performance) {
        case 'top':
            return standingsData.slice(0, 6);
        case 'middle':
            return standingsData.slice(6, 12);
        case 'bottom':
            return standingsData.slice(12);
        default:
            return standingsData;
    }
}

// Update Teams Display
function updateTeamsDisplay(teams) {
    const container = document.getElementById('topTeamsPreview');
    if (!container) return;
    
    container.innerHTML = teams.slice(0, 3).map((team, index) => `
        <div class="team-preview-card stagger-item" style="animation-delay: ${index * 0.2}s">
            <div class="team-position">${team.position}° Lugar</div>
            <div class="team-name">${team.name}</div>
            <div class="team-points">${team.points} pts</div>
            <div class="team-stats">
                <span>PJ: ${team.played}</span>
                <span>G: ${team.wins}</span>
                <span>E: ${team.draws}</span>
                <span>P: ${team.losses}</span>
            </div>
            <button class="team-details-btn" onclick="goToTeam('${team.id}')">
                <i class="fas fa-eye"></i> Ver Detalles
            </button>
        </div>
    `).join('');
}

// Update Filter Buttons
function updateFilterButtons(type, value) {
    const filterButtons = document.querySelectorAll(`[data-filter="${type}"]`);
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
}

// Export functions for use in other files
window.ultraGolApp = {
    teamsData: () => teamsData,
    standingsData: () => standingsData,
    fixturesData: () => fixturesData,
    formatDate,
    formatTime,
    showErrorMessage,
    showSuccessMessage,
    showLoading,
    hideLoading,
    saveToLocalStorage,
    getFromLocalStorage,
    searchTeams,
    filterTeamsByRegion,
    applyTeamTheme,
    compareTeams,
    performGlobalSearch,
    setupCarousel,
    setupTeamComparison,
    displaySearchResults,
    goToTeam,
    applyAdvancedFilter
};
