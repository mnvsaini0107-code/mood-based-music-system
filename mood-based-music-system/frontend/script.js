// Enhanced song library with proper local audio files
const SAMPLE_SONGS = [
    {
        title: "Kesariya",
        artist: "Arijit Singh",
        audio: "songs/kesariya.mp3",
        cover: "covers/kesariya.jpg",
        playlist: "romantic"
    },
    {
        title: "Tum Hi Ho",
        artist: "Arijit Singh",
        audio: "songs/tumhiho.mp3",
        cover: "covers/tumhiho.jpg",
        playlist: "sad"
    },
    {
        title: "Channa Mereya",
        artist: "Arijit Singh",
        audio: "songs/channamereya.mp3",
        cover: "covers/channamereya.jpg",
        playlist: "sad"
    },
    {
        title: "Agar Tum Saath Ho",
        artist: "Alka Yagnik, Arijit Singh",
        audio: "songs/agartumsaathho.mp3",
        cover: "covers/agartumsaathho.jpg",
        playlist: "sad"
    },
    {
        title: "Raabta",
        artist: "Arijit Singh",
        audio: "songs/raabta.mp3",
        cover: "covers/raabta.jpg",
        playlist: "romantic"
    },
    {
        title: "Nashe Si Chadh Gayi",
        artist: "Arijit Singh",
        audio: "songs/nashe.mp3",
        cover: "covers/nashe.jpg",
        playlist: "energetic"
    },
    {
        title: "Ghungroo",
        artist: "Arijit Singh, Shashaa Tirupati",
        audio: "songs/ghungroo.mp3",
        cover: "covers/ghungroo.jpg",
        playlist: "energetic"
    },
    {
        title: "Leo Das Entry",
        artist: "Anirudh Ravichander",
        audio: "songs/leo.mp3",
        cover: "covers/leo.jpg",
        playlist: "energetic"
    },
    {
        title: "Mann Mera",
        artist: "Gajendra Verma",
        audio: "songs/mannmera.mp3",
        cover: "covers/mannmera.jpg",
        playlist: "romantic"
    },
    {
        title: "Mera Yaar",
        artist: "B Praak",
        audio: "songs/merayaar.mp3",
        cover: "covers/merayaar.jpg",
        playlist: "sad"
    },
    {
        title: "Qafirana",
        artist: "Arijit Singh, Sona Mohapatra",
        audio: "songs/qafirana.mp3",
        cover: "covers/qafirana.jpg",
        playlist: "romantic"
    },
    {
        title: "Bolna",
        artist: "Arijit Singh",
        audio: "songs/bolna.mp3",
        cover: "covers/bolna.jpg",
        playlist: "romantic"
    },
    {
        title: "Phir Bhi Tumko Chaahunga",
        artist: "Arijit Singh",
        audio: "songs/phirbhi.mp3",
        cover: "covers/phirbhi.jpg",
        playlist: "romantic"
    }
];

// Deezer API integration for real music previews
const DEEZER_API_BASE = "https://api.deezer.com/search";

