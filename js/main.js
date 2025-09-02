// Main JavaScript file for UltraGol website by L3HO
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Global variables
let teamsData = [];
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
    if (hamburger) {
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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
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
    if (!query) return;
    
    const results = {
        teams: searchTeams(query),
        matches: searchMatches(query),
        players: searchPlayers(query)
    };
    
    displaySearchResults(results);
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
    const team1 = standingsData.find(t => t.id === team1Id);
    const team2 = standingsData.find(t => t.id === team2Id);
    
    if (!team1 || !team2) return null;
    
    return {
        team1: team1,
        team2: team2,
        comparison: {
            pointsDiff: team1.points - team2.points,
            winsDiff: team1.wins - team2.wins,
            goalsDiff: (team1.goalsFor - team1.goalsAgainst) - (team2.goalsFor - team2.goalsAgainst)
        }
    };
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
    setupCarousel
};
