/**
 * Enhanced Browser Compatibility Layer
 * Ensures consistent behavior across all browsers and platforms
 */

class BrowserCompatibility {
    constructor() {
        this.browser = this.detectBrowser();
        this.features = this.checkFeatures();
        this.setupCompatibility();
        this.setupPerformanceOptimizations();
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor || '';

        if (userAgent.indexOf('Chrome') > -1) return 'chrome';
        if (userAgent.indexOf('Safari') > -1) return 'safari';
        if (userAgent.indexOf('Firefox') > -1) return 'firefox';
        if (userAgent.indexOf('Edge') > -1) return 'edge';
        if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'opera';
        if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'ie';

        return 'unknown';
    }

    checkFeatures() {
        return {
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            fetch: 'fetch' in window,
            promises: 'Promise' in window,
            asyncAwait: this.testAsyncAwait(),
            webWorkers: 'Worker' in window,
            webGL: this.testWebGL(),
            touchEvents: 'ontouchstart' in window,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            indexedDB: 'indexedDB' in window,
            webRTC: this.testWebRTC(),
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            css: {
                grid: this.testCSSGrid(),
                flexbox: this.testCSSFlexbox(),
                customProperties: this.testCSSCustomProperties(),
                transforms3d: this.testCSS3DTransforms()
            }
        };
    }

    testLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    testSessionStorage() {
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    testAsyncAwait() {
        try {
            eval('(async function() {})');
            return true;
        } catch (e) {
            return false;
        }
    }

    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    testWebRTC() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                 navigator.mozGetUserMedia || navigator.msGetUserMedia ||
                 window.RTCPeerConnection || window.webkitRTCPeerConnection ||
                 window.mozRTCPeerConnection);
    }

    testCSSGrid() {
        return CSS && CSS.supports && CSS.supports('display', 'grid');
    }

    testCSSFlexbox() {
        return CSS && CSS.supports && CSS.supports('display', 'flex');
    }

    testCSSCustomProperties() {
        return CSS && CSS.supports && CSS.supports('--custom', 'property');
    }

    testCSS3DTransforms() {
        return CSS && CSS.supports && CSS.supports('transform', 'translateZ(0)');
    }

    setupCompatibility() {
        this.fixConsole();
        this.fixEventListeners();
        this.fixStorage();
        this.fixFetch();
        this.fixAsync();
        this.fixCSS();
        this.setupViewportFixes();
        this.setupTouchSupport();
    }

    fixConsole() {
        if (!window.console) {
            window.console = {
                log: function () { },
                warn: function () { },
                error: function () { },
                info: function () { },
                group: function () { },
                groupEnd: function () { }
            };
        }
    }

    fixEventListeners() {
        // Passive event listeners for better performance
        if (this.supportsPassiveEvents()) {
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function (type, listener, options) {
                const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
                if (passiveEvents.includes(type) && typeof options !== 'object') {
                    options = { passive: true };
                }
                return originalAddEventListener.call(this, type, listener, options);
            };
        }
    }

    supportsPassiveEvents() {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: function () {
                    supportsPassive = true;
                }
            });
            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
        } catch (e) { }
        return supportsPassive;
    }

    fixStorage() {
        if (!this.features.localStorage) {
            console.warn('localStorage not available, using memory storage');
            window.localStorage = this.createMemoryStorage();
        }

        if (!this.features.sessionStorage) {
            console.warn('sessionStorage not available, using memory storage');
            window.sessionStorage = this.createMemoryStorage();
        }
    }

    createMemoryStorage() {
        const storage = {};
        return {
            getItem: function (key) { return storage[key] || null; },
            setItem: function (key, value) { storage[key] = String(value); },
            removeItem: function (key) { delete storage[key]; },
            clear: function () { Object.keys(storage).forEach(key => delete storage[key]); },
            key: function (index) { return Object.keys(storage)[index] || null; },
            get length() { return Object.keys(storage).length; }
        };
    }

    fixFetch() {
        if (!this.features.fetch) {
            window.fetch = function (url, options = {}) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open(options.method || 'GET', url, true);

                    if (options.headers) {
                        Object.keys(options.headers).forEach(key => {
                            xhr.setRequestHeader(key, options.headers[key]);
                        });
                    }

                    xhr.onload = function () {
                        const response = {
                            ok: xhr.status >= 200 && xhr.status < 300,
                            status: xhr.status,
                            statusText: xhr.statusText,
                            headers: new Map(),
                            text: () => Promise.resolve(xhr.responseText),
                            json: () => Promise.resolve(JSON.parse(xhr.responseText)),
                            blob: () => Promise.resolve(new Blob([xhr.response])),
                            arrayBuffer: () => Promise.resolve(xhr.response)
                        };
                        resolve(response);
                    };

                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.ontimeout = () => reject(new Error('Request timeout'));

                    if (options.timeout) {
                        xhr.timeout = options.timeout;
                    }

                    xhr.send(options.body);
                });
            };
        }
    }

    fixAsync() {
        if (!this.features.asyncAwait) {
            console.warn('Async/await not supported, consider using transpiled code');
        }
    }

    fixCSS() {
        // Add CSS fallbacks for unsupported features
        const style = document.createElement('style');
        let css = '';

        if (!this.features.css.grid) {
            css += `
                .grid-fallback {
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -ms-flex-wrap: wrap;
                    flex-wrap: wrap;
                }
            `;
        }

        if (!this.features.css.flexbox) {
            css += `
                .flex-fallback {
                    display: block;
                    overflow: hidden;
                }
                .flex-fallback > * {
                    float: left;
                }
            `;
        }

        if (!this.features.css.customProperties) {
            css += `
                :root {
                    /* Fallback colors */
                }
            `;
        }

        if (css) {
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    setupViewportFixes() {
        // iOS viewport fix
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const viewportFix = () => {
                document.querySelector('meta[name="viewport"]')?.setAttribute(
                    'content',
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
            };
            viewportFix();
            window.addEventListener('orientationchange', viewportFix);
        }
    }

    setupTouchSupport() {
        if (this.features.touchEvents) {
            // Add touch-friendly styles
            const style = document.createElement('style');
            style.textContent = `
                * {
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none;
                }
                button, a, [role="button"] {
                    touch-action: manipulation;
                }
                input, textarea {
                    font-size: 16px; /* Prevent zoom on iOS */
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupPerformanceOptimizations() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup lazy loading
        this.setupLazyLoading();
        
        // Setup connection-aware loading
        this.setupConnectionAwareLoading();
    }

    preloadCriticalResources() {
        const criticalResources = [
            'index.css',
            'modules.css'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }

    setupLazyLoading() {
        if (this.features.intersectionObserver) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupConnectionAwareLoading() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.documentElement.classList.add('slow-connection');
                // Disable non-essential features for slow connections
                this.disableNonEssentialFeatures();
            }
        }
    }

    disableNonEssentialFeatures() {
        // Disable animations for slow connections
        const style = document.createElement('style');
        style.textContent = `
            .slow-connection * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    getBrowserInfo() {
        return {
            name: this.browser,
            version: this.getBrowserVersion(),
            platform: navigator.platform,
            mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            language: navigator.language || navigator.userLanguage || 'en',
            cookiesEnabled: navigator.cookieEnabled,
            online: navigator.onLine,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }

    getBrowserVersion() {
        const userAgent = navigator.userAgent;
        const match = userAgent.match(/(chrome|firefox|edge|opera|safari|msie)\/?\s*(\d+)/i);
        return match ? parseInt(match[2]) : 0;
    }

    showCompatibilityWarning() {
        const unsupported = [];
        const critical = [];

        if (!this.features.localStorage) unsupported.push('Local Storage');
        if (!this.features.sessionStorage) unsupported.push('Session Storage');
        if (!this.features.fetch) unsupported.push('Fetch API');
        if (!this.features.promises) critical.push('Promises');
        if (!this.features.css.flexbox) unsupported.push('CSS Flexbox');
        if (!this.features.css.grid) unsupported.push('CSS Grid');

        if (critical.length > 0 || unsupported.length > 3) {
            this.displayCompatibilityWarning(unsupported, critical);
        }
    }

    displayCompatibilityWarning(unsupported, critical) {
        const warning = document.createElement('div');
        warning.className = 'browser-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <div class="warning-header">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <h3>Browser Compatibility Notice</h3>
                    <button class="warning-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                ${critical.length > 0 ? `
                    <div class="warning-critical">
                        <strong>Critical features not supported:</strong>
                        <ul>${critical.map(f => `<li>${f}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                ${unsupported.length > 0 ? `
                    <div class="warning-features">
                        <strong>Some features may not work properly:</strong>
                        <ul>${unsupported.map(f => `<li>${f}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                <div class="warning-suggestion">
                    <p>For the best experience, please update your browser:</p>
                    <div class="browser-suggestions">
                        <a href="https://www.google.com/chrome/" target="_blank" rel="noopener">
                            <i class="fa-brands fa-chrome"></i> Chrome
                        </a>
                        <a href="https://www.mozilla.org/firefox/" target="_blank" rel="noopener">
                            <i class="fa-brands fa-firefox"></i> Firefox
                        </a>
                        <a href="https://www.microsoft.com/edge/" target="_blank" rel="noopener">
                            <i class="fa-brands fa-edge"></i> Edge
                        </a>
                    </div>
                </div>
            </div>
        `;

        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        const style = document.createElement('style');
        style.textContent = `
            .warning-content {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            .warning-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }
            .warning-header h3 {
                margin: 0;
                flex: 1;
            }
            .warning-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
            }
            .warning-critical {
                background: rgba(255,255,255,0.1);
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 12px;
            }
            .warning-features ul, .warning-critical ul {
                margin: 8px 0 0 20px;
                padding: 0;
            }
            .browser-suggestions {
                display: flex;
                gap: 12px;
                margin-top: 12px;
            }
            .browser-suggestions a {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: rgba(255,255,255,0.2);
                color: white;
                text-decoration: none;
                border-radius: 20px;
                font-size: 14px;
                transition: background 0.3s;
            }
            .browser-suggestions a:hover {
                background: rgba(255,255,255,0.3);
            }
            @media (max-width: 768px) {
                .warning-content { padding: 16px; }
                .browser-suggestions { flex-wrap: wrap; }
                .browser-suggestions a { font-size: 12px; padding: 6px 12px; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(warning);
    }

    // Public API methods
    isFeatureSupported(feature) {
        return this.features[feature] || false;
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isOnline() {
        return navigator.onLine;
    }

    getConnectionInfo() {
        return navigator.connection || null;
    }
}

// Create global instance
const browserCompatibility = new BrowserCompatibility();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.browserCompatibility = browserCompatibility;
}

// Auto-run compatibility check
document.addEventListener('DOMContentLoaded', () => {
    browserCompatibility.showCompatibilityWarning();
});
