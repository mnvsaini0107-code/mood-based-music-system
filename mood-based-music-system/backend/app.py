import os
import random
import requests             
from flask import Flask, jsonify, render_template, request, session, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

from emotion_model import detect_emotion, detect_emotion_from_frame

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "moon_music_super_secret"
CORS(app)

# Using Spotify API with new credentials
spotify_client_id = os.getenv("SPOTIPY_CLIENT_ID")
spotify_client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
JAMENDO_CLIENT_ID = os.getenv("JAMENDO_CLIENT_ID", "5674917c") # Default public ID if missing
JAMENDO_API_URL = "https://api.jamendo.com/v3.0/tracks/"

if spotify_client_id and spotify_client_secret:
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
        client_id=spotify_client_id,
        client_secret=spotify_client_secret
    ))
else:
    sp = None
    print("Warning: SPOTIPY credentials not found in env!")

@app.route("/")
def index():
    if "user" in session:
        return redirect(url_for("home"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.json
        username = data.get("username")
        # Mock login: accept any user
        session["user"] = username or "Guest"
        return jsonify({"success": True})
    return render_template("login.html")


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        data = request.json
        username = data.get("username")
        # Mock signup: accept any user
        session["user"] = username or "Guest"
        return jsonify({"success": True})
    return render_template("signup.html")


@app.route("/home")
def home():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("index.html", user=session.get("user"))


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))



@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "")
    if not query:
        return jsonify({"songs": []})
    
    result = []
    try:
        if sp:
            search_results = sp.search(q=query, type='track', limit=10)
            spotify_tracks = search_results['tracks']['items']
            
            for track in spotify_tracks:
                track_id = track['id']
                title = track['name']
                artist = track['artists'][0]['name']
                audio = track.get('preview_url')
                cover = track['album']['images'][0]['url'] if track['album']['images'] else "https://ui-avatars.com/api/?name=Music&background=8a2be2&color=fff&size=512"
                
                result.append({
                    "title": title,
                    "artist": artist,
                    "audio": audio, 
                    "cover": cover,
                    "id": track_id,
                    "source": "spotify"
                })
                
    except Exception as e:
        print(f"Error in /search: {e}")
        
    return jsonify({"songs": result})


