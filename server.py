import io
import os
import numpy as np
import librosa
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')
CORS(app)

# ── Keras model disabled — using pyin only ──────────────────────────────────────────
# MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'outputs', 'piano_detector_final.keras')
keras_model = None

# def load_model():
#     global keras_model
#     try:
#         from tensorflow import keras
#         keras_model = keras.models.load_model(MODEL_PATH)
#         print(f"Keras model loaded from {MODEL_PATH}")
#     except Exception as e:
#         print(f"WARNING: Could not load Keras model ({e}). Falling back to pyin.")
#
# load_model()
NOTE_NAMES = ['C', 'Cs', 'D', 'Eb', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'Bb', 'B']
SEG_LEN    = 32   # must match training
N_MELS     = 229
SR         = 16000
HOP        = 512

def extract_mel(y, sr=SR):
    mel = librosa.feature.melspectrogram(
        y=y, sr=sr, n_mels=N_MELS, hop_length=HOP, fmin=27.5, fmax=8000
    )
    return librosa.power_to_db(mel, ref=np.max)   # (229, T)

def midi_to_note_name(midi_idx):
    """midi_idx is 0-based offset from A0 (MIDI 21)."""
    midi = midi_idx + 21
    octave = (midi // 12) - 1
    name   = NOTE_NAMES[midi % 12]
    freq   = 440.0 * 2 ** ((midi - 69) / 12.0)
    return {"note": f"{name}_{octave}", "frequency": round(freq, 2), "centsOff": 0.0}

def predict_with_keras(y):
    mel = extract_mel(y)        # (229, T)
    T   = mel.shape[1]

    if T < SEG_LEN:
        mel = np.pad(mel, ((0, 0), (0, SEG_LEN - T)), mode='constant')
        T   = SEG_LEN

    all_preds = []
    for i in range(0, T - SEG_LEN + 1, SEG_LEN):
        seg  = mel[:, i:i+SEG_LEN].T[np.newaxis, ..., np.newaxis]   # (1,32,229,1)
        pred = keras_model.predict(seg, verbose=0)[0]                # (32, 88)
        all_preds.append(pred)

    all_preds    = np.concatenate(all_preds, axis=0)                 # (T, 88)
    active_ratio = (all_preds > 0.3).mean(axis=0)                   # (88,) — lowered from 0.5 for mic input
    note_idxs    = np.where(active_ratio >= 0.05)[0]                # lowered from 0.1

    results = []
    for idx in note_idxs:
        info = midi_to_note_name(int(idx))
        info["confidence"] = round(float(active_ratio[idx]) * 100, 1)
        results.append(info)

    # Top 3 by confidence
    return sorted(results, key=lambda x: x["confidence"], reverse=True)[:3]

def hz_to_note(freq):
    if freq is None or np.isnan(freq) or freq <= 0:
        return None
    midi   = 12 * np.log2(freq / 440.0) + 69
    midi_r = int(round(midi))
    if midi_r < 21 or midi_r > 108:
        return None
    octave    = (midi_r // 12) - 1
    cents_off = (midi - midi_r) * 100
    return {
        "note": f"{NOTE_NAMES[midi_r % 12]}_{octave}",
        "frequency": round(float(freq), 2),
        "centsOff": round(float(cents_off), 1)
    }

def predict_with_pyin(y, sr):
    print(f"[pyin] audio length={len(y)/sr:.2f}s  sr={sr}  peak={float(np.max(np.abs(y))):.4f}")
    f0, voiced_flag, voiced_prob = librosa.pyin(
        y, sr=sr,
        fmin=librosa.note_to_hz("A0"),
        fmax=librosa.note_to_hz("C8"),
        frame_length=2048, hop_length=512
    )
    voiced_count = int(np.sum(voiced_flag))
    print(f"[pyin] voiced frames={voiced_count}/{len(voiced_flag)}")
    raw = []
    for freq, voiced, prob in zip(f0, voiced_flag, voiced_prob):
        if not voiced or prob < 0.35:
            continue
        info = hz_to_note(freq)
        if info:
            info["confidence"] = round(float(prob) * 100, 1)
            raw.append(info)
    print(f"[pyin] raw notes after threshold: {[r['note'] for r in raw[:10]]}")

    consolidated = []
    if raw:
        run_note, run = raw[0]["note"], [raw[0]]
        for item in raw[1:]:
            if item["note"] == run_note:
                run.append(item)
            else:
                if len(run) >= 2:
                    consolidated.append(max(run, key=lambda x: x["confidence"]))
                run_note, run = item["note"], [item]
        if len(run) >= 2:
            consolidated.append(max(run, key=lambda x: x["confidence"]))

    seen = {}
    for item in consolidated:
        n = item["note"]
        if n not in seen or item["confidence"] > seen[n]["confidence"]:
            seen[n] = item

    return sorted(seen.values(), key=lambda x: x["confidence"], reverse=True)[:5]

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/')
@app.route('/<path:path>')
def serve_static(path='index.html'):
    if path != '' and os.path.exists(os.path.join(STATIC_DIR, path)):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, 'index.html')

@app.route("/health")
def health():
    return jsonify({"status": "ok", "model": "keras" if keras_model else "pyin"})

@app.route("/analyze", methods=["POST"])
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    try:
        audio_bytes = request.files["audio"].read()
        target_sr   = SR if keras_model else 22050
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=target_sr, mono=True)
    except Exception as e:
        return jsonify({"error": f"Failed to decode audio: {str(e)}"}), 422

    if len(y) < sr * 0.1:
        return jsonify({"notes": []})

    try:
        if keras_model:
            notes = predict_with_keras(y)
            # If Keras found nothing, fall back to pyin so the user isn't left empty
            if not notes:
                print("Keras returned no notes — falling back to pyin")
                y_pyin, sr_pyin = librosa.load(io.BytesIO(audio_bytes), sr=22050, mono=True)
                notes = predict_with_pyin(y_pyin, 22050)
        else:
            notes = predict_with_pyin(y, sr)
    except Exception as e:
        print(f"Prediction error: {e}")
        try:
            y_pyin, sr_pyin = librosa.load(io.BytesIO(audio_bytes), sr=22050, mono=True)
            notes = predict_with_pyin(y_pyin, 22050)
        except Exception as e2:
            print(f"pyin fallback also failed: {e2}")
            notes = []

    print(f"[analyze] returning {len(notes)} notes: {[n['note'] for n in notes]}")
    return jsonify({"notes": notes})

if __name__ == "__main__":
    model_type = "Keras CNN+LSTM" if keras_model else "pyin fallback"
    port = int(os.environ.get("PORT", 5001))
    print(f"Backend running ({model_type}) on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)

