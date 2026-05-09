// ===== SPA NAVIGATION LOGIC ===== //
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!btn.dataset.target) return; // Skip logout or other non-view links
        e.preventDefault();
        
        // Remove active class from all buttons and views
        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.add('hidden'));
        views.forEach(v => v.classList.remove('active'));
        
        // Add active class to clicked button and target view
        btn.classList.add('active');
        const targetId = btn.dataset.target;
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
        }
    });
});

// ===== MUSIC AUDIO PLAYER LOGIC ===== //
const audio = document.getElementById('main-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn.querySelector('i');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const currentCover = document.getElementById('current-cover');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');

const progressBg = document.getElementById('progress-bg');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time'); // We'll cap at 30s

// Full Player Elements
const fullPlayer = document.getElementById('full-player');
const expandBtn = document.getElementById('expand-player-btn');
const closeBtn = document.getElementById('close-player-btn');

// Premium Player Elements
const premiumPlayBtn = document.getElementById('full-play-pause-btn');
const premiumFullCover = document.getElementById('full-cover');
const premiumFullTitle = document.getElementById('full-title');
const premiumFullArtist = document.getElementById('full-artist');

const volumeSlider = document.getElementById('volume-slider');

const fullPrevBtn = document.getElementById('full-prev-btn');
const fullNextBtn = document.getElementById('full-next-btn');
const fullProgressBg = document.getElementById('full-progress-bg');
const fullProgressFill = document.getElementById('full-progress-fill');
const fullCurrentTimeEl = document.getElementById('full-current-time');

const bottomPlayer = document.querySelector('.music-player');

// Lyrics removed for Apple Music style redesign

let playlist = [];
let currentSongIndex = 0;

// Search Elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchResultsContainer = document.getElementById('search-results-container');
const clearSearchBtn = document.getElementById('clear-search');
const genreCards = document.querySelectorAll('.genre-card');

// ===== SEARCH LOGIC ===== //
let searchTimeout = null;

async function performSearch(query) {
    if (!query || query.trim().length === 0) {
        searchResultsContainer.classList.add('hidden');
        return;
    }
    
    try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (data.songs && data.songs.length > 0) {
            playlist = data.songs; // Update global playlist for search context
            searchResults.innerHTML = '';
            data.songs.forEach((song, i) => {
                const card = createSongCard(song, i);
                searchResults.appendChild(card);
            });
            searchResultsContainer.classList.remove('hidden');
        } else {
            searchResults.innerHTML = '<div class="empty-state">No songs found.</div>';
            searchResultsContainer.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Search failed", e);
    }
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(query), 500);
});

genreCards.forEach(card => {
    card.addEventListener('click', () => {
        const genre = card.textContent;
        searchInput.value = genre;
        performSearch(genre);
    });
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchResultsContainer.classList.add('hidden');
    searchResults.innerHTML = '';
});
const MAX_PLAY_TIME = 30;

const spotifyEmbedContainer = document.getElementById('spotify-embed-container');
const visualHeader = document.querySelector('.visual-header');
const premiumControlsBox = document.querySelector('.premium-controls-box');

const miniPlayerControls = document.querySelector('.player-center');