async function searchDeezer(query, limit = 10) {
    try {
        const response = await fetch(`${DEEZER_API_BASE}?q=${encodeURIComponent(query)}&limit=${limit}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            return data.data.map(track => ({
                title: track.title,
                artist: track.artist.name,
                audio: track.preview, // 30-second preview
                cover: track.album.cover_medium,
                id: track.id,
                playlist: getPlaylistCategory(track.title)
            }));
        }
        return [];
    } catch (error) {
        console.error('Deezer API error:', error);
        return [];
    }
}

// Helper function to categorize songs by mood/energy
function getPlaylistCategory(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('sad') || lowerTitle.includes('slow') || lowerTitle.includes('peaceful')) {
        return 'sad';
    }
    if (lowerTitle.includes('love') || lowerTitle.includes('romantic') || lowerTitle.includes('dil')) {
        return 'romantic';
    }
    if (lowerTitle.includes('dance') || lowerTitle.includes('party') || lowerTitle.includes('energetic')) {
        return 'energetic';
    }
    return 'mixed';
}

// Enhanced song library with real previews
let ENHANCED_SONGS = [];

async function loadEnhancedSongs() {
    const searchQueries = [
        "Arijit Singh",
        "Pritam", 
        "A.R. Rahman",
        "Anirudh Ravichander",
        "Badshah"
    ];
    
    const allSongs = [...SAMPLE_SONGS];
    
    for (const query of searchQueries) {
        const deezerSongs = await searchDeezer(query, 5);
        allSongs.push(...deezerSongs);
    }
    
    ENHANCED_SONGS = allSongs;
    return ENHANCED_SONGS;
}

// Function to get songs by playlist name
function getPlaylistSongs(playlistId) {
    const playlist = PREDEFINED_PLAYLISTS.find(p => p.id === playlistId);
    if (!playlist) return [];
    
    const availableSongs = SAMPLE_SONGS;
    
    // Filter songs by playlist category
    return availableSongs.filter(song => song.playlist === playlistId);
}

// Function to get songs by playlist category
function getSongsByPlaylistCategory(category) {
    const availableSongs = SAMPLE_SONGS;
    
    if (category === 'mixed') {
        return availableSongs.sort(() => Math.random() - 0.5).slice(0, 12);
    }
    
    // Filter songs by playlist category
    return availableSongs.filter(song => song.playlist === category);
}

/* MOON Music – frontend */

const API_DETECT = "http://127.0.0.1:5000/detect";
const DETECT_INTERVAL_MS = 3000;
const PREVIEW_DURATION_MS = 30000; // 30 second preview

const STORAGE_KEY = "moon_user";
const PLAYLISTS_KEY = "moon_playlists";
const SETTINGS_KEY = "moon_settings";

const audio = document.getElementById("audioPlayer");
const btnPlay = document.getElementById("btnPlay");
const progressBar = document.getElementById("progressBar");
const volumeSlider = document.getElementById("volumeSlider");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const songTitleEl = document.getElementById("songTitle");
const songArtistEl = document.getElementById("songArtist");
const playerAlbumEl = document.getElementById("playerAlbum");

const landing = document.getElementById("landing");
const app = document.getElementById("app");

// Auth elements
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const signupUsername = document.getElementById("signupUsername");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");
const loginHint = document.getElementById("loginHint");
const signupHint = document.getElementById("signupHint");

// Landing buttons
const btnHeroLogin = document.getElementById("btnHeroLogin");
const btnHeroSignUp = document.getElementById("btnHeroSignUp");

// Modal controls
const closeLoginModal = document.getElementById("closeLoginModal");
const closeSignupModal = document.getElementById("closeSignupModal");
const switchToSignup = document.getElementById("switchToSignup");
const switchToLogin = document.getElementById("switchToLogin");

// Navigation
const viewHome = document.getElementById("viewHome");
const viewMood = document.getElementById("viewMood");
const viewSearch = document.getElementById("viewSearch");
const viewProfile = document.getElementById("viewProfile");
const viewSettings = document.getElementById("viewSettings");
const navLinks = document.querySelectorAll(".nav-link");
const navHome = document.getElementById("navHome");
const profileUsername = document.getElementById("profileUsername");
const profileAvatar = document.getElementById("profileAvatar");
const progressWaveform = document.getElementById("progressWaveform");

// Mood detection
const cameraPreview = document.getElementById("cameraPreview");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const emotionLabel = document.getElementById("emotionLabel");
const btnStartDetect = document.getElementById("btnStartDetect");
const btnStopDetect = document.getElementById("btnStopDetect");

// Player controls
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnShuffle = document.getElementById("btnShuffle");
const btnRepeat = document.getElementById("btnRepeat");

// Settings
const btnSettings = document.getElementById("btnSettings");
const btnLogout = document.getElementById("btnLogout");
const btnChangePassword = document.getElementById("btnChangePassword");
const autoplayToggle = document.getElementById("autoplayToggle");
const previewDuration = document.getElementById("previewDuration");
const moodNotifications = document.getElementById("moodNotifications");

// Playlists
const userPlaylists = document.getElementById("userPlaylists");

// Search
const searchHeroInput = document.getElementById("searchHeroInput");

let songs = [];
let currentSong = null;
let stream = null;
let detectIntervalId = null;
let previewTimeoutId = null;
let listeningHistory = [];
let favorites = [];
let playlists = [];
let isShuffled = false;
let isRepeating = false;
let currentPlaylist = [];
let currentSongIndex = 0;

function getStoredUser() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setStoredUser(user) {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
}

function getStoredPlaylists() {
    try {
        const raw = localStorage.getItem(PLAYLISTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function setStoredPlaylists(playlists) {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

function getStoredSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : {
            autoplay: true,
            previewDuration: 30,
            moodNotifications: true,
            theme: 'moon'
        };
    } catch {
        return {
            autoplay: true,
            previewDuration: 30,
            moodNotifications: true,
            theme: 'moon'
        };
    }
}

function setStoredSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Modal functions
function showModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
}

function showLanding() {
    landing.hidden = false;
    app.hidden = true;
    document.body.classList.remove("app-visible");
}

function showApp() {
    landing.hidden = true;
    app.hidden = false;
    document.body.classList.add("app-visible");
    const user = getStoredUser();
    
    // Update both old and new profile elements
    if (profileUsername) profileUsername.textContent = user ? user.username : "User";
    if (profileAvatar) profileAvatar.textContent = user && user.username ? user.username.charAt(0).toUpperCase() : "👤";
    
    const profileUsernameLarge = document.getElementById('profileUsernameLarge');
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileUsernameLarge) profileUsernameLarge.textContent = user ? user.username : "User";
    if (profileAvatarLarge) profileAvatarLarge.textContent = user && user.username ? user.username.charAt(0).toUpperCase() : "👤";
    
    const navAv = document.getElementById("navAvatar");
    if (navAv) navAv.textContent = user && user.username ? user.username.charAt(0).toUpperCase() : "👤";
    
    loadPlaylists();
    loadSettings();
    updateProfileLists();
}

function getAlbumArtUrl(song) {
    const seed = (song.title + song.artist).replace(/\s/g, "").slice(0, 20) || "music";
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/200/200`;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function formatTime(seconds) {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function createSongCard(song) {
    const card = document.createElement("div");
    card.className = "song-card";
    const imgUrl = escapeAttr(song.cover && song.cover.trim() ? song.cover : getAlbumArtUrl(song));
    card.innerHTML = `
        <div class="card-image-wrap">
            <img class="card-image" src="${imgUrl}" alt="" loading="lazy" />
            <div class="play-overlay">
                <button class="play-btn-overlay" type="button" aria-label="Play">▶</button>
            </div>
        </div>
        <div class="card-info">
            <div class="card-title">${escapeHtml(song.title)}</div>
            <div class="card-artist">${escapeHtml(song.artist)}</div>
        </div>
    `;
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05) translateY(-4px)';
        card.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
        
        // Show play button with glow
        const playBtn = card.querySelector('.play-btn-overlay');
        if (playBtn) {
            playBtn.style.opacity = '1';
            playBtn.style.transform = 'scale(1)';
            playBtn.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.8)';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) translateY(0)';
        card.style.boxShadow = 'var(--shadow)';
        
        // Hide play button
        const playBtn = card.querySelector('.play-btn-overlay');
        if (playBtn) {
            playBtn.style.opacity = '0';
            playBtn.style.transform = 'scale(0.8)';
            playBtn.style.boxShadow = 'none';
        }
    });
    
    card.addEventListener("click", () => playSong(song));
    return card;
}

function renderSongsInto(container, list) {
    if (!container) return;
    container.innerHTML = "";
    if (!list || list.length === 0) return;
    list.forEach((song) => container.appendChild(createSongCard(song)));
}

function clearPreviewTimeout() {
    if (previewTimeoutId) {
        clearTimeout(previewTimeoutId);
        previewTimeoutId = null;
    }
}

const audioPlayer = document.getElementById("audioPlayer");

function playSong(song) {
    if (!song || !audioPlayer) return;
    
    // Clear any existing preview timeout
    clearPreviewTimeout();
    
    // Update current song and playlist
    currentSong = song;
    if (!currentPlaylist.includes(song)) {
        const availableSongs = SAMPLE_SONGS;
        currentPlaylist = availableSongs;
        currentSongIndex = currentPlaylist.findIndex(s => s.title === song.title && s.artist === song.artist);
    }
    
    // Update player UI with smooth animation
    updatePlayerUI(song);
    
    // Load and play the correct audio
    audioPlayer.src = song.audio || "";
    audioPlayer.play().catch(error => {
        console.error('Audio playback failed:', error);
        showNotification('Audio playback failed. Try another song.');
    });
    
    updatePlayButton(true);
    
    // Update player title
    const playerTitle = document.getElementById("songTitle");
    if (playerTitle) {
        playerTitle.innerText = song.title;
    }
    
    // Set up 30-second preview timeout
    const settings = getStoredSettings();
    const duration = (settings.previewDuration || 30) * 1000;
    
    previewTimeoutId = setTimeout(() => {
        audioPlayer.pause();
        updatePlayButton(false);
        progressBar.value = 0;
        if (progressWaveform) progressWaveform.style.width = "0%";
        currentTimeEl.textContent = "0:00";
        previewTimeoutId = null;
        
        // Auto-play next song if enabled
        if (settings.autoplay && currentPlaylist.length > 1) {
            if (isRepeating) {
                playSong(currentSong);
            } else {
                playNextSong();
            }
        }
    }, duration);
    
    // Update listening history
    listeningHistory = [{ ...song }, ...listeningHistory.filter((s) => s.title !== song.title || s.artist !== song.artist)].slice(0, 20);
    updateProfileLists();
    updateAllSections();
}

function updatePlayerUI(song) {
    // Add fade animation
    const playerInfo = document.querySelector('.song-info');
    const playerAlbum = document.querySelector('.player-album');
    
    if (playerInfo && playerAlbum) {
        playerInfo.style.opacity = '0.7';
        playerAlbum.style.opacity = '0.7';
        
        setTimeout(() => {
            songTitleEl.textContent = song.title;
            songArtistEl.textContent = song.artist;
            
            // Update album artwork with animation
            playerAlbumEl.innerHTML = "";
            const img = document.createElement("img");
            img.src = song.cover || getAlbumArtUrl(song);
            img.alt = `${song.title} by ${song.artist}`;
            img.style.animation = 'fadeIn 0.5s ease';
            playerAlbumEl.appendChild(img);
            
            playerInfo.style.opacity = '1';
            playerAlbum.style.opacity = '1';
        }, 200);
    }
    
    // Update waveform visualization
    updateWaveform(song);
}

function updateWaveform(song) {
    if (!progressWaveform) return;
    
    // Create animated waveform bars
    const barCount = 50;
    let waveformHTML = '';
    
    for (let i = 0; i < barCount; i++) {
        const height = Math.random() * 60 + 20; // Random height between 20-80%
        waveformHTML += `<div class="waveform-bar" style="height: ${height}%"></div>`;
    }
    
    progressWaveform.innerHTML = waveformHTML;
    progressWaveform.style.animation = 'waveformPulse 2s ease-in-out infinite';
}

function updateWaveformProgress(progress) {
    if (!progressWaveform) return;
    
    const bars = progressWaveform.querySelectorAll('.waveform-bar');
    const activeBars = Math.floor(bars.length * (progress / 100));
    
    bars.forEach((bar, index) => {
        if (index < activeBars) {
            bar.style.background = 'var(--purple-accent)';
            bar.style.boxShadow = '0 0 10px var(--purple-accent)';
        } else {
            bar.style.background = 'rgba(255, 255, 255, 0.3)';
            bar.style.boxShadow = 'none';
        }
    });
}

function getSongByTitle(title, artist) {
    const availableSongs = SAMPLE_SONGS;
    return availableSongs.find(song => song.title === title && song.artist === artist);
}

function getPlaylistSongs(playlistSongTitles) {
    const availableSongs = SAMPLE_SONGS;
    return playlistSongTitles.map(title => availableSongs.find(song => song.title === title)).filter(Boolean);
}

// Enhanced emotion-based recommendations
function getEmotionBasedRecommendations(emotion, songArray = null) {
    const availableSongs = songArray || SAMPLE_SONGS;
    if (!availableSongs.length) return [];
    
    let filteredSongs = [...availableSongs];
    
    switch (emotion.toLowerCase()) {
        case 'happy':
            // Energetic, upbeat songs
            filteredSongs = getSongsByPlaylistCategory('energetic');
            break;
        case 'sad':
            // Calm, melancholic songs
            filteredSongs = getSongsByPlaylistCategory('sad');
            break;
        case 'angry':
            // High energy, intense songs
            filteredSongs = getSongsByPlaylistCategory('energetic');
            break;
        case 'neutral':
        default:
            // Mixed songs - no filtering, just randomize
            filteredSongs = getSongsByPlaylistCategory('mixed');
            break;
    }
    
    // If filtering resulted in too few songs, add random ones
    if (filteredSongs.length < 5) {
        const additionalSongs = availableSongs.filter(song => 
            !filteredSongs.some(f => f.title === song.title && f.artist === song.artist)
        ).slice(0, 10 - filteredSongs.length);
        filteredSongs = [...filteredSongs, ...additionalSongs];
    }
    
    // Return top recommendations
    return filteredSongs.slice(0, 12);
}

function updateAllSections() {
    // Use sample songs if available, fallback to backend songs
    const availableSongs = SAMPLE_SONGS.length > 0 ? SAMPLE_SONGS : (songs.length > 0 ? songs : []);
    
    renderSongsInto(document.getElementById("trendingRow"), availableSongs.slice(0, 8));
    renderSongsInto(document.getElementById("popularRow"), availableSongs.slice(0, 6));
    renderSongsInto(document.getElementById("recommendedRow"), availableSongs.slice(0, 10));
    renderSongsInto(document.getElementById("jumpBackRow"), availableSongs.slice(0, 6));
    renderSongsInto(document.getElementById("recentlyPlayedRow"), listeningHistory.slice(0, 6));
}

function loadPlaylist(name) {
    const playlistSongs = SAMPLE_SONGS.filter(song => song.playlist === name);
    showSongs(playlistSongs);
}

function showSongs(songs) {
    const container = document.getElementById("songGrid");
    if (!container) return;
    
    container.innerHTML = "";
    songs.forEach(song => {
        const card = document.createElement("div");
        card.className = "songCard";
        
        card.innerHTML = `
            <img src="${song.cover}" alt="${song.title}">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        `;
        
        card.onclick = () => playSong(song);
        container.appendChild(card);
    });
}

function renderSongs(songs) {
    const container = document.getElementById("songContainer");
    if (!container) return;
    
    container.innerHTML = "";
    songs.forEach(song => {
        const card = document.createElement("div");
        card.className = "songCard";
        
        card.innerHTML = `
            <img src="${song.cover}" class="cover" alt="${song.title}">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        `;
        
        card.onclick = () => playSong(song);
        container.appendChild(card);
    });
}

async function detectMood() {
    try {
        const response = await fetch("http://127.0.0.1:5000/detect");
        const data = await response.json();
        console.log(data);
        renderSongs(data.songs || []);
        
        // Update emotion text
        const emotionText = document.getElementById("emotionText");
        if (emotionText) {
            emotionText.innerText = "Detected Emotion: " + data.emotion;
        }
    } catch (error) {
        console.error('Error detecting mood:', error);
        // Fallback to sample songs
        renderSongs(SAMPLE_SONGS);
    }
}

function showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = 'notification glass';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        background: var(--purple-accent);
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function updateProfileLists() {
    renderSongsInto(document.getElementById("historyRow"), listeningHistory.slice(0, 8));
    renderSongsInto(document.getElementById("favoritesRow"), favorites.length ? favorites : listeningHistory.slice(0, 6));
    
    // Update profile stats
    updateProfileStats();
    
    // Update top artists
    updateTopArtists();
}

function updateProfileStats() {
    const user = getStoredUser();
    const userPlaylists = getStoredPlaylists();
    const totalPlaylists = PREDEFINED_PLAYLISTS.length + userPlaylists.length;
    
    // Update profile elements
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const profileUsernameLarge = document.getElementById('profileUsernameLarge');
    const playlistCount = document.getElementById('playlistCount');
    const listeningCount = document.getElementById('listeningCount');
    
    if (profileAvatarLarge && user && user.username) {
        profileAvatarLarge.textContent = user.username.charAt(0).toUpperCase();
    }
    
    if (profileUsernameLarge && user && user.username) {
        profileUsernameLarge.textContent = user.username;
    }
    
    if (playlistCount) {
        playlistCount.textContent = totalPlaylists;
    }
    
    if (listeningCount) {
        listeningCount.textContent = listeningHistory.length;
    }
}

function updateTopArtists() {
    const topArtistsGrid = document.getElementById('topArtistsGrid');
    if (!topArtistsGrid) return;
    
    // Get top artists from listening history
    const artistCounts = {};
    listeningHistory.forEach(song => {
        if (song.artist) {
            artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 1;
        }
    });
    
    // Sort by play count and get top 6
    const topArtists = Object.entries(artistCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([artist, count]) => ({ name: artist, songs: count }));
    
    // If no listening history, show default artists
    if (topArtists.length === 0) {
        topArtists.push(
            { name: 'Arijit Singh', songs: 12 },
            { name: 'Pritam', songs: 8 },
            { name: 'Vishal-Shekhar', songs: 6 },
            { name: 'A.R. Rahman', songs: 5 },
            { name: 'Badshah', songs: 4 },
            { name: 'Neha Kakkar', songs: 3 }
        );
    }
    
    // Render artist cards
    topArtistsGrid.innerHTML = '';
    topArtists.forEach(artist => {
        const artistCard = createArtistCard(artist);
        topArtistsGrid.appendChild(artistCard);
    });
}

function createArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'artist-card';
    
    // Generate avatar based on artist name
    const avatarEmoji = getArtistAvatar(artist.name);
    
    card.innerHTML = `
        <div class="artist-avatar">${avatarEmoji}</div>
        <h4 class="artist-name">${escapeHtml(artist.name)}</h4>
        <p class="artist-songs">${artist.songs} songs</p>
    `;
    
    card.addEventListener('click', () => {
        // Show artist's songs
        const artistSongs = SAMPLE_SONGS.filter(song => song.artist === artist.name);
        if (artistSongs.length > 0) {
            currentPlaylist = artistSongs;
            currentSongIndex = 0;
            playSong(currentPlaylist[0]);
            showView('viewHome');
        }
    });
    
    return card;
}

