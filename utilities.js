/**
 * Music Studio Pro Utilities & Configuration Module
 * Provides system utilities, error handling, logging, and configuration
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
    APP_VERSION: '1.0.0',
    APP_NAME: 'Music Studio Pro',
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: false,
    AUDIO_CONFIG: {
        fftSize: 8192,
        smoothing: 0.85,
        minFrequency: 16,
        maxFrequency: 8000,
        minConfidence: 0.3
    },
    RECORDER_CONFIG: {
        mimeType: 'audio/webm;codecs=opus',
        maxDuration: 30000, // 30 seconds
        minDuration: 1000   // 1 second
    },
    LESSON_CONFIG: {
        enableProgressTracking: true,
        enableAchievements: true,
        enableLeaderboard: false
    }
};

// ==================== LOGGING SYSTEM ====================
class Logger {
    constructor(name) {
        this.name = name;
        this.logs = [];
        this.errors = [];
    }

    log(message, data = null) {
        const timestamp = new Date().toISOString();
        const entry = { timestamp, message, data, type: 'log' };
        this.logs.push(entry);
        
        if (CONFIG.ENABLE_LOGGING) {
            console.log(`[${this.name}] ${message}`, data || '');
        }
    }

    warn(message, data = null) {
        const timestamp = new Date().toISOString();
        const entry = { timestamp, message, data, type: 'warn' };
        this.logs.push(entry);
        
        if (CONFIG.ENABLE_LOGGING) {
            console.warn(`[${this.name}] ⚠️ ${message}`, data || '');
        }
    }

    error(message, error = null) {
        const timestamp = new Date().toISOString();
        const entry = { timestamp, message, error, type: 'error' };
        this.logs.push(entry);
        this.errors.push(entry);
        
        if (CONFIG.ENABLE_LOGGING) {
            console.error(`[${this.name}] ❌ ${message}`, error || '');
        }
    }

    getLogs() {
        return this.logs;
    }

    getErrors() {
        return this.errors;
    }

    clear() {
        this.logs = [];
        this.errors = [];
    }
}

// ==================== ERROR HANDLING ====================
class ErrorHandler {
    static async handle(error, context = 'Unknown') {
        const errorEntry = {
            message: error.message,
            context,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };

        logger.error(`Error in ${context}`, errorEntry);

        // User-friendly error messages
        const userMessage = this.getUserFriendlyMessage(error, context);
        return {
            success: false,
            error: userMessage,
            details: errorEntry
        };
    }

    static getUserFriendlyMessage(error, context) {
        if (error.name === 'NotAllowedError') {
            return 'Microphone permission denied. Please enable microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            return 'Microphone not found. Please check your device.';
        } else if (error.name === 'NotSupportedError') {
            return 'Your browser does not support audio recording. Please use Chrome, Firefox, or Safari.';
        } else if (error.message.includes('microphone')) {
            return 'Microphone access failed. Please check your permissions.';
        } else if (error.message.includes('audio')) {
            return 'Audio processing error. Please try again.';
        } else {
            return `An error occurred: ${error.message}`;
        }
    }
}

// ==================== VALIDATION ====================
class Validator {
    static isValidInstrument(instrument) {
        return ['piano', 'guitar'].includes(instrument && instrument.toLowerCase());
    }

    static isValidSkillLevel(level) {
        return ['beginner', 'intermediate', 'advanced'].includes(level && level.toLowerCase());
    }

    static isValidFrequency(frequency) {
        return typeof frequency === 'number' && 
               frequency >= CONFIG.AUDIO_CONFIG.minFrequency && 
               frequency <= CONFIG.AUDIO_CONFIG.maxFrequency;
    }

    static isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isEmpty(value) {
        return value === null || value === undefined || value === '';
    }
}

// ==================== STORAGE ====================
class Storage {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('Storage set error', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            logger.error('Storage get error', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            logger.error('Storage remove error', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            logger.error('Storage clear error', error);
            return false;
        }
    }

    static getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        return keys;
    }
}

// ==================== PERFORMANCE MONITORING ====================
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }

    start(label) {
        this.metrics[label] = {
            start: performance.now(),
            end: null,
            duration: null
        };
    }

    end(label) {
        if (this.metrics[label]) {
            this.metrics[label].end = performance.now();
            this.metrics[label].duration = this.metrics[label].end - this.metrics[label].start;
            logger.log(`Performance: ${label} took ${this.metrics[label].duration.toFixed(2)}ms`);
            return this.metrics[label].duration;
        }
        return null;
    }

    getMetric(label) {
        return this.metrics[label];
    }

    getAllMetrics() {
        return this.metrics;
    }

    clear() {
        this.metrics = {};
    }
}

// ==================== AUDIO UTILITIES ====================
class AudioUtils {
    /**
     * Convert decibels to linear
     */
    static dbToLinear(db) {
        return Math.pow(10, db / 20);
    }

    /**
     * Convert linear to decibels
     */
    static linearToDb(linear) {
        return 20 * Math.log10(linear);
    }

    /**
     * Normalize audio data
     */
    static normalizeAudio(audioData) {
        let max = 0;
        for (let i = 0; i < audioData.length; i++) {
            const abs = Math.abs(audioData[i]);
            if (abs > max) max = abs;
        }
        
        if (max === 0) return audioData;
        
        const normalized = new Float32Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
            normalized[i] = audioData[i] / max;
        }
        return normalized;
    }

    /**
     * Calculate RMS (Root Mean Square)
     */
    static calculateRMS(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length);
    }

    /**
     * Apply gain to audio
     */
    static applyGain(audioData, gainDb) {
        const gain = this.dbToLinear(gainDb);
        const result = new Float32Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
            result[i] = audioData[i] * gain;
        }
        return result;
    }

    /**
     * Detect audio silence
     */
    static isSilence(audioData, threshold = 0.01) {
        const rms = this.calculateRMS(audioData);
        return rms < threshold;
    }

    /**
     * Format frequency as readable note
     */
    static formatFrequency(frequency) {
        return frequency.toFixed(2) + ' Hz';
    }

    /**
     * Calculate musical interval
     */
    static calculateInterval(freq1, freq2) {
        return Math.abs(1200 * Math.log2(freq2 / freq1)); // in cents
    }
}