function loadSong(index) {
    if (playlist.length === 0) return;
    const song = playlist[index];
    
    // Clear previous state
    pauseSong();
    spotifyEmbedContainer.innerHTML = '';
    spotifyEmbedContainer.classList.add('hidden');
    if (visualHeader) visualHeader.classList.remove('hidden');
    if (premiumControlsBox) premiumControlsBox.classList.remove('hidden');
    miniPlayerControls.classList.remove('hidden'); // Show by default
    bottomPlayer.classList.remove('hidden');

    if (song.source === "spotify") {
        spotifyEmbedContainer.classList.remove('hidden');
        if (visualHeader) visualHeader.classList.add('hidden'); // Hide visuals for Spotify
        if (premiumControlsBox) premiumControlsBox.classList.add('hidden'); // Hide controls for Spotify
        miniPlayerControls.classList.add('hidden'); 
        
        spotifyEmbedContainer.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${song.id}?autoplay=1" 
                width="100%" height="320" frameBorder="0" allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"></iframe>
        `;
        
        currentTitle.textContent = song.title;
        currentArtist.textContent = song.artist || "Spotify Track";
        currentCover.src = song.cover;
        currentCover.classList.remove('hidden');
        
        premiumFullArtist.textContent = song.artist;
        premiumFullCover.src = song.cover;
        
    } else {
        // Fallback tracks
        if (!song.audio || song.audio === "null") {
            currentTitle.textContent = "Playback Unavailable";
            return;
        }
        
        audio.src = song.audio;
        currentCover.src = song.cover;
        currentCover.classList.remove('hidden');
        currentTitle.textContent = song.title;
        currentArtist.textContent = song.artist || "Unknown Artist";
        
        premiumFullCover.src = song.cover;
        premiumFullTitle.textContent = song.title;
        premiumFullArtist.textContent = song.artist || "Unknown Artist";

        progressFill.style.width = '0%';
        fullProgressFill.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        fullCurrentTimeEl.textContent = '0:00';
    }
}

// Lyrics functions removed for Apple Music style redesign

// Update Play button visuals
function updatePlayIcons(isPlaying) {
    const iconClass = isPlaying ? 'fa-pause' : 'fa-play';
    playPauseIcon.className = `fa-solid ${iconClass}`;
    if (premiumPlayBtn) {
        premiumPlayBtn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    }
}

function playSong() {
    audio.play();
    updatePlayIcons(true);
}

function pauseSong() {
    audio.pause();
    updatePlayIcons(false);
}

function togglePlay() {
    if (playlist.length === 0) return;
    if (audio.paused) playSong();
    else pauseSong();
}

playPauseBtn.addEventListener('click', togglePlay);
if (premiumPlayBtn) premiumPlayBtn.addEventListener('click', togglePlay);

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    playSong();
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    playSong();
}

nextBtn.addEventListener('click', nextSong);
fullNextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
fullPrevBtn.addEventListener('click', prevSong);

// Expand/Collapse Player
expandBtn.addEventListener('click', () => fullPlayer.classList.remove('hidden'));
closeBtn.addEventListener('click', () => fullPlayer.classList.add('hidden'));
// Also expand when clicking the song info on bottom
document.querySelector('.player-left').addEventListener('click', () => fullPlayer.classList.remove('hidden'));

audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    if (current >= MAX_PLAY_TIME) {
        pauseSong();
        audio.currentTime = 0;
        return;
    }

    const progressPercent = (current / MAX_PLAY_TIME) * 100;
    progressFill.style.width = `${progressPercent}%`;
    fullProgressFill.style.width = `${progressPercent}%`;
    
    const minutes = Math.floor(current / 60);
    const seconds = Math.floor(current % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    currentTimeEl.textContent = timeStr;
    fullCurrentTimeEl.textContent = timeStr;
});

function handleProgressClick(e, element) {
    const width = element.clientWidth;
    const clickX = e.offsetX;
    const targetTime = (clickX / width) * MAX_PLAY_TIME;
    audio.currentTime = targetTime;
}

progressBg.addEventListener('click', (e) => handleProgressClick(e, progressBg));
fullProgressBg.addEventListener('click', (e) => handleProgressClick(e, fullProgressBg));

// Volume Slider Control Fix
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        audio.volume = val;
        // Visual indicator could be added here
    });
}

// Sidebar Click (Player) - already handled by expandBtn

// Render cards helper
function createSongCard(song, index) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
        <img src="${song.cover}" alt="Cover">
        <div class="title">${song.title}</div>
        <div class="artist">${song.artist || "Unknown Artist"}</div>
        <div class="play-hover-btn">
            <i class="fa-solid fa-play"></i>
        </div>
    `;
    
    card.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(index);
        if (song.source !== "spotify") playSong();
        // Automatically expand so player is visible
        fullPlayer.classList.remove('hidden');
    });
    
    return card;
}

// ===== API & DATA LOGIC ===== //
let lastMoodDetected = null;

