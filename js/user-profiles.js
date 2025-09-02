// Creative User Profiles System for Liga MX UltraGol
import { db, storage } from './firebase-config.js';
import { getCurrentUser } from './firebase-config.js';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp,
    increment 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Initialize user profiles system
export function initUserProfiles() {
    setupProfileInterface();
    setupAchievementSystem();
    setupPredictionSystem();
}

// Setup profile interface
function setupProfileInterface() {
    addProfileMenuItems();
}

// Add profile menu items to navbar
function addProfileMenuItems() {
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;
    
    // Add profile dropdown
    const profileDropdown = document.createElement('div');
    profileDropdown.className = 'profile-dropdown';
    profileDropdown.innerHTML = `
        <div class="profile-info">
            <div class="user-avatar" id="userAvatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
                <span class="user-name" id="userDisplayName">Usuario</span>
                <div class="user-stats">
                    <span class="user-level">Nv. <span id="userLevel">1</span></span>
                    <span class="user-points"><i class="fas fa-star"></i> <span id="userPoints">0</span></span>
                </div>
            </div>
        </div>
        <div class="profile-menu">
            <a href="#" onclick="openProfile()" class="profile-menu-item">
                <i class="fas fa-user"></i> Mi Perfil
            </a>
            <a href="#" onclick="openPredictions()" class="profile-menu-item">
                <i class="fas fa-crystal-ball"></i> Predicciones
            </a>
            <a href="#" onclick="openAchievements()" class="profile-menu-item">
                <i class="fas fa-trophy"></i> Logros
            </a>
            <a href="#" onclick="openStats()" class="profile-menu-item">
                <i class="fas fa-chart-bar"></i> Estadísticas
            </a>
            <hr>
            <a href="#" onclick="logoutUser()" class="profile-menu-item logout">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </a>
        </div>
    `;
    
    userMenu.appendChild(profileDropdown);
}

// Open user profile modal
window.openProfile = async function() {
    const user = getCurrentUser();
    if (!user) return;
    
    const profileData = await loadUserProfile(user.uid);
    createProfileModal(profileData);
};

