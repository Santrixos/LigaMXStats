// Fan Zone JavaScript - Modern Social Media Functionality with Firebase
document.addEventListener('DOMContentLoaded', function() {
    initializeFanZone();
});

// Global variables
let currentUser = null;
let allPosts = [];
let currentFilter = 'all';
let currentSort = 'recent';
let isLoading = false;
let lastPostDoc = null;
let postsPerPage = 10;

// Initialize Fan Zone
function initializeFanZone() {
    console.log('🎯 Fan Zone initializing...');
    
    // Check Firebase availability
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        console.log('🔥 Firebase available, setting up Fan Zone with real-time features');
        setupFirebaseFeatures();
    } else {
        console.log('📱 Running Fan Zone in demo mode');
        setupDemoMode();
    }
    
    // Setup basic functionality
    setupEventListeners();
    setupNavigation();
    animateCounters();
    loadTeamsData();
    
    // Setup filters and sorting
    setupFilters();
    
    // Load initial content
    loadInitialContent();
}

// Setup Firebase features
function setupFirebaseFeatures() {
    try {
        // Authentication state listener
        firebase.auth().onAuthStateChanged((user) => {
            currentUser = user;
            updateUIForAuthState(user);
            if (user) {
                console.log('✅ User authenticated:', user.displayName || user.email);
                loadUserPosts();
            } else {
                console.log('❌ User not authenticated');
                loadPublicPosts();
            }
        });
        
        // Setup real-time listeners
        setupRealtimeListeners();
        
    } catch (error) {
        console.error('Firebase setup error:', error);
        setupDemoMode();
    }
}

// Setup demo mode with sample data
function setupDemoMode() {
    console.log('🎮 Setting up Fan Zone demo mode');
    generateSamplePosts();
    generateSampleStories();
    generateTrendingTopics();
    generateTopFans();
    setupDemoChat();
}

// Setup event listeners
function setupEventListeners() {
    // Post creation
    const publishBtn = document.getElementById('publishPost');
    const postContent = document.getElementById('postContent');
    const imageUpload = document.getElementById('imageUpload');
    const videoUpload = document.getElementById('videoUpload');
    const removeMedia = document.getElementById('removeMedia');
    
    if (publishBtn) publishBtn.addEventListener('click', handlePublishPost);
    if (postContent) {
        postContent.addEventListener('input', updateCharCounter);
        postContent.addEventListener('input', autoResizeTextarea);
    }
    if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);
    if (videoUpload) videoUpload.addEventListener('change', handleVideoUpload);
    if (removeMedia) removeMedia.addEventListener('click', handleRemoveMedia);
    
    // Filters and sorting
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sortPosts');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => handleFilterChange(tab.dataset.filter));
    });
    
    if (sortSelect) sortSelect.addEventListener('change', handleSortChange);
    
    // View toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => handleViewChange(btn.dataset.view));
    });
    
    // Load more posts
    const loadMoreBtn = document.getElementById('loadMorePosts');
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMorePosts);
    
    // Authentication
    const googleAuth = document.getElementById('googleAuth');
    const facebookAuth = document.getElementById('facebookAuth');
    const closeAuth = document.getElementById('closeAuth');
    
    if (googleAuth) googleAuth.addEventListener('click', signInWithGoogle);
    if (facebookAuth) facebookAuth.addEventListener('click', signInWithFacebook);
    if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);
    
    // Modal handling
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    
    if (modalOverlay) modalOverlay.addEventListener('click', closePostModal);
    if (closeModal) closeModal.addEventListener('click', closePostModal);
    
    // Chat functionality
    const chatInput = document.getElementById('chatInput');
    const sendChat = document.getElementById('sendChat');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendChat();
        });
    }
    if (sendChat) sendChat.addEventListener('click', handleSendChat);
    
    // Stories
    const addStory = document.getElementById('addStory');
    if (addStory) addStory.addEventListener('click', handleAddStory);
}

// Update character counter
function updateCharCounter() {
    const postContent = document.getElementById('postContent');
    const charCount = document.getElementById('charCount');
    
    if (postContent && charCount) {
        const count = postContent.value.length;
        charCount.textContent = count;
        charCount.style.color = count > 250 ? '#ff6b35' : count > 280 ? '#ff0000' : '#666';
    }
}

