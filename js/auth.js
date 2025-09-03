// Authentication System for Liga MX UltraGol - REAL MODE
console.log('Real-time authentication system loading...');

// Current user state
export let currentUser = null;

// Initialize auth system
export function initAuth() {
    console.log('Real-time updates system initialized (static mode)');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('⚠️ Firebase not loaded, using static mode');
        showAuthInterface();
        return;
    }

    // Real Firebase auth state observer
    firebase.auth().onAuthStateChanged(async (user) => {
        currentUser = user;
        if (user) {
            console.log('✅ User authenticated:', user.displayName || user.email);
            await createOrUpdateUserProfile(user);
            showUserInterface();
            loadUserProfile();
        } else {
            console.log('❌ User not authenticated');
            showAuthInterface();
        }
        updateNavbarAuth();
    });
}

// Register new user with Firebase
export async function registerUser(email, password, displayName, favoriteTeam) {
    try {
        showLoading('Creando cuenta...');
        
        // Use global Firebase functions from firebase-config.js
        const result = await window.signUpWithEmail(email, password, displayName, favoriteTeam);
        
        if (result.success) {
            hideLoading();
            showSuccessMessage('¡Cuenta creada exitosamente!');
            closeModal('authModal');
            return result.user;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Login user with Firebase
export async function loginUser(email, password) {
    try {
        showLoading('Iniciando sesión...');
        
        // Use global Firebase functions from firebase-config.js
        const result = await window.signInWithEmail(email, password);
        
        if (result.success) {
            hideLoading();
            showSuccessMessage('¡Bienvenido de vuelta!');
            closeModal('authModal');
            return result.user;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Google Sign In
export async function signInWithGoogle() {
    try {
        showLoading('Conectando con Google...');
        
        // Use global Firebase functions from firebase-config.js
        const result = await window.signInWithGoogle();
        
        if (result.success) {
            hideLoading();
            showSuccessMessage('¡Conectado con Google exitosamente!');
            closeModal('authModal');
            return result.user;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Logout user
export async function logoutUser() {
    try {
        showLoading('Cerrando sesión...');
        
        // Use global Firebase functions from firebase-config.js
        const result = await window.signOutUser();
        
        if (result.success) {
            hideLoading();
            showSuccessMessage('Sesión cerrada correctamente');
            currentUser = null;
            showAuthInterface();
            updateNavbarAuth();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        showLoading('Enviando email de recuperación...');
        
        if (typeof firebase === 'undefined' || !firebase.auth) {
            throw new Error('Firebase no está disponible');
        }

        await firebase.auth().sendPasswordResetEmail(email);
        
        hideLoading();
        showSuccessMessage('Email de recuperación enviado. Revisa tu bandeja de entrada.');
        closeModal('authModal');
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Create or update user profile in Firestore
async function createOrUpdateUserProfile(user) {
    if (!window.db || !user) return;
    
    try {
        const userRef = window.db.collection('users').doc(user.uid);
        const snapshot = await userRef.get();
        
        if (!snapshot.exists) {
            // Create new user profile
            await userRef.set({
                displayName: user.displayName || 'Usuario',
                email: user.email,
                photoURL: user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                level: 1,
                points: 0,
                favoriteTeam: '',
                badges: [],
                preferences: {
                    notifications: true,
                    theme: 'auto',
                    language: 'es'
                },
                stats: {
                    predictionsCorrect: 0,
                    predictionsTotal: 0,
                    commentsCount: 0,
                    articlesRead: 0
                }
            });
            console.log('✅ User profile created');
        } else {
            // Update existing profile
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: user.displayName || snapshot.data().displayName
            });
            console.log('✅ User profile updated');
        }
    } catch (error) {
        console.error('❌ Error managing user profile:', error);
    }
}

// Load user profile data
async function loadUserProfile() {
    if (!window.db || !currentUser) return;
    
    try {
        const userDoc = await window.db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Update UI with user data
            const userLevel = document.getElementById('userLevel');
            const userPoints = document.getElementById('userPoints');
            const userDisplayName = document.getElementById('userDisplayName');
            
            if (userLevel) userLevel.textContent = userData.level || 1;
            if (userPoints) userPoints.textContent = userData.points || 0;
            if (userDisplayName) userDisplayName.textContent = userData.displayName || 'Usuario';
            
            console.log('✅ User profile loaded');
        }
    } catch (error) {
        console.error('❌ Error loading user profile:', error);
    }
}

// UI Functions
function showUserInterface() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
}

function showAuthInterface() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

function updateNavbarAuth() {
    // Update navigation based on auth state
    const navLinks = document.querySelectorAll('.nav-link');
    if (currentUser) {
        // User is logged in - enable all features
        navLinks.forEach(link => {
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
        });
    }
}

// Error handling
function handleAuthError(error) {
    console.error('Authentication error:', error);
    
    let message = 'Error de autenticación';
    
    if (error.code) {
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/user-disabled':
                message = 'Usuario deshabilitado';
                break;
            case 'auth/user-not-found':
                message = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            case 'auth/email-already-in-use':
                message = 'Este email ya está en uso';
                break;
            case 'auth/weak-password':
                message = 'La contraseña debe tener al menos 6 caracteres';
                break;
            case 'auth/network-request-failed':
                message = 'Error de conexión. Verifica tu internet.';
                break;
            case 'auth/unauthorized-domain':
                message = 'Dominio no autorizado para autenticación';
                break;
            default:
                message = error.message || 'Error desconocido';
        }
    }
    
    showErrorMessage(message);
}

// Loading functions
function showLoading(message) {
    const loadingEl = document.getElementById('loadingMessage');
    if (loadingEl) {
        loadingEl.textContent = message;
        loadingEl.style.display = 'block';
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('loadingMessage');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

// Message functions
function showSuccessMessage(message) {
    console.log('✅ Success:', message);
    // Add visual success notification here
}

function showErrorMessage(message) {
    console.error('❌ Error:', message);
    alert(message); // Simple alert for now
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

console.log('✅ Real authentication system loaded');