function getArtistAvatar(artistName) {
    // Simple mapping of artist names to emojis
    const artistEmojis = {
        'Arijit Singh': '🎤',
        'Pritam': '🎹',
        'Vishal-Shekhar': '🎸',
        'A.R. Rahman': '🎺',
        'Badshah': '🎧',
        'Neha Kakkar': '🎵',
        'Alka Yagnik': '🎶',
        'Udit Narayan': '🎼',
        'Shreya Ghoshal': '🎤',
        'Sonu Nigam': '🎙️'
    };
    
    return artistEmojis[artistName] || '🎵';
}

// Playlist functions
function loadPlaylists() {
    // Load predefined playlists and user playlists
    playlists = [...PREDEFINED_PLAYLISTS, ...getStoredPlaylists()];
    renderPlaylists();
}

function renderPlaylists() {
    if (!userPlaylists) return;
    userPlaylists.innerHTML = "";
    
    // Add create playlist button
    const createCard = createPlaylistCard(null);
    userPlaylists.appendChild(createCard);
    
    // Add existing playlists
    playlists.forEach(playlist => {
        const card = createPlaylistCard(playlist);
        userPlaylists.appendChild(card);
    });
}

function createPlaylistCard(playlist) {
    const card = document.createElement("div");
    card.className = "playlist-card glass";
    
    if (playlist === null) {
        // Create playlist button
        card.className += " create-playlist-btn";
        card.innerHTML = `
            <div class="create-icon">+</div>
            <div class="create-label">Create Playlist</div>
        `;
        card.addEventListener("click", () => {
            const name = prompt("Enter playlist name:");
            if (name && name.trim()) {
                const userPlaylists = getStoredPlaylists();
                const newPlaylist = {
                    id: Date.now().toString(),
                    name: name.trim(),
                    songs: []
                };
                const updatedPlaylists = [...userPlaylists, newPlaylist];
                setStoredPlaylists(updatedPlaylists);
                loadPlaylists();
                showNotification(`Playlist "${name}" created!`);
            }
        });
    } else {
        // Existing playlist
        const playlistSongs = getPlaylistSongs(playlist.id);
        const songCount = playlistSongs.length;
        
        card.innerHTML = `
            <div class="playlist-image">
                <div class="playlist-overlay">
                    <button class="play-btn-overlay" type="button" aria-label="Play">▶</button>
                </div>
                <div class="playlist-cover">${playlist.name.charAt(0).toUpperCase()}</div>
            </div>
            <div class="playlist-info">
                <h4 class="playlist-title">${escapeHtml(playlist.name)}</h4>
                <p class="playlist-count">${songCount} songs</p>
            </div>
        `;
        
        card.addEventListener("click", () => {
            if (playlistSongs.length > 0) {
                currentPlaylist = playlistSongs;
                currentSongIndex = 0;
                showPlaylistView(playlist, playlistSongs);
            } else {
                showNotification('This playlist is empty.');
            }
        });
    }
    
    return card;
}

