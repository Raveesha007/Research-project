"""
Step 1: Explore the Piano Dataset 2 to understand structure and contents.
"""
import os
import pandas as pd

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'Piano Dataset 2')
CSV_PATH = os.path.join(DATASET_DIR, 'triads.csv')
AUDIO_DIR = os.path.join(DATASET_DIR, 'piano_triads')


def parse_chord_label(chord_id):
    """Parse chord ID like 'C_maj_2_0' into components."""
    parts = chord_id.rsplit('_', 2)  # ['C_maj', '2', '0'] or ['Cs_maj', '2', '0']
    octave = parts[-2]
    variation = parts[-1]
    root_and_type = parts[0]

    # Split root_and_type: last part is type (maj/min/dim), rest is root
    rt_parts = root_and_type.rsplit('_', 1)
    root = rt_parts[0]
    chord_type = rt_parts[1]

    # Map short names to full names
    type_map = {'maj': 'Major', 'min': 'Minor', 'dim': 'Diminished'}
    root_map = {'C': 'C', 'Cs': 'C#', 'D': 'D', 'Eb': 'Eb', 'E': 'E',
                'F': 'F', 'Fs': 'F#', 'G': 'G', 'Gs': 'G#', 'A': 'A',
                'Bb': 'Bb', 'B': 'B'}

    readable_root = root_map.get(root, root)
    readable_type = type_map.get(chord_type, chord_type)

    return {
        'root': readable_root,
        'chord_type': readable_type,
        'octave': int(octave),
        'variation': int(variation),
        'label': f"{readable_root} {readable_type}"
    }


def main():
    print("=" * 60)
    print("DATASET EXPLORATION")
    print("=" * 60)

    # 1. Load CSV
    print("\n--- CSV Analysis ---")
    df = pd.read_csv(CSV_PATH)
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst 5 rows:")
    print(df.head().to_string(index=False))

    # 2. Parse chord labels
    print("\n--- Chord Label Parsing ---")
    parsed = df['Chord'].apply(parse_chord_label)
    df['root'] = parsed.apply(lambda x: x['root'])
    df['chord_type'] = parsed.apply(lambda x: x['chord_type'])
    df['octave'] = parsed.apply(lambda x: x['octave'])
    df['label'] = parsed.apply(lambda x: x['label'])

    print(f"\nUnique roots ({df['root'].nunique()}): {sorted(df['root'].unique())}")
    print(f"Unique chord types ({df['chord_type'].nunique()}): {sorted(df['chord_type'].unique())}")
    print(f"Octave range: {df['octave'].min()} - {df['octave'].max()}")
    print(f"\nUnique labels ({df['label'].nunique()}):")
    label_counts = df['label'].value_counts().sort_index()
    for label, count in label_counts.items():
        print(f"  {label}: {count} samples")

    # 3. Check audio files
    print("\n--- Audio Files ---")
    wav_files = [f for f in os.listdir(AUDIO_DIR) if f.endswith('.wav')]
    print(f"Total .wav files: {len(wav_files)}")
    print(f"Sample filenames: {wav_files[:5]}")

    # Check CSV-to-file matching
    csv_chords = set(df['Chord'].values)
    file_stems = set(os.path.splitext(f)[0] for f in wav_files)
    missing_files = csv_chords - file_stems
    extra_files = file_stems - csv_chords
    print(f"\nCSV entries without audio: {len(missing_files)}")
    if missing_files:
        print(f"  Missing: {list(missing_files)[:5]}")
    print(f"Audio files without CSV entry: {len(extra_files)}")
    if extra_files:
        print(f"  Extra: {list(extra_files)[:5]}")

    # 4. Load one sample
    print("\n--- Sample Audio Analysis ---")
    try:
        import librosa
        sample_file = os.path.join(AUDIO_DIR, wav_files[0])
        y, sr = librosa.load(sample_file, sr=22050)
        duration = len(y) / sr
        print(f"File: {wav_files[0]}")
        print(f"Sample rate: {sr} Hz")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Samples: {len(y)}")
    except ImportError:
        print("librosa not installed — skipping audio analysis")
    except Exception as e:
        print(f"Error loading audio: {e}")

    print("\n" + "=" * 60)
    print("EXPLORATION COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
