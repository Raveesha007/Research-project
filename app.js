/**
 * Music Studio Pro - AI-Powered Music Learning Application
 * Comprehensive Application Logic for Piano and Guitar Learning
 */

// ==================== APP STATE ====================
const APP_STATE = {
    currentStep: 1,
    selectedInstrument: null,
    selectedSkillLevel: null,
    selectedLesson: null,
    isRecording: false,
    detectedNotes: [],
    analysisData: null,
    completedLessons: new Set()
};

// ==================== PROGRESS PERSISTENCE ====================
function saveProgress() {
    const data = Array.from(APP_STATE.completedLessons);
    localStorage.setItem('Music Studio Pro_progress', JSON.stringify(data));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('Music Studio Pro_progress'));
        if (Array.isArray(data)) {
            APP_STATE.completedLessons = new Set(data);
        }
    } catch (e) {
        APP_STATE.completedLessons = new Set();
    }
}

function isSkillCompleted(instrument, skillLevel) {
    const lessons = LESSONS[instrument]?.[skillLevel];
    if (!lessons || lessons.length === 0) return false;
    return lessons.every(l => APP_STATE.completedLessons.has(l.id));
}

// ==================== LESSON DATABASE ====================
const LESSONS = {
    piano: {
        beginner: [
            {
                id: 1,
                name: 'Introduction to Piano',
                description: 'Learn the basic layout and notes',
                duration: '10 min',
                icon: '🎹'
            },
            {
                id: 2,
                name: 'Middle C and Octaves',
                description: 'Understand the fundamental note references',
                duration: '12 min',
                icon: '🎵'
            },
            {
                id: 3,
                name: 'Major Scale',
                description: 'Play your first complete scale',
                duration: '15 min',
                icon: '📈'
            }
        ],
        intermediate: [
            {
                id: 4,
                name: 'Chord Progressions',
                description: 'Build and play common chord patterns',
                duration: '20 min',
                icon: '🎼'
            },
            {
                id: 5,
                name: 'Rhythm and Timing',
                description: 'Develop consistent rhythm',
                duration: '18 min',
                icon: '⏱️'
            },
            {
                id: 6,
                name: 'Simple Melodies',
                description: 'Play famous melodies',
                duration: '25 min',
                icon: '🎶'
            }
        ],
        advanced: [
            {
                id: 7,
                name: 'Advanced Techniques',
                description: 'Master complex playing techniques',
                duration: '30 min',
                icon: '⭐'
            },
            {
                id: 8,
                name: 'Classical Pieces',
                description: 'Play classical compositions',
                duration: '35 min',
                icon: '🎭'
            },
            {
                id: 9,
                name: 'Sight Reading',
                description: 'Develop rapid reading skills',
                duration: '28 min',
                icon: '👁️'
            }
        ]
    },
    guitar: {
        beginner: [
            {
                id: 10,
                name: 'Guitar Basics',
                description: 'Learn guitar fundamentals and parts',
                duration: '15 min',
                icon: '🎸'
            },
            {
                id: 11,
                name: 'Basic Chords',
                description: 'Master essential open chords',
                duration: '20 min',
                icon: '☁️'
            },
            {
                id: 12,
                name: 'Strumming Patterns',
                description: 'Develop basic strumming technique',
                duration: '18 min',
                icon: '↓↑'
            }
        ],
        intermediate: [
            {
                id: 13,
                name: 'Barre Chords',
                description: 'Play barre chord progressions',
                duration: '25 min',
                icon: '🔷'
            },
            {
                id: 14,
                name: 'Fingerpicking',
                description: 'Develop fingerpicking skills',
                duration: '22 min',
                icon: '🎯'
            },
            {
                id: 15,
                name: 'Song Playing',
                description: 'Learn complete songs',
                duration: '30 min',
                icon: '🎵'
            }
        ],
        advanced: [
            {
                id: 16,
                name: 'Advanced Techniques',
                description: 'Master advanced playing techniques',
                duration: '35 min',
                icon: '⚡'
            },
            {
                id: 17,
                name: 'Music Theory',
                description: 'Deep dive into music theory',
                duration: '40 min',
                icon: '📚'
            },
            {
                id: 18,
                name: 'Improvisation',
                description: 'Create and improvise music',
                duration: '45 min',
                icon: '✨'
            }
        ]
    }
};

// ==================== REFERENCE MATERIAL ====================
const REFERENCE_MATERIAL = {
    piano: {
        'Introduction to Piano': `
            <h4>🎹 Piano Layout</h4>
            <p><strong>Keyboard Structure:</strong> 88 keys total, ranging from A0 to C8</p>
            <p><strong>White Keys:</strong> C, D, E, F, G, A, B (repeating pattern)</p>
            <p><strong>Black Keys:</strong> C#/Db, D#/Eb, F#/Gb, G#/Ab, A#/Bb</p>
            <p><strong>Key Groups:</strong> Black keys form groups of 2 and 3</p>
            <p><strong>Middle C (C4):</strong> The reference point - locate between groups of 2 black keys</p>
            <p>💡 <strong>Practice:</strong> Find Middle C on your piano. Play it 5 times clearly.</p>
        `,
        'Middle C and Octaves': `
            <h4>🎵 Middle C (C4) & Octaves</h4>
            <p><strong>Middle C Location:</strong> Center of an 88-key piano, between 2 black keys</p>
            <p><strong>C Notes Across Octaves:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>C3 (one octave below Middle C)</li>
                <li>C4 (Middle C) ← START HERE</li>
                <li>C5 (one octave above Middle C)</li>
            </ul>
            <p><strong>Octave Definition:</strong> 8 white keys (C to B) or 12 semitones</p>
            <p>💡 <strong>Practice:</strong> Play C4 → C5 → C4. Listen to the pitch differences.</p>
        `,
        'Major Scale': `
            <h4>📈 C Major Scale (No Black Keys)</h4>
            <p><strong>Note Sequence:</strong> C - D - E - F - G - A - B - C</p>
            <p><strong>Interval Pattern:</strong> Whole-Whole-Half-Whole-Whole-Whole-Half</p>
            <p><strong>Starting Position:</strong> Begin at C4 (Middle C)</p>
            <p><strong>Finger Pattern (Right Hand):</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>C (1), D (2), E (3), F (4), G (5), A (1), B (2), C (3)</li>
            </ul>
            <p><strong>Technique:</strong> Play smoothly, even tempo, consistent dynamics</p>
            <p>💡 <strong>Practice:</strong> Play C Major scale up 1 octave, then down. Repeat 3 times.</p>
        `,
        'Chord Progressions': `
            <h4>🎼 Basic Piano Chords</h4>
            <p><strong>C Major Chord:</strong> C - E - G</p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>C4 (left hand thumb)</li>
                <li>E4 (middle finger)</li>
                <li>G4 (pinky)</li>
            </ul>
            <p><strong>G Major Chord:</strong> G - B - D</p>
            <p><strong>F Major Chord:</strong> F - A - C</p>
            <p><strong>Technique:</strong> Press all notes simultaneously, hold for 2-3 seconds</p>
            <p>💡 <strong>Practice:</strong> C → G → F → C progression, 4 times each chord</p>
        `,
        'Rhythm and Timing': `
            <h4>⏱️ Piano Rhythm Basics</h4>
            <p><strong>Tempo:</strong> Speed of music (measured in BPM - Beats Per Minute)</p>
            <p><strong>Beginner Tempo:</strong> 60 BPM (1 beat per second)</p>
            <p><strong>Note Values:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Whole Note: 4 beats</li>
                <li>Half Note: 2 beats</li>
                <li>Quarter Note: 1 beat</li>
                <li>Eighth Note: 0.5 beats</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Play C4 in quarter notes at steady tempo. Tap foot on beats.</p>
        `,
        'Simple Melodies': `
            <h4>🎶 Famous Simple Melodies for Beginners</h4>
            <p><strong>Happy Birthday (8 notes):</strong></p>
            <p style="font-family: monospace; font-weight: bold;">C C D C F E</p>
            <p><strong>Twinkle Twinkle Little Star:</strong></p>
            <p style="font-family: monospace; font-weight: bold;">C C G G A A G</p>
            <p><strong>Mary Had a Little Lamb:</strong></p>
            <p style="font-family: monospace; font-weight: bold;">E D C D E E E D D D E G C</p>
            <p>💡 <strong>Practice:</strong> Choose one melody and play it 5 times smoothly.</p>
        `,
        'Advanced Techniques': `
            <h4>⭐ Intermediate Piano Techniques</h4>
            <p><strong>Hand Position:</strong> Curved fingers, relaxed wrists, rounded knuckles</p>
            <p><strong>Dynamic Control:</strong> Playing soft (piano) and loud (forte)</p>
            <p><strong>Legato:</strong> Smooth, connected playing without gaps</p>
            <p><strong>Staccato:</strong> Short, detached notes with spaces</p>
            <p><strong>Pedal Usage:</strong> Sustain pedal extends note duration</p>
            <p>💡 <strong>Practice:</strong> Play a scale with legato, then with staccato.</p>
        `,
        'Classical Pieces': `
            <h4>🎭 Classical Masterpieces for Advanced Players</h4>
            <p><strong>Level Requirements:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Beethoven - "Moonlight Sonata" (1st movement)</li>
                <li>Bach - "Prelude in C Major" (WTC Book 1)</li>
                <li>Mozart - "Piano Sonata K. 545" (1st movement)</li>
            </ul>
            <p><strong>Skills Needed:</strong> Hand independence, precise rhythm, dynamic control</p>
            <p>💡 <strong>Practice:</strong> Start with simplified versions before full pieces.</p>
        `,
        'Sight Reading': `
            <h4>👁️ Rapid Music Reading (Sight Reading)</h4>
            <p><strong>Treble Clef Notes:</strong> E F G A B C D E F (Lines and Spaces)</p>
            <p><strong>Key to Improvement:</strong> Consistent daily practice with new pieces</p>
            <p><strong>Technique:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Look ahead while playing</li>
                <li>Don't stop for mistakes</li>
                <li>Maintain steady tempo</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Play 3-5 new, simple pieces daily to develop fluency.</p>
        `
    },
    guitar: {
        'Guitar Basics': `
            <h4>🎸 Guitar Anatomy & Setup</h4>
            <p><strong>Head:</strong> Contains 6 tuning pegs (machines) for pitch adjustment</p>
            <p><strong>Neck:</strong> 19-22 frets, fingerboard where fingers press strings</p>
            <p><strong>Body:</strong> Acoustic or electric, amplifies/produces sound</p>
            <p><strong>6 Strings (Standard Tuning):</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>String 1 (High): E (Thinnest)</li>
                <li>String 2: B</li>
                <li>String 3: G</li>
                <li>String 4: D</li>
                <li>String 5: A</li>
                <li>String 6 (Low): E (Thickest)</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Identify each string by sound. Pluck and memorize.</p>
        `,
        'Basic Chords': `
            <h4>☁️ Essential Open Chords for Beginners</h4>
            <p><strong>E Major (Em):</strong> 022100 (Frets)</p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>String 1: Open (no fret)</li>
                <li>String 2: 2nd fret</li>
                <li>String 3: 2nd fret</li>
                <li>Strings 4-6: Open</li>
            </ul>
            <p><strong>A Major (Am):</strong> x02210</p>
            <p><strong>D Major (Dm):</strong> xx0232</p>
            <p><strong>G Major:</strong> 320033</p>
            <p><strong>Technique:</strong> Press firmly, all strings should ring clearly</p>
            <p>💡 <strong>Practice:</strong> Change between Em→Am→Dm every 4 beats.</p>
        `,
        'Strumming Patterns': `
            <h4>↓↑ Fundamental Strumming Techniques</h4>
            <p><strong>Basic Downstroke Pattern:</strong> ↓ ↓ ↓ ↓ (steady quarter notes)</p>
            <p><strong>Basic Upstroke-Downstroke:</strong> ↓ ↑ ↓ ↑ (alternating eighth notes)</p>
            <p><strong>Common Folk Pattern:</strong> ↓ ↓ ↑ ↑ ↓ ↑</p>
            <p><strong>Proper Technique:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Use wrist motion, not elbow</li>
                <li>Hold pick loosely between thumb & index</li>
                <li>Maintain consistent tempo</li>
                <li>All 6 strings should sound together</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Strum Am chord with each pattern, 10 repetitions.</p>
        `,
        'Barre Chords': `
            <h4>🔷 Pressing Multiple Strings with One Finger</h4>
            <p><strong>F Major (Full Barre):</strong> 133211</p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>1st fret: Index finger bars all 6 strings</li>
                <li>2nd fret: Middle fingers on strings 3-4</li>
                <li>3rd fret: Ring/pinky on strings 5-6</li>
            </ul>
            <p><strong>Technique Tips:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Press the barre firmly across all strings</li>
                <li>Keep thumb on back of neck for support</li>
                <li>Fingers must be close to the fret (not on top)</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Form F Major, check each string rings clear. 5 minutes daily.</p>
        `,
        'Fingerpicking': `
            <h4>🎯 Individual String Playing Technique</h4>
            <p><strong>Finger Assignment (Classical Style):</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Thumb (p): Strings 4, 5, 6 (bass strings)</li>
                <li>Index (i): String 3 (G string)</li>
                <li>Middle (m): String 2 (B string)</li>
                <li>Ring (a): String 1 (High E string)</li>
            </ul>
            <p><strong>Basic Pattern:</strong> Play each string individually in sequence</p>
            <p><strong>Common Arpeggio:</strong> p-i-m-a-m-i (repeating fingerpicking pattern)</p>
            <p>💡 <strong>Practice:</strong> Play arpeggio on Am chord, smooth and steady.</p>
        `,
        'Song Playing': `
            <h4>🎵 Playing Complete Guitar Songs</h4>
            <p><strong>Easy Beginner Songs:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>"Horse with No Name" (Em - Am alternating)</li>
                <li>"Wonderwall" by Oasis (Em7 - Dsus2 - A7sus4)</li>
                <li>"Creep" by Radiohead (Em - G - Dsus2 - A7)</li>
            </ul>
            <p><strong>Requirements:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Smooth chord transitions</li>
                <li>Consistent rhythm and timing</li>
                <li>Proper strumming technique</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Learn chord progression, play through 3 times.</p>
        `,
        'Advanced Techniques': `
            <h4>⚡ Intermediate to Advanced Guitar Skills</h4>
            <p><strong>Techniques to Master:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li><strong>Hammer-ons & Pull-offs:</strong> Smooth note transitions</li>
                <li><strong>Slides:</strong> Sliding between frets smoothly</li>
                <li><strong>String Bending:</strong> Changing pitch by bending strings</li>
                <li><strong>Palm Muting:</strong> Muting strings with hand for percussive effect</li>
                <li><strong>Vibrato:</strong> Subtle pitch variations for expression</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Master one technique at a time, 10 min daily.</p>
        `,
        'Music Theory': `
            <h4>📚 Essential Guitar Music Theory</h4>
            <p><strong>Intervals:</strong> Distance between notes (Perfect 5th, Major 3rd, etc.)</p>
            <p><strong>Scales:</strong> Major, Minor (Natural, Harmonic, Melodic), Pentatonic</p>
            <p><strong>Modes:</strong> Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian</p>
            <p><strong>Chord Construction:</strong> Root + 3rd + 5th (triad basis)</p>
            <p><strong>Key Signatures:</strong> Understanding sharps and flats</p>
            <p>💡 <strong>Practice:</strong> Learn one scale or mode per week.</p>
        `,
        'Improvisation': `
            <h4>✨ Creating Your Own Music (Improvisation)</h4>
            <p><strong>Prerequisite Knowledge:</strong> Scales, chord progressions, rhythm patterns</p>
            <p><strong>Common Improvisation Frameworks:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Blues Scale Soloing (12-bar blues progression)</li>
                <li>Chord Tone Soloing (focusing on chord notes)</li>
                <li>Pentatonic Scale Patterns</li>
            </ul>
            <p><strong>Tips for Better Improvisation:</strong></p>
            <ul style="margin: 10px 0 10px 20px;">
                <li>Listen and absorb professional solos</li>
                <li>Practice over backing tracks</li>
                <li>Use space and silence effectively</li>
            </ul>
            <p>💡 <strong>Practice:</strong> Improvise over a backing track, 15 minutes.</p>
        `
    }
};