function createPlaylist() {
    const name = prompt("Enter playlist name:");
    if (!name || name.trim() === "") return;
    
    const newPlaylist = {
        id: Date.now().toString(),
        name: name.trim(),
        songs: [],
        createdAt: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    setStoredPlaylists(playlists.filter(p => !PREDEFINED_PLAYLISTS.some(predef => predef.id === p.id)));
    renderPlaylists();
}

function deletePlaylist(playlistId) {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    
    playlists = playlists.filter(p => p.id !== playlistId);
    setStoredPlaylists(playlists.filter(p => !PREDEFINED_PLAYLISTS.some(predef => predef.id === p.id)));
    renderPlaylists();
}

function openPlaylist(playlist) {
    // Get actual songs for this playlist
    const playlistSongs = playlist.songs ? playlist.songs : getPlaylistSongs(playlist.songs || []);
    
    // Show playlist view
    showPlaylistView(playlist, playlistSongs);
}

function showPlaylistView(playlist, songs) {
    // Create playlist view HTML
    const playlistHTML = `
        <div class="playlist-view" id="playlistView">
            <div class="playlist-header glass">
                <button class="btn-back" onclick="showView('viewProfile')">← Back</button>
                <div class="playlist-info">
                    <h2 class="playlist-title">${escapeHtml(playlist.name)}</h2>
                    <p class="playlist-meta">${songs.length} songs</p>
                </div>
                <button class="btn-play-all" onclick="playPlaylist(${JSON.stringify(playlist.songs || [])})">
                    ▶ Play All
                </button>
            </div>
            <div class="playlist-songs">
                <div class="songs-list" id="playlistSongsList"></div>
            </div>
        </div>
    `;
    
    // Hide other views and show playlist
    viewHome.hidden = true;
    viewMood.hidden = true;
    viewSearch.hidden = true;
    viewProfile.hidden = true;
    viewSettings.hidden = true;
    
    // Add playlist view to app
    const existingPlaylistView = document.getElementById('playlistView');
    if (existingPlaylistView) {
        existingPlaylistView.remove();
    }
    
    app.insertAdjacentHTML('beforeend', playlistHTML);
    
    // Render songs in playlist
    const songsList = document.getElementById('playlistSongsList');
    if (songsList) {
        songsList.innerHTML = '';
        songs.forEach(song => {
            const songElement = createPlaylistSongElement(song);
            songsList.appendChild(songElement);
        });
    }
}

function createPlaylistSongElement(song) {
    const songDiv = document.createElement('div');
    songDiv.className = 'playlist-song glass';
    songDiv.innerHTML = `
        <div class="song-artwork">
            <img src="${song.cover}" alt="${escapeHtml(song.title)}" />
        </div>
        <div class="song-details">
            <div class="song-title">${escapeHtml(song.title)}</div>
            <div class="song-artist">${escapeHtml(song.artist)}</div>
        </div>
        <button class="btn-play-song" onclick="playSong(${JSON.stringify(song).replace(/"/g, '&quot;')})">
            ▶
        </button>
    `;
    return songDiv;
}

function playPlaylist(songTitles) {
    const playlistSongs = getPlaylistSongs(songTitles);
    if (playlistSongs.length > 0) {
        currentPlaylist = playlistSongs;
        currentSongIndex = 0;
        playSong(currentPlaylist[0]);
    }
}

// Settings functions
function loadSettings() {
    const settings = getStoredSettings();
    
    if (autoplayToggle) autoplayToggle.checked = settings.autoplay;
    if (previewDuration) previewDuration.value = settings.previewDuration;
    if (moodNotifications) moodNotifications.checked = settings.moodNotifications;
    
    // Apply theme
    applyTheme(settings.theme);
}

function saveSettings() {
    const settings = {
        autoplay: autoplayToggle ? autoplayToggle.checked : true,
        previewDuration: previewDuration ? parseInt(previewDuration.value) : 30,
        moodNotifications: moodNotifications ? moodNotifications.checked : true,
        theme: document.querySelector('.theme-btn.active')?.dataset.theme || 'moon'
    };
    
    setStoredSettings(settings);
    
    // Update preview duration
    if (settings.previewDuration) {
        PREVIEW_DURATION_MS = settings.previewDuration * 1000;
    }
}

function applyTheme(theme) {
    document.body.className = theme === 'light' ? 'light-theme' : '';
}

function startCamera() {
    if (stream) return Promise.resolve(stream);
    return navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((s) => {
            stream = s;
            if (cameraPreview.playsInline !== undefined) cameraPreview.playsInline = true;
            cameraPreview.srcObject = s;
            cameraPreview.classList.add("active");
            return s;
        })
        .catch((err) => {
            console.error("Camera error:", err);
            cameraPlaceholder.textContent = "Could not access camera. Check permissions.";
            return null;
        });
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
    }
    cameraPreview.srcObject = null;
    cameraPreview.classList.remove("active");
    if (detectIntervalId) {
        clearInterval(detectIntervalId);
        detectIntervalId = null;
    }
    cameraPlaceholder.textContent = "Click Start Detection to open the camera.";
}

