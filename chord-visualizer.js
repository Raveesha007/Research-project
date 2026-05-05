/**
 * Chord Visualizer - Real-time Piano and Guitar Interface with Chord Detection
 * Shows notes being played and identifies chords automatically with sound and visual feedback
 */

class ChordVisualizer {
    constructor(containerId, instrument = 'piano', expectedNotes = []) {
        this.container = document.getElementById(containerId);
        this.instrument = instrument;
        this.activeNotes = new Set();
        this.chordName = '';
        this.expectedNotes = new Set(expectedNotes.map(n => n.replace(/\d/g, ''))); // Store base notes only
        this.audioContext = null;
        this.oscillators = new Map(); // Track active oscillators
        
        // Note to MIDI mapping
        this.noteToMidi = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        
        this.midiToNote = {
            0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
            6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
        };

        // Chord patterns (intervals from root in semitones)
        this.chordPatterns = {
            'major': [0, 4, 7],
            'minor': [0, 3, 7],
            'major7': [0, 4, 7, 11],
            'minor7': [0, 3, 7, 10],
            'dominant7': [0, 4, 7, 10],
            'diminished': [0, 3, 6],
            'augmented': [0, 4, 8],
            'sus2': [0, 2, 7],
            'sus4': [0, 5, 7],
            'maj9': [0, 4, 7, 2],
            'min9': [0, 3, 7, 2]
        };

        // Initialize audio context
        this.initAudioContext();

        if (instrument === 'piano') {
            this.createPianoInterface();
        } else if (instrument === 'guitar') {
            this.createGuitarInterface();
        }
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    noteNameToFrequency(noteName) {
        // Parse note name and octave (e.g., "C4" -> C in octave 4)
        const baseNote = noteName.replace(/\d/g, '');
        const octave = parseInt(noteName.match(/\d+/)[0]);
        
        // A4 = 440 Hz is our reference
        const noteInOctave = this.noteToMidi[baseNote];
        const semitanesToA4 = (octave - 4) * 12 + (noteInOctave - 9);
        const frequency = 440 * Math.pow(2, semitanesToA4 / 12);
        
        return frequency;
    }

    playSound(noteName) {
        if (!this.audioContext) {
            this.initAudioContext();
        }

        const frequency = this.noteNameToFrequency(noteName);
        
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Set volume
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
        
        // Store for cleanup
        this.oscillators.set(noteName, oscillator);
    }

    createPianoInterface() {
        this.container.innerHTML = `
            <div class="chord-viz-header">
                <div class="chord-viz-title">🎹 Piano Keyboard</div>
                <div class="chord-display">
                    <div class="chord-name" id="chordName">-</div>
                    <div class="notes-display" id="notesDisplay">No notes</div>
                </div>
            </div>
            <div class="piano-container">
                <div class="piano-keyboard" id="pianoKeyboard"></div>
            </div>
        `;

        const keyboard = document.getElementById('pianoKeyboard');
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const startOctave = 2;
        const endOctave = 6;
        let keyIndex = 0;

        // Color mapping for notes
        const noteColors = {
            'C': '#ef4444', 'C#': '#f97316',
            'D': '#eab308', 'D#': '#84cc16',
            'E': '#22c55e', 'F': '#10b981',
            'F#': '#14b8a6', 'G': '#06b6d4',
            'G#': '#0ea5e9', 'A': '#3b82f6',
            'A#': '#6366f1', 'B': '#a855f7'
        };

        for (let octave = startOctave; octave < endOctave; octave++) {
            for (let noteIdx = 0; noteIdx < notes.length; noteIdx++) {
                const noteName = notes[noteIdx];
                const fullNoteName = noteName + octave;
                
                // White key
                const whiteKeyEl = document.createElement('div');
                whiteKeyEl.className = 'piano-key white-key';
                whiteKeyEl.id = `key-${fullNoteName}`;
                whiteKeyEl.dataset.note = fullNoteName;
                whiteKeyEl.dataset.baseNote = noteName;
                whiteKeyEl.textContent = noteName;
                whiteKeyEl.style.setProperty('--note-color', noteColors[noteName]);
                whiteKeyEl.addEventListener('click', () => this.playNote(fullNoteName));
                whiteKeyEl.addEventListener('mousedown', () => this.playNote(fullNoteName));
                keyboard.appendChild(whiteKeyEl);

                // Black key (except between E-F and B-C)
                if (noteName !== 'E' && noteName !== 'B') {
                    const blackKeyEl = document.createElement('div');
                    const sharpNoteName = noteName + '#' + octave;
                    blackKeyEl.className = 'piano-key black-key';
                    blackKeyEl.id = `key-${sharpNoteName}`;
                    blackKeyEl.dataset.note = sharpNoteName;
                    blackKeyEl.dataset.baseNote = noteName + '#';
                    blackKeyEl.style.setProperty('--note-color', noteColors[noteName + '#']);
                    blackKeyEl.addEventListener('click', () => this.playNote(sharpNoteName));
                    blackKeyEl.addEventListener('mousedown', () => this.playNote(sharpNoteName));
                    keyboard.appendChild(blackKeyEl);
                }
            }
        }
    }

    createGuitarInterface() {
        this.container.innerHTML = `
            <div class="chord-viz-header">
                <div class="chord-viz-title">🎸 Guitar Fretboard</div>
                <div class="chord-display">
                    <div class="chord-name" id="chordName">-</div>
                    <div class="notes-display" id="notesDisplay">No notes</div>
                </div>
            </div>
            <div class="guitar-container">
                <div class="guitar-fretboard" id="guitarFretboard"></div>
            </div>
        `;

        const fretboard = document.getElementById('guitarFretboard');
        const stringNotes = [
            ['E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4'],
            ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4'],
            ['D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'],
            ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5'],
            ['B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5'],
            ['E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5']
        ];
        const stringLabels = ['E', 'A', 'D', 'G', 'B', 'e'];
        const fretMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21];

        for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
            const stringContainer = document.createElement('div');
            stringContainer.className = 'guitar-string-row';

            // String label
            const labelEl = document.createElement('div');
            labelEl.className = 'guitar-string-label';
            labelEl.textContent = stringLabels[stringIdx];
            stringContainer.appendChild(labelEl);

            // Frets
            for (let fretNum = 0; fretNum <= 21; fretNum++) {
                const fretEl = document.createElement('div');
                fretEl.className = 'guitar-fret';

                const noteName = stringNotes[stringIdx][fretNum];
                fretEl.id = `fret-${noteName}`;
                fretEl.dataset.note = noteName;
                fretEl.dataset.string = stringIdx;
                fretEl.dataset.fret = fretNum;

                if (fretNum === 0) {
                    fretEl.classList.add('open-string');
                    fretEl.textContent = 'O';
                } else {
                    fretEl.textContent = fretNum;
                    if (fretMarkers.includes(fretNum)) {
                        fretEl.classList.add('fret-marker');
                    }
                }

                fretEl.addEventListener('click', () => this.playNote(noteName));
                fretEl.addEventListener('mousedown', () => this.playNote(noteName));
                stringContainer.appendChild(fretEl);
            }

            fretboard.appendChild(stringContainer);
        }
    }

    highlightNote(noteName, confidence = 1, isExpected = null) {
        // Extract base note (without octave)
        const baseNote = noteName.replace(/\d/g, '');
        
        // Determine if note is correct (expected)
        if (isExpected === null) {
            isExpected = this.expectedNotes.size === 0 || this.expectedNotes.has(baseNote);
        }
        
        // Update active notes set
        this.activeNotes.add(baseNote);

        // Find and highlight all keys/frets with this note
        const elements = document.querySelectorAll(`[data-note="${noteName}"], [data-base-note="${baseNote}"]`);
        elements.forEach(el => {
            el.classList.add('active');
            el.style.opacity = Math.min(0.7 + (confidence * 0.3), 1);
            
            // Set color based on correctness
            if (isExpected) {
                el.style.backgroundColor = '#22c55e'; // Green for correct
                el.style.boxShadow = '0 0 20px #22c55e, 0 4px 8px rgba(0, 0, 0, 0.2)';
            } else {
                el.style.backgroundColor = '#ef4444'; // Red for incorrect
                el.style.boxShadow = '0 0 20px #ef4444, 0 4px 8px rgba(0, 0, 0, 0.2)';
            }
        });

        // Auto-remove highlight after 1.5 seconds
        setTimeout(() => {
            this.dimNote(noteName);
        }, 1500);

        // Update chord detection
        this.detectChord();
    }

    dimNote(noteName) {
        const baseNote = noteName.replace(/\d/g, '');
        this.activeNotes.delete(baseNote);

        const elements = document.querySelectorAll(`[data-note="${noteName}"]`);
        elements.forEach(el => {
            el.classList.remove('active');
            el.style.opacity = '';
            el.style.backgroundColor = '';
            el.style.boxShadow = '';
        });

        this.detectChord();
    }

    detectChord() {
        if (this.activeNotes.size === 0) {
            document.getElementById('chordName').textContent = '-';
            document.getElementById('notesDisplay').textContent = 'No notes';
            this.chordName = '';
            return;
        }

        const sortedNotes = Array.from(this.activeNotes).sort();
        const noteNums = sortedNotes.map(n => this.noteToMidi[n]);
        const root = noteNums[0];
        const intervals = noteNums.map(n => (n - root + 12) % 12).sort((a, b) => a - b);

        // Try to match chord pattern
        let detectedChord = null;
        let chordType = 'other';

        // Check for common chord patterns
        for (const [type, pattern] of Object.entries(this.chordPatterns)) {
            const patternMatch = pattern.every(interval => intervals.includes(interval));
            if (patternMatch && pattern.length <= intervals.length) {
                chordType = type;
                // Format chord type for display (capitalize first letter)
                const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
                detectedChord = sortedNotes[0] + formattedType;
                break;
            }
        }

        // Default: show root with number of notes
        if (!detectedChord) {
            detectedChord = sortedNotes[0] + ` (${sortedNotes.length} notes)`;
        }

        this.chordName = detectedChord;
        document.getElementById('chordName').textContent = detectedChord;
        document.getElementById('notesDisplay').textContent = sortedNotes.join(' - ');
    }

    clearAll() {
        this.activeNotes.clear();
        const allKeys = document.querySelectorAll('.white-key.active, .black-key.active, .guitar-fret.active, .piano-key.active');
        allKeys.forEach(el => {
            el.classList.remove('active');
            el.style.opacity = '';
            el.style.backgroundColor = '';
            el.style.boxShadow = '';
        });
        document.getElementById('chordName').textContent = '-';
        document.getElementById('notesDisplay').textContent = 'No notes';
        this.chordName = '';
    }

    playNote(noteName) {
        // Play sound
        this.playSound(noteName);
        
        // Get expected status
        const baseNote = noteName.replace(/\d/g, '');
        const isExpected = this.expectedNotes.size === 0 || this.expectedNotes.has(baseNote);
        
        // Highlight with color feedback
        this.highlightNote(noteName, 1, isExpected);
    }

    /**
     * Animate a sequence of expected notes/chords by flashing keys green with sound.
     * @param {Array} noteSequence - Array of note strings or arrays-of-strings (for chords)
     * @param {object} options - { flashDuration: 200, gapDuration: 500 }
     */
    animateExpectedSequence(noteSequence, options = {}) {
        const flashDuration = options.flashDuration || 500;
        const gapDuration = options.gapDuration || 1000;
        const stepTime = flashDuration + gapDuration;

        // Cancel any running animation first
        this.stopAnimation();
        this._animTimers = [];

        noteSequence.forEach((step, index) => {
            const notes = Array.isArray(step) ? step : [step];

            // Flash ON
            const onTimer = setTimeout(() => {
                notes.forEach(note => {
                    this.playSound(note);
                    const el = document.getElementById(`key-${note}`) || document.getElementById(`fret-${note}`);
                    if (el) {
                        el.classList.add('active');
                        el.style.backgroundColor = '#22c55e';
                        el.style.boxShadow = '0 0 20px #22c55e, 0 4px 8px rgba(0,0,0,0.2)';
                    }
                });
            }, index * stepTime);

            // Flash OFF
            const offTimer = setTimeout(() => {
                notes.forEach(note => {
                    const el = document.getElementById(`key-${note}`) || document.getElementById(`fret-${note}`);
                    if (el) {
                        el.classList.remove('active');
                        el.style.backgroundColor = '';
                        el.style.boxShadow = '';
                    }
                });
            }, index * stepTime + flashDuration);

            this._animTimers.push(onTimer, offTimer);
        });
    }

    stopAnimation() {
        if (this._animTimers) {
            this._animTimers.forEach(t => clearTimeout(t));
            this._animTimers = [];
        }
        this.clearAll();
    }
}