// ==================== PERMISSION CHECKER ====================
class PermissionChecker {
    static async checkMicrophonePermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            return {
                state: result.state,
                granted: result.state === 'granted',
                denied: result.state === 'denied',
                prompt: result.state === 'prompt'
            };
        } catch (error) {
            logger.warn('Permission query not supported', error);
            return { state: 'unknown', granted: false, denied: false, prompt: true };
        }
    }

    static async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            logger.error('Microphone permission denied', error);
            return false;
        }
    }

    static async checkBrowserSupport() {
        return {
            webAudioAPI: !!window.AudioContext || !!window.webkitAudioContext,
            mediaRecorder: !!window.MediaRecorder,
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            localStorage: typeof Storage !== 'undefined'
        };
    }
}

// ==================== NOTIFICATION MANAGER ====================
class NotificationManager {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${this.getBackgroundColor(type)};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.3s ease-out;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    static getBackgroundColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}

// ==================== DEVICE INFO ====================
class DeviceInfo {
    static getInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    static getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            isChrome: /Chrome/.test(ua),
            isFirefox: /Firefox/.test(ua),
            isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
            isEdge: /Edge/.test(ua),
            name: this.getBrowserName(),
            version: this.getBrowserVersion()
        };
    }

    static getBrowserName() {
        const ua = navigator.userAgent;
        if (/Chrome/.test(ua)) return 'Chrome';
        if (/Firefox/.test(ua)) return 'Firefox';
        if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
        if (/Edge/.test(ua)) return 'Edge';
        return 'Unknown';
    }

    static getBrowserVersion() {
        const ua = navigator.userAgent;
        let match = ua.match(/Chrome\/(\d+)/);
        if (match) return match[1];
        match = ua.match(/Firefox\/(\d+)/);
        if (match) return match[1];
        match = ua.match(/Safari\/(\d+)/);
        if (match) return match[1];
        return 'Unknown';
    }
}

// ==================== GLOBAL INSTANCES ====================
const logger = new Logger('Music Studio Pro');
const performanceMonitor = new PerformanceMonitor();

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    logger.log(`${CONFIG.APP_NAME} v${CONFIG.APP_VERSION} initialized`);
    
    // Check browser support
    const support = await PermissionChecker.checkBrowserSupport();
    if (!support.webAudioAPI || !support.mediaRecorder) {
        logger.error('Browser does not support required APIs', support);
        NotificationManager.error('Your browser does not support this application. Please use Chrome, Firefox, or Safari.');
    }

    // Check audio context
    if (!window.AudioContext && !window.webkitAudioContext) {
        logger.error('Web Audio API not supported');
    }

    logger.log('Browser info', DeviceInfo.getBrowserInfo());
    logger.log('Device info', DeviceInfo.getInfo());
});

// Handle online/offline
window.addEventListener('online', () => {
    logger.log('Application is online');
    NotificationManager.info('You are back online');
});

window.addEventListener('offline', () => {
    logger.warn('Application is offline');
    NotificationManager.warning('You are offline. Some features may not work.');
});

// Global error handler
window.addEventListener('error', (event) => {
    logger.error('Uncaught error', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason);
});

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        Logger,
        ErrorHandler,
        Validator,
        Storage,
        PerformanceMonitor,
        AudioUtils,
        PermissionChecker,
        NotificationManager,
        DeviceInfo,
        logger,
        performanceMonitor
    };
}
