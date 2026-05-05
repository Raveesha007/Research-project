/**
 * darkmode.js — Shared dark mode controller for all pages.
 *
 * Supports two CSS mechanisms used across this project:
 *   1. body.dark-mode  class      → index.html, app.html
 *   2. [data-theme="dark"]  attr  → Instrument.html, analyze.html (style.css)
 *
 * Both mechanisms are applied simultaneously so every page responds.
 * Preference is stored under two localStorage keys for full compatibility:
 *   musicStudioTheme  (used by index.html / app.html)
 *   theme             (used by Instrument.html / script.js)
 */
(function () {
    var DARK_KEY   = 'musicStudioTheme';
    var LEGACY_KEY = 'theme';

    function getPref() {
        return localStorage.getItem(DARK_KEY) || localStorage.getItem(LEGACY_KEY) || 'light';
    }

    function applyTheme(mode) {
        var dark = (mode === 'dark');
        // Mechanism 1 – body class (index.html, app.html)
        if (dark) document.body.classList.add('dark-mode');
        else       document.body.classList.remove('dark-mode');
        // Mechanism 2 – data-theme attribute (Instrument.html, analyze.html)
        if (dark) document.documentElement.setAttribute('data-theme', 'dark');
        else       document.documentElement.removeAttribute('data-theme');
    }

    function savePref(mode) {
        localStorage.setItem(DARK_KEY,   mode);
        localStorage.setItem(LEGACY_KEY, mode);
    }

    function syncUI() {
        var dark = document.body.classList.contains('dark-mode');

        // index.html & app.html — pill button label
        var label = document.getElementById('themeLabel');
        if (label) label.textContent = dark ? 'Night Mode' : 'Day Mode';

        // index.html & app.html — sun/moon sky animation
        // The CSS transition handles the animation; no JS needed beyond adding the class.

        // Instrument.html — moon/sun icon button
        var icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = dark ? '☀️' : '🌙';
    }

    // ── Pre-paint: apply data-theme ASAP to avoid flash on style.css pages ──
    if (getPref() === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // ── Full apply once body exists ──
    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(getPref());
        syncUI();
    });

    // ── Public API ──

    /** Toggle between day and night mode. Called by all toggle buttons. */
    window.toggleTheme = function () {
        var newMode = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newMode);
        savePref(newMode);
        syncUI();
    };

    /**
     * Alias used by Instrument.html's existing button (onclick="toggleDarkMode(event)").
     * Also calls updateUI() when script.js has loaded it.
     */
    window.toggleDarkMode = function () {
        window.toggleTheme();
        if (typeof updateUI === 'function') updateUI();
    };
}());