// Auto resize textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('postContent');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showMediaPreview('image', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Handle video upload
function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showMediaPreview('video', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Show media preview
function showMediaPreview(type, src) {
    const mediaPreview = document.getElementById('mediaPreview');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    
    if (mediaPreview && imagePreview && videoPreview) {
        mediaPreview.style.display = 'block';
        
        if (type === 'image') {
            imagePreview.src = src;
            imagePreview.style.display = 'block';
            videoPreview.style.display = 'none';
        } else if (type === 'video') {
            videoPreview.src = src;
            videoPreview.style.display = 'block';
            imagePreview.style.display = 'none';
        }
    }
}

// Handle remove media
function handleRemoveMedia() {
    const mediaPreview = document.getElementById('mediaPreview');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const imageUpload = document.getElementById('imageUpload');
    const videoUpload = document.getElementById('videoUpload');
    
    if (mediaPreview) mediaPreview.style.display = 'none';
    if (imagePreview) {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
    if (videoPreview) {
        videoPreview.src = '';
        videoPreview.style.display = 'none';
    }
    if (imageUpload) imageUpload.value = '';
    if (videoUpload) videoUpload.value = '';
}

// Handle publish post
async function handlePublishPost() {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    const postContent = document.getElementById('postContent');
    const teamFilter = document.getElementById('teamFilter');
    const imageUpload = document.getElementById('imageUpload');
    const videoUpload = document.getElementById('videoUpload');
    
    if (!postContent || !postContent.value.trim()) {
        showNotification('Por favor escribe algo para publicar', 'error');
        return;
    }
    
    const publishBtn = document.getElementById('publishPost');
    if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Publicando...</span>';
    }
    
    try {
        const postData = {
            content: postContent.value.trim(),
            author: {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Fan de Liga MX',
                email: currentUser.email,
                avatar: currentUser.photoURL || null
            },
            team: teamFilter ? teamFilter.value : '',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            comments: 0,
            shares: 0,
            type: 'text'
        };
        
        // Handle media upload
        if (imageUpload && imageUpload.files[0]) {
            const imageUrl = await uploadMedia(imageUpload.files[0], 'images');
            postData.media = {
                type: 'image',
                url: imageUrl
            };
            postData.type = 'image';
        } else if (videoUpload && videoUpload.files[0]) {
            const videoUrl = await uploadMedia(videoUpload.files[0], 'videos');
            postData.media = {
                type: 'video',
                url: videoUrl
            };
            postData.type = 'video';
        }
        
        // Save to Firestore
        await firebase.firestore().collection('fanzone_posts').add(postData);
        
        // Clear form
        postContent.value = '';
        updateCharCounter();
        handleRemoveMedia();
        if (teamFilter) teamFilter.value = '';
        
        showNotification('¡Post publicado exitosamente!', 'success');
        
        // Reload posts
        loadUserPosts();
        
    } catch (error) {
        console.error('Error publishing post:', error);
        showNotification('Error al publicar el post', 'error');
    } finally {
        if (publishBtn) {
            publishBtn.disabled = false;
            publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Publicar</span>';
        }
    }
}

// Upload media to Firebase Storage
async function uploadMedia(file, folder) {
    const storageRef = firebase.storage().ref();
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    const fileRef = storageRef.child(fileName);
    
    const snapshot = await fileRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    return downloadURL;
}

// Authentication functions
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebase.auth().signInWithPopup(provider);
        closeAuthModal();
    } catch (error) {
        console.error('Google sign-in error:', error);
        showNotification('Error al iniciar sesión con Google', 'error');
    }
}

async function signInWithFacebook() {
    try {
        const provider = new firebase.auth.FacebookAuthProvider();
        await firebase.auth().signInWithPopup(provider);
        closeAuthModal();
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        showNotification('Error al iniciar sesión con Facebook', 'error');
    }
}

function showAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'flex';
    }
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
}

// Update UI based on authentication state
function updateUIForAuthState(user) {
    const userProfile = document.querySelector('.user-profile');
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');
    const username = document.querySelector('.username');
    
    if (user && userProfile) {
        if (avatarPlaceholder) {
            if (user.photoURL) {
                avatarPlaceholder.innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                avatarPlaceholder.innerHTML = `<i class="fas fa-user"></i>`;
            }
        }
        
        if (username) {
            username.textContent = user.displayName || user.email || 'Fan de Liga MX';
        }
    }
}

