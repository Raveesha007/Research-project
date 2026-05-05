/**
 * Chord Classifier Inference — Pure JavaScript
 * Loads a Random Forest model exported from Python and runs predictions in-browser.
 *
 * Usage:
 *   await ChordClassifier.load('outputs/chord_classifier.json', 'outputs/scaler_params.json');
 *   const result = ChordClassifier.predictChord(features); // Float32Array(36)
 *   // result = { chord: "C Major", confidence: 0.87 }
 */

const ChordClassifier = (() => {
    let modelData = null;
    let scalerData = null;
    let isLoaded = false;

    /**
     * Load the model and scaler JSON files.
     * @param {string} modelUrl - Path to chord_classifier.json
     * @param {string} scalerUrl - Path to scaler_params.json
     */
    async function load(modelUrl, scalerUrl) {
        try {
            const [modelResp, scalerResp] = await Promise.all([
                fetch(modelUrl),
                fetch(scalerUrl)
            ]);

            if (!modelResp.ok || !scalerResp.ok) {
                throw new Error('Failed to fetch model files');
            }

            modelData = await modelResp.json();
            scalerData = await scalerResp.json();
            isLoaded = true;

            console.log(`Chord classifier loaded: ${modelData.n_estimators} trees, ${modelData.n_classes} classes`);
        } catch (e) {
            console.error('Failed to load chord classifier:', e);
            isLoaded = false;
        }
    }

    /**
     * Normalize features using the saved StandardScaler parameters.
     * @param {Float32Array|number[]} features - 36 raw features
     * @returns {number[]} Scaled features
     */
    function scaleFeatures(features) {
        const mean = scalerData.mean;
        const scale = scalerData.scale;
        return features.map((val, i) => (val - mean[i]) / scale[i]);
    }

    /**
     * Traverse a single decision tree using compact array format.
     * @param {object} tree - Tree with arrays: f (feature), t (threshold), l (left), r (right), c (class)
     * @param {number[]} features - Scaled features
     * @returns {number} Predicted class index
     */
    function traverseTree(tree, features) {
        let node = 0;
        while (tree.f[node] >= 0) {
            if (features[tree.f[node]] <= tree.t[node]) {
                node = tree.l[node];
            } else {
                node = tree.r[node];
            }
        }
        return tree.c[node];
    }

    /**
     * Run Random Forest inference: majority voting across all trees.
     * @param {Float32Array|number[]} rawFeatures - 36 raw chroma features
     * @returns {{ chord: string, confidence: number }} Predicted chord and confidence
     */
    function predictChord(rawFeatures) {
        if (!isLoaded) {
            return { chord: 'Unknown', confidence: 0 };
        }

        const scaled = scaleFeatures(rawFeatures);
        const nClasses = modelData.n_classes;
        const votes = new Array(nClasses).fill(0);

        for (const tree of modelData.trees) {
            const classIdx = traverseTree(tree, scaled);
            votes[classIdx]++;
        }

        const totalVotes = votes.reduce((a, b) => a + b, 0);
        let bestIdx = 0;
        for (let i = 1; i < votes.length; i++) {
            if (votes[i] > votes[bestIdx]) bestIdx = i;
        }

        const confidence = totalVotes > 0 ? votes[bestIdx] / totalVotes : 0;

        return {
            chord: modelData.classes[bestIdx],
            confidence: Math.round(confidence * 100) / 100
        };
    }

    /**
     * In-place Cooley-Tukey radix-2 FFT (O(N log N)).
     * @param {Float64Array} re - Real part (modified in place)
     * @param {Float64Array} im - Imaginary part (modified in place)
     */
    function fftInPlace(re, im) {
        const N = re.length;
        // Bit-reversal permutation
        let j = 0;
        for (let i = 1; i < N; i++) {
            let bit = N >> 1;
            for (; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) {
                let tmp = re[i]; re[i] = re[j]; re[j] = tmp;
                tmp = im[i]; im[i] = im[j]; im[j] = tmp;
            }
        }
        // Butterfly passes
        for (let len = 2; len <= N; len <<= 1) {
            const halfLen = len >> 1;
            const ang = -2 * Math.PI / len;
            const wBaseRe = Math.cos(ang);
            const wBaseIm = Math.sin(ang);
            for (let i = 0; i < N; i += len) {
                let wRe = 1, wIm = 0;
                for (let k = 0; k < halfLen; k++) {
                    const uRe = re[i + k];
                    const uIm = im[i + k];
                    const vRe = re[i + k + halfLen] * wRe - im[i + k + halfLen] * wIm;
                    const vIm = re[i + k + halfLen] * wIm + im[i + k + halfLen] * wRe;
                    re[i + k]          = uRe + vRe;
                    im[i + k]          = uIm + vIm;
                    re[i + k + halfLen] = uRe - vRe;
                    im[i + k + halfLen] = uIm - vIm;
                    const newWRe = wRe * wBaseRe - wIm * wBaseIm;
                    wIm = wRe * wBaseIm + wIm * wBaseRe;
                    wRe = newWRe;
                }
            }
        }
    }

    /**
     * Build a lookup table mapping each FFT bin → chroma bin index.
     * Pre-computed once per (fftSize, sampleRate) pair to avoid per-frame log2 calls.
     */
    function buildChromaMap(fftSize, sampleRate) {
        const numBins = fftSize / 2 + 1;
        const map = new Int8Array(numBins).fill(-1);
        for (let k = 1; k < numBins; k++) {
            const freq = k * sampleRate / fftSize;
            if (freq >= 27.5) { // below A0 gives meaningless chroma
                const pitch = Math.round(12 * Math.log2(freq / 440) + 69);
                map[k] = ((pitch % 12) + 12) % 12;
            }
        }
        return map;
    }

    /**
     * Extract 36 chroma features from a Web Audio API AudioBuffer.
     * Matches Python feature extraction: chroma_stft mean (12) + std (12) + max (12).
     * Uses a proper O(N log N) FFT — safe for real-time browser use.
     *
     * @param {AudioBuffer} audioBuffer - Web Audio API buffer
     * @returns {Float32Array} 36 features in the same order as training
     */
    function extractFeaturesFromBuffer(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const N = channelData.length;

        const fftSize = 2048;  // must be power of 2
        const hopSize = 512;
        const numFrames = Math.floor((N - fftSize) / hopSize) + 1;
        const nChroma = 12;
        const nFeatures = 36;

        if (numFrames <= 0) {
            return new Float32Array(nFeatures);
        }

        // Pre-compute Hann window
        const win = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
            win[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
        }

        // Pre-compute chroma bin map (avoids log2 inside the hot loop)
        const chromaMap = buildChromaMap(fftSize, sampleRate);
        const numBins = fftSize / 2 + 1;

        // Reusable FFT buffers
        const re = new Float64Array(fftSize);
        const im = new Float64Array(fftSize);

        // Compute chroma per frame using O(N log N) FFT
        const chromaFrames = [];
        for (let frame = 0; frame < numFrames; frame++) {
            const offset = frame * hopSize;

            // Fill FFT input with windowed samples
            for (let n = 0; n < fftSize; n++) {
                re[n] = (offset + n < N) ? channelData[offset + n] * win[n] : 0;
                im[n] = 0;
            }

            fftInPlace(re, im);

            // Map power spectrum to 12 chroma bins
            const chroma = new Float32Array(nChroma);
            for (let k = 1; k < numBins; k++) {
                const bin = chromaMap[k];
                if (bin >= 0) {
                    chroma[bin] += re[k] * re[k] + im[k] * im[k];
                }
            }

            // Normalize chroma frame
            let maxVal = 1e-10;
            for (let i = 0; i < nChroma; i++) { if (chroma[i] > maxVal) maxVal = chroma[i]; }
            for (let i = 0; i < nChroma; i++) chroma[i] /= maxVal;
            chromaFrames.push(chroma);
        }

        // Compute statistics across frames: mean, std, max
        const chromaMean = new Float32Array(nChroma);
        const chromaMax = new Float32Array(nChroma);
        for (let i = 0; i < nChroma; i++) chromaMax[i] = -Infinity;

        for (const frame of chromaFrames) {
            for (let i = 0; i < nChroma; i++) {
                chromaMean[i] += frame[i];
                if (frame[i] > chromaMax[i]) chromaMax[i] = frame[i];
            }
        }
        for (let i = 0; i < nChroma; i++) chromaMean[i] /= chromaFrames.length;

        const chromaStd = new Float32Array(nChroma);
        for (const frame of chromaFrames) {
            for (let i = 0; i < nChroma; i++) {
                const diff = frame[i] - chromaMean[i];
                chromaStd[i] += diff * diff;
            }
        }
        for (let i = 0; i < nChroma; i++) {
            chromaStd[i] = Math.sqrt(chromaStd[i] / chromaFrames.length);
        }

        // Combine: 12 mean + 12 std + 12 max = 36 features
        const features = new Float32Array(nFeatures);
        for (let i = 0; i < nChroma; i++) {
            features[i] = chromaMean[i];
            features[nChroma + i] = chromaStd[i];
            features[2 * nChroma + i] = chromaMax[i];
        }

        return features;
    }

    /**
     * Score the quality of a played note/chord against the expected notes.
     * Uses the same 36 chroma features as the dataset.
     *
     * @param {Float32Array|number[]|AudioBuffer} input - Pre-computed features (36 values) OR an AudioBuffer
     * @param {string[]} expectedNotes - Array of note strings like ['C4', 'E4', 'G4']
     * @returns {number} Quality score 0–1 (multiply by 100 for %). Score >= 0.80 = correct.
     */
    function scoreNoteQuality(input, expectedNotes) {
        if (!input || !expectedNotes || expectedNotes.length === 0) return 0;

        // Accept either pre-computed features array or a raw AudioBuffer
        let chromaMean;
        if (input instanceof AudioBuffer) {
            const features = extractFeaturesFromBuffer(input);
            chromaMean = Array.from(features.slice(0, 12));
        } else {
            chromaMean = Array.from(input).slice(0, 12);
        }

        // Note name → chroma bin index (C=0 … B=11)
        const NOTE_TO_BIN = {
            C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4,
            F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11
        };

        // Build the ideal chroma profile from expected notes
        const idealChroma = new Array(12).fill(0);
        let validNotes = 0;
        for (const noteStr of expectedNotes) {
            const m = noteStr.match(/^([A-G]#?)(\d+)?$/);
            if (m) {
                const bin = NOTE_TO_BIN[m[1]];
                if (bin !== undefined) {
                    idealChroma[bin] = 1.0;
                    validNotes++;
                }
            }
        }
        if (validNotes === 0) return 0;

        // Cosine similarity between played chroma mean and ideal chroma
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < 12; i++) {
            dot   += chromaMean[i] * idealChroma[i];
            normA += chromaMean[i] * chromaMean[i];
            normB += idealChroma[i] * idealChroma[i];
        }
        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);
        if (normA < 1e-10 || normB < 1e-10) return 0;

        return Math.max(0, Math.min(1, dot / (normA * normB)));
    }

    return {
        load,
        predictChord,
        extractFeaturesFromBuffer,
        scoreNoteQuality,
        get isReady() { return isLoaded; }
    };
})();

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChordClassifier;
}
