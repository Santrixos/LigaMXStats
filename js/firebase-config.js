// Firebase Configuration and Initialization for Demo Mode
console.log('UltraGol loaded with Firebase features');

// Demo mode configuration - no actual Firebase needed
const DEMO_MODE = true;

// Mock Firebase services for demo
export const auth = DEMO_MODE ? createMockAuth() : null;
export const db = DEMO_MODE ? createMockFirestore() : null;
export const storage = DEMO_MODE ? createMockStorage() : null;
export const analytics = DEMO_MODE ? createMockAnalytics() : null;
export const messaging = null;

function createMockAuth() {
    return {
        currentUser: null,
        onAuthStateChanged: (callback) => {
            // Call callback with null user in demo mode
            setTimeout(() => callback(null), 100);
            return () => {}; // unsubscribe function
        }
    };
}

function createMockFirestore() {
    return {
        collection: () => ({
            doc: () => ({
                set: () => Promise.resolve(),
                get: () => Promise.resolve({ exists: false, data: () => null }),
                update: () => Promise.resolve()
            })
        })
    };
}

function createMockStorage() {
    return {
        ref: () => ({
            put: () => Promise.resolve(),
            getDownloadURL: () => Promise.resolve('demo-url')
        })
    };
}

function createMockAnalytics() {
    return {
        logEvent: () => {}
    };
}

// Auth state observer
export function onAuthStateChange(callback) {
    return auth.onAuthStateChanged(callback);
}

// Current user helper
export function getCurrentUser() {
    return auth.currentUser;
}

console.log('🔥 Firebase initialized successfully');