// Load posts
async function loadUserPosts() {
    if (!firebase.firestore) {
        loadPublicPosts();
        return;
    }
    
    try {
        showLoadingPosts(true);
        
        let query = firebase.firestore()
            .collection('fanzone_posts')
            .orderBy('timestamp', 'desc')
            .limit(postsPerPage);
        
        if (lastPostDoc) {
            query = query.startAfter(lastPostDoc);
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty && !lastPostDoc) {
            // No posts found, generate sample data
            await generateSampleFirebasePosts();
            loadUserPosts();
            return;
        }
        
        const posts = [];
        snapshot.forEach(doc => {
            posts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (lastPostDoc) {
            allPosts = [...allPosts, ...posts];
        } else {
            allPosts = posts;
        }
        
        lastPostDoc = snapshot.docs[snapshot.docs.length - 1];
        
        renderPosts(allPosts);
        showLoadingPosts(false);
        
    } catch (error) {
        console.error('Error loading posts:', error);
        showLoadingPosts(false);
        loadPublicPosts();
    }
}

// Load public posts (demo mode)
function loadPublicPosts() {
    showLoadingPosts(true);
    
    setTimeout(() => {
        generateSamplePosts();
        showLoadingPosts(false);
    }, 1000);
}

// Generate sample Firebase posts
async function generateSampleFirebasePosts() {
    const samplePosts = [
        {
            content: "¡Qué golazo del América! 🔥⚽ Este equipo está imparable esta temporada. #VamosÁguila",
            author: {
                name: "Carlos Rodríguez",
                email: "carlos@example.com",
                avatar: null
            },
            team: "América",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 24,
            comments: 8,
            shares: 3,
            type: "text"
        },
        {
            content: "La afición de Chivas siempre presente. No importa el resultado, somos rojiblanco de corazón ❤️🤍",
            author: {
                name: "María González",
                email: "maria@example.com",
                avatar: null
            },
            team: "Guadalajara",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 18,
            comments: 12,
            shares: 5,
            type: "text"
        },
        {
            content: "Los Tigres jugando como verdaderos felinos 🐅. Gignac sigue siendo una leyenda!",
            author: {
                name: "José Martínez",
                email: "jose@example.com",
                avatar: null
            },
            team: "Tigres",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 31,
            comments: 6,
            shares: 2,
            type: "text"
        }
    ];
    
    try {
        const batch = firebase.firestore().batch();
        
        samplePosts.forEach(post => {
            const docRef = firebase.firestore().collection('fanzone_posts').doc();
            batch.set(docRef, post);
        });
        
        await batch.commit();
        console.log('✅ Sample posts created in Firebase');
        
    } catch (error) {
        console.error('Error creating sample posts:', error);
    }
}

// Generate sample posts for demo mode
function generateSamplePosts() {
    const teams = ['América', 'Guadalajara', 'Cruz Azul', 'Tigres', 'Monterrey', 'Pumas', 'Santos', 'León'];
    const sampleContents = [
        "¡Qué partidazo! La Liga MX siempre nos da las mejores emociones ⚽🔥",
        "Mi equipo del corazón dando todo en la cancha. ¡Vamos por el título! 🏆",
        "La afición mexicana es la mejor del mundo. Siempre apoyando sin importar nada 💚🤍❤️",
        "Este gol va a quedar en la historia de la Liga MX. ¡Increíble técnica! ⭐",
        "El fútbol mexicano tiene un nivel espectacular. Cada jornada es pura emoción 🎯",
        "Orgulloso de ser parte de esta gran familia futbolera. ¡Liga MX por siempre! 🇲🇽"
    ];
    
    allPosts = [];
    
    for (let i = 0; i < 15; i++) {
        const randomTeam = teams[Math.floor(Math.random() * teams.length)];
        const randomContent = sampleContents[Math.floor(Math.random() * sampleContents.length)];
        const randomLikes = Math.floor(Math.random() * 50) + 1;
        const randomComments = Math.floor(Math.random() * 20) + 1;
        const randomShares = Math.floor(Math.random() * 10) + 1;
        
        allPosts.push({
            id: `demo_${i}`,
            content: randomContent,
            author: {
                name: `Fan de ${randomTeam}`,
                avatar: null
            },
            team: randomTeam,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            likes: randomLikes,
            comments: randomComments,
            shares: randomShares,
            type: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'image' : 'video') : 'text'
        });
    }
    
    renderPosts(allPosts);
}

// Render posts
function renderPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;
    
    const filteredPosts = filterPosts(posts);
    const sortedPosts = sortPosts(filteredPosts);
    
    postsContainer.innerHTML = sortedPosts.map(post => renderPostCard(post)).join('');
    
    // Add event listeners to post actions
    addPostEventListeners();
}

// Filter posts based on current filter
function filterPosts(posts) {
    if (currentFilter === 'all') return posts;
    
    return posts.filter(post => {
        switch (currentFilter) {
            case 'posts':
                return post.type === 'text';
            case 'videos':
                return post.type === 'video';
            case 'photos':
                return post.type === 'image';
            case 'polls':
                return post.type === 'poll';
            case 'trending':
                return post.likes > 20;
            default:
                return true;
        }
    });
}