// Create profile modal
function createProfileModal(profileData) {
    const modal = document.createElement('div');
    modal.id = 'profileModal';
    modal.className = 'modal profile-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Mi Perfil</h2>
                <button class="close-modal" onclick="closeModal('profileModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="profile-container">
                    <div class="profile-left">
                        <div class="profile-avatar-section">
                            <div class="profile-avatar-container">
                                <img id="profileAvatarImg" src="${profileData.profilePicture || '/assets/default-avatar.png'}" alt="Avatar">
                                <button class="change-avatar-btn" onclick="changeAvatar()">
                                    <i class="fas fa-camera"></i>
                                </button>
                            </div>
                            <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                            
                            <div class="profile-level-badge">
                                <div class="level-circle">
                                    <span class="level-number">${profileData.level || 1}</span>
                                </div>
                                <div class="level-info">
                                    <span class="level-title">Nivel ${profileData.level || 1}</span>
                                    <div class="xp-bar">
                                        <div class="xp-fill" style="width: ${calculateXPPercentage(profileData.experience || 0)}%"></div>
                                    </div>
                                    <span class="xp-text">${profileData.experience || 0} XP</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-stats">
                            <h3>Estadísticas</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <i class="fas fa-star"></i>
                                    <span class="stat-value">${profileData.points || 0}</span>
                                    <span class="stat-label">Puntos</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-crystal-ball"></i>
                                    <span class="stat-value">${profileData.stats?.correctPredictions || 0}</span>
                                    <span class="stat-label">Predicciones Correctas</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-link"></i>
                                    <span class="stat-value">${profileData.stats?.linksShared || 0}</span>
                                    <span class="stat-label">Links Compartidos</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-trophy"></i>
                                    <span class="stat-value">${profileData.badges?.length || 0}</span>
                                    <span class="stat-label">Logros</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-right">
                        <form id="profileForm">
                            <div class="form-group">
                                <label>Nombre de Usuario</label>
                                <input type="text" id="displayName" value="${profileData.displayName || ''}" maxlength="30">
                            </div>
                            
                            <div class="form-group">
                                <label>Equipo Favorito</label>
                                <select id="favoriteTeam">
                                    <option value="">Selecciona tu equipo</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Biografía</label>
                                <textarea id="bio" placeholder="Cuéntanos sobre ti..." maxlength="200">${profileData.bio || ''}</textarea>
                                <span class="char-count"><span id="bioCount">${(profileData.bio || '').length}</span>/200</span>
                            </div>
                            
                            <div class="form-group">
                                <label>Ubicación</label>
                                <input type="text" id="location" placeholder="Ciudad, Estado" value="${profileData.location || ''}" maxlength="50">
                            </div>
                            
                            <div class="form-group">
                                <label>Posición Favorita</label>
                                <select id="favoritePosition">
                                    <option value="">Selecciona posición</option>
                                    <option value="Portero">Portero</option>
                                    <option value="Defensa">Defensa</option>
                                    <option value="Mediocampista">Mediocampista</option>
                                    <option value="Delantero">Delantero</option>
                                </select>
                            </div>
                            
                            <div class="profile-preferences">
                                <h3>Preferencias</h3>
                                <div class="preference-group">
                                    <label class="switch-label">
                                        <input type="checkbox" id="publicProfile" ${profileData.publicProfile !== false ? 'checked' : ''}>
                                        <span class="switch-slider"></span>
                                        Perfil Público
                                    </label>
                                </div>
                                <div class="preference-group">
                                    <label class="switch-label">
                                        <input type="checkbox" id="showStats" ${profileData.showStats !== false ? 'checked' : ''}>
                                        <span class="switch-slider"></span>
                                        Mostrar Estadísticas
                                    </label>
                                </div>
                                <div class="preference-group">
                                    <label class="switch-label">
                                        <input type="checkbox" id="emailNotifications" ${profileData.emailNotifications !== false ? 'checked' : ''}>
                                        <span class="switch-slider"></span>
                                        Notificaciones por Email
                                    </label>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Load teams for selection
    loadTeamsForProfile();
    
    // Setup form handlers
    setupProfileForm();
    
    // Set favorite team if exists
    if (profileData.favoriteTeam) {
        setTimeout(() => {
            const favoriteTeamSelect = document.getElementById('favoriteTeam');
            if (favoriteTeamSelect) {
                favoriteTeamSelect.value = profileData.favoriteTeam;
            }
        }, 500);
    }
}

// Setup profile form
function setupProfileForm() {
    const form = document.getElementById('profileForm');
    const bioTextarea = document.getElementById('bio');
    const bioCount = document.getElementById('bioCount');
    
    // Bio character counter
    if (bioTextarea && bioCount) {
        bioTextarea.addEventListener('input', () => {
            bioCount.textContent = bioTextarea.value.length;
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', saveProfile);
    }
    
    // Avatar upload
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
}

// Change avatar
window.changeAvatar = function() {
    document.getElementById('avatarUpload').click();
};

// Handle avatar upload
async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        showLoading('Subiendo avatar...');
        
        // Upload to Firebase Storage
        const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Update profile picture in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            profilePicture: downloadURL,
            updatedAt: serverTimestamp()
        });
        
        // Update UI
        document.getElementById('profileAvatarImg').src = downloadURL;
        
        hideLoading();
        showSuccessMessage('Avatar actualizado correctamente');
        
    } catch (error) {
        hideLoading();
        console.error('Error uploading avatar:', error);
        showErrorMessage('Error al subir el avatar');
    }
}

