// MOON Music - Spotify Clone JavaScript

// Global Variables
let currentSong = null;
let isPlaying = false;
let currentPlaylist = [];
let mediaStream = null;
let detectInterval = null;

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const playerSongTitle = document.getElementById('playerSongTitle');
const playerSongArtist = document.getElementById('playerSongArtist');
const playerAlbumImg = document.getElementById('playerAlbumImg');

// Sample Songs Data
const SAMPLE_SONGS = [
    {
        id: 1,
        title: "Blinding Lights",
        artist: "The Weeknd",
        cover: "https://picsum.photos/300/1",
        audio: "/static/songs/song1.mp3",
        duration: "3:20"
    },
    {
        id: 2,
        title: "Levitating",
        artist: "Dua Lipa",
        cover: "https://picsum.photos/300/2",
        audio: "/static/songs/song2.mp3",
        duration: "3:23"
    },
    {
        id: 3,
        title: "Good 4 U",
        artist: "A$AP Rocky",
        cover: "https://picsum.photos/300/3",
        audio: "/static/songs/song1.mp3",
        duration: "2:34"
    },
    {
        id: 4,
        title: "Heat Waves",
        artist: "Glass Animals",
        cover: "https://picsum.photos/300/4",
        audio: "/static/songs/song2.mp3",
        duration: "3:58"
    },
    {
        id: 5,
        title: "Stay",
        artist: "The Kid LAROI & Justin Bieber",
        cover: "https://picsum.photos/300/5",
        audio: "/static/songs/song1.mp3",
        duration: "2:21"
    },
    {
        id: 6,
        title: "Industry Baby",
        artist: "Bella Poarch",
        cover: "https://picsum.photos/300/6",
        audio: "/static/songs/song2.mp3",
        duration: "2:54"
    }
];

// Playlists Data
const SAMPLE_PLAYLISTS = [
    {
        id: 1,
        name: "Chill Vibes",
        description: "Relax and unwind",
        cover: "https://picsum.photos/300/playlist1",
        songCount: 24
    },
    {
        id: 2,
        name: "Workout Energy",
        description: "High intensity training",
        cover: "https://picsum.photos/300/playlist2",
        songCount: 32
    },
    {
        id: 3,
        name: "Study Focus",
        description: "Concentration music",
        cover: "https://picsum.photos/300/playlist3",
        songCount: 18
    },
    {
        id: 4,
        name: "Party Mix",
        description: "Dance and celebrate",
        cover: "https://picsum.photos/300/playlist4",
        songCount: 45
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializePlayer();
    loadHomePage();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showPage(page);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // Load page-specific content
        switch(pageId) {
            case 'home':
                loadHomePage();
                break;
            case 'search':
                loadSearchPage();
                break;
            case 'mood':
                loadMoodPage();
                break;
            case 'library':
                loadLibraryPage();
                break;
            case 'create-playlist':
                showCreatePlaylistModal();
                break;
            case 'liked':
                loadLikedSongs();
                break;
        }
    }
}

// Page Loaders
function loadHomePage() {
    loadRecentlyPlayed();
    loadTrendingSongs();
    loadRecommendedAlbums();
    loadPlaylists();
}

function loadRecentlyPlayed() {
    const container = document.getElementById('recentlyPlayedGrid');
    const recentSongs = SAMPLE_SONGS.slice(0, 6);
    renderAlbumGrid(container, recentSongs);
}

function loadTrendingSongs() {
    const container = document.getElementById('trendingGrid');
    const trendingSongs = SAMPLE_SONGS.slice(2, 8);
    renderAlbumGrid(container, trendingSongs);
}

function loadRecommendedAlbums() {
    const container = document.getElementById('recommendedGrid');
    const recommendedAlbums = SAMPLE_PLAYLISTS.slice(0, 4);
    renderPlaylistGrid(container, recommendedAlbums);
}

