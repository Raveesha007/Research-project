"""
Step 3: Extract chroma-focused audio features with data augmentation.
Produces outputs/features.csv with chroma features + chord_label.

Chroma features are the primary discriminators for chord classification
(68% CV accuracy vs <2% for MFCCs). Non-chroma features add noise.

Augmentation (5x data): original + 2 noise levels + 2 volume changes
"""
import os
import numpy as np
import pandas as pd
import librosa

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'Piano Dataset 2')
AUDIO_DIR = os.path.join(DATASET_DIR, 'piano_triads')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), 'outputs', 'features.csv')

SR = 22050


def parse_label(chord_id):
    """Parse 'C_maj_2_0' -> 'C Major'."""
    parts = chord_id.rsplit('_', 2)
    root_and_type = parts[0]
    rt_parts = root_and_type.rsplit('_', 1)
    root = rt_parts[0]
    chord_type = rt_parts[1]

    type_map = {'maj': 'Major', 'min': 'Minor', 'dim': 'Diminished'}
    root_map = {'C': 'C', 'Cs': 'C#', 'D': 'D', 'Eb': 'Eb', 'E': 'E',
                'F': 'F', 'Fs': 'F#', 'G': 'G', 'Gs': 'G#', 'A': 'A',
                'Bb': 'Bb', 'B': 'B'}

    readable_root = root_map.get(root, root)
    readable_type = type_map.get(chord_type, chord_type)
    return f"{readable_root} {readable_type}"


def extract_features_from_audio(y, sr):
    """Extract 36 chroma-focused features from audio signal."""
    # Ensure minimum signal length for FFT
    if len(y) < 2048:
        y = np.pad(y, (0, 2048 - len(y)), mode='constant')

    # Chroma STFT — all features derived from this (no CQT, avoids slow/crash)
    chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr)

    # 12 mean — primary chord fingerprint
    chroma_stft_mean = np.mean(chroma_stft, axis=1)

    # 12 std — temporal variation in each pitch class
    chroma_stft_std = np.std(chroma_stft, axis=1)

    # 12 max — peak energy per pitch class (strong note indicator)
    chroma_stft_max = np.max(chroma_stft, axis=1)

    return np.concatenate([chroma_stft_mean, chroma_stft_std, chroma_stft_max])


def augment_audio(y, sr):
    """Generate augmented versions of audio. Returns list of (audio, tag) pairs.
    Uses only instant numpy ops (noise + volume), no slow librosa transforms."""
    rng = np.random.RandomState(hash(y.tobytes()[:100]) % (2**31))
    augmented = [
        (y, 'orig'),
    ]

    # Noise augmentation at different SNRs
    signal_power = np.mean(y ** 2)
    if signal_power > 0:
        for snr_db, tag in [(25, 'noise25'), (15, 'noise15')]:
            snr_linear = 10 ** (snr_db / 10)
            noise_power = signal_power / snr_linear
            noise = rng.normal(0, np.sqrt(noise_power), len(y)).astype(np.float32)
            augmented.append((y + noise, tag))

    # Volume augmentation
    augmented.append((y * 0.7, 'vol07'))
    augmented.append((y * 1.3, 'vol13'))

    return augmented


# Feature column names (36 total)
FEATURE_NAMES = (
    [f'chroma_stft_{i+1}' for i in range(12)] +
    [f'chroma_stft_std_{i+1}' for i in range(12)] +
    [f'chroma_stft_max_{i+1}' for i in range(12)]
)


def main():
    print("=" * 60)
    print("FEATURE EXTRACTION (Chroma-focused + Augmentation)")
    print("=" * 60)

    wav_files = sorted([f for f in os.listdir(AUDIO_DIR) if f.endswith('.wav')])
    total = len(wav_files)
    print(f"Found {total} WAV files")
    print(f"Augmentation: 5x (original + 2 noise + 2 volume)")
    print(f"Expected output: {total * 5} samples with {len(FEATURE_NAMES)} features\n")

    results = []
    errors = []

    for idx, wav_file in enumerate(wav_files):
        chord_id = os.path.splitext(wav_file)[0]
        wav_path = os.path.join(AUDIO_DIR, wav_file)

        try:
            y, sr = librosa.load(wav_path, sr=SR)
            label = parse_label(chord_id)

            for y_aug, tag in augment_audio(y, sr):
                features = extract_features_from_audio(y_aug, sr)
                results.append(list(features) + [label])

        except Exception as e:
            errors.append(f"  WARNING: {wav_file}: {e}")

        if (idx + 1) % 50 == 0 or (idx + 1) == total:
            print(f"  Processed {idx + 1}/{total} files ({len(results)} samples)...")

    if errors:
        print(f"\n{len(errors)} errors:")
        for err in errors:
            print(err)

    columns = FEATURE_NAMES + ['chord_label']
    features_df = pd.DataFrame(results, columns=columns)
    features_df.to_csv(OUTPUT_PATH, index=False)

    print(f"\nFeatures saved to: {OUTPUT_PATH}")
    print(f"Shape: {features_df.shape}")
    print(f"Labels: {features_df['chord_label'].nunique()} unique classes")
    print(f"Samples per class:")
    for label, count in features_df['chord_label'].value_counts().sort_index().items():
        print(f"  {label}: {count}")

    print("\n" + "=" * 60)
    print("FEATURE EXTRACTION COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