// Save profile
async function saveProfile(e) {
    e.preventDefault();
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        showLoading('Guardando perfil...');
        
        const profileData = {
            displayName: document.getElementById('displayName').value,
            favoriteTeam: document.getElementById('favoriteTeam').value,
            bio: document.getElementById('bio').value,
            location: document.getElementById('location').value,
            favoritePosition: document.getElementById('favoritePosition').value,
            publicProfile: document.getElementById('publicProfile').checked,
            showStats: document.getElementById('showStats').checked,
            emailNotifications: document.getElementById('emailNotifications').checked,
            updatedAt: serverTimestamp()
        };
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, profileData);
        
        // Check for completion achievement
        await checkProfileCompletionAchievement(user.uid);
        
        hideLoading();
        showSuccessMessage('Perfil actualizado correctamente');
        
    } catch (error) {
        hideLoading();
        console.error('Error saving profile:', error);
        showErrorMessage('Error al guardar el perfil');
    }
}

// Load user profile data
async function loadUserProfile(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return userSnap.data();
        }
        
        return {};
    } catch (error) {
        console.error('Error loading user profile:', error);
        return {};
    }
}

// Load teams for profile selection
async function loadTeamsForProfile() {
    try {
        const response = await fetch('/data/teams.json');
        const teams = await response.json();
        
        const favoriteTeamSelect = document.getElementById('favoriteTeam');
        if (favoriteTeamSelect) {
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                favoriteTeamSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading teams:', error);
    }
}

// Calculate XP percentage for level progress
function calculateXPPercentage(experience) {
    const level = Math.floor(experience / 100) + 1;
    const currentLevelXP = experience % 100;
    return currentLevelXP;
}

// Check profile completion achievement
async function checkProfileCompletionAchievement(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            
            const isComplete = data.displayName && 
                              data.favoriteTeam && 
                              data.bio && 
                              data.location;
            
            if (isComplete && !data.achievements?.profileComplete) {
                await updateDoc(userRef, {
                    'achievements.profileComplete': true,
                    points: increment(25),
                    experience: increment(50)
                });
                
                await unlockAchievement(userId, 'profile_master', 'Maestro del Perfil', 'Completa tu perfil al 100%');
                showSuccessMessage('¡Logro desbloqueado: Maestro del Perfil! +25 puntos');
            }
        }
    } catch (error) {
        console.error('Error checking profile achievement:', error);
    }
}

// Unlock achievement
async function unlockAchievement(userId, achievementId, title, description) {
    try {
        await addDoc(collection(db, 'achievements'), {
            userId,
            achievementId,
            title,
            description,
            unlockedAt: serverTimestamp()
        });
        
        // Update user's badges array
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const badges = userSnap.data().badges || [];
            badges.push(achievementId);
            
            await updateDoc(userRef, { badges });
        }
        
    } catch (error) {
        console.error('Error unlocking achievement:', error);
    }
}

// Open predictions modal
window.openPredictions = function() {
    createPredictionsModal();
};

// Create predictions modal
function createPredictionsModal() {
    const modal = document.createElement('div');
    modal.id = 'predictionsModal';
    modal.className = 'modal predictions-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-crystal-ball"></i> Mis Predicciones</h2>
                <button class="close-modal" onclick="closeModal('predictionsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="predictions-tabs">
                    <button class="tab-btn active" onclick="showPredictionsTab('upcoming')">Próximos Partidos</button>
                    <button class="tab-btn" onclick="showPredictionsTab('my-predictions')">Mis Predicciones</button>
                    <button class="tab-btn" onclick="showPredictionsTab('results')">Resultados</button>
                </div>
                
                <div class="predictions-content" id="predictionsContent">
                    <div class="loading">Cargando predicciones...</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Load initial tab
    showPredictionsTab('upcoming');
}

// Show predictions tab
window.showPredictionsTab = function(tab) {
    const tabs = document.querySelectorAll('.predictions-tabs .tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(tab) {
        case 'upcoming':
            loadUpcomingMatches();
            break;
        case 'my-predictions':
            loadUserPredictions();
            break;
        case 'results':
            loadPredictionResults();
            break;
    }
};