// Sort posts
function sortPosts(posts) {
    return posts.sort((a, b) => {
        switch (currentSort) {
            case 'recent':
                return new Date(b.timestamp) - new Date(a.timestamp);
            case 'popular':
                return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
            case 'controversial':
                return b.comments - a.comments;
            default:
                return new Date(b.timestamp) - new Date(a.timestamp);
        }
    });
}

// Render individual post card
function renderPostCard(post) {
    const timeAgo = getTimeAgo(post.timestamp);
    const authorInitials = post.author.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">
                        ${post.author.avatar ? 
                            `<img src="${post.author.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
                            authorInitials
                        }
                    </div>
                    <div class="author-info">
                        <div class="author-name">${post.author.name}</div>
                        <div class="post-time">${timeAgo}${post.team ? ` • ${post.team}` : ''}</div>
                    </div>
                </div>
                <button class="post-menu" onclick="showPostMenu('${post.id}')">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            
            <div class="post-content">
                <div class="post-text">${post.content}</div>
                ${post.media ? renderPostMedia(post.media) : ''}
            </div>
            
            <div class="post-actions">
                <div class="action-group">
                    <button class="action-btn like-btn" onclick="toggleLike('${post.id}')" ${post.liked ? 'class="liked"' : ''}>
                        <i class="fas fa-heart"></i>
                        <span>${post.likes}</span>
                    </button>
                    <button class="action-btn comment-btn" onclick="showComments('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments}</span>
                    </button>
                    <button class="action-btn share-btn" onclick="sharePost('${post.id}')">
                        <i class="fas fa-share"></i>
                        <span>${post.shares}</span>
                    </button>
                </div>
                <button class="action-btn bookmark-btn" onclick="bookmarkPost('${post.id}')">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
}

// Render post media
function renderPostMedia(media) {
    if (media.type === 'image') {
        return `
            <div class="post-media">
                <img src="${media.url}" alt="Post image" loading="lazy">
            </div>
        `;
    } else if (media.type === 'video') {
        return `
            <div class="post-media">
                <video controls preload="metadata">
                    <source src="${media.url}" type="video/mp4">
                    Tu navegador no soporta video.
                </video>
            </div>
        `;
    }
    return '';
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = new Date();
    const time = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)}d`;
    
    return time.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// Add event listeners to posts
function addPostEventListeners() {
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                openPostModal(card.dataset.postId);
            }
        });
    });
}

// Show loading posts
function showLoadingPosts(show) {
    const loadingPosts = document.getElementById('loadingPosts');
    if (loadingPosts) {
        loadingPosts.style.display = show ? 'block' : 'none';
    }
}

// Handle filter change
function handleFilterChange(filter) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Re-render posts
    renderPosts(allPosts);
}

// Handle sort change
function handleSortChange(event) {
    currentSort = event.target.value;
    renderPosts(allPosts);
}

// Handle view change
function handleViewChange(view) {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    const postsContainer = document.getElementById('postsContainer');
    if (postsContainer) {
        if (view === 'grid') {
            postsContainer.style.display = 'grid';
            postsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        } else {
            postsContainer.style.display = 'flex';
            postsContainer.style.flexDirection = 'column';
        }
    }
}

// Load more posts
function loadMorePosts() {
    if (firebase.firestore && currentUser) {
        loadUserPosts();
    } else {
        // Demo mode - generate more posts
        generateSamplePosts();
    }
}

// Setup filters
function setupFilters() {
    // Already handled in setupEventListeners
}