function loadPlaylists() {
    const container = document.getElementById('playlistGrid');
    const playlists = SAMPLE_PLAYLISTS;
    renderPlaylistGrid(container, playlists);
}

function loadSearchPage() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 2) {
            const results = SAMPLE_SONGS.filter(song => 
                song.title.toLowerCase().includes(query) || 
                song.artist.toLowerCase().includes(query)
            );
            renderAlbumGrid(searchResults, results);
        } else {
            searchResults.innerHTML = '';
        }
    });
}

function loadMoodPage() {
    initializeMoodDetection();
}

function loadLibraryPage() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="content-header">
            <h1>Your Library</h1>
        </div>
        <div class="album-grid">
            ${SAMPLE_SONGS.map(song => createAlbumCard(song)).join('')}
        </div>
    `;
}

function loadLikedSongs() {
    const mainContent = document.querySelector('.main-content');
    const likedSongs = SAMPLE_SONGS.filter(song => song.id <= 3);
    
    mainContent.innerHTML = `
        <div class="content-header">
            <h1>Liked Songs</h1>
        </div>
        <div class="album-grid">
            ${likedSongs.map(song => createAlbumCard(song)).join('')}
        </div>
    `;
}

// Mood Detection
function initializeMoodDetection() {
    const startBtn = document.getElementById('startDetection');
    const stopBtn = document.getElementById('stopDetection');
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraOverlay = document.getElementById('cameraOverlay');
    
    startBtn.addEventListener('click', startMoodDetection);
    stopBtn.addEventListener('click', stopMoodDetection);
}

async function startMoodDetection() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        });
        
        const cameraPreview = document.getElementById('cameraPreview');
        const cameraOverlay = document.getElementById('cameraOverlay');
        
        if (cameraPreview) {
            cameraPreview.srcObject = stream;
            mediaStream = stream;
        }
        
        if (cameraOverlay) {
            cameraOverlay.style.display = 'none';
        }
        
        // Start detection interval
        detectInterval = setInterval(detectMood, 3000);
        
        // Update UI
        document.getElementById('startDetection').disabled = true;
        document.getElementById('stopDetection').disabled = false;
        
    } catch (error) {
        console.error('Camera access denied:', error);
        showNotification('Camera access denied. Please allow camera permissions.');
    }
}

function stopMoodDetection() {
    if (detectInterval) {
        clearInterval(detectInterval);
        detectInterval = null;
    }
    
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraOverlay = document.getElementById('cameraOverlay');
    
    if (cameraPreview) {
        cameraPreview.srcObject = null;
    }
    
    if (cameraOverlay) {
        cameraOverlay.style.display = 'flex';
    }
    
    // Update UI
    document.getElementById('startDetection').disabled = false;
    document.getElementById('stopDetection').disabled = true;
}

async function detectMood() {
    try {
        const cameraPreview = document.getElementById('cameraPreview');
        if (!cameraPreview || !cameraPreview.srcObject) {
            return;
        }
        
        // Capture frame from video
        const canvas = document.createElement('canvas');
        canvas.width = cameraPreview.videoWidth || 640;
        canvas.height = cameraPreview.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraPreview, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to backend for emotion detection
        const response = await fetch('/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        });
        
        const data = await response.json();
        console.log('Detected emotion:', data.emotion);
        
        // Update emotion display
        const emotionEl = document.getElementById('detectedEmotion');
        if (emotionEl) {
            emotionEl.textContent = data.emotion;
        }
        
        // Load mood-based songs
        if (data.songs && data.songs.length > 0) {
            const moodSongsGrid = document.getElementById('moodSongsGrid');
            renderAlbumGrid(moodSongsGrid, data.songs);
        }
        
    } catch (error) {
        console.error('Mood detection error:', error);
    }
}

// Music Player Functions
function initializePlayer() {
    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Previous/Next
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // Shuffle/Repeat
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Volume
    volumeSlider.addEventListener('input', updateVolume);
    
    // Audio Events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', handleSongEnd);
    
    // Set initial volume
    audioPlayer.volume = volumeSlider.value / 100;
}

function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    if (currentSong) {
        audioPlayer.play();
        isPlaying = true;
        updatePlayButton();
    } else {
        // Play first available song
        const firstSong = SAMPLE_SONGS[0];
        loadAndPlaySong(firstSong);
    }
}

function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayButton();
}

function loadAndPlaySong(song) {
    currentSong = song;
    
    // Update player UI
    playerSongTitle.textContent = song.title;
    playerSongArtist.textContent = song.artist;
    playerAlbumImg.src = song.cover;
    
    // Load and play audio
    audioPlayer.src = song.audio;
    audioPlayer.play();
    isPlaying = true;
    updatePlayButton();
    
    // Add to recently played
    addToRecentlyPlayed(song);
}

function updatePlayButton() {
    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        playPauseBtn.style.backgroundColor = 'var(--accent-green)';
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        playPauseBtn.style.backgroundColor = 'transparent';
    }
}

function playPrevious() {
    if (currentPlaylist.length > 0) {
        const currentIndex = currentPlaylist.findIndex(song => song.id === currentSong?.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentPlaylist.length - 1;
        loadAndPlaySong(currentPlaylist[prevIndex]);
    }
}

function playNext() {
    if (currentPlaylist.length > 0) {
        const currentIndex = currentPlaylist.findIndex(song => song.id === currentSong?.id);
        const nextIndex = currentIndex < currentPlaylist.length - 1 ? currentIndex + 1 : 0;
        loadAndPlaySong(currentPlaylist[nextIndex]);
    } else if (SAMPLE_SONGS.length > 0) {
        const currentIndex = SAMPLE_SONGS.findIndex(song => song.id === currentSong?.id);
        const nextIndex = currentIndex < SAMPLE_SONGS.length - 1 ? currentIndex + 1 : 0;
        loadAndPlaySong(SAMPLE_SONGS[nextIndex]);
    }
}

function updateVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
}

function updateProgress() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
}

function updateDuration() {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
}

function handleSongEnd() {
    isPlaying = false;
    updatePlayButton();
    
    // Auto-play next song
    playNext();
}

function toggleShuffle() {
    shuffleBtn.style.color = shuffleBtn.style.color === 'var(--accent-green)' ? 'var(--text-secondary)' : 'var(--accent-green)';
}

function toggleRepeat() {
    repeatBtn.style.color = repeatBtn.style.color === 'var(--accent-green)' ? 'var(--text-secondary)' : 'var(--accent-green)';
}

function addToRecentlyPlayed(song) {
    // Move song to front of recently played
    const index = SAMPLE_SONGS.findIndex(s => s.id === song.id);
    if (index > 0) {
        SAMPLE_SONGS.splice(index, 1);
        SAMPLE_SONGS.unshift(song);
    }
}

// Rendering Functions
function renderSongs(songs) {
    const container = document.getElementById("songContainer");
    if (!container) return;

    container.innerHTML = "";

    songs.forEach(song => {
        const card = document.createElement("div");
        card.className = "song-card";

        card.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" />
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        `;

        card.onclick = () => playSong(song);
        container.appendChild(card);
    });
}

function playSelectedSong(songId) {
    const song = SAMPLE_SONGS.find(s => s.id === songId);
    if (song) {
        currentPlaylist = SAMPLE_SONGS;
        loadAndPlaySong(song);
    }
}

function playPlaylist(playlistId) {
    const playlist = SAMPLE_PLAYLISTS.find(p => p.id === playlistId);
    if (playlist) {
        // Get songs for this playlist (sample data)
        const playlistSongs = SAMPLE_SONGS.slice(0, playlist.songCount);
        currentPlaylist = playlistSongs;
        
        // Play first song
        if (playlistSongs.length > 0) {
            loadAndPlaySong(playlistSongs[0]);
        }
    }
}

// Utility Functions
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-elevated);
        color: var(--text-primary);
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
