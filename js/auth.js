// Authentication System for Liga MX UltraGol - Demo Mode
import { auth, db } from './firebase-config.js';

// Demo mode - create mock functions for Firebase auth
const DEMO_MODE = true;

// Mock Firebase auth functions for demo
const createUserWithEmailAndPassword = DEMO_MODE ? 
    (auth, email, password) => Promise.resolve({ user: { uid: 'demo-user', email, displayName: null } }) :
    null;

const signInWithEmailAndPassword = DEMO_MODE ? 
    (auth, email, password) => Promise.resolve({ user: { uid: 'demo-user', email, displayName: 'Usuario Demo' } }) :
    null;

const signOut = DEMO_MODE ? 
    (auth) => Promise.resolve() :
    null;

const sendPasswordResetEmail = DEMO_MODE ? 
    (auth, email) => Promise.resolve() :
    null;

const updateProfile = DEMO_MODE ? 
    (user, profile) => Promise.resolve() :
    null;

const signInWithPopup = DEMO_MODE ? 
    (auth, provider) => Promise.resolve({ user: { uid: 'demo-google-user', email: 'demo@google.com', displayName: 'Usuario Google Demo' } }) :
    null;

// Mock Google provider for demo
const googleProvider = DEMO_MODE ? {} : null;

// Mock Firestore functions for demo
const doc = DEMO_MODE ? 
    (db, collection, id) => ({ collection, id }) :
    null;

const setDoc = DEMO_MODE ? 
    (ref, data) => Promise.resolve() :
    null;

const getDoc = DEMO_MODE ? 
    (ref) => Promise.resolve({ exists: () => false, data: () => null }) :
    null;

const updateDoc = DEMO_MODE ? 
    (ref, data) => Promise.resolve() :
    null;

const serverTimestamp = DEMO_MODE ? 
    () => new Date() :
    null;

// Current user state
export let currentUser = null;

// Initialize auth system
export function initAuth() {
    // Check auth state
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        if (user) {
            // User is signed in
            await createOrUpdateUserProfile(user);
            showUserInterface();
            loadUserProfile();
        } else {
            // User is signed out
            showAuthInterface();
        }
        updateNavbarAuth();
    });
}