// Global instance
let chordVisualizer = null;

function initializeChordVisualizer(instrument, expectedNotes = []) {
    if (chordVisualizer) {
        chordVisualizer.clearAll();
    }
    chordVisualizer = new ChordVisualizer('chordVisualizerContainer', instrument, expectedNotes);
}

function visualizeNote(noteName, confidence = 1) {
    if (!chordVisualizer) return;
    chordVisualizer.highlightNote(noteName, confidence);
}

function visualizeMultipleNotes(notes) {
    if (!chordVisualizer) return;
    chordVisualizer.clearAll();
    
    if (Array.isArray(notes)) {
        notes.forEach(note => {
            if (typeof note === 'object') {
                chordVisualizer.highlightNote(note.name, note.confidence || 1);
            } else {
                chordVisualizer.highlightNote(note, 1);
            }
        });
    }
}

function clearChordVisualization() {
    if (chordVisualizer) {
        chordVisualizer.clearAll();
    }
}

function getDetectedChord() {
    return chordVisualizer ? chordVisualizer.chordName : null;
}

// Store the current animation sequence so replay button can re-trigger it
let _expectedNoteSequence = [];

function animateExpectedNotes(noteSequence) {
    _expectedNoteSequence = noteSequence;
    if (chordVisualizer && noteSequence.length > 0) {
        chordVisualizer.animateExpectedSequence(noteSequence);
    }
}

function replayExpectedAnimation() {
    animateExpectedNotes(_expectedNoteSequence);
}

function stopExpectedAnimation() {
    if (chordVisualizer) {
        chordVisualizer.stopAnimation();
    }
}
