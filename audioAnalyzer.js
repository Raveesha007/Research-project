/**
 * Advanced Audio Analyzer - Professional-Grade Pitch Detection
 * Implements autocorrelation-based pitch detection with comprehensive analysis
 */

// Frequency to note mapping
const FREQUENCY_TO_NOTE = {
    16.35: 'C_0', 17.32: 'Cs_0', 18.35: 'D_0', 19.45: 'Eb_0', 20.60: 'E_0', 21.83: 'F_0', 23.12: 'Fs_0', 24.50: 'G_0', 25.96: 'Gs_0', 27.50: 'A_0', 29.14: 'Bb_0', 30.87: 'B_0',
    32.70: 'C_1', 34.65: 'Cs_1', 36.71: 'D_1', 38.89: 'Eb_1', 41.20: 'E_1', 43.65: 'F_1', 46.25: 'Fs_1', 49.00: 'G_1', 51.91: 'Gs_1', 55.00: 'A_1', 58.27: 'Bb_1', 61.74: 'B_1',
    65.41: 'C_2', 69.30: 'Cs_2', 73.42: 'D_2', 77.78: 'Eb_2', 82.41: 'E_2', 87.31: 'F_2', 92.50: 'Fs_2', 98.00: 'G_2', 103.83: 'Gs_2', 110.00: 'A_2', 116.54: 'Bb_2', 123.47: 'B_2',
    130.81: 'C_3', 138.59: 'Cs_3', 146.83: 'D_3', 155.56: 'Eb_3', 164.81: 'E_3', 174.61: 'F_3', 185.00: 'Fs_3', 196.00: 'G_3', 207.65: 'Gs_3', 220.00: 'A_3', 233.08: 'Bb_3', 246.94: 'B_3',
    261.63: 'C_4', 277.18: 'Cs_4', 293.66: 'D_4', 311.13: 'Eb_4', 329.63: 'E_4', 349.23: 'F_4', 369.99: 'Fs_4', 392.00: 'G_4', 415.30: 'Gs_4', 440.00: 'A_4', 466.16: 'Bb_4', 493.88: 'B_4',
    523.25: 'C_5', 554.37: 'Cs_5', 587.33: 'D_5', 622.25: 'Eb_5', 659.25: 'E_5', 698.46: 'F_5', 739.99: 'Fs_5', 783.99: 'G_5', 830.61: 'Gs_5', 880.00: 'A_5', 932.33: 'Bb_5', 987.77: 'B_5',
    1046.50: 'C_6', 1108.73: 'Cs_6', 1174.66: 'D_6', 1244.51: 'Eb_6', 1318.51: 'E_6', 1396.91: 'F_6', 1479.98: 'Fs_6', 1567.98: 'G_6', 1661.22: 'Gs_6', 1760.00: 'A_6', 1864.66: 'Bb_6', 1975.53: 'B_6',
    2093.00: 'C_7', 2217.46: 'Cs_7', 2349.32: 'D_7', 2489.02: 'Eb_7', 2637.02: 'E_7', 2793.83: 'F_7', 2959.96: 'Fs_7', 3135.96: 'G_7', 3322.44: 'Gs_7', 3520.00: 'A_7', 3729.31: 'Bb_7', 3951.07: 'B_7',
    4186.01: 'C_8', 4434.92: 'Cs_8', 4698.63: 'D_8', 4978.03: 'Eb_8', 5274.04: 'E_8', 5587.65: 'F_8', 5919.91: 'Fs_8', 6271.93: 'G_8', 6644.88: 'Gs_8', 7040.00: 'A_8', 7458.62: 'Bb_8', 7902.13: 'B_8'
};

// Note to frequency mapping (reverse)
const NOTE_TO_FREQUENCY = {};
Object.entries(FREQUENCY_TO_NOTE).forEach(([freq, note]) => {
    NOTE_TO_FREQUENCY[note] = parseFloat(freq);
});