function startDetection() {
    if (!btnStartDetect) return;
    btnStartDetect.disabled = true;
    startCamera().then(() => {
        detectMood();
        detectIntervalId = setInterval(detectMood, DETECT_INTERVAL_MS);
        if (btnStopDetect) btnStopDetect.disabled = false;
    }).catch(() => {
        btnStartDetect.disabled = false;
    });
}

function stopDetection() {
    stopCamera();
    if (btnStartDetect) btnStartDetect.disabled = false;
    if (btnStopDetect) btnStopDetect.disabled = true;
    setEmotionLabel(null);
}

function showView(viewId) {
    viewHome.hidden = viewId !== "viewHome";
    viewMood.hidden = viewId !== "viewMood";
    viewSearch.hidden = viewId !== "viewSearch";
    viewProfile.hidden = viewId !== "viewProfile";
    viewSettings.hidden = viewId !== "viewSettings";
    const viewName = viewId.replace("view", "").toLowerCase();
    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("data-view") === viewName);
    });
    if (viewId === "viewMood") {
        if (btnStopDetect) btnStopDetect.disabled = !detectIntervalId;
    } else {
        stopDetection();
    }
    if (viewId === "viewProfile") updateProfileLists();
    if (viewId === "viewSettings") loadSettings();
}

// Enhanced player functions
function playNextSong() {
    if (!currentPlaylist.length) return;
    
    if (isShuffled) {
        currentSongIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    }
    
    playSong(currentPlaylist[currentSongIndex]);
}