// Load upcoming matches for predictions
async function loadUpcomingMatches() {
    try {
        const response = await fetch('/data/fixtures.json');
        const fixtures = await response.json();
        
        const upcomingMatches = fixtures.filter(match => 
            match.status === 'scheduled'
        ).slice(0, 10);
        
        const content = document.getElementById('predictionsContent');
        content.innerHTML = `
            <div class="upcoming-matches">
                ${upcomingMatches.map(match => `
                    <div class="prediction-match-card">
                        <div class="match-info">
                            <div class="teams">
                                <span class="home-team">${match.homeTeam}</span>
                                <span class="vs">VS</span>
                                <span class="away-team">${match.awayTeam}</span>
                            </div>
                            <div class="match-date">${formatMatchDate(match.date)}</div>
                        </div>
                        
                        <div class="prediction-form">
                            <h4>Haz tu predicción:</h4>
                            <div class="prediction-options">
                                <button class="prediction-btn" data-prediction="home" onclick="makePrediction('${match.id}', 'home', '${match.homeTeam}')">
                                    ${match.homeTeam}
                                </button>
                                <button class="prediction-btn" data-prediction="draw" onclick="makePrediction('${match.id}', 'draw', 'Empate')">
                                    Empate
                                </button>
                                <button class="prediction-btn" data-prediction="away" onclick="makePrediction('${match.id}', 'away', '${match.awayTeam}')">
                                    ${match.awayTeam}
                                </button>
                            </div>
                            
                            <div class="score-prediction">
                                <label>Resultado exacto (bonus):</label>
                                <div class="score-inputs">
                                    <input type="number" min="0" max="10" placeholder="0" id="homeScore_${match.id}">
                                    <span>-</span>
                                    <input type="number" min="0" max="10" placeholder="0" id="awayScore_${match.id}">
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading upcoming matches:', error);
        document.getElementById('predictionsContent').innerHTML = '<div class="error">Error al cargar los partidos</div>';
    }
}

// Make prediction
window.makePrediction = async function(matchId, prediction, teamName) {
    const user = getCurrentUser();
    if (!user) {
        showAuthRequired();
        return;
    }
    
    const homeScore = document.getElementById(`homeScore_${matchId}`)?.value || null;
    const awayScore = document.getElementById(`awayScore_${matchId}`)?.value || null;
    
    try {
        showLoading('Guardando predicción...');
        
        await addDoc(collection(db, 'predictions'), {
            userId: user.uid,
            userDisplayName: user.displayName || 'Usuario',
            matchId,
            prediction,
            predictedResult: teamName,
            homeScore: homeScore ? parseInt(homeScore) : null,
            awayScore: awayScore ? parseInt(awayScore) : null,
            points: 0,
            correct: null,
            createdAt: serverTimestamp()
        });
        
        // Update user stats
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            'stats.totalPredictions': increment(1)
        });
        
        // Check first prediction achievement
        await checkFirstPredictionAchievement(user.uid);
        
        hideLoading();
        showSuccessMessage('¡Predicción guardada correctamente!');
        
        // Disable prediction buttons for this match
        const matchCard = event.target.closest('.prediction-match-card');
        const predictionBtns = matchCard.querySelectorAll('.prediction-btn');
        predictionBtns.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.prediction === prediction) {
                btn.classList.add('selected');
            }
        });
        
    } catch (error) {
        hideLoading();
        console.error('Error making prediction:', error);
        showErrorMessage('Error al guardar la predicción');
    }
};

// Check first prediction achievement
async function checkFirstPredictionAchievement(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            
            if (!data.achievements?.firstPrediction) {
                await updateDoc(userRef, {
                    'achievements.firstPrediction': true,
                    points: increment(15),
                    experience: increment(30)
                });
                
                await unlockAchievement(userId, 'first_prediction', 'Primer Visionario', 'Realiza tu primera predicción');
                showSuccessMessage('¡Logro desbloqueado: Primer Visionario! +15 puntos');
            }
        }
    } catch (error) {
        console.error('Error checking first prediction achievement:', error);
    }
}

