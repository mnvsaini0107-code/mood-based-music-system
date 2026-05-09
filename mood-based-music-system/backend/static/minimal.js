const songs = [
    {
        title: "Kesariya",
        artist: "Arijit Singh",
        audio: "/static/songs/song1.mp3",
        cover: "/static/covers/cover1.jpg"
    },
    {
        title: "Tum Hi Ho",
        artist: "Arijit Singh",
        audio: "/static/songs/song2.mp3",
        cover: "/static/covers/cover2.jpg"
    },
    {
        title: "Good 4 U",
        artist: "A$AP Rocky",
        audio: "/static/songs/song1.mp3",
        cover: "/static/covers/cover3.jpg"
    },
    {
        title: "Stay",
        artist: "The Kid LAROI & Justin Bieber",
        audio: "/static/songs/song2.mp3",
        cover: "/static/covers/cover4.jpg"
    }
];

const container = document.getElementById("songContainer");
const audio = document.getElementById("audioPlayer");

const title = document.getElementById("playerTitle");
const artist = document.getElementById("playerArtist");
const cover = document.getElementById("playerCover");

let playing = false;

function renderSongs(){
    container.innerHTML = "";

    songs.forEach(song => {
        const card = document.createElement("div");
        card.className = "song-card";

        card.innerHTML = `
            <img src="${song.cover}">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;

        card.onclick = () => playSong(song);

        container.appendChild(card);
    });
}

function playSong(song){
    audio.src = song.audio;
    audio.play();

    title.innerText = song.title;
    artist.innerText = song.artist;
    cover.src = song.cover;

    playing = true;
}

function playPause(){
    if(playing){
        audio.pause();
        playing = false;
    }else{
        audio.play();
        playing = true;
    }
}

renderSongs();