function playPrevSong() {
    if (!currentPlaylist.length) return;
    
    currentSongIndex = currentSongIndex === 0 ? currentPlaylist.length - 1 : currentSongIndex - 1;
    playSong(currentPlaylist[currentSongIndex]);
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    btnShuffle.classList.toggle("active", isShuffled);
}

function toggleRepeat() {
    isRepeating = !isRepeating;
    btnRepeat.classList.toggle("active", isRepeating);
}

// Enhanced search functionality
function performSearch(query) {
    if (!query || query.trim() === "") return;
    
    const results = [];
    const searchTerm = query.toLowerCase();
    
    // Search in songs
    songs.forEach(song => {
        if (song.title.toLowerCase().includes(searchTerm) || 
            song.artist.toLowerCase().includes(searchTerm)) {
            results.push({ ...song, type: 'song' });
        }
    });
    
    // Display search results
    displaySearchResults(results);
}

function displaySearchResults(results) {
    // For now, just log results - full search UI coming soon
    console.log('Search results:', results);
}

// Event Listeners
if (btnHeroLogin) {
    btnHeroLogin.addEventListener("click", () => showModal(loginModal));
}

if (btnHeroSignUp) {
    btnHeroSignUp.addEventListener("click", () => showModal(signupModal));
}

if (closeLoginModal) {
    closeLoginModal.addEventListener("click", () => hideModal(loginModal));
}