class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.detectedNotes = [];
        this.triadsData = {};
        this.mediaRecorder = null;
        this.recordingData = [];
        this.isRecording = false;
    }

    /**
     * Initialize audio context and microphone access
     */
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
            this.analyser.fftSize = 8192;
            this.analyser.smoothingTimeConstant = 0.85;
            source.connect(this.analyser);

            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.recordingData.push(e.data);
            };

            return true;
        } catch (error) {
            console.error('Audio initialization error:', error);
            return false;
        }
    }

    startRecording() {
        if (!this.mediaRecorder) return false;
        this.recordingData = [];
        this.mediaRecorder.start();
        this.isRecording = true;
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

    /**
     * Diagnostic mapping for the 5-song test (Easy to Hard)
     */
    getDiagnosticSample(step) {
        const samples = {
            1: { chord: 'C_maj_4_0', notes: ['C_4', 'E_4', 'G_4'], difficulty: 'Easy' },
            2: { chord: 'G_maj_4_0', notes: ['G_4', 'B_4', 'D_5'], difficulty: 'Easy' },
            3: { chord: 'A_min_4_0', notes: ['A_4', 'C_5', 'E_5'], difficulty: 'Intermediate' },
            4: { chord: 'D_min_4_0', notes: ['D_4', 'F_4', 'A_4'], difficulty: 'Intermediate' },
            5: { chord: 'B_dim_4_0', notes: ['B_4', 'D_5', 'F_5'], difficulty: 'Pro' }
        };
        return samples[step] || samples[1];
    }

    async loadTriads(csvPath = 'Piano Dataset 2/triads.csv') {
        try {
            const response = await fetch(csvPath);
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            
            lines.forEach((line, index) => {
                if (index === 0) return;
                const [chord, note1, note2, note3] = line.split(',');
                this.triadsData[chord] = {
                    chord: chord,
                    notes: [note1.trim(), note2.trim(), note3.trim()]
                };
            });
            
            console.log('Triads loaded:', Object.keys(this.triadsData).length, 'chords');
            return this.triadsData;
        } catch (error) {
            console.error('Error loading triads:', error);
            return null;
        }
    }


    /**
     * Pitch detection — delegates to the YIN algorithm
     */
    detectFrequency(audioData, sampleRate) {
        return this.yinPitchDetect(audioData, sampleRate);
    }

    /**
     * YIN pitch detection algorithm (de Cheveigné & Kawahara, 2002)
     * Avoids the octave-doubling errors common in plain autocorrelation.
     */
    yinPitchDetect(buffer, sampleRate) {
        const SIZE = buffer.length;
        const halfSize = Math.floor(SIZE / 2);
        const YIN_THRESHOLD = 0.10; // lower = stricter; 0.10–0.15 is typical

        // Noise gate — raise RMS threshold to reduce false detections in quiet rooms
        let rms = 0;
        for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.12) return null;  // absolute floor — rejects near-silent frames

        // Step 1: Difference function
        const diff = new Float32Array(halfSize);
        for (let tau = 1; tau < halfSize; tau++) {
            for (let i = 0; i < halfSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                diff[tau] += delta * delta;
            }
        }

        // Step 2: Cumulative mean normalised difference function (CMNDF)
        const cmndf = new Float32Array(halfSize);
        cmndf[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < halfSize; tau++) {
            runningSum += diff[tau];
            cmndf[tau] = runningSum > 0 ? diff[tau] * tau / runningSum : 1;
        }

        // Step 3: Absolute threshold — first dip below threshold
        let tau = 2;
        while (tau < halfSize - 1) {
            if (cmndf[tau] < YIN_THRESHOLD) {
                // Walk to the local minimum of this dip
                while (tau + 1 < halfSize && cmndf[tau + 1] < cmndf[tau]) tau++;
                break;
            }
            tau++;
        }

        // Fallback: use global minimum if no dip found
        if (tau >= halfSize - 1) {
            let minVal = Infinity;
            for (let t = 2; t < halfSize; t++) {
                if (cmndf[t] < minVal) { minVal = cmndf[t]; tau = t; }
            }
            if (minVal > 0.30) return null; // still too uncertain
        }

        // Step 4: Parabolic interpolation for sub-sample precision
        let betterTau;
        if (tau > 0 && tau < halfSize - 1) {
            const s0 = cmndf[tau - 1];
            const s1 = cmndf[tau];
            const s2 = cmndf[tau + 1];
            const denom = 2 * (2 * s1 - s2 - s0);
            betterTau = denom !== 0 ? tau + (s2 - s0) / denom : tau;
        } else {
            betterTau = tau;
        }

        if (betterTau <= 0) return null;

        const frequency = sampleRate / betterTau;
        // Sanity-check: full piano range A0 (27.5 Hz) to C8 (4186 Hz)
        if (frequency < 27 || frequency > 4200) return null;

        const confidence = Math.max(0, Math.min(100, (1 - cmndf[tau]) * 100));
        return { frequency, confidence, rms };
    }


    /**
     * Get frequency data for real-time visualization
     */
    getFrequencyData() {
        if (!this.analyser) return null;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    /**
     * Get time domain data for waveform visualization
     */
    getTimeDomainData() {
        if (!this.analyser) return null;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(dataArray);
        return dataArray;
    }

    /**
     * Cents-based frequency to note conversion.
     * Maps directly via the 12-TET formula — no linear scan, no 5% band edge cases.
     */
    frequencyToNote(frequency) {
        if (!frequency || frequency < 27) return null;

        const A4 = 440;
        const A4_MIDI = 69;
        const NOTE_NAMES = ['C', 'Cs', 'D', 'Eb', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'Bb', 'B'];

        // Nearest MIDI semitone
        const midiNote = Math.round(12 * Math.log2(frequency / A4) + A4_MIDI);
        if (midiNote < 21 || midiNote > 108) return null; // A0–C8 piano range

        // Exact frequency for that semitone
        const noteFreq = A4 * Math.pow(2, (midiNote - A4_MIDI) / 12);
        const centsOff = 1200 * Math.log2(frequency / noteFreq);

        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = NOTE_NAMES[midiNote % 12] + '_' + octave;

        return { note: noteName, centsOff, frequency };
    }

    /**
     * Analyze audio buffer with professional-grade quality metrics
     */
    async analyzeAudioBuffer(audioBuffer) {
        this.detectedNotes = [];
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);

        const windowSize = 8192; // larger window = better low-note frequency resolution
        const hopSize = 4096;
        const analysisResults = [];

        // --- Noise gate: peak-relative threshold ---
        // Find the loudest frame in the entire recording, then only process frames
        // that are at least 40% as loud as that peak. This filters out all the
        // quiet background periods before/after/between actual notes.
        const PEAK_RATIO = 0.60; // keep frames within 40% of the recording's loudest moment
        const ABSOLUTE_FLOOR = 0.12; // also enforce a hard minimum regardless
        const frameRmsList = [];
        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            let s = 0;
            for (let j = 0; j < windowSize; j++) s += channelData[i + j] * channelData[i + j];
            frameRmsList.push(Math.sqrt(s / windowSize));
        }
        const peakRms = Math.max(...frameRmsList);
        const dynamicThreshold = Math.max(ABSOLUTE_FLOOR, peakRms * PEAK_RATIO);

        // Sliding window analysis
        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            const frameIndex = Math.floor(i / hopSize);
            const frameRms = frameRmsList[frameIndex] || 0;

            // Skip frames that are not close to the recording's peak loudness
            if (frameRms < dynamicThreshold) continue;

            const window = this.hannWindow(windowSize);
            const frameData = new Float32Array(windowSize);

            // Apply Hann window
            for (let j = 0; j < windowSize; j++) {
                frameData[j] = channelData[i + j] * window[j];
            }

            // Detect frequency
            const result = this.detectFrequency(frameData, sampleRate);
            if (result && result.confidence > 75) { // confidence is 0–100; require strong pitch
                const noteInfo = this.frequencyToNote(result.frequency);
                if (noteInfo) {
                    analysisResults.push({
                        note: noteInfo.note,
                        frequency: result.frequency,
                        confidence: result.confidence,
                        centsOff: noteInfo.centsOff,
                        timestamp: i / sampleRate
                    });
                }
            }
        }

        // Remove duplicates and consolidate
        this.detectedNotes = this.consolidateDetections(analysisResults);
        return this.detectedNotes;
    }

    /**
     * Consolidate detections using median-frequency voting.
     * Collects all frames in a same-note run, picks the median frequency reading,
     * then re-maps to a note — more robust against transient spikes than "first wins".
     */
    consolidateDetections(detections) {
        if (!detections.length) return [];

        const consolidated = [];
        let runStart = 0;

        for (let i = 1; i <= detections.length; i++) {
            const endOfRun = i === detections.length ||
                             detections[i].note !== detections[runStart].note;
            if (endOfRun) {
                const run = detections.slice(runStart, i);
                // Require at least 5 consecutive frames to count as a real note
                if (run.length >= 12) {
                    // Median frequency vote
                    const sorted = run.slice().sort((a, b) => a.frequency - b.frequency);
                    const median = sorted[Math.floor(sorted.length / 2)];
                    consolidated.push(median);
                }
                runStart = i;
            }
        }

        return consolidated;
    }

    /**
     * Create Hann window for analysis
     */
    hannWindow(length) {
        const window = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)));
        }
        return window;
    }

    /**
     * Compare detected notes with expected notes
     */
    compareWithTriad(expectedTriadNotes, tolerance = 0.5) {
        if (!this.detectedNotes || this.detectedNotes.length === 0) {
            return { correct: [], wrong: [], missing: expectedTriadNotes };
        }

        const result = {
            correct: [],
            wrong: [],
            missing: [],
            extra: []
        };

        const detectedNotesSet = new Set(this.detectedNotes.map(n => n.note));

        expectedTriadNotes.forEach(expectedNote => {
            if (detectedNotesSet.has(expectedNote)) {
                result.correct.push(expectedNote);
            } else {
                result.missing.push(expectedNote);
            }
        });

        detectedNotesSet.forEach(detectedNote => {
            if (!expectedTriadNotes.includes(detectedNote)) {
                result.extra.push(detectedNote);
            }
        });

        return result;
    }

    /**
     * Get summary of detected notes
     */
    getDetectionSummary() {
        if (!this.detectedNotes.length) {
            return {
                totalNotes: 0,
                uniqueNotes: 0,
                averageConfidence: 0,
                stabilityScore: 0,
                feedback: []
            };
        }

        const unique = new Map();
        const confidences = [];

        this.detectedNotes.forEach(item => {
            confidences.push(item.confidence);
            if (!unique.has(item.note) || item.confidence > unique.get(item.note).confidence) {
                unique.set(item.note, item);
            }
        });

        const avgConfidence = confidences.reduce((a, b) => a + b) / confidences.length;
        const stabilityScore = 100 - Math.min(100, Math.sqrt(
            confidences.reduce((a, b) => a + Math.pow(b - avgConfidence, 2), 0) / confidences.length
        ));

        const feedback = this.generateDetailedFeedback(avgConfidence, stabilityScore);

        return {
            totalNotes: this.detectedNotes.length,
            uniqueNotes: unique.size,
            averageConfidence: Math.round(avgConfidence),
            stabilityScore: Math.round(stabilityScore),
            feedback,
            detectedNotes: Array.from(unique.values())
        };
    }

    /**
     * Generate detailed performance feedback
     */
    generateDetailedFeedback(confidence, stability) {
        const feedback = [];

        if (confidence < 60) {
            feedback.push('🔊 Play louder and clearer - the audio was too soft');
        } else if (confidence < 80) {
            feedback.push('📻 Good clarity, but try to make notes even clearer');
        } else {
            feedback.push('✨ Excellent clarity and precision!');
        }

        if (stability < 60) {
            feedback.push('🎯 Work on pitch stability - maintain steady notes');
        } else if (stability < 80) {
            feedback.push('💪 Good control, aim for even more consistency');
        } else {
            feedback.push('🌟 Outstanding pitch control!');
        }

        feedback.push('🎵 Keep practicing to refine your technique!');

        return feedback;
    }

    /**
     * Clear detected notes
     */
    clearDetectedNotes() {
        this.detectedNotes = [];
    }

    /**
     * Send audio blob to the Python pyin backend for analysis.
     * Falls back to JS-based analyzeAudioBuffer() if the server is unavailable.
     */
    async analyzeWithBackend(audioBlob) {
        // MediaRecorder records WebM/Opus internally; decode with AudioContext then write real WAV
        let wavBlob = audioBlob;
        let decoded = null;
        try {
            const arrayBuf = await audioBlob.arrayBuffer();
            const tmpCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            decoded = await tmpCtx.decodeAudioData(arrayBuf);
            tmpCtx.close();
            wavBlob = this._encodeWAV(decoded.getChannelData(0), decoded.sampleRate);
        } catch (decErr) {
            console.warn('WAV re-encode failed, sending raw blob:', decErr.message);
        }

        try {
            const formData = new FormData();
            formData.append('audio', wavBlob, 'recording.wav');
            const res = await fetch('http://localhost:5001/analyze', {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(15000)
            });
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            if (data.notes && data.notes.length > 0) {
                this.detectedNotes = data.notes;
                return this.detectedNotes;
            }
        } catch (e) {
            console.warn('Backend unavailable, falling back to JS detection:', e.message);
        }
        // Fallback: use already-decoded buffer if available, otherwise re-decode
        try {
            if (!decoded) {
                const arrayBuf2 = await audioBlob.arrayBuffer();
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                decoded = await audioCtx.decodeAudioData(arrayBuf2);
            }
            return this.analyzeAudioBuffer(decoded);
        } catch (e) {
            console.warn('JS fallback also failed:', e.message);
            return [];
        }
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

    /**
     * Return the unique detected notes (highest-confidence occurrence per note name).
     * Confidence is already on the 0–100 scale.
     */
    getDetectedNotesList() {
        const map = new Map();
        for (const item of this.detectedNotes) {
            const existing = map.get(item.note);
            if (!existing || item.confidence > existing.confidence) {
                map.set(item.note, item);
            }
        }
        // Keep only notes with meaningful confidence, sorted best-first, capped at 3
        return Array.from(map.values())
            .filter(item => item.confidence >= 60)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);
    }
}

// Global analyzer instance
const audioAnalyzer = new AudioAnalyzer();