// Load teams data for filter
async function loadTeamsData() {
    try {
        const response = await fetch('data/teams.json');
        const teams = await response.json();
        
        const teamFilter = document.getElementById('teamFilter');
        if (teamFilter && teams) {
            teamFilter.innerHTML = '<option value="">Todos los equipos</option>' +
                teams.map(team => `<option value="${team.name}">${team.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading teams:', error);
    }
}

// Load initial content
function loadInitialContent() {
    generateSampleStories();
    generateTrendingTopics();
    generateTopFans();
    setupDemoChat();
}

// Generate sample stories
function generateSampleStories() {
    const storiesContainer = document.getElementById('storiesContainer');
    if (!storiesContainer) return;
    
    const stories = [
        { user: 'CarlosFan', team: 'América', time: '2h' },
        { user: 'ChivasBro', team: 'Guadalajara', time: '4h' },
        { user: 'TigresFan', team: 'Tigres', time: '6h' },
        { user: 'Rayados', team: 'Monterrey', time: '8h' }
    ];
    
    storiesContainer.innerHTML = stories.map(story => `
        <div class="story-item">
            <div class="story-avatar">
                ${story.user.substring(0, 2).toUpperCase()}
            </div>
            <div class="story-info">
                <div class="story-user">${story.user}</div>
                <div class="story-time">${story.time}</div>
            </div>
        </div>
    `).join('');
}

// Generate trending topics
function generateTrendingTopics() {
    const trendingTopics = document.getElementById('trendingTopics');
    if (!trendingTopics) return;
    
    const topics = [
        { hashtag: '#LigaMX', posts: '2.1K posts' },
        { hashtag: '#Clásico', posts: '892 posts' },
        { hashtag: '#Gignac', posts: '445 posts' },
        { hashtag: '#AmericaVsChivas', posts: '1.3K posts' },
        { hashtag: '#LiguillaMX', posts: '756 posts' }
    ];
    
    trendingTopics.innerHTML = topics.map(topic => `
        <div class="trending-item">
            <div class="trending-hashtag">${topic.hashtag}</div>
            <div class="trending-posts">${topic.posts}</div>
        </div>
    `).join('');
}

// Generate top fans
function generateTopFans() {
    const topFansList = document.getElementById('topFansList');
    if (!topFansList) return;
    
    const fans = [
        { name: 'Carlos R.', team: 'América', posts: 127 },
        { name: 'María G.', team: 'Chivas', posts: 98 },
        { name: 'José M.', team: 'Tigres', posts: 84 },
        { name: 'Ana L.', team: 'Cruz Azul', posts: 76 }
    ];
    
    topFansList.innerHTML = fans.map((fan, index) => `
        <div class="top-fan-item">
            <div class="fan-rank">${index + 1}</div>
            <div class="fan-avatar">${fan.name.substring(0, 2)}</div>
            <div class="fan-info">
                <div class="fan-name">${fan.name}</div>
                <div class="fan-stats">${fan.posts} posts</div>
            </div>
        </div>
    `).join('');
}

// Setup demo chat
function setupDemoChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messages = [
        { user: 'CarlosFan', message: '¡Qué golazo!' },
        { user: 'ChivasBro', message: 'Mi equipo está jugando increíble' },
        { user: 'TigresFan', message: '¿Alguien vio el último partido?' }
    ];
    
    chatMessages.innerHTML = messages.map(msg => `
        <div class="chat-message">
            <strong>${msg.user}:</strong> ${msg.message}
        </div>
    `).join('');
}

// Chat functionality
function handleSendChat() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages || !chatInput.value.trim()) return;
    
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    const message = chatInput.value.trim();
    const userName = currentUser.displayName || 'Fan de Liga MX';
    
    const messageHTML = `
        <div class="chat-message">
            <strong>${userName}:</strong> ${message}
        </div>
    `;
    
    chatMessages.innerHTML += messageHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.value = '';
}

// Post interaction functions
function toggleLike(postId) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    // Implementation for Firebase or demo mode
    console.log('Toggling like for post:', postId);
}

function showComments(postId) {
    openPostModal(postId);
}

function sharePost(postId) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    console.log('Sharing post:', postId);
    showNotification('¡Post compartido!', 'success');
}

function bookmarkPost(postId) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    console.log('Bookmarking post:', postId);
    showNotification('Post guardado en favoritos', 'success');
}

function showPostMenu(postId) {
    console.log('Showing menu for post:', postId);
}

// Modal functions
function openPostModal(postId) {
    const modal = document.getElementById('postModal');
    const modalBody = document.getElementById('postModalBody');
    
    if (modal && modalBody) {
        const post = allPosts.find(p => p.id === postId);
        if (post) {
            modalBody.innerHTML = renderPostCard(post);
            modal.style.display = 'block';
        }
    }
}

function closePostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Story functions
function handleAddStory() {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    console.log('Adding story...');
    showNotification('Funcionalidad de historias próximamente', 'info');
}

// Setup navigation (inherited from main.js)
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });
}

// Animate counters
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
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
    });
}

// Setup real-time listeners
function setupRealtimeListeners() {
    if (!firebase.firestore) return;
    
    try {
        // Listen for new posts
        firebase.firestore()
            .collection('fanzone_posts')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        console.log('New post added:', change.doc.data());
                        // Optionally update UI with new post
                    }
                });
            });
            
    } catch (error) {
        console.error('Error setting up real-time listeners:', error);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
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

console.log('🎯 Fan Zone script loaded successfully');