// Load user predictions
async function loadUserPredictions() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const predictionsQuery = query(
            collection(db, 'predictions'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );
        
        const querySnapshot = await getDocs(predictionsQuery);
        const predictions = [];
        
        querySnapshot.forEach((doc) => {
            predictions.push({ id: doc.id, ...doc.data() });
        });
        
        const content = document.getElementById('predictionsContent');
        if (predictions.length === 0) {
            content.innerHTML = `
                <div class="no-predictions">
                    <i class="fas fa-crystal-ball"></i>
                    <p>No tienes predicciones aún</p>
                    <p class="small">Haz clic en "Próximos Partidos" para comenzar</p>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div class="user-predictions">
                ${predictions.map(pred => `
                    <div class="prediction-item ${pred.correct === true ? 'correct' : pred.correct === false ? 'incorrect' : 'pending'}">
                        <div class="prediction-match">
                            <span class="match-id">${pred.matchId}</span>
                            <span class="prediction-result">Predicción: ${pred.predictedResult}</span>
                        </div>
                        <div class="prediction-status">
                            ${pred.correct === null ? 
                                '<span class="pending">Pendiente</span>' :
                                pred.correct ? 
                                    `<span class="correct"><i class="fas fa-check"></i> +${pred.points} puntos</span>` :
                                    '<span class="incorrect"><i class="fas fa-times"></i> Sin puntos</span>'
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading user predictions:', error);
        document.getElementById('predictionsContent').innerHTML = '<div class="error">Error al cargar las predicciones</div>';
    }
}

// Open achievements modal
window.openAchievements = function() {
    createAchievementsModal();
};

// Create achievements modal
function createAchievementsModal() {
    const modal = document.createElement('div');
    modal.id = 'achievementsModal';
    modal.className = 'modal achievements-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-trophy"></i> Mis Logros</h2>
                <button class="close-modal" onclick="closeModal('achievementsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="achievements-content" id="achievementsContent">
                    <div class="loading">Cargando logros...</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    loadUserAchievements();
}

// Load user achievements
async function loadUserAchievements() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        // Load unlocked achievements
        const achievementsQuery = query(
            collection(db, 'achievements'),
            where('userId', '==', user.uid),
            orderBy('unlockedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(achievementsQuery);
        const unlockedAchievements = [];
        
        querySnapshot.forEach((doc) => {
            unlockedAchievements.push({ id: doc.id, ...doc.data() });
        });
        
        // Available achievements
        const availableAchievements = [
            { id: 'first_login', title: 'Primer Paso', description: 'Crear tu cuenta', icon: 'fa-user-plus', points: 5 },
            { id: 'profile_master', title: 'Maestro del Perfil', description: 'Completar tu perfil', icon: 'fa-id-card', points: 25 },
            { id: 'first_prediction', title: 'Primer Visionario', description: 'Realizar tu primera predicción', icon: 'fa-crystal-ball', points: 15 },
            { id: 'first_shared_link', title: 'Compartir es Vivir', description: 'Compartir tu primer link', icon: 'fa-link', points: 10 },
            { id: 'prediction_master', title: 'Maestro Predictor', description: '10 predicciones correctas', icon: 'fa-trophy', points: 50 },
            { id: 'link_master', title: 'Maestro de Links', description: 'Compartir 25 links', icon: 'fa-share', points: 75 },
            { id: 'social_butterfly', title: 'Mariposa Social', description: '50 comentarios publicados', icon: 'fa-comments', points: 40 }
        ];
        
        const content = document.getElementById('achievementsContent');
        content.innerHTML = `
            <div class="achievements-grid">
                ${availableAchievements.map(achievement => {
                    const isUnlocked = unlockedAchievements.find(a => a.achievementId === achievement.id);
                    return `
                        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                            <div class="achievement-icon">
                                <i class="fas ${achievement.icon}"></i>
                            </div>
                            <div class="achievement-info">
                                <h3>${achievement.title}</h3>
                                <p>${achievement.description}</p>
                                <div class="achievement-points">
                                    <i class="fas fa-star"></i>
                                    ${achievement.points} puntos
                                </div>
                            </div>
                            ${isUnlocked ? 
                                `<div class="achievement-status unlocked">
                                    <i class="fas fa-check"></i>
                                    <span>Desbloqueado</span>
                                </div>` :
                                `<div class="achievement-status locked">
                                    <i class="fas fa-lock"></i>
                                    <span>Bloqueado</span>
                                </div>`
                            }
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading achievements:', error);
        document.getElementById('achievementsContent').innerHTML = '<div class="error">Error al cargar los logros</div>';
    }
}

// Open stats modal  
window.openStats = function() {
    createStatsModal();
};

// Create stats modal
function createStatsModal() {
    const modal = document.createElement('div');
    modal.id = 'statsModal';
    modal.className = 'modal stats-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-chart-bar"></i> Mis Estadísticas</h2>
                <button class="close-modal" onclick="closeModal('statsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="stats-content" id="statsContent">
                    <div class="loading">Cargando estadísticas...</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    loadUserStats();
}

// Load user statistics
async function loadUserStats() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const profileData = await loadUserProfile(user.uid);
        
        const content = document.getElementById('statsContent');
        content.innerHTML = `
            <div class="stats-overview">
                <div class="stats-summary">
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="summary-info">
                            <span class="summary-value">${profileData.points || 0}</span>
                            <span class="summary-label">Puntos Total</span>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-level-up-alt"></i>
                        </div>
                        <div class="summary-info">
                            <span class="summary-value">${profileData.level || 1}</span>
                            <span class="summary-label">Nivel Actual</span>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="summary-info">
                            <span class="summary-value">${profileData.experience || 0}</span>
                            <span class="summary-label">Experiencia</span>
                        </div>
                    </div>
                </div>
                
                <div class="detailed-stats">
                    <h3>Estadísticas Detalladas</h3>
                    <div class="stats-list">
                        <div class="stat-row">
                            <span class="stat-label"><i class="fas fa-crystal-ball"></i> Predicciones Correctas</span>
                            <span class="stat-value">${profileData.stats?.correctPredictions || 0}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label"><i class="fas fa-bullseye"></i> Total de Predicciones</span>
                            <span class="stat-value">${profileData.stats?.totalPredictions || 0}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label"><i class="fas fa-percentage"></i> Precisión</span>
                            <span class="stat-value">${calculateAccuracy(profileData.stats)}%</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label"><i class="fas fa-link"></i> Links Compartidos</span>
                            <span class="stat-value">${profileData.stats?.linksShared || 0}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label"><i class="fas fa-comments"></i> Comentarios Publicados</span>
                            <span class="stat-value">${profileData.stats?.commentsPosted || 0}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label"><i class="fas fa-trophy"></i> Logros Desbloqueados</span>
                            <span class="stat-value">${profileData.badges?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading user stats:', error);
        document.getElementById('statsContent').innerHTML = '<div class="error">Error al cargar las estadísticas</div>';
    }
}

// Calculate accuracy percentage
function calculateAccuracy(stats) {
    if (!stats || !stats.totalPredictions || stats.totalPredictions === 0) {
        return 0;
    }
    
    return Math.round((stats.correctPredictions / stats.totalPredictions) * 100);
}

// Utility functions
function formatMatchDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
        return `Mañana ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAuthRequired() {
    showErrorMessage('Necesitas iniciar sesión para usar esta función');
}

// Global utility functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function showLoading(message) {
    if (window.showLoading) {
        window.showLoading(message);
    }
}

function hideLoading() {
    if (window.hideLoading) {
        window.hideLoading();
    }
}

function showSuccessMessage(message) {
    if (window.showSuccessMessage) {
        window.showSuccessMessage(message);
    }
}

function showErrorMessage(message) {
    if (window.showErrorMessage) {
        window.showErrorMessage(message);
    }
}