// Register new user
export async function registerUser(email, password, displayName, favoriteTeam) {
    try {
        showLoading('Creando cuenta...');
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        await updateProfile(user, { displayName });
        
        // Create user profile in Firestore
        await createUserProfile(user, { favoriteTeam });
        
        hideLoading();
        showSuccessMessage('¡Cuenta creada exitosamente en modo demo!');
        closeModal('authModal');
        
        // In demo mode, simulate login
        if (DEMO_MODE) {
            currentUser = { ...user, displayName: displayName };
            setTimeout(() => {
                showUserInterface();
                updateNavbarAuth();
            }, 500);
        }
        
        return user;
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        showLoading('Iniciando sesión...');
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        hideLoading();
        showSuccessMessage('¡Bienvenido de vuelta en modo demo!');
        closeModal('authModal');
        
        // In demo mode, simulate login
        if (DEMO_MODE) {
            currentUser = { ...user, displayName: user.displayName || 'Usuario Demo' };
            setTimeout(() => {
                showUserInterface();
                updateNavbarAuth();
            }, 500);
        }
        
        return user;
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Google sign in
export async function signInWithGoogle() {
    try {
        showLoading('Conectando con Google...');
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        hideLoading();
        showSuccessMessage('¡Bienvenido en modo demo!');
        closeModal('authModal');
        
        // In demo mode, simulate login
        if (DEMO_MODE) {
            currentUser = { ...user, displayName: user.displayName || 'Usuario Google Demo' };
            setTimeout(() => {
                showUserInterface();
                updateNavbarAuth();
            }, 500);
        }
        
        return user;
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Logout user
export async function logoutUser() {
    try {
        await signOut(auth);
        showSuccessMessage('Sesión cerrada correctamente');
        currentUser = null;
    } catch (error) {
        console.error('Logout error:', error);
        showErrorMessage('Error al cerrar sesión');
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        showSuccessMessage('Revisa tu email para restablecer tu contraseña');
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
}

// Create user profile in Firestore
async function createUserProfile(user, additionalData = {}) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                favoriteTeam: additionalData.favoriteTeam || '',
                profilePicture: user.photoURL || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                level: 1,
                experience: 0,
                points: 0,
                badges: [],
                predictions: [],
                sharedLinks: [],
                notifications: true,
                bio: '',
                location: '',
                achievements: {
                    firstLogin: true,
                    profileComplete: false,
                    firstPrediction: false,
                    firstSharedLink: false
                },
                stats: {
                    correctPredictions: 0,
                    totalPredictions: 0,
                    linksShared: 0,
                    commentsPosted: 0
                }
            };
            
            await setDoc(userRef, userData);
            console.log('User profile created');
        }
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
}

// Update existing user profile
async function createOrUpdateUserProfile(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            // Update existing profile
            await updateDoc(userRef, {
                email: user.email,
                displayName: user.displayName || userSnap.data().displayName,
                profilePicture: user.photoURL || userSnap.data().profilePicture,
                updatedAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
        } else {
            // Create new profile
            await createUserProfile(user);
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
}

// Load user profile data
export async function loadUserProfile() {
    if (!currentUser) return null;
    
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            updateUserInterface(userData);
            return userData;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
    return null;
}

// Update user interface with user data
function updateUserInterface(userData) {
    // Update navbar
    const userNameEl = document.getElementById('userDisplayName');
    const userAvatarEl = document.getElementById('userAvatar');
    const userPointsEl = document.getElementById('userPoints');
    const userLevelEl = document.getElementById('userLevel');
    
    if (userNameEl) userNameEl.textContent = userData.displayName || 'Usuario';
    if (userAvatarEl) {
        if (userData.profilePicture) {
            userAvatarEl.innerHTML = `<img src="${userData.profilePicture}" alt="Avatar" class="user-avatar-img">`;
        } else {
            userAvatarEl.innerHTML = `<i class="fas fa-user"></i>`;
        }
    }
    if (userPointsEl) userPointsEl.textContent = userData.points || 0;
    if (userLevelEl) userLevelEl.textContent = userData.level || 1;
}

// Show user interface (logged in)
function showUserInterface() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
}

// Show auth interface (logged out)
function showAuthInterface() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

// Update navbar auth state
function updateNavbarAuth() {
    const navbar = document.querySelector('.navbar');
    if (currentUser) {
        navbar.classList.add('user-logged-in');
    } else {
        navbar.classList.remove('user-logged-in');
    }
}

// Show forgot password message
function showForgotPassword() {
    showSuccessMessage('En modo demo: Funcionalidad de recuperación de contraseña no disponible');
}

// Utility functions
function showLoading(message = 'Cargando...') {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'authLoading';
    loadingEl.className = 'auth-loading';
    loadingEl.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loadingEl);
}

function hideLoading() {
    const loadingEl = document.getElementById('authLoading');
    if (loadingEl) {
        document.body.removeChild(loadingEl);
    }
}

function showSuccessMessage(message) {
    // Reuse the existing showSuccessMessage function from main.js
    if (window.showSuccessMessage) {
        window.showSuccessMessage(message);
    } else {
        alert(message);
    }
}

function showErrorMessage(message) {
    // Reuse the existing showErrorMessage function from main.js
    if (window.showErrorMessage) {
        window.showErrorMessage(message);
    } else {
        alert(message);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show user interface (logged in state)
function showUserInterface() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
}

// Show auth interface (logged out state)
function showAuthInterface() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

// Update navbar based on auth state
function updateNavbarAuth() {
    if (currentUser) {
        showUserInterface();
        updateUserInterface({
            displayName: currentUser.displayName || 'Usuario Demo',
            level: 1,
            points: 0
        });
    } else {
        showAuthInterface();
    }
}

// Handle authentication errors
function handleAuthError(error) {
    let message = 'Error de autenticación';
    
    if (DEMO_MODE) {
        message = 'Error en modo demo - ' + (error.message || 'Error desconocido');
    } else {
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'El email ya está registrado';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/weak-password':
                message = 'La contraseña es muy débil';
                break;
            case 'auth/user-not-found':
                message = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            default:
                message = error.message || 'Error desconocido';
        }
    }
    
    showErrorMessage(message);
}