// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getMessaging } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: window.FIREBASE_API_KEY || "AIzaSyBvOkBwNQI-GnFUF3Sa416b9S7QJXJNnyg",
    authDomain: "ligamx-daf3d.firebaseapp.com",
    projectId: "ligamx-daf3d",
    storageBucket: "ligamx-daf3d.firebasestorage.app",
    messagingSenderId: "437421248316",
    appId: "1:437421248316:web:38e9f436a57389d2c49839",
    measurementId: "G-LKVTFN2463"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Initialize messaging if supported
let messaging = null;
try {
    if ('serviceWorker' in navigator) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.log('Messaging not supported:', error);
}

export { messaging };

// Auth state observer
export function onAuthStateChange(callback) {
    return auth.onAuthStateChanged(callback);
}

// Current user helper
export function getCurrentUser() {
    return auth.currentUser;
}

console.log('🔥 Firebase initialized successfully');