// ==================== LESSON REQUIREMENTS - What Each Lesson Expects ====================
const LESSON_REQUIREMENTS = {
    piano: {
        'Introduction to Piano': {
            expectedNotes: ['C4'],
            expectedOctave: 4,
            minNotesRequired: 5,
            maxDuration: 30,
            technique: 'single-notes',
            description: 'Play Middle C clearly 5 times'
        },
        'Middle C and Octaves': {
            expectedNotes: ['C3', 'C4', 'C5'],
            minNotesRequired: 3,
            maxDuration: 40,
            technique: 'octaves-separated',
            description: 'Play C notes across 3 octaves'
        },
        'Major Scale': {
            expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            minNotesRequired: 8,
            maxDuration: 60,
            technique: 'scale-ascending',
            description: 'Play full C Major scale ascending'
        },
        'Chord Progressions': {
            expectedChords: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['F4', 'A4', 'C5']],
            minNotesRequired: 9,
            maxDuration: 90,
            technique: 'chords-simultaneous',
            description: 'Play 3 different chords clearly'
        },
        'Rhythm and Timing': {
            expectedNotes: ['C4'],
            minNotesRequired: 4,
            maxDuration: 30,
            tempo: 60,
            technique: 'rhythm-steady',
            description: 'Play C4 in steady rhythm with consistent timing'
        },
        'Simple Melodies': {
            expectedNotes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'],
            minNotesRequired: 7,
            maxDuration: 60,
            technique: 'melody-sequence',
            description: 'Play "Mary Had a Little Lamb" melody'
        },
        'Advanced Techniques': {
            expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            minNotesRequired: 8,
            maxDuration: 120,
            technique: 'scale-with-dynamics',
            description: 'Play scale with legato technique'
        },
        'Classical Pieces': {
            expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
            minNotesRequired: 15,
            maxDuration: 300,
            technique: 'complex-piece',
            description: 'Play selected classical piece excerpt'
        },
        'Sight Reading': {
            expectedNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            minNotesRequired: 8,
            maxDuration: 60,
            technique: 'continuous-reading',
            description: 'Read and play new notation without preparation'
        }
    },
    guitar: {
        'Guitar Basics': {
            expectedNotes: ['E2', 'B2', 'G3', 'D3', 'A2', 'E4'],
            minNotesRequired: 6,
            maxDuration: 30,
            technique: 'individual-strings',
            description: 'Identify and play all 6 open strings'
        },
        'Basic Chords': {
            expectedChords: [['E2', 'B2', 'E3', 'G3', 'B3', 'E4'], ['A2', 'E3', 'A3', 'C4', 'E4'], ['D3', 'A3', 'D4']],
            minNotesRequired: 6,
            maxDuration: 60,
            technique: 'chord-strumming',
            description: 'Play Em, Am, Dm chords with clear strumming'
        },
        'Strumming Patterns': {
            expectedNotes: ['A2', 'E3', 'A3', 'C4', 'E4'],
            minNotesRequired: 5,
            maxDuration: 45,
            technique: 'strumming-rhythm',
            description: 'Strum chords with consistent downstroke pattern'
        },
        'Barre Chords': {
            expectedChords: [['F2', 'C3', 'F3', 'A3', 'C4', 'F4']],
            minNotesRequired: 6,
            maxDuration: 60,
            technique: 'barre-chord-full',
            description: 'Play F Major barre chord with all strings ringing'
        },
        'Fingerpicking': {
            expectedNotes: ['A2', 'E3', 'A3', 'C4', 'E4'],
            minNotesRequired: 5,
            maxDuration: 90,
            technique: 'fingerpicking-pattern',
            description: 'Play arpeggio pattern on Am chord'
        },
        'Song Playing': {
            expectedChords: [['E2', 'G3', 'D3']],
            minNotesRequired: 10,
            maxDuration: 120,
            technique: 'full-song',
            description: 'Play complete song with smooth transitions'
        },
        'Advanced Techniques': {
            expectedNotes: ['A2', 'E3', 'A3', 'C4', 'E4'],
            minNotesRequired: 8,
            maxDuration: 90,
            technique: 'advanced-effect',
            description: 'Apply techniques like hammer-on, slide, or bend'
        },
        'Music Theory': {
            expectedNotes: ['A2', 'B2', 'C3', 'D3', 'E3'],
            minNotesRequired: 5,
            maxDuration: 120,
            technique: 'scale-playing',
            description: 'Play minor pentatonic or major scale'
        },
        'Improvisation': {
            expectedNotes: ['A2', 'C3', 'D3', 'E3', 'G3'],
            minNotesRequired: 8,
            maxDuration: 120,
            technique: 'improvisation-free',
            description: 'Create improvisational solo over backing progression'
        }
    }
};

// ==================== LESSON CRITERIA - Grading Rubric ====================
const LESSON_CRITERIA = {
    pitchAccuracyWeighting: 40,    // 40% of final score
    rhythmAccuracyWeighting: 25,   // 25% of final score
    techniqueWeighting: 20,         // 20% of final score
    confidenceWeighting: 15,        // 15% of final score
    
    grades: {
        excellent: { min: 90, emoji: '⭐⭐⭐', message: 'Outstanding performance!' },
        good: { min: 75, emoji: '⭐⭐', message: 'Great job! Keep practicing.' },
        satisfactory: { min: 60, emoji: '⭐', message: 'Good effort! Practice specific areas.' },
        needsWork: { min: 0, emoji: '💪', message: 'Keep practicing - you\'ll get it!' }
    }
};

