import sys
import random

try:
    import cv2
    import numpy as np
    from deepface import DeepFace
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("WARNING: cv2 or deepface not installed. Falling back to mock emotion detection.")

# Supported emotions (DeepFace returns these)
SUPPORTED_EMOTIONS = {"happy", "sad", "angry", "neutral", "surprise", "fear", "disgust"}

MAX_CAMERA_ATTEMPTS = 3
MAX_READ_ATTEMPTS = 3
MAX_DEEPFACE_ATTEMPTS = 2


def _open_camera():
    """Open webcam with OpenCV; fallback to CAP_DSHOW on Windows."""
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        return cap
    cap.release()
    if sys.platform == "win32":
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if cap.isOpened():
            return cap
        cap.release()
    return None


def _normalize_emotion(emotion):
    if not emotion:
        return "neutral"
    e = str(emotion).lower().strip()
    return e if e in SUPPORTED_EMOTIONS else "neutral"


def detect_emotion_from_frame(frame):
    """Detect emotion from a BGR frame (numpy array)."""
    if not ML_AVAILABLE:
        # Return random emotion (excluding neutral) for more varied feedback if ML is not available
        others = list(SUPPORTED_EMOTIONS - {"neutral"})
        mock_emotion = random.choice(others)
        print(f"DEBUG: Mock Frame returned emotion: {mock_emotion} (no ML available)")
        return mock_emotion

    if frame is None or getattr(frame, 'size', 0) == 0:
        print("Emotion detected: neutral (no frame)")
        return "neutral"
    emotion = "neutral"
    for attempt in range(MAX_DEEPFACE_ATTEMPTS):
        try:
            result = DeepFace.analyze(
                frame,
                actions=["emotion"],
                enforce_detection=False,
            )
            if result and len(result) > 0:
                raw = result[0].get("dominant_emotion", "neutral")
                emotion = _normalize_emotion(raw)
                print("Emotion detected:", emotion)
                return emotion
        except Exception as e:
            print(f"DeepFace attempt {attempt + 1} failed: {e}")
    print("Emotion detected: neutral (DeepFace failed)")
    return "neutral"


def detect_emotion():
    """Open webcam with OpenCV, read one frame, detect emotion, release camera."""
    if not ML_AVAILABLE:
        # Return random emotion for demo purposes if ML is not available
        # Excluding neutral from random choice to make it more obvious it's working
        others = list(SUPPORTED_EMOTIONS - {"neutral"})
        mock_emotion = random.choice(others)
        print(f"DEBUG: Mock Webcam returned emotion: {mock_emotion} (no ML models)")
        return mock_emotion

    cap = None
    for attempt in range(MAX_CAMERA_ATTEMPTS):
        cap = _open_camera()
        if cap is not None:
            break
        print(f"Webcam open attempt {attempt + 1}/{MAX_CAMERA_ATTEMPTS} failed, retrying...")
    if cap is None:
        print("Webcam could not be opened. Emotion detected: neutral")
        return "neutral"

    frame = None
    for attempt in range(MAX_READ_ATTEMPTS):
        ret, frame = cap.read()
        if ret and frame is not None:
            break
        print(f"Webcam read attempt {attempt + 1}/{MAX_READ_ATTEMPTS} failed, retrying...")
    cap.release()

    if frame is None:
        print("Could not read frame. Emotion detected: neutral")
        return "neutral"

    return detect_emotion_from_frame(frame)
