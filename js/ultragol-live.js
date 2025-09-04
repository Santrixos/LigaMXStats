// UltraGol LIVE - JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeLivePage();
});

// Initialize Firebase for UltraGol LIVE
const liveFirebaseConfig = {
    apiKey: "AIzaSyAneyRjnZzvhIFLzykATmW4ShN3IVuf5E0",
    authDomain: "ligamx-daf3d.firebaseapp.com",
    projectId: "ligamx-daf3d",
    storageBucket: "ligamx-daf3d.firebasestorage.app",
    messagingSenderId: "437421248316",
    appId: "1:437421248316:web:38e9f436a57389d2c49839",
    measurementId: "G-LKVTFN2463"
};

let db;

function initializeLivePage() {
    // Initialize Firebase if not already done
    if (typeof firebase !== 'undefined') {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(liveFirebaseConfig);
            }
            db = firebase.firestore();
            console.log('🔥 Firebase initialized for UltraGol LIVE');
            
            loadStreams();
            setupFormSubmission();
            setupNavigation();
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    } else {
        console.log('Waiting for Firebase to load...');
        setTimeout(initializeLivePage, 1000);
    }
}

// Load and display streams from Firebase
async function loadStreams() {
    const streamsList = document.getElementById('streamsList');
    
    try {
        const streamsSnapshot = await db.collection('streams')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();
        
        if (streamsSnapshot.empty) {
            streamsList.innerHTML = `
                <div class="no-streams">
                    <i class="fas fa-tv fa-2x" style="color: #666; margin-bottom: 1rem;"></i>
                    <p>No hay transmisiones disponibles en este momento.</p>
                    <small style="color: #999;">¡Sé el primero en compartir un link!</small>
                </div>
            `;
            return;
        }
        
        let streamsHTML = '';
        streamsSnapshot.forEach(doc => {
            const stream = doc.data();
            streamsHTML += createStreamHTML(stream);
        });
        
        streamsList.innerHTML = streamsHTML;
        console.log(`✅ Loaded ${streamsSnapshot.size} streams`);
        
    } catch (error) {
        console.error('Error loading streams:', error);
        streamsList.innerHTML = `
            <div class="no-streams">
                <i class="fas fa-exclamation-triangle fa-2x" style="color: #ff6633; margin-bottom: 1rem;"></i>
                <p>Error al cargar las transmisiones.</p>
                <button onclick="loadStreams()" class="btn btn-outline" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Intentar de nuevo
                </button>
            </div>
        `;
    }
}

// Create HTML for a stream item
function createStreamHTML(stream) {
    const platformClass = stream.platform || 'otros';
    const platformName = {
        'youtube': 'YouTube',
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'otros': 'Otros'
    }[stream.platform] || 'Otros';
    
    const timestamp = stream.timestamp ? new Date(stream.timestamp.seconds * 1000) : new Date();
    const timeAgo = getTimeAgo(timestamp);
    
    return `
        <div class="stream-item">
            <div class="stream-header">
                <div class="match-info">${stream.matchName}</div>
                <div class="platform-badge ${platformClass}">${platformName}</div>
            </div>
            ${stream.description ? `<p style="color: #ccc; margin-bottom: 1rem; font-size: 0.9rem;">${stream.description}</p>` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <a href="${stream.url}" target="_blank" class="stream-link" onclick="trackStreamClick('${stream.platform}')">
                    <i class="fas fa-play"></i>
                    Ver Transmisión
                </a>
                <small style="color: #999;">${timeAgo}</small>
            </div>
        </div>
    `;
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('streamUploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            matchName: document.getElementById('matchName').value.trim(),
            url: document.getElementById('streamUrl').value.trim(),
            platform: document.getElementById('platform').value,
            description: document.getElementById('description').value.trim()
        };
        
        // Validate form
        if (!formData.matchName || !formData.url || !formData.platform) {
            showMessage('Por favor completa todos los campos requeridos.', 'error');
            return;
        }
        
        // Validate URL format
        if (!isValidURL(formData.url)) {
            showMessage('Por favor ingresa una URL válida.', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        loadingSpinner.style.display = 'inline-block';
        submitBtn.innerHTML = `
            <span class="loading-spinner" style="display: inline-block;"></span>
            Enviando...
        `;
        
        try {
            // Add to Firebase
            await db.collection('streams').add({
                ...formData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                clicks: 0
            });
            
            // Reset form
            form.reset();
            showMessage('¡Transmisión compartida exitosamente!', 'success');
            
            // Reload streams
            setTimeout(loadStreams, 1000);
            
        } catch (error) {
            console.error('Error adding stream:', error);
            showMessage('Error al compartir la transmisión. Inténtalo de nuevo.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            loadingSpinner.style.display = 'none';
            submitBtn.innerHTML = `
                <i class="fas fa-upload"></i>
                Compartir Transmisión
            `;
        }
    });
}

// Utility functions
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace menos de 1 minuto';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
}

function showMessage(message, type) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        color: #fff;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    `;
    
    if (type === 'success') {
        messageEl.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        messageEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        messageEl.style.background = 'linear-gradient(45deg, #dc3545, #fd7e14)';
        messageEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    }
    
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 5000);
}

function trackStreamClick(platform) {
    // Track analytics (optional)
    console.log(`Stream clicked: ${platform}`);
    
    // Could add to Firebase analytics here
    try {
        db.collection('analytics').add({
            action: 'stream_click',
            platform: platform,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        // Silent fail for analytics
        console.log('Analytics tracking failed:', error);
    }
}

function setupNavigation() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('🎯 UltraGol LIVE script loaded successfully');