// ==================== AUDIO ANALYSIS ENGINE ====================
class AudioAnalysisEngine {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingStartTime = null;
        this.detectedNotes = [];
        this.noteQualityScore = 0;  // 0-1: dataset quality score (>=0.80 = correct)
        this.lastChromaFeatures = null;
    }

    async initialize() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    latency: 0,
                    channelCount: 1
                }
            });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 4096;
            source.connect(this.analyser);

            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
            this.mediaRecorder.onstop = () => this.processRecording();

            return true;
        } catch (err) {
            console.error('Microphone access error:', err);
            showNotification('Please enable microphone access to continue', 'error');
            return false;
        }
    }

    startRecording() {
        if (!this.mediaRecorder) return false;
        this.audioChunks = [];
        this.detectedNotes = [];
        this.detectedChord = null;
        this.noteQualityScore = 0;
        this.lastChromaFeatures = null;
        this.recordingStartTime = Date.now();
        this.isRecording = true;
        this.mediaRecorder.start();
        return true;
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            return true;
        }
        return false;
    }

    // Encode Float32 mono PCM into a proper WAV Blob that librosa can decode
    _encodeWAV(float32, sampleRate) {
        const numSamples = float32.length;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);
        const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
        writeStr(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true);
        writeStr(8, 'WAVE'); writeStr(12, 'fmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true); view.setUint16(34, 16, true);
        writeStr(36, 'data'); view.setUint32(40, numSamples * 2, true);
        let off = 44;
        for (let i = 0; i < numSamples; i++) {
            const s = Math.max(-1, Math.min(1, float32[i]));
            view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
        }
        return new Blob([buffer], { type: 'audio/wav' });
    }

    async processRecording() {
        // MediaRecorder always encodes WebM/Opus internally — label alone doesn't re-encode.
        // Decode with AudioContext (browser handles WebM natively), then write a real WAV.
        const rawBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        let wavBlob = rawBlob;
        try {
            const arrayBuf = await rawBlob.arrayBuffer();
            const tmpCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 22050 });
            const decoded = await tmpCtx.decodeAudioData(arrayBuf);
            tmpCtx.close();
            wavBlob = this._encodeWAV(decoded.getChannelData(0), decoded.sampleRate);
            console.log('[audio] WAV encoded:', wavBlob.size, 'bytes at', decoded.sampleRate, 'Hz, duration', decoded.duration.toFixed(2), 's');
        } catch (decErr) {
            console.warn('[audio] WAV re-encode failed, sending raw blob:', decErr.message);
        }

        // Try backend first; fall back to local autocorrelation
        let backendSuccess = false;
        try {
            const formData = new FormData();
            formData.append('audio', wavBlob, 'recording.wav');

            // Use AbortController for broad browser compatibility
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000);

            console.log('[audio] Sending', wavBlob.size, 'bytes to /analyze …');
            const res = await fetch('/analyze', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log('[audio] /analyze responded:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('[audio] backend notes:', data.notes);
                // Map backend note format ("C_4") to app.js format ({name, octave, full})
                const nameMap = { Cs: 'C#', Eb: 'D#', Fs: 'F#', Gs: 'G#', Bb: 'A#' };
                const mapped = (data.notes || []).map(item => {
                    const parts = item.note.split('_');
                    const rawName = parts[0];
                    const octave = parseInt(parts[1], 10);
                    const name = nameMap[rawName] || rawName;
                    return {
                        frequency: item.frequency,
                        confidence: item.confidence,
                        note: { name, octave, full: name + octave },
                        timestamp: 0
                    };
                });
                if (mapped.length > 0) {
                    this.detectedNotes = mapped;
                    this.generateAnalysis();
                    if (this._onAnalysisDone) this._onAnalysisDone([...this.detectedNotes]);
                    backendSuccess = true;
                } else {
                    console.warn('[audio] Backend returned 0 notes — using local fallback');
                }
            } else {
                const errText = await res.text().catch(() => '');
                console.warn('[audio] Backend error', res.status, errText);
            }
        } catch (e) {
            console.warn('[audio] Fetch failed:', e.message, '— using local fallback');
        }

        if (!backendSuccess) {
            // Fallback: local frequency analysis (use the WAV blob, not raw WebM)
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const arrayBuffer = e.target.result;
                this.analyzeAudio(arrayBuffer);
            };
            fileReader.readAsArrayBuffer(wavBlob);
        }
    }

    analyzeAudio(arrayBuffer) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const channelData = audioBuffer.getChannelData(0);
            this.detectPitch(channelData, audioBuffer.sampleRate);

            // Run ML chord classification and dataset quality scoring
            if (typeof ChordClassifier !== 'undefined') {
                try {
                    const features = ChordClassifier.extractFeaturesFromBuffer(audioBuffer);
                    this.lastChromaFeatures = features;

                    // Chord classification (requires model to be loaded)
                    if (ChordClassifier.isReady) {
                        this.detectedChord = ChordClassifier.predictChord(features);
                        console.log('ML Chord detected:', this.detectedChord);
                    } else {
                        this.detectedChord = null;
                    }

                    // Dataset quality score — works without model, only needs chroma features
                    const lessonName = APP_STATE.currentLessonData?.name;
                    const instrument = APP_STATE.selectedInstrument;
                    const req = LESSON_REQUIREMENTS[instrument]?.[lessonName];
                    const expectedNotes = req?.expectedNotes || (req?.expectedChords ? req.expectedChords.flat() : []);
                    if (expectedNotes.length > 0) {
                        this.noteQualityScore = ChordClassifier.scoreNoteQuality(features, expectedNotes);
                        console.log('Note quality score:', (this.noteQualityScore * 100).toFixed(1) + '%');
                    }
                } catch (err) {
                    console.warn('ML analysis failed:', err);
                    this.detectedChord = null;
                }
            } else {
                this.detectedChord = null;
            }

            // Trigger display callback now that all local analysis is complete
            if (this._onAnalysisDone) this._onAnalysisDone([...this.detectedNotes]);
        });
    }

    detectPitch(buffer, sampleRate) {
        // Windowed pitch detection to find multiple notes over time
        const windowSize = 4096;
        const hopSize = 4096; // Non-overlapping windows to reduce over-detection
        const totalSamples = buffer.length;
        const MIN_CONFIDENCE = 55; // Lowered from 75 — piano mic recordings are often quieter
        const MIN_HOLD_WINDOWS = 2; // Lowered from 3 — allow notes held for ~185ms (2×4096/44100)

        // Phase 1: Detect raw notes per window
        const rawDetections = [];
        for (let start = 0; start + windowSize <= totalSamples; start += hopSize) {
            const windowBuffer = buffer.slice(start, start + windowSize);
            const autocorrelation = this.getAutocorrelation(windowBuffer, sampleRate);

            if (autocorrelation && autocorrelation.frequency > 0 && autocorrelation.confidence > MIN_CONFIDENCE) {
                const noteInfo = this.frequencyToNote(autocorrelation.frequency);
                rawDetections.push({
                    frequency: autocorrelation.frequency,
                    confidence: autocorrelation.confidence,
                    note: noteInfo,
                    timestamp: start / sampleRate
                });
            } else {
                rawDetections.push(null); // silence/noise
            }
        }

        // Phase 2: Consolidate — group consecutive same-note detections,
        // only emit a note if it held for MIN_HOLD_WINDOWS consecutive windows
        let runNote = null;
        let runCount = 0;
        let runBest = null;

        const emitRun = () => {
            if (runNote && runCount >= MIN_HOLD_WINDOWS && runBest) {
                this.detectedNotes.push(runBest);
            }
        };

        for (const det of rawDetections) {
            const currentNote = det ? det.note.full : null;

            if (currentNote && currentNote === runNote) {
                // Same note continues
                runCount++;
                if (det.confidence > (runBest?.confidence || 0)) {
                    runBest = det; // Keep highest-confidence sample
                }
            } else {
                // Note changed or silence — flush previous run
                emitRun();
                if (currentNote) {
                    runNote = currentNote;
                    runCount = 1;
                    runBest = det;
                } else {
                    runNote = null;
                    runCount = 0;
                    runBest = null;
                }
            }
        }
        emitRun(); // Flush last run

        // Peak-relative noise gate: only keep notes from frames loud enough
        // relative to the loudest moment in the recording (same logic as audioAnalyzer.js)
        if (this.detectedNotes.length > 0) {
            // Sort by confidence descending, keep top 3
            this.detectedNotes.sort((a, b) => b.confidence - a.confidence);
            this.detectedNotes = this.detectedNotes.slice(0, 3);
        }

        // Generate analysis report
        const analysis = this.generateAnalysis();
        return analysis;
    }

    getAutocorrelation(buffer, sampleRate) {
        const SIZE = buffer.length;
        const MAX_SAMPLES = Math.floor(sampleRate / 50);
        let best_offset = -1;
        let best_correlation = 0;
        let rms = 0;

        // Calculate RMS
        for (let i = 0; i < SIZE; i++) {
            const val = buffer[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);

        if (rms < 0.12) return null;

        // Find best correlation
        let lastCorrelation = 1;
        for (let offset = 0; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;
            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs(buffer[i] - buffer[i + offset]);
            }
            correlation = 1 - (correlation / MAX_SAMPLES);
            
            if (correlation > 0.9 && correlation > lastCorrelation) {
                let foundGoodCorrelation = false;
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                    foundGoodCorrelation = true;
                }
                if (foundGoodCorrelation) {
                    const shift = this.parabolicInterpolation(buffer, best_offset, sampleRate);
                    if (shift) {
                        return {
                            frequency: shift,
                            confidence: best_correlation * 100
                        };
                    }
                }
            }
            lastCorrelation = correlation;
        }

        if (best_correlation > 0.01) {
            const frequency = sampleRate / best_offset;
            return {
                frequency: frequency,
                confidence: best_correlation * 100
            };
        }
        return null;
    }

    parabolicInterpolation(buffer, offset, sampleRate) {
        const s0 = buffer[offset];
        const s1 = buffer[offset + 1];
        const s2 = buffer[offset + 2];

        const a = (s2 - s1) - (s1 - s0);
        const b = (s1 - s0) * 2 + a;
        const shift = (a === 0) ? 0 : -b / (2 * a);

        return sampleRate / (offset + shift);
    }

    frequencyToNote(frequency) {
        // A4 = 440 Hz = MIDI note 69
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const a4 = 440;
        const halfStepsFromA4 = 12 * Math.log2(frequency / a4);
        const midiNote = Math.round(halfStepsFromA4) + 69; // A4 = MIDI 69
        const noteIndex = ((midiNote % 12) + 12) % 12; // safe modulo handles negatives
        const octave = Math.floor(midiNote / 12) - 1;
        
        return {
            name: noteNames[noteIndex],
            octave: octave,
            full: noteNames[noteIndex] + octave,
            frequency: frequency
        };
    }

    generateAnalysis() {
        if (this.detectedNotes.length === 0) {
            return {
                success: false,
                message: 'No notes detected. Please try again with louder audio.',
                pitchAccuracy: 0,
                timing: 0,
                rhythm: 0
            };
        }

        // Get current lesson requirements
        const lessonName = APP_STATE.currentLessonData?.name;
        const instrument = APP_STATE.selectedInstrument;
        const requirements = LESSON_REQUIREMENTS[instrument]?.[lessonName];
        
        const avgConfidence = this.detectedNotes.reduce((a, b) => a + b.confidence, 0) / this.detectedNotes.length;
        const pitchVariance = this.calculatePitchVariance();
        const recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
        
        // Compare against lesson requirements
        const comparison = this.compareAgainstLessonRequirements(requirements, this.detectedNotes);
        
        // Pitch accuracy: based on how many expected notes were actually matched
        const pitchScore = comparison.expectedNotesCount > 0
            ? comparison.matchPercentage
            : Math.min(100, avgConfidence);
        
        // Rhythm: based on how many expected notes were played (note count ratio)
        const expectedCount = requirements?.minNotesRequired || requirements?.expectedNotes?.length || 1;
        const actualCount = this.detectedNotes.length;
        const rhythmScore = Math.max(0, Math.min(100,
            actualCount >= expectedCount
                ? 100 - Math.max(0, (actualCount - expectedCount * 1.5) / expectedCount) * 30
                : (actualCount / expectedCount) * 100
        ));
        
        const techniqueScore = comparison.techniqueMatch ? 95 : 70;
        const confidenceScore = Math.min(100, avgConfidence);
        
        const finalScore = (
            pitchScore * (LESSON_CRITERIA.pitchAccuracyWeighting / 100) +
            rhythmScore * (LESSON_CRITERIA.rhythmAccuracyWeighting / 100) +
            techniqueScore * (LESSON_CRITERIA.techniqueWeighting / 100) +
            confidenceScore * (LESSON_CRITERIA.confidenceWeighting / 100)
        );
        
        return {
            success: true,
            notesDetected: this.detectedNotes.length,
            averageConfidence: avgConfidence,
            pitchAccuracy: pitchScore,
            timing: recordingDuration,
            rhythm: rhythmScore,
            finalScore: Math.round(finalScore),
            detectedNotes: this.detectedNotes,
            detectedChord: this.detectedChord || null,
            noteQualityScore: this.noteQualityScore || 0,
            isCorrectNote: (this.noteQualityScore || 0) >= 0.80,
            comparison: comparison,
            feedback: this.generateLessonSpecificFeedback(
                requirements, 
                this.detectedNotes, 
                comparison, 
                finalScore,
                avgConfidence,
                pitchVariance,
                this.noteQualityScore || 0
            )
        };
    }

    compareAgainstLessonRequirements(requirements, detectedNotes) {
        if (!requirements) {
            return {
                expectedNotesCount: 0,
                actualNotesCount: detectedNotes.length,
                matchedNotes: detectedNotes.map(n => n.note.full),
                techniqueMatch: detectedNotes.length > 0
            };
        }

        const expectedNotes = requirements.expectedNotes || [];
        const actualNotes = detectedNotes.map(n => n.note.full);
        
        // Each actual note can only match ONE expected note (no reuse)
        const usedActualIndices = new Set();
        const matchedNotes = [];
        const missedNotes = [];
        
        expectedNotes.forEach(expected => {
            let foundIndex = -1;
            for (let i = 0; i < actualNotes.length; i++) {
                if (!usedActualIndices.has(i) && this.notesMatch(expected, actualNotes[i])) {
                    foundIndex = i;
                    break;
                }
            }
            if (foundIndex >= 0) {
                usedActualIndices.add(foundIndex);
                matchedNotes.push(expected);
            } else {
                missedNotes.push(expected);
            }
        });

        return {
            expectedNotes: expectedNotes,
            expectedNotesCount: expectedNotes.length,
            actualNotesCount: actualNotes.length,
            matchedNotes: matchedNotes,
            missedNotes: missedNotes,
            matchPercentage: expectedNotes.length > 0 ? (matchedNotes.length / expectedNotes.length) * 100 : 0,
            extraNotes: actualNotes.filter((n, i) => !usedActualIndices.has(i)),
            techniqueMatch: matchedNotes.length >= (requirements.minNotesRequired || 1),
            actualPlayedNotes: actualNotes,
            technique: requirements.technique
        };
    }

    notesMatch(expected, actual) {
        // Require exact match: note name + octave (e.g. C4 === C4)
        if (expected === actual) return true;

        // Allow ±1 semitone tolerance for slightly off pitch
        const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const parseNote = (n) => {
            const match = n.match(/^([A-G]#?)(\d+)$/);
            if (!match) return null;
            const semitone = noteOrder.indexOf(match[1]);
            const octave = parseInt(match[2]);
            return semitone >= 0 ? octave * 12 + semitone : null;
        };

        const expMidi = parseNote(expected);
        const actMidi = parseNote(actual);
        if (expMidi !== null && actMidi !== null) {
            return Math.abs(expMidi - actMidi) <= 2; // ±2 semitone tolerance
        }
        
        return false;
    }

    calculatePitchVariance() {
        if (this.detectedNotes.length < 2) return 0;
        const frequencies = this.detectedNotes.map(n => n.frequency);
        const mean = frequencies.reduce((a, b) => a + b) / frequencies.length;
        const variance = frequencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / frequencies.length;
        return Math.sqrt(variance);
    }

    generateLessonSpecificFeedback(requirements, detectedNotes, comparison, finalScore, avgConfidence, pitchVariance, noteQualityScore = 0) {
        const feedbackLines = [];
        const instrument = APP_STATE.selectedInstrument;

        // ── Dataset Quality Banner (primary correct/incorrect indicator) ──
        const qualityPct = Math.round(noteQualityScore * 100);
        const isCorrect = noteQualityScore >= 0.80;
        const bannerBg   = isCorrect ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)' : 'linear-gradient(135deg,#fee2e2,#fecaca)';
        const bannerBorder = isCorrect ? '#10b981' : '#ef4444';
        const bannerTextColor = isCorrect ? '#065f46' : '#7f1d1d';
        const bannerSubColor  = isCorrect ? '#047857' : '#991b1b';
        feedbackLines.push(`
        <div style="text-align:center; padding:18px 12px; background:${bannerBg}; border-radius:14px; margin-bottom:16px; border:2px solid ${bannerBorder};">
          <div style="font-size:40px; line-height:1;">${isCorrect ? '✅' : '❌'}</div>
          <div style="font-size:22px; font-weight:800; color:${bannerTextColor}; margin-top:6px;">
            ${isCorrect ? 'CORRECT NOTE!' : 'NEEDS IMPROVEMENT'}
          </div>
          <div style="font-size:13px; color:${bannerSubColor}; margin-top:4px;">
            Dataset Quality Score: <strong>${qualityPct}%</strong>
            &nbsp;${isCorrect ? '(≥ 80% threshold ✓)' : '(Below 80% threshold — keep practising)'}
          </div>
          <div style="margin-top:10px; background:rgba(0,0,0,0.08); border-radius:8px; height:10px; overflow:hidden;">
            <div style="width:${qualityPct}%; height:100%; background:${bannerBorder}; border-radius:8px; transition:width 0.6s;"></div>
          </div>
        </div>`);

        // Header with score
        feedbackLines.push(`<div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">`);
        
        // Grade with emoji
        let gradeInfo;
        if (finalScore >= LESSON_CRITERIA.grades.excellent.min) {
            gradeInfo = LESSON_CRITERIA.grades.excellent;
        } else if (finalScore >= LESSON_CRITERIA.grades.good.min) {
            gradeInfo = LESSON_CRITERIA.grades.good;
        } else if (finalScore >= LESSON_CRITERIA.grades.satisfactory.min) {
            gradeInfo = LESSON_CRITERIA.grades.satisfactory;
        } else {
            gradeInfo = LESSON_CRITERIA.grades.needsWork;
        }
        
        feedbackLines.push(`${gradeInfo.emoji} <strong>Score: ${Math.round(finalScore)}/100</strong> - ${gradeInfo.message}</div>`);
        
        // Detailed breakdown
        feedbackLines.push(`<div style="margin-top: 15px; padding: 12px; background: #f0f4ff; border-radius: 8px;">`);
        feedbackLines.push(`<p style="margin: 5px 0;"><strong>📊 Performance Analysis:</strong></p>`);
        const displayedPitchAccuracy = comparison.expectedNotesCount > 0 ? Math.round(comparison.matchPercentage) : Math.round(avgConfidence);
        feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">🎯 Pitch Accuracy: ${displayedPitchAccuracy}%</p>`);
        feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">⏱️ Duration: ${detectedNotes.length} notes detected</p>`);
        
        if (requirements?.expectedNotes) {
            feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">✓ Expected: ${requirements.expectedNotes.join(', ')}</p>`);
            feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">🎵 Played: ${comparison.actualPlayedNotes.join(', ')}</p>`);
            feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">✅ Matched: ${comparison.matchedNotes.join(', ') || 'None yet'}</p>`);
            
            if (comparison.missedNotes.length > 0) {
                feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px; color: #d97706;">❌ To Improve: ${comparison.missedNotes.join(', ')}</p>`);
            }
        }
        feedbackLines.push(`</div>`);
        
        // Instrument-specific tips
        feedbackLines.push(`<div style="margin-top: 15px;">`);
        feedbackLines.push(`<p style="font-weight: bold; margin-bottom: 8px;">💡 Personalized Tips for ${instrument.toUpperCase()}:</p>`);
        
        const tips = this.generateInstrumentSpecificTips(
            instrument,
            avgConfidence,
            pitchVariance,
            comparison,
            requirements
        );
        
        tips.forEach(tip => {
            feedbackLines.push(`<p style="margin: 6px 0; font-size: 13px;">• ${tip}</p>`);
        });
        
        feedbackLines.push(`</div>`);
        
        // Next steps
        feedbackLines.push(`<div style="margin-top: 15px; padding: 12px; background: #ecfdf5; border-radius: 8px;">`);
        
        if (finalScore >= 75) {
            feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">🎉 <strong>Ready for the next lesson!</strong></p>`);
        } else if (finalScore >= 60) {
            feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">📚 <strong>Review the reference material and try again.</strong></p>`);
        } else {
            feedbackLines.push(`<p style="margin: 5px 0; font-size: 13px;">💪 <strong>Keep practicing! Use the reference guide and retry.</strong></p>`);
        }
        
        feedbackLines.push(`</div>`);
        
        return feedbackLines.join('');
    }

    generateInstrumentSpecificTips(instrument, confidence, variance, comparison, requirements) {
        const tips = [];
        
        if (instrument === 'piano') {
            // Piano-specific tips
            if (confidence < 80) {
                tips.push('Press keys more firmly and hold longer for clearer sound');
            }
            if (variance > 30) {
                tips.push('Focus on consistent hand position to stabilize pitch');
            }
            if (comparison.actualPlayedNotes.length < (requirements?.minNotesRequired || 1)) {
                tips.push(`Play all required notes: ${requirements?.expectedNotes?.join(', ')}`);
            }
            if (requirements?.technique === 'scale-ascending' && comparison.actualPlayedNotes.length > 0) {
                tips.push('Play notes in ascending order without skipping any');
            }
            if (requirements?.technique === 'chords-simultaneous') {
                tips.push('Press all chord notes at the same time for clarity');
            }
            if (requirements?.technique === 'melody-sequence') {
                tips.push('Focus on rhythmic accuracy while maintaining melody');
            }
            if (confidence >= 85) {
                tips.push('Excellent pitch control! Now work on dynamics and expression.');
            }
        } else if (instrument === 'guitar') {
            // Guitar-specific tips
            if (confidence < 75) {
                tips.push('Press strings firmly on the frets to avoid muted or muffled notes');
            }
            if (variance > 40) {
                tips.push('Maintain consistent pressure and finger positioning');
            }
            if (requirements?.technique === 'chord-strumming') {
                tips.push('Ensure all 6 strings ring clearly - check finger placement on frets');
            }
            if (requirements?.technique === 'barre-chord-full') {
                tips.push('Press the barre firmly across all strings; arch your fingers properly');
            }
            if (requirements?.technique === 'strumming-rhythm') {
                tips.push('Use steady wrist motion, alternating down and up strokes');
            }
            if (requirements?.technique === 'fingerpicking-pattern') {
                tips.push('Maintain consistent finger pattern: thumb on bass, fingers on treble');
            }
            if (requirements?.technique === 'advanced-effect') {
                tips.push('Practice the technique slowly first, then gradually increase speed');
            }
            if (confidence >= 85) {
                tips.push('Great tone! Now focus on smoother transitions between chords.');
            }
        }
        
        // ML chord detection feedback
        if (this.detectedChord && this.detectedChord.chord !== 'Unknown') {
            const chordConf = Math.round(this.detectedChord.confidence * 100);
            tips.push(`🎹 AI detected chord: <strong>${this.detectedChord.chord}</strong> (${chordConf}% confidence)`);
            if (requirements?.expectedChord) {
                if (this.detectedChord.chord.toLowerCase() === requirements.expectedChord.toLowerCase()) {
                    tips.push('✅ Correct chord played!');
                } else {
                    tips.push(`Expected chord: ${requirements.expectedChord}. Try adjusting your fingers.`);
                }
            }
        }

        // General tips for all
        if (comparison.matchPercentage === 100) {
            tips.push('🌟 Perfect! All expected notes were played correctly!');
        } else if (comparison.matchPercentage >= 75) {
            tips.push(`Good progress! ${Math.round(comparison.matchPercentage)}% of expected notes matched.`);
        } else if (comparison.matchPercentage >= 50) {
            tips.push('Keep practicing - you\'re making progress!');
        }
        
        if (tips.length === 0) {
            tips.push('Keep practicing consistently to improve!');
        }
        
        return tips;
    }

    generateFeedback(confidence, pitchVariance) {
        // Fallback method for backward compatibility
        const tips = [];

        if (confidence < 70) {
            tips.push('💡 Try to play louder and clearer');
        } else if (confidence < 85) {
            tips.push('💡 Good effort! Try to stabilize the pitch');
        } else {
            tips.push('💡 Excellent clarity and confidence!');
        }

        if (pitchVariance > 50) {
            tips.push('🎯 Work on maintaining consistent pitch');
        }

        tips.push('✨ Keep practicing to improve!');

        return tips;
    }
}

// ==================== GLOBAL INSTANCES ====================
const audioEngine = new AudioAnalysisEngine();

// ==================== UI FUNCTIONS ====================

function selectInstrument(instrument, element) {
    APP_STATE.selectedInstrument = instrument;
    
    // Update UI
    document.querySelectorAll('.instrument-card').forEach(e => e.classList.remove('selected'));
    element.classList.add('selected');
    
    showNotification(`Great! You selected ${instrument.toUpperCase()}`, 'success');
    
    // Move to next step
    setTimeout(() => nextStep(), 500);
}

function selectSkillLevel(level, element) {
    APP_STATE.selectedSkillLevel = level;
    
    // Update UI
    document.querySelectorAll('.skill-card').forEach(e => e.classList.remove('selected'));
    element.classList.add('selected');
    
    showNotification(`You selected ${level} level`, 'success');
    
    // Move to next step
    setTimeout(() => nextStep(), 500);
}

function selectLesson(lessonId, element, lessonData) {
    // Validate lesson exists
    const lessons = LESSONS[APP_STATE.selectedInstrument][APP_STATE.selectedSkillLevel];
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lesson) {
        showNotification('Lesson not found. Please try again.', 'error');
        return;
    }
    
    // Update state
    APP_STATE.selectedLesson = lessonId;
    APP_STATE.currentLessonData = lesson;
    
    // Update UI - remove all selected states
    document.querySelectorAll('.lesson-card').forEach(e => {
        e.classList.remove('selected');
    });
    
    // Add selected state to clicked card
    if (element) {
        element.classList.add('selected');
    } else {
        // If element not provided, find and select it
        const card = document.getElementById(`lesson-${lessonId}`);
        if (card) {
            card.classList.add('selected');
        }
    }
    
    // Show practice button and update based on completion status
    const practiceBtn = document.getElementById('practiceBtn');
    if (practiceBtn) {
        practiceBtn.style.display = 'flex';
        if (APP_STATE.completedLessons.has(lessonId)) {
            practiceBtn.innerHTML = '🔄 Practice Again';
            practiceBtn.classList.remove('btn-success');
            practiceBtn.classList.add('btn-warning');
        } else {
            practiceBtn.innerHTML = '🎤 Start Practice';
            practiceBtn.classList.remove('btn-warning');
            practiceBtn.classList.add('btn-success');
        }
    }
    
    // Update message
    const bubble = document.getElementById('speechBubble');
    if (bubble) {
        bubble.innerText = "Excellent choice! Ready to practice this lesson?";
    }
    
    showNotification(`✓ Selected: ${lesson.name}`, 'success');
}

