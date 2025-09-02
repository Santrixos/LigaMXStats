// Authentication System for Liga MX UltraGol
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Google provider
const googleProvider = new GoogleAuthProvider();

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
        showSuccessMessage('¡Cuenta creada exitosamente!');
        closeModal('authModal');
        
        return user;
    } catch (error) {
        hideLoading();
        handleAuthError(error);
        throw error;
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        showLoading('Iniciando sesión...');
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        hideLoading();
        showSuccessMessage('¡Bienvenido de vuelta!');
        closeModal('authModal');
        
        return user;
    } catch (error) {
        hideLoading();
        handleAuthError(error);
        throw error;
    }
}

// Google sign in
export async function signInWithGoogle() {
    try {
        showLoading('Conectando con Google...');
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        hideLoading();
        showSuccessMessage('¡Bienvenido!');
        closeModal('authModal');
        
        return user;
    } catch (error) {
        hideLoading();
        handleAuthError(error);
        throw error;
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

// Handle authentication errors
function handleAuthError(error) {
    let message = 'Error desconocido';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'Este email ya está registrado';
            break;
        case 'auth/invalid-email':
            message = 'Email inválido';
            break;
        case 'auth/operation-not-allowed':
            message = 'Operación no permitida';
            break;
        case 'auth/weak-password':
            message = 'La contraseña es muy débil';
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
        case 'auth/too-many-requests':
            message = 'Demasiados intentos. Intenta más tarde';
            break;
        default:
            message = error.message;
    }
    
    showErrorMessage(message);
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