@app.route("/detect", methods=["GET", "POST"])
def detect():
    if request.method == "POST":
        data = request.json
        image_data = data.get("image", "")
        
        if image_data:
            try:
                import base64
                if "base64," in image_data:
                    image_data = image_data.split("base64,")[1]
                image_bytes = base64.b64decode(image_data)
                
                try:
                    import cv2
                    import numpy as np
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if img is not None:
                        emotion = detect_emotion_from_frame(img)
                    else:
                        print("Error: Could not decode image from base64")
                        emotion = detect_emotion()
                except ImportError:
                    print("cv2 not installed - falling back to mock emotion for POST data")
                    emotion = detect_emotion()
            except Exception as e:
                print(f"Error processing webcam image: {e}")
                emotion = "neutral"
        else:
            # Check for direct mood parameter (used for reactive language filtering)
            mood_param = data.get("mood")
            if mood_param:
                emotion = mood_param
            else:
                emotion = detect_emotion()
    else:
        emotion = detect_emotion()
    
    # Filter songs by detected emotion via Spotify API
    emotion_lower = (emotion or "neutral").lower()
    
    # Map emotion to Spotify recommendation seeds
    # Values: target_energy, target_valence, seed_genres
    # We use broader genres that work well when combined with language keywords
    mood_map = {
        "happy": {"energy": 0.8, "valence": 0.9, "seed_genres": ["party", "dance-pop", "bollywood-hits", "upbeat"]},
        "sad": {"energy": 0.2, "valence": 0.1, "seed_genres": ["acoustic", "soul-healing", "sad-romantic", "ghazal"]},
        "angry": {"energy": 0.9, "valence": 0.2, "seed_genres": ["metalcore", "hype", "hard-rock", "aggressive"]},
        "fear": {"energy": 0.4, "valence": 0.2, "seed_genres": ["cinematic", "dark-ambient", "horror"]},
        "surprise": {"energy": 0.8, "valence": 0.8, "seed_genres": ["progressive", "indie-pop", "exciting"]},
        "disgust": {"energy": 0.5, "valence": 0.3, "seed_genres": ["experimental", "punk", "alternative-rock"]},
        "neutral": {"energy": 0.5, "valence": 0.5, "seed_genres": ["lo-fi", "chill-vibes", "deep-focus", "instrumental"]}
    }
    settings = mood_map.get(emotion_lower, mood_map["neutral"])
    result = []
    language = data.get("language", "english") if request.method == "POST" else "english"
    
    try:
        print(f"DEBUG: Processing emotion {emotion_lower} in {language} mapped to genres {settings['seed_genres']}")
        
        if sp:
            # Strictly prioritize Spotify Search by Genre and Language
            try:
                genre = settings['seed_genres'][0]
                # More specific search for language + genre + emotion
                search_query = f"{language} {genre} {emotion_lower} hits"
                print(f"DEBUG: Searching Spotify for: {search_query}")
                search_results = sp.search(q=search_query, type='track', limit=10)
                spotify_tracks = search_results['tracks']['items']
                
                # If very specific search fails, fall back to broader language + genre
                if not spotify_tracks:
                    search_query = f"{language} {genre} hits"
                    print(f"DEBUG: Falling back to Spotify search: {search_query}")
                    search_results = sp.search(q=search_query, type='track', limit=10)
                    spotify_tracks = search_results['tracks']['items']

                for track in spotify_tracks:
                    if len(result) >= 10: break
                    
                    # Extract info
                    track_id = track['id']
                    title = track['name']
                    artist = track['artists'][0]['name']
                    audio = track.get('preview_url')
                    cover = track['album']['images'][0]['url'] if track['album']['images'] else "https://ui-avatars.com/api/?name=Music&background=8a2be2&color=fff&size=512"
                    
                    result.append({
                        "title": title,
                        "artist": artist,
                        "audio": audio, 
                        "cover": cover,
                        "id": track_id,
                        "source": "spotify"
                    })
                
                print(f"DEBUG: Found {len(result)} Spotify tracks (with {len([t for t in result if t['audio']])} previews).")
            except Exception as e:
                print(f"DEBUG: Spotify search/process error: {e}")

        # JAMENDO SUPPLEMENT / FALLBACK AUDIO
        try:
            genre = settings['seed_genres'][0] if settings['seed_genres'] else "pop"
            # Get some Jamendo tracks for this genre to use as backup audio or extra songs
            params = {
                "client_id": JAMENDO_CLIENT_ID, "format": "json", "limit": 20,
                "fuzzytags": f"{language},{genre}", 
                "include": "musicinfo", "audioformat": "mp32",
                "order": "popularity_total"
            }
            resp = requests.get(JAMENDO_API_URL, params=params)
            jamendo_tracks = resp.json().get('results', [])
            
            print(f"DEBUG: Found {len(jamendo_tracks)} Jamendo results for {language} {genre}")
            
            # 1. Fill in missing audio for Spotify tracks
            jam_idx = 0
            for s_track in result:
                if s_track['source'] == "spotify" and not s_track['audio']:
                    if jam_idx < len(jamendo_tracks):
                        s_track['audio'] = jamendo_tracks[jam_idx]['audio']
                        jam_idx += 1
                    else:
                        # Final safety: SoundHelix
                        s_track['audio'] = f"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{random.randint(1, 10)}.mp3"
            
            # 2. If we still have space, add more Jamendo tracks
            while len(result) < 10 and jam_idx < len(jamendo_tracks):
                track = jamendo_tracks[jam_idx]
                result.append({
                    "title": track.get('name', 'Unknown Title'),
                    "artist": track.get('artist_name', 'Unknown Artist'),
                    "audio": track.get('audio', ''),
                    "cover": track.get('image', "https://ui-avatars.com/api/?name=Music&background=8a2be2&color=fff&size=512"),
                    "id": track.get('id', str(random.randint(1000, 9999))),
                    "source": "jamendo"
                })
                jam_idx += 1
            
            # 3. ABSOLUTE FINAL GUARD: Ensure no track has null/empty audio
            for track in result:
                if not track.get('audio'):
                     track['audio'] = f"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{random.randint(1, 10)}.mp3"
                
        except Exception as e:
            print(f"DEBUG: Supplement/Audio fallback error: {e}")
            # Ensure at least some audio for existing result if exception occurs
            for s_track in result:
                if not s_track.get('audio'):
                    s_track['audio'] = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"                
    except Exception as e:
        print(f"DEBUG: Global detect exception: {e}")
    
    return jsonify({
        "emotion": emotion_lower,
        "songs": result
    })


if __name__ == "__main__":
    app.run(debug=True)