function renderLessons() {
    const container = document.getElementById('lessonsGrid');
    const lessons = LESSONS[APP_STATE.selectedInstrument][APP_STATE.selectedSkillLevel];
    
    if (!lessons || lessons.length === 0) {
        container.innerHTML = '<p>No lessons available for this level.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    lessons.forEach((lesson, index) => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.id = `lesson-${lesson.id}`;
        card.setAttribute('data-lesson-id', lesson.id);
        card.setAttribute('data-lesson-name', lesson.name);

        // Mark completed lessons
        const isCompleted = APP_STATE.completedLessons.has(lesson.id);
        if (isCompleted) {
            card.classList.add('completed');
        }
        
        // Add click handler
        card.addEventListener('click', function(e) {
            e.preventDefault();
            selectLesson(lesson.id, card, lesson);
        });
        
        // Add keyboard support
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectLesson(lesson.id, card, lesson);
            }
        });
        
        card.innerHTML = `
            <div class="lesson-icon">${lesson.icon}</div>
            <div class="lesson-number">Lesson ${index + 1}</div>
            <h3>${lesson.name}</h3>
            <p class="lesson-description">${lesson.description}</p>
            <div class="lesson-duration">⏱️ ${lesson.duration}</div>
            ${isCompleted ? '<div class="lesson-completed-badge">✓ Completed</div>' : '<div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary);">Click to select</div>'}
        `;
        
        // Restore selection if it matches current selection
        if (APP_STATE.selectedLesson === lesson.id) {
            card.classList.add('selected');
        }
        
        container.appendChild(card);
    });
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    
    const progress = (APP_STATE.currentStep / 4) * 100;
    progressFill.style.width = progress + '%';
    progressLabel.textContent = `Progress: Step ${APP_STATE.currentStep} of 4`;
}