if (closeSignupModal) {
    closeSignupModal.addEventListener("click", () => hideModal(signupModal));
}

if (switchToSignup) {
    switchToSignup.addEventListener("click", () => {
        hideModal(loginModal);
        showModal(signupModal);
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener("click", () => {
        hideModal(signupModal);
        showModal(loginModal);
    });
}

// Close modals on backdrop click
[loginModal, signupModal].forEach(modal => {
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    }
});

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = (loginUsername && loginUsername.value.trim()) || "";
        const password = loginPassword ? loginPassword.value : "";
        if (!username) {
            if (loginHint) { loginHint.textContent = "Enter a username."; loginHint.classList.add("error"); }
            return;
        }
        const user = getStoredUser();
        if (user && user.username === username) {
            if (user.password !== password) {
                if (loginHint) { loginHint.textContent = "Wrong password."; loginHint.classList.add("error"); }
                return;
            }
        } else {
            setStoredUser({ username, password });
        }
        if (loginHint) { loginHint.textContent = ""; loginHint.classList.remove("error"); }
        loginPassword.value = "";
        hideModal(loginModal);
        showApp();
        fetch(API_DETECT)
            .then((r) => r.json())
            .then((data) => {
                songs = data.songs || [];
                currentPlaylist = songs;
                updateAllSections();
            })
            .catch(() => {});
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = (signupUsername && signupUsername.value.trim()) || "";
        const email = (signupEmail && signupEmail.value.trim()) || "";
        const password = signupPassword ? signupPassword.value : "";
        const confirmPassword = signupConfirmPassword ? signupConfirmPassword.value : "";
        
        if (!username) {
            if (signupHint) { signupHint.textContent = "Enter a username."; signupHint.classList.add("error"); }
            return;
        }
        
        if (!email || !email.includes("@")) {
            if (signupHint) { signupHint.textContent = "Enter a valid email."; signupHint.classList.add("error"); }
            return;
        }
        
        if (password.length < 6) {
            if (signupHint) { signupHint.textContent = "Password must be at least 6 characters."; signupHint.classList.add("error"); }
            return;
        }
        
        if (password !== confirmPassword) {
            if (signupHint) { signupHint.textContent = "Passwords do not match."; signupHint.classList.add("error"); }
            return;
        }
        
        setStoredUser({ username, email, password });
        if (signupHint) { signupHint.textContent = "Account created successfully!"; signupHint.classList.remove("error"); }
        
        setTimeout(() => {
            hideModal(signupModal);
            showApp();
            fetch(API_DETECT)
                .then((r) => r.json())
                .then((data) => {
                    songs = data.songs || [];
                    currentPlaylist = songs;
                    updateAllSections();
                })
                .catch(() => {});
        }, 1000);
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.getAttribute("data-view");
        if (view === "home") showView("viewHome");
        else if (view === "search") showView("viewSearch");
        else if (view === "mood") showView("viewMood");
        else if (view === "profile") showView("viewProfile");
    });
});

if (navHome) {
    navHome.addEventListener("click", (e) => { e.preventDefault(); showView("viewHome"); });
}

if (document.getElementById("btnProfileNav")) {
    document.getElementById("btnProfileNav").addEventListener("click", () => showView("viewProfile"));
}

if (btnSettings) {
    btnSettings.addEventListener("click", () => showView("viewSettings"));
}

// Settings event listeners
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            setStoredUser(null);
            showLanding();
        }
    });
}

if (btnChangePassword) {
    btnChangePassword.addEventListener("click", () => {
        const newPassword = prompt("Enter new password:");
        if (newPassword && newPassword.length >= 6) {
            const user = getStoredUser();
            if (user) {
                user.password = newPassword;
                setStoredUser(user);
                alert("Password changed successfully!");
            }
        } else if (newPassword) {
            alert("Password must be at least 6 characters.");
        }
    });
}

// Settings save on change
[autoplayToggle, previewDuration, moodNotifications].forEach(element => {
    if (element) {
        element.addEventListener("change", saveSettings);
    }
});