async function fetchSongsByMood(mood, lang) {
    try {
        const res = await fetch('/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: null, language: lang, mood: mood })
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("Mood fetch error", e);
        return null;
    }
}

async function initializeHome() {
    try {
        const res = await fetch('/detect');
        const data = await res.json();
        
        if (data.songs && data.songs.length > 0) {
            playlist = data.songs;
            
            const homeSongs = document.getElementById('home-songs');
            const trendingSongs = document.getElementById('trending-songs');
            homeSongs.innerHTML = ''; trendingSongs.innerHTML = '';
            
            data.songs.forEach((song, i) => {
                const card = createSongCard(song, i);
                if (i < 4) homeSongs.appendChild(card);
                else trendingSongs.appendChild(card);
            });
            loadSong(0);
        }
    } catch (e) {
        console.error("Home initialization failed", e);
    }
}

// ===== MOOD DETECTION WEBCAM & LANGUAGE ===== //
const detectBtn = document.getElementById('detect-mood-btn');
const emotionDisplay = document.getElementById('emotion-display');
const moodSongsContainer = document.getElementById('mood-songs');
const webcamFrame = document.getElementById('webcam-mock');
const langBtns = document.querySelectorAll('.lang-btn');

let selectedLanguage = 'english';

langBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLanguage = btn.dataset.lang;
        
        // REACTIVE: If we already have a detected mood, refresh immediately
        if (lastMoodDetected) {
            detectBtn.textContent = 'Refreshing...';
            const data = await fetchSongsByMood(lastMoodDetected, selectedLanguage);
            if (data) updateMoodUI(data);
            detectBtn.textContent = 'Detect Again';
        }
    });
});

let videoStream = null;
let videoElement = null;

async function startWebcam() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement = document.createElement('video');
        videoElement.srcObject = videoStream;
        videoElement.autoplay = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        videoElement.style.borderRadius = '10px';
        webcamFrame.innerHTML = '';
        webcamFrame.appendChild(videoElement);
        return true;
    } catch (e) {
        webcamFrame.innerHTML = '<i class="fa-solid fa-camera-slash fa-3x mb-2"></i><p>Camera access denied</p>';
        return false;
    }
}

async function stopWebcam() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    if (videoElement) {
        videoElement.remove();
        videoElement = null;
    }
    webcamFrame.innerHTML = '<i class="fa-solid fa-camera fa-3x mb-2"></i><p>Webcam Access</p>';
}

function captureFrame() {
    if (!videoElement) return null;
    const canvas = document.createElement('canvas');
    // Use full resolution for better accuracy
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9); // High quality
}

function updateMoodUI(data) {
    emotionDisplay.innerHTML = `<h3>Emotion: <span class="highlight">${data.emotion}</span></h3>`;
    lastMoodDetected = data.emotion;
    
    if (data.songs && data.songs.length > 0) {
        playlist = data.songs;
        moodSongsContainer.innerHTML = '';
        data.songs.forEach((song, i) => {
            const card = createSongCard(song, i);
            moodSongsContainer.appendChild(card);
        });
        loadSong(0);
        // spotify tracks shouldn't call playSong() as it controls the HTML5 audio element
        if (playlist[0].source !== "spotify") playSong();
        else {
            // For spotify, just expand the player so they can see the embed controls
            fullPlayer.classList.remove('hidden');
        }
    }
}

detectBtn.addEventListener('click', async () => {
    if (!videoStream) {
        const started = await startWebcam();
        if (started) detectBtn.textContent = 'Capture & Analyze';
        return;
    }
    
    const base64Image = captureFrame();
    if (!base64Image) return;
    
    detectBtn.textContent = 'Analyzing...';
    emotionDisplay.innerHTML = '<h3>Emotion: <span class="highlight">Analyzing...</span></h3>';
    
    try {
        const res = await fetch('/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                image: base64Image,
                language: selectedLanguage 
            })
        });
        const data = await res.json();
        updateMoodUI(data);
        stopWebcam(); // Turn off camera after success
    } catch (e) {
        emotionDisplay.innerHTML = '<h3>Emotion: <span class="highlight">Error</span></h3>';
        stopWebcam(); // Also turn off on error
    } finally {
        detectBtn.textContent = 'Detect Mood';
    }
});

document.addEventListener('DOMContentLoaded', initializeHome);