function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    const steps = [
        'Select an instrument',
        'Choose skill level',
        'Select a lesson',
        'Practice'
    ];
    breadcrumb.textContent = steps[APP_STATE.currentStep - 1];
}

function startPracticeLesson() {
    if (!APP_STATE.selectedLesson) {
        showNotification('Please select a lesson first', 'warning');
        return;
    }

    // If practicing a completed lesson, remove completion so badge + state are fully reset
    if (APP_STATE.completedLessons.has(APP_STATE.selectedLesson)) {
        APP_STATE.isPracticingAgain = true;
        APP_STATE.completedLessons.delete(APP_STATE.selectedLesson);
        saveProgress();

        // Refresh the lesson card immediately so the "✓ Completed" badge disappears
        renderLessons();

        // Re-select the card visually and update the practice button label
        const card = document.getElementById(`lesson-${APP_STATE.selectedLesson}`);
        if (card) card.classList.add('selected');

        const practiceBtn = document.getElementById('practiceBtn');
        if (practiceBtn) {
            practiceBtn.innerHTML = '🎤 Start Practice';
            practiceBtn.classList.remove('btn-warning');
            practiceBtn.classList.add('btn-success');
        }

        // Also refresh the skill-level card badge in case it was fully completed
        refreshSkillCards();
    }

    showNotification('Starting practice lesson...', 'info');
    setTimeout(() => {
        nextStep();
    }, 500);
}

function nextStep() {
    if (APP_STATE.currentStep === 1 && !APP_STATE.selectedInstrument) {
        showNotification('Please select an instrument', 'warning');
        return;
    }
    if (APP_STATE.currentStep === 2 && !APP_STATE.selectedSkillLevel) {
        showNotification('Please select a skill level', 'warning');
        return;
    }
    if (APP_STATE.currentStep === 3 && !APP_STATE.selectedLesson) {
        showNotification('Please select a lesson', 'warning');
        return;
    }

    if (APP_STATE.currentStep < 4) {
        showStep(++APP_STATE.currentStep);
        updateProgress();
        updateBreadcrumb();
        window.scrollTo(0, 0);
    }
}

function previousStep() {
    // Stop any running note animation
    stopExpectedAnimation();

    // Clear practice-again flag
    APP_STATE.isPracticingAgain = false;

    if (APP_STATE.currentStep > 1) {
        showStep(--APP_STATE.currentStep);
        updateProgress();
        updateBreadcrumb();
        window.scrollTo(0, 0);
    }
}

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show selected step
    const step = document.getElementById(`step${stepNumber}`);
    if (step) {
        step.classList.add('active');
    }

    // Special handling for step 2
    if (stepNumber === 2) {
        refreshSkillCards();
    }

    // Special handling for step 3
    if (stepNumber === 3) {
        renderLessons();
    }

    // Special handling for step 4
    if (stepNumber === 4) {
        initializePractice();
    }
}

function initializePractice() {
    // ── Reset the practice UI so previous lesson's results don't bleed through ──
    const analysisResults = document.getElementById('analysisResults');
    const statsGrid       = document.getElementById('statsGrid');
    const completeBtn     = document.getElementById('completeBtn');
    const timingGraph     = document.getElementById('timingGraphContainer');
    const recordBtn       = document.getElementById('recordBtn');
    const stopBtn         = document.getElementById('stopBtn');
    const timer           = document.getElementById('timer');

    if (analysisResults)  analysisResults.innerHTML = '';
    if (statsGrid)        { statsGrid.style.display = 'none'; }
    if (completeBtn)      { completeBtn.style.display = 'none'; }
    if (timingGraph)      { timingGraph.style.display = 'none'; }
    if (recordBtn)        { recordBtn.style.display = 'flex'; recordBtn.innerHTML = '🎤 Start Practice'; }
    if (stopBtn)          { stopBtn.style.display = 'none'; }
    if (timer)            { timer.style.display = 'none'; timer.textContent = ''; }

    // Reset audio engine state so it's clean for the new lesson
    if (typeof audioEngine !== 'undefined') {
        audioEngine.detectedNotes = [];
        audioEngine.detectedChord = null;
        audioEngine.noteQualityScore = 0;
        audioEngine.lastChromaFeatures = null;
        audioEngine.audioChunks = [];
        audioEngine.isRecording = false;
    }

    APP_STATE.analysisData = null;
    APP_STATE.isRecording  = false;

    const lesson = LESSONS[APP_STATE.selectedInstrument][APP_STATE.selectedSkillLevel]
        .find(l => l.id === APP_STATE.selectedLesson);
    
    if (!lesson) return;

    // Update title
    document.getElementById('practiceTitle').textContent = `Practice: ${lesson.name}`;

    // Set reference content with lesson requirements
    const referenceContent = document.getElementById('referenceContent');
    const reference = REFERENCE_MATERIAL[APP_STATE.selectedInstrument][lesson.name] || 'No reference material';
    
    // Get lesson requirements
    const requirements = LESSON_REQUIREMENTS[APP_STATE.selectedInstrument]?.[lesson.name];
    
    let fullContent = reference;
    
    // Add lesson requirements section
    if (requirements) {
        fullContent += `
            <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border);">
            <h4>📋 What You Need to Do</h4>
            <div style="background: #f0f4ff; padding: 12px; border-radius: 8px; margin: 10px 0;">
                <p style="margin: 5px 0; font-size: 13px;"><strong>Task:</strong> ${requirements.description}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Expected Notes/Chords:</strong> ${(requirements.expectedNotes || []).join(', ') || (requirements.expectedChords?.map(c => c.join('-')).join(', ') || 'See above')}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Minimum Notes:</strong> ${requirements.minNotesRequired || 1}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Technique:</strong> ${requirements.technique}</p>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">💡 <strong>Tip:</strong> When you're ready, click "Start Recording" below and follow the guidance above.</p>
        `;
    }
    
    referenceContent.innerHTML = fullContent;

    // Initialize visualization
    initializeVisualizer();

    // Initialize chord visualizer with expected notes
    const expectedNotes = requirements?.expectedNotes || requirements?.expectedChords?.flat() || [];
    setTimeout(() => {
        initializeChordVisualizer(APP_STATE.selectedInstrument, expectedNotes);
        document.getElementById('chordVisualizerContainer').style.display = 'block';

        // Build animation sequence from lesson requirements and store for later use
        APP_STATE.animSequence = [];
        if (requirements) {
            if (requirements.expectedChords) {
                APP_STATE.animSequence = requirements.expectedChords;
            } else if (requirements.expectedNotes) {
                const notes = requirements.expectedNotes;
                const count = Math.max(requirements.minNotesRequired || notes.length, notes.length);
                for (let i = 0; i < count; i++) {
                    APP_STATE.animSequence.push(notes[i % notes.length]);
                }
            }
        }
    }, 100);

    // Initialize audio engine
    audioEngine.initialize();
}

function initializeVisualizer() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    function draw() {
        if (!audioEngine.analyser) {
            requestAnimationFrame(draw);
            return;
        }

        const dataArray = new Uint8Array(audioEngine.analyser.frequencyBinCount);
        audioEngine.analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            
            const hue = (i / dataArray.length) * 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        requestAnimationFrame(draw);
    }

    draw();
}

function startRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const timer = document.getElementById('timer');

    // Clear previous chord visualization
    clearChordVisualization();

    recordBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    timer.style.display = 'block';

    // Play expected notes animation, then start recording after it finishes
    const seq = APP_STATE.animSequence || [];
    if (seq.length > 0) {
        const stepTime = 500 + 1000; // flashDuration + gapDuration
        const totalAnimTime = seq.length * stepTime;
        animateExpectedNotes(seq);

        // Show replay button
        const replayBtn = document.getElementById('replayAnimBtn');
        if (replayBtn) replayBtn.style.display = 'inline-flex';

        // Start actual recording after animation completes
        setTimeout(() => {
            audioEngine.startRecording();
            APP_STATE.isRecording = true;
            timer.style.display = 'block';
            startRecordingTimer();
        }, totalAnimTime);
    } else {
        audioEngine.startRecording();
        APP_STATE.isRecording = true;
        startRecordingTimer();
    }
}

function startRecordingTimer() {
    const timer = document.getElementById('timer');
    let seconds = 0;
    APP_STATE.timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (seconds >= 30) {
            stopRecording();
        }
    }, 1000);
}

function stopRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const timer = document.getElementById('timer');

    // Clear timer interval
    if (APP_STATE.timerInterval) {
        clearInterval(APP_STATE.timerInterval);
        APP_STATE.timerInterval = null;
    }

    stopBtn.style.display = 'none';
    timer.style.display = 'none';

    audioEngine.stopRecording();
    APP_STATE.isRecording = false;

    // Wait for async processRecording to finish (WAV encode + backend fetch + pyin)
    // before rendering results — do NOT use a fixed setTimeout
    audioEngine._onAnalysisDone = () => {
        audioEngine._onAnalysisDone = null;
        displayAnalysisResults();
        recordBtn.style.display = 'flex';
    };
}