// Theme toggle
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        saveSettings();
    });
});

// Search functionality
if (searchHeroInput) {
    let searchTimeout;
    searchHeroInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

// Player controls
if (btnShuffle) {
    btnShuffle.addEventListener("click", toggleShuffle);
}

if (btnRepeat) {
    btnRepeat.addEventListener("click", toggleRepeat);
}

if (btnPrev) {
    btnPrev.addEventListener("click", playPrevSong);
}

if (btnNext) {
    btnNext.addEventListener("click", playNextSong);
}

if (btnStartDetect) btnStartDetect.addEventListener("click", startDetection);
if (btnStopDetect) {
    btnStopDetect.disabled = true;
    btnStopDetect.addEventListener("click", stopDetection);
}

audio.addEventListener("play", () => updatePlayButton(true));
audio.addEventListener("pause", () => {
    updatePlayButton(false);
    clearPreviewTimeout();
});
audio.addEventListener("timeupdate", () => {
    if (!isFinite(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.value = pct;
    
    // Update waveform progress visualization
    updateWaveformProgress(pct);
    
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    totalTimeEl.textContent = formatTime(audio.duration);
    
    // Initialize waveform when metadata is loaded
    if (currentSong) {
        updateWaveform(currentSong);
    }
});

audio.addEventListener("ended", () => {
    updatePlayButton(false);
    progressBar.value = 0;
    
    // Reset waveform
    if (progressWaveform) {
        const bars = progressWaveform.querySelectorAll('.waveform-bar');
        bars.forEach(bar => {
            bar.style.background = 'rgba(255, 255, 255, 0.3)';
            bar.style.boxShadow = 'none';
        });
    }
    
    currentTimeEl.textContent = "0:00";
    clearPreviewTimeout();
    
    // Auto-play next song if enabled
    const settings = getStoredSettings();
    if (settings.autoplay && currentPlaylist.length > 1) {
        if (isRepeating) {
            playSong(currentSong);
        } else {
            playNextSong();
        }
    }
});

progressBar.addEventListener("input", (e) => {
    const pct = Number(e.target.value);
    updateWaveformProgress(pct);
    if (isFinite(audio.duration)) audio.currentTime = (pct / 100) * audio.duration;
});
volumeSlider.addEventListener("input", (e) => {
    audio.volume = Number(e.target.value) / 100;
});
btnPlay.addEventListener("click", togglePlay);

document.getElementById("btnPrev").addEventListener("click", () => {
    if (!songs.length || !currentSong) return;
    const idx = songs.findIndex((s) => s === currentSong);
    playSong(idx <= 0 ? songs[songs.length - 1] : songs[idx - 1]);
});
document.getElementById("btnNext").addEventListener("click", () => {
    if (!songs.length || !currentSong) return;
    const idx = songs.findIndex((s) => s === currentSong);
    playSong(idx >= songs.length - 1 ? songs[0] : songs[idx + 1]);
});

// Star particles background effect
function createStarParticles() {
    const starContainer = document.getElementById('starParticles');
    if (!starContainer) return;
    
    const starCount = 50;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Random animation delay
        star.style.animationDelay = Math.random() * 3 + 's';
        
        // Random size
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // Random opacity
        star.style.opacity = Math.random() * 0.8 + 0.2;
        
        starContainer.appendChild(star);
    }
}

// Initialize application
window.addEventListener("load", async () => {
    // Create star particles
    createStarParticles();
    
    const user = getStoredUser();
    if (user) {
        showApp();
        
        // Try backend first, then use sample songs
        try {
            const response = await fetch(API_DETECT);
            const data = await response.json();
            songs = data.songs || [];
            
            if (songs.length > 0) {
                currentPlaylist = songs;
                updateAllSections();
            } else {
                // Use sample songs if backend returns empty
                songs = [];
                currentPlaylist = SAMPLE_SONGS;
                updateAllSections();
            }
        } catch (error) {
            console.log('Backend unavailable, using sample songs');
            songs = [];
            currentPlaylist = SAMPLE_SONGS;
            updateAllSections();
        }
    } else {
        showLanding();
    }
});

// Add missing functions that were referenced
function updatePlayButton(playing) {
    btnPlay.classList.toggle("playing", playing);
    btnPlay.textContent = playing ? "" : "▶";
    btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
}

function togglePlay() {
    if (!audio.src) return;
    if (audio.paused) {
        clearPreviewTimeout();
        audio.play().catch(() => {});
        updatePlayButton(true);
        const settings = getStoredSettings();
        const duration = (settings.previewDuration || 30) * 1000;
        previewTimeoutId = setTimeout(() => {
            audio.pause();
            updatePlayButton(false);
            progressBar.value = 0;
            currentTimeEl.textContent = "0:00";
            if (progressWaveform) progressWaveform.style.width = "0%";
            previewTimeoutId = null;
            
            // Auto-play next song if enabled
            if (settings.autoplay && currentPlaylist.length > 1) {
                if (isRepeating) {
                    playSong(currentSong);
                } else {
                    playNextSong();
                }
            }
        }, duration);
    } else {
        clearPreviewTimeout();
        audio.pause();
        updatePlayButton(false);
    }
}

function setEmotionLabel(emotion) {
    const text = emotion ? emotion.charAt(0).toUpperCase() + emotion.slice(1) : "—";
    emotionLabel.textContent = "Detected Emotion: " + text;
}