function displayAnalysisResults() {
    const analysis = audioEngine.generateAnalysis();
    APP_STATE.analysisData = analysis;

    const resultsDiv = document.getElementById('analysisResults');
    const statsGrid = document.getElementById('statsGrid');
    const completeBtn = document.getElementById('completeBtn');

    if (analysis.success) {
        // Build chord detection block (will be prepended to feedback)
        let chordHTML = '';
        if (analysis.detectedChord && analysis.detectedChord.chord !== 'Unknown') {
            const chordConfPct = Math.round(analysis.detectedChord.confidence * 100);
            const chordColor = chordConfPct >= 80 ? '#10b981' : chordConfPct >= 60 ? '#f59e0b' : '#6366f1';
            chordHTML = `
                <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08)); border-radius: 14px; border: 2px solid ${chordColor}; text-align: center;">
                    <div style="font-size: 13px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">🎹 AI Chord Detection</div>
                    <div style="font-size: 28px; font-weight: 800; color: #222;">${analysis.detectedChord.chord}</div>
                    <div style="margin-top: 8px;">
                        <span style="display: inline-block; padding: 4px 14px; border-radius: 20px; background: ${chordColor}; color: white; font-size: 14px; font-weight: 600;">${chordConfPct}% confidence</span>
                    </div>
                </div>`;
        }

        // Display stats - updated with actual analysis data
        document.getElementById('pitchAccuracy').textContent = Math.round(analysis.pitchAccuracy) + '%';
        const noteLabel = analysis.detectedNotes.length === 1 ? 'note' : 'notes';
        document.getElementById('timing').textContent = analysis.detectedNotes.length + ' ' + noteLabel;
        // Show dataset quality % in rhythm slot for clarity
        const qualityPctDisplay = Math.round((analysis.noteQualityScore || 0) * 100);
        document.getElementById('rhythm').textContent = qualityPctDisplay + '% quality';
        
        statsGrid.style.display = 'grid';

        // Visualize detected notes on chord visualizer
        if (analysis.detectedNotes && analysis.detectedNotes.length > 0) {
            const notesWithConfidence = analysis.detectedNotes.map(note => {
                // note structure: {frequency, confidence, note:{name,octave,full}, timestamp}
                const noteName = note.note?.name || note.name || String(note).replace(/\d+/g, '');
                return { name: noteName, confidence: note.confidence || 0.8 };
            });
            visualizeMultipleNotes(notesWithConfidence);
        }

        // Display detailed lesson-specific feedback (chord HTML prepended)
        let feedbackHTML = '<div class="feedback-panel" style="border-left: 4px solid var(--primary);">';
        feedbackHTML += chordHTML;
        
        // Use the new detailed feedback (HTML format)
        if (typeof analysis.feedback === 'string') {
            feedbackHTML += analysis.feedback;
        } else if (Array.isArray(analysis.feedback)) {
            // Fallback for array-based feedback
            feedbackHTML += '<div class="feedback-title">💡 AI Feedback</div>';
            analysis.feedback.forEach(tip => {
                feedbackHTML += `<div class="feedback-item">${tip}</div>`;
            });
        }
        
        feedbackHTML += '</div>';
        resultsDiv.innerHTML = feedbackHTML;

        // Always show complete button after analysis
        completeBtn.style.display = 'flex';

        // Draw timing graph
        if (analysis.detectedNotes && analysis.detectedNotes.length > 0) {
            drawTimingGraph(analysis.detectedNotes, analysis.comparison?.expectedNotes || [], APP_STATE.animSequence || []);
        }

        // Show success notification with score
        const scoreMsg = analysis.finalScore !== undefined ? ` Score: ${analysis.finalScore}/100` : '';
        showNotification(`Analysis complete!${scoreMsg}`, 'success');
    } else {
        resultsDiv.innerHTML = `<div class="feedback-panel" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 191, 36, 0.1)); border-color: #ef4444; border-left: 4px solid #ef4444;">
            <div class="feedback-title">⚠️ ${analysis.message}</div>
            <p style="margin-top: 10px; font-size: 13px;">Try playing louder or speaking more clearly, and adjust your microphone volume.</p>
        </div>`;
        showNotification(analysis.message, 'warning');
    }
}

function drawTimingGraph(detectedNotes, expectedNotes, animSequence) {
    const container = document.getElementById('timingGraphContainer');
    const canvas = document.getElementById('timingGraph');
    if (!container || !canvas || detectedNotes.length === 0) return;

    container.style.display = 'block';
    const ctx = canvas.getContext('2d');

    // DPR-aware sizing
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 260 * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = 260;

    const PAD_LEFT = 65;
    const PAD_RIGHT = 20;
    const PAD_TOP = 20;
    const PAD_BOTTOM = 40;
    const plotW = W - PAD_LEFT - PAD_RIGHT;
    const plotH = H - PAD_TOP - PAD_BOTTOM;

    // Note / MIDI helpers
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteToMidi = (name) => {
        const m = name.match(/^([A-G]#?)(\d+)$/);
        if (!m) return null;
        const idx = noteOrder.indexOf(m[1]);
        return idx >= 0 ? parseInt(m[2]) * 12 + idx : null;
    };
    const midiToName = (m) => noteOrder[((m % 12) + 12) % 12] + Math.floor(m / 12);

    // Build data points — normalise confidence to 0-100
    const points = detectedNotes.map((n, i) => {
        const rawConf = typeof n.confidence === 'number' ? n.confidence : 0.5;
        return {
            time: n.timestamp != null ? n.timestamp : 0,
            midi: noteToMidi(n.note?.full || n.note || ''),
            label: n.note?.full || n.note || '',
            conf: rawConf > 1 ? rawConf : rawConf * 100,   // normalise to 0-100
            frequency: n.frequency || 0
        };
    }).filter(p => p.midi !== null);

    if (points.length === 0) return;

    const expectedMidis = expectedNotes
        .map(n => ({ midi: noteToMidi(n), label: n }))
        .filter(e => e.midi !== null);

    // Y range shared by both modes
    const allMidis = [...points.map(p => p.midi), ...expectedMidis.map(e => e.midi)];
    let minMidi = Math.min(...allMidis) - 2;
    let maxMidi = Math.max(...allMidis) + 2;
    if (maxMidi - minMidi < 6) { minMidi -= 3; maxMidi += 3; }
    const yOf = (m) => PAD_TOP + plotH - ((m - minMidi) / (maxMidi - minMidi)) * plotH;

    // Clear + background
    ctx.clearRect(0, 0, W, H);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── Detect mode ─────────────────────────────────────────────────────────
    // Backend returns all timestamps = 0, so a time axis is meaningless.
    // Use confidence-bar mode instead; fall back to time plot for local path.
    const backendMode = points.every(p => p.time === 0);

    if (backendMode) {
        // ── CONFIDENCE BAR MODE ──────────────────────────────────────────────
        // X axis = confidence (0–100 %), Y axis = MIDI pitch
        // Each note: horizontal bar from left edge to its confidence, dot at end

        points.sort((a, b) => b.conf - a.conf);  // highest confidence first

        const xOfConf = (c) => PAD_LEFT + (c / 100) * plotW;

        // Vertical grid + X labels (0 / 25 / 50 / 75 / 100 %)
        ctx.lineWidth = 1;
        [0, 25, 50, 75, 100].forEach(c => {
            const x = xOfConf(c);
            ctx.strokeStyle = c === 50
                ? 'rgba(165, 180, 252, 0.2)'
                : 'rgba(165, 180, 252, 0.08)';
            ctx.beginPath();
            ctx.moveTo(x, PAD_TOP);
            ctx.lineTo(x, H - PAD_BOTTOM);
            ctx.stroke();
            ctx.fillStyle = '#7c8db5';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(c + '%', x, H - 8);
        });

        // Horizontal pitch grid + Y labels
        const yStep = Math.max(1, Math.round((maxMidi - minMidi) / 8));
        for (let m = Math.ceil(minMidi); m <= maxMidi; m += yStep) {
            const y = yOf(m);
            ctx.strokeStyle = 'rgba(165, 180, 252, 0.07)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(PAD_LEFT, y);
            ctx.lineTo(W - PAD_RIGHT, y);
            ctx.stroke();
            if (!points.some(p => p.midi === m)) {
                ctx.fillStyle = '#556080';
                ctx.font = '10px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(midiToName(m), PAD_LEFT - 4, y + 3);
            }
        }

        // Expected note reference bands
        expectedMidis.forEach(e => {
            const y = yOf(e.midi);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.13)';
            ctx.fillRect(PAD_LEFT, y - 4, plotW, 8);
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(PAD_LEFT, y);
            ctx.lineTo(W - PAD_RIGHT, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('▸' + e.label, PAD_LEFT - 4, y + 3);
        });

        // Bars + dots per detected note
        const barH = Math.min(28, Math.floor(plotH / (points.length + 1)));
        points.forEach((p) => {
            const y = yOf(p.midi);
            const x = xOfConf(p.conf);
            const isMatch = expectedMidis.some(e => Math.abs(e.midi - p.midi) <= 1);
            const barColor   = isMatch ? 'rgba(34,197,94,0.22)'   : 'rgba(99,102,241,0.22)';
            const edgeColor  = isMatch ? 'rgba(34,197,94,0.55)'   : 'rgba(99,102,241,0.5)';
            const dotColor   = isMatch ? '#22c55e' : '#6366f1';

            // Horizontal confidence bar
            ctx.fillStyle = barColor;
            ctx.fillRect(PAD_LEFT, y - barH / 2, x - PAD_LEFT, barH);
            ctx.strokeStyle = edgeColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(PAD_LEFT, y - barH / 2, x - PAD_LEFT, barH);

            // Confidence % inside bar (only if wide enough)
            if (p.conf > 18) {
                ctx.fillStyle = isMatch ? '#86efac' : '#a5b4fc';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(Math.round(p.conf) + '%', PAD_LEFT + (x - PAD_LEFT) / 2, y + 3);
            }

            // Dot at bar tip
            ctx.shadowColor = dotColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = dotColor;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Note label + pitch name on Y axis
            ctx.fillStyle = '#7c8db5';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(p.label, PAD_LEFT - 4, y + 3);

            // Label to the right of dot (or left if close to edge)
            const labelX = x + 10 + 38 < W - PAD_RIGHT ? x + 10 : x - 42;
            ctx.fillStyle = '#e0e7ff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'left';
            const freqStr = p.frequency ? ' ' + Math.round(p.frequency) + 'Hz' : '';
            ctx.fillText(p.label + freqStr, labelX, y + 4);
        });

        // Axis titles
        ctx.fillStyle = '#a5b4fc';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Detection Confidence', PAD_LEFT + plotW / 2, H);
        ctx.save();
        ctx.translate(14, PAD_TOP + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Pitch', 0, 0);
        ctx.restore();

    } else {
        // ── TIME-PITCH MODE (local autocorrelation fallback) ─────────────────
        // X = time (s), Y = MIDI pitch

        // Build timed expected from animation sequence (1.5 s per step)
        const STEP_TIME = 1.5;
        const timedExpected = [];
        if (animSequence && animSequence.length > 0) {
            animSequence.forEach((step, i) => {
                const notes = Array.isArray(step) ? step : [step];
                notes.forEach(n => {
                    const midi = noteToMidi(n);
                    if (midi !== null) timedExpected.push({ time: i * STEP_TIME, midi, label: n });
                });
            });
        }
        const allTimedMidis = [...allMidis, ...timedExpected.map(e => e.midi)];
        if (Math.min(...allTimedMidis) < minMidi) minMidi = Math.min(...allTimedMidis) - 2;
        if (Math.max(...allTimedMidis) > maxMidi) maxMidi = Math.max(...allTimedMidis) + 2;

        const maxExpTime = timedExpected.length > 0 ? timedExpected[timedExpected.length - 1].time + 0.5 : 0;
        const maxTime = Math.max(...points.map(p => p.time), maxExpTime, 0.5);
        const xOf = (t) => PAD_LEFT + (t / maxTime) * plotW;

        // Y grid + labels
        ctx.lineWidth = 1;
        const yStep = Math.max(1, Math.round((maxMidi - minMidi) / 8));
        for (let m = Math.ceil(minMidi); m <= maxMidi; m += yStep) {
            const y = yOf(m);
            ctx.strokeStyle = 'rgba(165, 180, 252, 0.1)';
            ctx.beginPath();
            ctx.moveTo(PAD_LEFT, y); ctx.lineTo(W - PAD_RIGHT, y);
            ctx.stroke();
            ctx.fillStyle = '#7c8db5';
            ctx.font = '11px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(midiToName(m), PAD_LEFT - 8, y + 4);
        }

        // X grid + labels (time)
        const xSteps = Math.min(8, Math.ceil(maxTime));
        for (let i = 0; i <= xSteps; i++) {
            const t = (maxTime / xSteps) * i;
            const x = xOf(t);
            ctx.strokeStyle = 'rgba(165, 180, 252, 0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, PAD_TOP); ctx.lineTo(x, H - PAD_BOTTOM);
            ctx.stroke();
            ctx.fillStyle = '#7c8db5';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(t.toFixed(1) + 's', x, H - 8);
        }

        // Expected note markers
        if (timedExpected.length > 0) {
            timedExpected.forEach(e => {
                const x = xOf(e.time), y = yOf(e.midi);
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(x, y, 7, 0, Math.PI * 2);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(e.label, x, y + 18);
            });
        } else {
            expectedMidis.forEach(e => {
                const y = yOf(e.midi);
                ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
                ctx.fillRect(PAD_LEFT, y - 8, plotW, 16);
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'right';
                ctx.fillText('▸' + e.label, PAD_LEFT - 8, y + 4);
            });
        }

        // Connecting line
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(xOf(points[0].time), yOf(points[0].midi));
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(xOf(points[i].time), yOf(points[i].midi));
            }
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Detected note dots
        const dotColors = ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#7c3aed'];
        points.forEach((p, i) => {
            const x = xOf(p.time), y = yOf(p.midi);
            const isMatch = expectedMidis.some(e => Math.abs(e.midi - p.midi) <= 1);
            ctx.shadowColor = isMatch ? '#22c55e' : '#6366f1';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = isMatch ? '#22c55e' : dotColors[i % dotColors.length];
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#e0e7ff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(p.label, x, y - 12);
        });

        // Axis titles
        ctx.fillStyle = '#a5b4fc';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time', PAD_LEFT + plotW / 2, H);
        ctx.save();
        ctx.translate(14, PAD_TOP + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Pitch', 0, 0);
        ctx.restore();
    }

    // Legend
    const legendContainer = document.getElementById('timingGraphLegend');
    if (legendContainer) {
        const items = [
            { color: '#6366f1', label: 'Detected Note', type: 'dot' },
            { color: '#22c55e', label: 'Matched Expected Note', type: 'dot' },
        ];
        if (expectedMidis.length > 0) {
            items.push({ color: 'rgba(34,197,94,0.35)', border: '#22c55e', label: 'Expected Note Zone', type: 'bar' });
        }
        let html = '';
        items.forEach(item => {
            let icon;
            if (item.type === 'dot') {
                icon = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};border:1.5px solid #fff;vertical-align:middle;margin-right:6px;"></span>`;
            } else if (item.type === 'ring') {
                icon = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:transparent;border:2.5px solid ${item.color};vertical-align:middle;margin-right:6px;"></span>`;
            } else {
                icon = `<span style="display:inline-block;width:14px;height:10px;border-radius:2px;background:${item.color};border:1px solid ${item.border};vertical-align:middle;margin-right:6px;"></span>`;
            }
            html += `<span style="display:inline-flex;align-items:center;margin-right:18px;font-size:12px;color:#c7d2fe;">${icon}${item.label}</span>`;
        });
        legendContainer.innerHTML = html;
    }
}

function completeLesson() {
    // Mark current lesson as completed and clear practice-again flag
    APP_STATE.completedLessons.add(APP_STATE.selectedLesson);
    APP_STATE.isPracticingAgain = false;
    saveProgress();

    const instrument = APP_STATE.selectedInstrument;
    const skillLevel = APP_STATE.selectedSkillLevel;
    const lessons = LESSONS[instrument][skillLevel];

    // Check if all lessons in this skill level are completed
    const allDone = lessons.every(l => APP_STATE.completedLessons.has(l.id));

    if (allDone) {
        // All lessons in skill level completed → go to Step 2 with badge
        showNotification(`🏆 ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} level completed! Amazing work!`, 'success');
        setTimeout(() => {
            APP_STATE.currentStep = 2;
            APP_STATE.selectedSkillLevel = null;
            APP_STATE.selectedLesson = null;
            showStep(2);
            updateProgress();
            updateBreadcrumb();
            window.scrollTo(0, 0);
        }, 1500);
    } else {
        // Find next uncompleted lesson in this level
        const nextLesson = lessons.find(l => !APP_STATE.completedLessons.has(l.id));
        if (nextLesson) {
            showNotification(`🎉 Lesson completed! Moving to: ${nextLesson.name}`, 'success');
            setTimeout(() => {
                APP_STATE.selectedLesson = nextLesson.id;
                APP_STATE.currentStep = 4;
                showStep(4);
                updateProgress();
                updateBreadcrumb();
                window.scrollTo(0, 0);
            }, 1500);
        }
    }
}

function refreshSkillCards() {
    if (!APP_STATE.selectedInstrument) return;
    const levels = ['beginner', 'intermediate', 'advanced'];
    const cards = document.querySelectorAll('.skill-card');
    cards.forEach((card, i) => {
        const level = levels[i];
        // Remove any existing completed badge
        const existing = card.querySelector('.skill-completed-badge');
        if (existing) existing.remove();
        card.classList.remove('skill-completed');

        if (isSkillCompleted(APP_STATE.selectedInstrument, level)) {
            card.classList.add('skill-completed');
            const badge = document.createElement('div');
            badge.className = 'skill-completed-badge';
            badge.textContent = '✓ Completed';
            card.appendChild(badge);
        }
    });
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('active');
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
        color: white;
        max-width: 300px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== AI LEVEL ASSESSMENT MODULE ====================

const ASSESSMENT_CHALLENGES = {
    piano: [
        {
            phase: 1,
            levelTarget: 'beginner',
            label: 'Beginner Check',
            icon: '🟢',
            title: 'Play these 3 notes one by one',
            targetNotes: ['C4', 'D4', 'E4'],
            minMatch: 2,
            recordDuration: 8,
            description: 'Play C4, D4, then E4 — hold each note for about 1 second',
            hint: 'The 3 white keys starting from Middle C'
        },
        {
            phase: 2,
            levelTarget: 'intermediate',
            label: 'Intermediate Check',
            icon: '🟡',
            title: 'Play a C Major arpeggio',
            targetNotes: ['C4', 'E4', 'G4'],
            minMatch: 3,
            recordDuration: 10,
            description: 'Play C4 → E4 → G4 separately, then G4 → E4 → C4 back down',
            hint: 'The 3 notes of a C Major chord spread out'
        },
        {
            phase: 3,
            levelTarget: 'advanced',
            label: 'Pro Check',
            icon: '🔴',
            title: 'Play the full C Major scale',
            targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            minMatch: 6,
            recordDuration: 12,
            description: 'Play all 8 notes of the C Major scale (C4 to C5), ascending, evenly paced',
            hint: 'All white keys from Middle C upward — smooth and steady'
        }
    ],
    guitar: [
        {
            phase: 1,
            levelTarget: 'beginner',
            label: 'Beginner Check',
            icon: '🟢',
            title: 'Pluck 4 open strings',
            targetNotes: ['E2', 'A2', 'D3', 'G3'],
            minMatch: 3,
            recordDuration: 8,
            description: 'Pluck strings 6 (Low E), 5 (A), 4 (D), 3 (G) one at a time',
            hint: 'No fretting needed — open strings only'
        },
        {
            phase: 2,
            levelTarget: 'intermediate',
            label: 'Intermediate Check',
            icon: '🟡',
            title: 'Strum an open Em chord',
            targetNotes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
            minMatch: 4,
            recordDuration: 10,
            description: 'Strum all 6 strings open (Em chord — no frets required)',
            hint: 'Make sure all 6 strings ring clearly together'
        },
        {
            phase: 3,
            levelTarget: 'advanced',
            label: 'Pro Check',
            icon: '🔴',
            title: 'Play A minor pentatonic',
            targetNotes: ['A2', 'C3', 'D3', 'E3', 'G3', 'A3'],
            minMatch: 4,
            recordDuration: 12,
            description: 'Play the A minor pentatonic scale ascending from A2 to A3',
            hint: 'A (5th string open) → C3 → D3 → E3 → G3 → A3'
        }
    ]
};

let ASSESSMENT_STATE = {
    isOpen: false,
    currentPhase: 0,
    results: [],
    assessmentEngine: null,
    recordingTimer: null,
    instrument: null
};

function startLevelAssessment() {
    if (!APP_STATE.selectedInstrument) {
        showNotification('Please select an instrument first', 'warning');
        return;
    }
    ASSESSMENT_STATE.isOpen = true;
    ASSESSMENT_STATE.currentPhase = 0;
    ASSESSMENT_STATE.results = [];
    ASSESSMENT_STATE.instrument = APP_STATE.selectedInstrument;

    document.getElementById('assessmentModal').classList.add('active');
    renderAssessmentIntro();
}

function closeAssessmentModal() {
    document.getElementById('assessmentModal').classList.remove('active');
    ASSESSMENT_STATE.isOpen = false;
    if (ASSESSMENT_STATE.assessmentEngine?.isRecording) {
        ASSESSMENT_STATE.assessmentEngine.stopRecording();
    }
    if (ASSESSMENT_STATE.recordingTimer) {
        clearInterval(ASSESSMENT_STATE.recordingTimer);
        ASSESSMENT_STATE.recordingTimer = null;
    }
}

function renderAssessmentIntro() {
    updateAssessmentDots(0);
    const challenges = ASSESSMENT_CHALLENGES[ASSESSMENT_STATE.instrument];
    document.getElementById('assessmentBody').innerHTML = `
        <div style="text-align:center; padding: 10px 0;">
            <div style="font-size:52px; margin-bottom:16px;">🎯</div>
            <div class="modal-title">AI Level Assessment</div>
            <div class="modal-description">
                You'll play <strong>3 short musical challenges</strong> — one per level.<br>
                Our AI agent listens and assigns the best starting point for you.<br><br>
                <em>Microphone permission required.</em>
            </div>
            <div style="display:flex; justify-content:center; gap:16px; margin: 0 0 28px; flex-wrap:wrap;">
                ${challenges.map(c => `
                    <div style="text-align:center; padding:12px 18px; background:var(--bg-light); border-radius:10px; min-width:110px;">
                        <div style="font-size:22px;">${c.icon}</div>
                        <div style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-top:4px; text-transform:uppercase; letter-spacing:.5px;">${c.label}</div>
                    </div>`).join('')}
            </div>
            <div class="modal-buttons" style="justify-content:center; gap:12px;">
                <button class="btn btn-secondary" onclick="closeAssessmentModal()">Cancel</button>
                <button class="btn btn-primary" onclick="beginAssessmentPhase(1)">🎤 Start Assessment</button>
            </div>
        </div>`;
}

async function beginAssessmentPhase(phaseNum) {
    ASSESSMENT_STATE.currentPhase = phaseNum;
    updateAssessmentDots(phaseNum);

    const challenge = ASSESSMENT_CHALLENGES[ASSESSMENT_STATE.instrument][phaseNum - 1];

    if (!ASSESSMENT_STATE.assessmentEngine) {
        ASSESSMENT_STATE.assessmentEngine = new AudioAnalysisEngine();
        const ok = await ASSESSMENT_STATE.assessmentEngine.initialize();
        if (!ok) {
            showNotification('Microphone access denied — assessment requires microphone', 'error');
            closeAssessmentModal();
            return;
        }
        // Patch processRecording to fire a callback after pitch detection
        const eng = ASSESSMENT_STATE.assessmentEngine;
        eng.processRecording = async function () {
            const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
            let backendSuccess = false;
            try {
                const formData = new FormData();
                formData.append('audio', blob, 'recording.webm');
                const res = await fetch('/analyze', {
                    method: 'POST',
                    body: formData,
                    signal: AbortSignal.timeout(8000)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.notes && data.notes.length > 0) {
                        const nameMap = { Cs: 'C#', Eb: 'D#', Fs: 'F#', Gs: 'G#', Bb: 'A#' };
                        this.detectedNotes = data.notes.map(item => {
                            const parts = item.note.split('_');
                            const rawName = parts[0];
                            const octave = parseInt(parts[1], 10);
                            const name = nameMap[rawName] || rawName;
                            return {
                                frequency: item.frequency,
                                confidence: item.confidence,
                                note: { name, octave, full: name + octave },
                                timestamp: 0
                            };
                        });
                        if (this._onAnalysisDone) this._onAnalysisDone([...this.detectedNotes]);
                        backendSuccess = true;
                    }
                }
            } catch (e) {
                console.warn('Backend unavailable in assessment, falling back:', e.message);
            }
            if (!backendSuccess) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    ctx.decodeAudioData(ev.target.result, (buffer) => {
                        this.detectPitch(buffer.getChannelData(0), buffer.sampleRate);
                        if (this._onAnalysisDone) this._onAnalysisDone([...this.detectedNotes]);
                    }, () => {
                        if (this._onAnalysisDone) this._onAnalysisDone([]);
                    });
                };
                reader.readAsArrayBuffer(blob);
            }
        };
    }

    renderPhaseUI(challenge, 'ready');
}

function renderPhaseUI(challenge, state, extraData) {
    const pills = challenge.targetNotes.map(n =>
        `<div class="assessment-note-pill">${n}</div>`).join('');

    let action = '';
    if (state === 'ready') {
        action = `
            <p style="color:#9ca3af; font-size:13px; margin-top:16px;">${challenge.hint}</p>
            <div class="modal-buttons" style="justify-content:center; margin-top:20px; gap:12px;">
                <button class="btn btn-secondary" onclick="closeAssessmentModal()">Cancel</button>
                <button class="btn btn-primary" onclick="startAssessmentRecord(${challenge.phase})">
                    🎤 I'm Ready — Start Recording
                </button>
            </div>`;
    } else if (state === 'recording') {
        action = `
            <div class="assessment-mic-indicator">
                <div class="assessment-mic-dot"></div>
                Recording… <span id="assessCountdown">${challenge.recordDuration}</span>s remaining
            </div>
            <p style="color:#9ca3af; font-size:12px; margin-top:10px;">Recording will stop automatically</p>
            <div class="modal-buttons" style="justify-content:center; margin-top:20px;">
                <button class="btn btn-danger" onclick="stopAssessmentRecord()">⏹ Stop Early</button>
            </div>`;
    } else if (state === 'analyzing') {
        action = `
            <div class="ai-thinking">
                <span>🤖 Analyzing your playing</span>
                <div class="ai-thinking-dots"><span></span><span></span><span></span></div>
            </div>`;
    } else if (state === 'done' && extraData) {
        const { passed, matchScore } = extraData;
        action = `
            <div style="background:${passed ? 'rgba(16,185,129,.1)' : 'rgba(107,114,128,.1)'}; border-radius:10px; padding:14px; margin-top:12px;">
                <p style="font-weight:700; margin:0 0 4px;">${passed ? '✅ Challenge passed!' : '⚪ Noted — let\'s continue'}</p>
                <p style="font-size:13px; color:var(--text-secondary); margin:0;">Notes matched: ${Math.round(matchScore)}%</p>
            </div>
            <div class="modal-buttons" style="justify-content:center; margin-top:20px;">
                ${challenge.phase < 3
                    ? `<button class="btn btn-primary" onclick="beginAssessmentPhase(${challenge.phase + 1})">Next Challenge →</button>`
                    : `<button class="btn btn-primary" onclick="finalizeAssessment()">🤖 Get My Level</button>`}
            </div>`;
    }

    document.getElementById('assessmentBody').innerHTML = `
        <div class="assessment-phase-title">${challenge.label} — Phase ${challenge.phase} of 3</div>
        <div class="assessment-challenge-box">
            <div class="assessment-challenge-title">${challenge.title}</div>
            <div class="assessment-challenge-desc" style="margin-bottom:12px;">${challenge.description}</div>
            <div class="assessment-notes-display">${pills}</div>
        </div>
        <div id="assessActionArea">${action}</div>`;
}

function startAssessmentRecord(phaseNum) {
    const eng = ASSESSMENT_STATE.assessmentEngine;
    const challenge = ASSESSMENT_CHALLENGES[ASSESSMENT_STATE.instrument][phaseNum - 1];

    eng.detectedNotes = [];
    if (!eng.startRecording()) {
        showNotification('Could not start recording', 'error');
        return;
    }

    renderPhaseUI(challenge, 'recording');

    let remaining = challenge.recordDuration;
    ASSESSMENT_STATE.recordingTimer = setInterval(() => {
        remaining--;
        const el = document.getElementById('assessCountdown');
        if (el) el.textContent = remaining;
        if (remaining <= 0) {
            clearInterval(ASSESSMENT_STATE.recordingTimer);
            ASSESSMENT_STATE.recordingTimer = null;
            stopAssessmentRecord();
        }
    }, 1000);
}

function stopAssessmentRecord() {
    const eng = ASSESSMENT_STATE.assessmentEngine;
    if (!eng?.isRecording) return;

    clearInterval(ASSESSMENT_STATE.recordingTimer);
    ASSESSMENT_STATE.recordingTimer = null;

    const challenge = ASSESSMENT_CHALLENGES[ASSESSMENT_STATE.instrument][ASSESSMENT_STATE.currentPhase - 1];
    eng.stopRecording();
    renderPhaseUI(challenge, 'analyzing');

    eng._onAnalysisDone = (detectedNotes) => {
        eng._onAnalysisDone = null;
        const result = scoreAssessmentPhase(challenge, detectedNotes);
        ASSESSMENT_STATE.results.push(result);
        renderPhaseUI(challenge, 'done', { passed: result.passed, matchScore: result.matchScore });
    };
}

function scoreAssessmentPhase(challenge, detectedNotes) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const parseMidi = (n) => {
        const m = n.match(/^([A-G]#?)(\d+)$/);
        if (!m) return null;
        const s = noteOrder.indexOf(m[1]);
        return s >= 0 ? parseInt(m[2]) * 12 + s : null;
    };
    const notesMatch = (exp, act) => {
        if (exp === act) return true;
        const e = parseMidi(exp), a = parseMidi(act);
        return e !== null && a !== null && Math.abs(e - a) <= 1;
    };

    const actualNotes = detectedNotes.map(n => n.note?.full || n);
    const matched = challenge.targetNotes.filter(exp => actualNotes.some(act => notesMatch(exp, act)));
    const matchScore = challenge.targetNotes.length > 0
        ? (matched.length / challenge.targetNotes.length) * 100 : 0;
    const avgConf = detectedNotes.length > 0
        ? detectedNotes.reduce((s, n) => s + (n.confidence || 0), 0) / detectedNotes.length : 0;

    return {
        phase: challenge.phase,
        levelTarget: challenge.levelTarget,
        targetNotes: challenge.targetNotes,
        detectedNotes: actualNotes,
        matchedNotes: matched,
        matchScore: Math.round(matchScore),
        avgConfidence: Math.round(avgConf),
        passed: matched.length >= challenge.minMatch
    };
}

function finalizeAssessment() {
    updateAssessmentDots(4);
    document.getElementById('assessmentBody').innerHTML = `
        <div class="assessment-result-card">
            <div style="font-size:48px; margin-bottom:12px;">🤖</div>
            <div class="modal-title">Analyzing Your Performance…</div>
            <div class="ai-thinking" style="margin-top:20px;">
                <span>AI agent is determining your level</span>
                <div class="ai-thinking-dots"><span></span><span></span><span></span></div>
            </div>
        </div>`;

    // Compute level locally — instant, no network latency
    const { level, reasoning } = computeAssessmentLevel(ASSESSMENT_STATE.results);

    // Brief animation delay for UX, then show result
    setTimeout(() => showAssessmentResult(level, reasoning), 800);
}

function computeAssessmentLevel(results) {
    const r1 = results.find(r => r.phase === 1) || { matchScore: 0, passed: false };
    const r2 = results.find(r => r.phase === 2) || { matchScore: 0, passed: false };
    const r3 = results.find(r => r.phase === 3) || { matchScore: 0, passed: false };

    const passedCount = [r1, r2, r3].filter(r => r.passed).length;

    if (r3.passed || r3.matchScore >= 70) {
        return {
            level: 'advanced',
            reasoning: `You nailed all 3 challenges (${r3.matchScore}% on the Pro challenge) — you're ready for advanced content.`
        };
    }
    if ((r1.passed && r2.passed) || (passedCount >= 2)) {
        return {
            level: 'intermediate',
            reasoning: `You handled beginner and intermediate challenges well (${r2.matchScore}% on intermediate) — a great starting point.`
        };
    }
    if (r1.matchScore >= 50) {
        return {
            level: 'beginner',
            reasoning: `You're picking up the basics (${r1.matchScore}% on the beginner challenge) — starting from the fundamentals will build your skills fast.`
        };
    }
    return {
        level: 'beginner',
        reasoning: `Starting from the beginning is the best path — the foundations will set you up for everything ahead.`
    };
}

function showAssessmentResult(level, reasoning) {
    const info = {
        beginner:     { emoji: '🌱', label: 'Beginner',      color: '#10b981' },
        intermediate: { emoji: '🎵', label: 'Intermediate',  color: '#f59e0b' },
        advanced:     { emoji: '⭐', label: 'Pro',           color: '#7c3aed' }
    };
    const { emoji, label, color } = info[level] || info.beginner;

    const scoreBars = ASSESSMENT_STATE.results.map(r => `
        <div style="display:flex; align-items:center; gap:10px; margin:8px 0;">
            <span style="font-size:12px; color:var(--text-secondary); min-width:100px; text-transform:capitalize;">${r.levelTarget}</span>
            <div style="flex:1;">
                <div class="assessment-score-bar-wrap">
                    <div class="assessment-score-bar-fill" style="width:${r.matchScore}%; background:${r.passed ? 'linear-gradient(90deg,#10b981,#06b6d4)' : 'linear-gradient(90deg,#f59e0b,#ef4444)'}"></div>
                </div>
            </div>
            <span style="font-size:12px; font-weight:700; color:${r.passed ? '#10b981' : '#f59e0b'}; min-width:38px; text-align:right;">${r.matchScore}%</span>
        </div>`).join('');

    document.getElementById('assessmentBody').innerHTML = `
        <div class="assessment-result-card">
            <p style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-secondary); font-weight:700; margin:0 0 4px;">Your Assessed Level</p>
            <div class="assessment-result-level" style="font-size:44px; font-weight:800; margin:12px 0 6px; color:${color};">
                ${emoji} ${label}
            </div>
            <p style="font-size:14px; color:var(--text-secondary); font-style:italic; margin-bottom:22px;">${reasoning}</p>

            <div style="background:var(--bg-light); border-radius:10px; padding:16px; margin-bottom:22px; text-align:left;">
                <p style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text-secondary); margin:0 0 8px;">Phase Scores</p>
                ${scoreBars}
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
                <button class="btn btn-primary" onclick="applyAssessedLevel('${level}')">
                    ✅ Start at ${label} Level
                </button>
                <button class="btn btn-secondary" style="font-size:13px;" onclick="closeAssessmentModal()">
                    Choose Level Manually Instead
                </button>
            </div>
        </div>`;
}

function applyAssessedLevel(level) {
    APP_STATE.selectedSkillLevel = level;
    closeAssessmentModal();

    const levels = ['beginner', 'intermediate', 'advanced'];
    document.querySelectorAll('.skill-card').forEach((card, i) => {
        card.classList.toggle('selected', levels[i] === level);
    });

    const label = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Pro' }[level];
    showNotification(`🎯 AI assessed you as ${label}! Heading to your lessons.`, 'success');
    setTimeout(() => nextStep(), 600);
}

function updateAssessmentDots(activeDot) {
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`phaseDot${i}`);
        if (!dot) continue;
        dot.classList.remove('active', 'done');
        if (i < activeDot) dot.classList.add('done');
        else if (i === activeDot) dot.classList.add('active');
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved progress
    loadProgress();

    // Set initial state
    updateProgress();
    updateBreadcrumb();

    // Add CSS animation for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const instrument = urlParams.get('instrument');
    if (instrument && (instrument === 'piano' || instrument === 'guitar')) {
        APP_STATE.selectedInstrument = instrument;
        const cards = document.querySelectorAll('.instrument-card');
        cards.forEach(card => {
            if (card.onclick && card.onclick.toString().includes(instrument)) {
                card.classList.add('selected');
            }
        });
        nextStep();
    }

    // Close settings modal on outside click
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') closeSettings();
    });

    // Close assessment modal on outside click
    document.getElementById('assessmentModal').addEventListener('click', (e) => {
        if (e.target.id === 'assessmentModal') closeAssessmentModal();
    });

    // Load ML chord classifier model (non-blocking)
    if (typeof ChordClassifier !== 'undefined') {
        ChordClassifier.load('ml/outputs/chord_classifier.json', 'ml/outputs/scaler_params.json')
            .then(() => console.log('Chord classifier ready'))
            .catch(err => console.warn('Chord classifier load failed (non-critical):', err));
    }

    showNotification('🎵 Welcome to Music Studio Pro! Select an instrument to begin.', 'success');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (APP_STATE.isRecording) {
        audioEngine.stopRecording();
    }
});
