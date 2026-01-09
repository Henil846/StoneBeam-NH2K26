/**
 * Platform Detection and Optimization
 * Detects device, OS, browser and applies platform-specific optimizations
 */

class PlatformDetector {
    constructor() {
        this.userAgent = navigator.userAgent;
        this.platform = navigator.platform;
        this.vendor = navigator.vendor || '';
        
        this.device = this.detectDevice();
        this.os = this.detectOS();
        this.browser = this.detectBrowser();
        this.features = this.detectFeatures();
        
        this.init();
    }

    detectDevice() {
        const ua = this.userAgent.toLowerCase();
        
        if (/tablet|ipad|playbook|silk/i.test(ua)) {
            return { type: 'tablet', mobile: true };
        }
        
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
            return { type: 'mobile', mobile: true };
        }
        
        return { type: 'desktop', mobile: false };
    }

    detectOS() {
        const ua = this.userAgent;
        const platform = this.platform;
        
        // Mobile OS
        if (/iPad|iPhone|iPod/.test(ua)) {
            const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
            return {
                name: 'iOS',
                version: match ? `${match[1]}.${match[2]}.${match[3] || 0}` : 'unknown',
                mobile: true
            };
        }
        
        if (/Android/.test(ua)) {
            const match = ua.match(/Android (\d+(?:\.\d+)*)/);
            return {
                name: 'Android',
                version: match ? match[1] : 'unknown',
                mobile: true
            };
        }
        
        // Desktop OS
        if (/Windows NT/.test(ua)) {
            const versionMap = {
                '10.0': '10',
                '6.3': '8.1',
                '6.2': '8',
                '6.1': '7',
                '6.0': 'Vista',
                '5.1': 'XP'
            };
            const match = ua.match(/Windows NT (\d+\.\d+)/);
            const version = match ? versionMap[match[1]] || match[1] : 'unknown';
            return {
                name: 'Windows',
                version: version,
                mobile: false
            };
        }
        
        if (/Mac OS X/.test(ua)) {
            const match = ua.match(/Mac OS X (\d+(?:[._]\d+)*)/);
            const version = match ? match[1].replace(/_/g, '.') : 'unknown';
            return {
                name: 'macOS',
                version: version,
                mobile: false
            };
        }
        
        if (/Linux/.test(ua)) {
            return {
                name: 'Linux',
                version: 'unknown',
                mobile: false
            };
        }
        
        return {
            name: 'Unknown',
            version: 'unknown',
            mobile: false
        };
    }

    detectBrowser() {
        const ua = this.userAgent;
        
        // Edge (must be before Chrome check)
        if (/Edg/.test(ua)) {
            const match = ua.match(/Edg\/(\d+(?:\.\d+)*)/);
            return {
                name: 'Edge',
                version: match ? match[1] : 'unknown',
                engine: 'Blink'
            };
        }
        
        // Chrome (must be before Safari check)
        if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
            const match = ua.match(/Chrome\/(\d+(?:\.\d+)*)/);
            return {
                name: 'Chrome',
                version: match ? match[1] : 'unknown',
                engine: 'Blink'
            };
        }
        
        // Firefox
        if (/Firefox/.test(ua)) {
            const match = ua.match(/Firefox\/(\d+(?:\.\d+)*)/);
            return {
                name: 'Firefox',
                version: match ? match[1] : 'unknown',
                engine: 'Gecko'
            };
        }
        
        // Safari
        if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
            const match = ua.match(/Version\/(\d+(?:\.\d+)*)/);
            return {
                name: 'Safari',
                version: match ? match[1] : 'unknown',
                engine: 'WebKit'
            };
        }
        
        // Internet Explorer
        if (/MSIE|Trident/.test(ua)) {
            const match = ua.match(/(?:MSIE |rv:)(\d+(?:\.\d+)*)/);
            return {
                name: 'Internet Explorer',
                version: match ? match[1] : 'unknown',
                engine: 'Trident'
            };
        }
        
        return {
            name: 'Unknown',
            version: 'unknown',
            engine: 'Unknown'
        };
    }

    detectFeatures() {
        return {
            touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            webGL: this.hasWebGL(),
            webRTC: this.hasWebRTC(),
            geolocation: 'geolocation' in navigator,
            localStorage: this.hasLocalStorage(),
            sessionStorage: this.hasSessionStorage(),
            indexedDB: 'indexedDB' in window,
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            webAssembly: 'WebAssembly' in window,
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            mutationObserver: 'MutationObserver' in window,
            fetch: 'fetch' in window,
            promises: 'Promise' in window,
            asyncAwait: this.hasAsyncAwait(),
            es6Modules: this.hasES6Modules(),
            css: {
                grid: this.hasCSSGrid(),
                flexbox: this.hasCSSFlexbox(),
                customProperties: this.hasCSSCustomProperties(),
                transforms3d: this.hasCSS3DTransforms()
            }
        };
    }

    hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    hasWebRTC() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
                 navigator.mozGetUserMedia || navigator.msGetUserMedia ||
                 window.RTCPeerConnection || window.webkitRTCPeerConnection || 
                 window.mozRTCPeerConnection);
    }

    hasLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    hasSessionStorage() {
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    hasAsyncAwait() {
        try {
            eval('(async function() {})');
            return true;
        } catch (e) {
            return false;
        }
    }

    hasES6Modules() {
        try {
            new Function('import("")');
            return true;
        } catch (e) {
            return false;
        }
    }

    hasCSSGrid() {
        return CSS.supports('display', 'grid');
    }

    hasCSSFlexbox() {
        return CSS.supports('display', 'flex');
    }

    hasCSSCustomProperties() {
        return CSS.supports('--custom', 'property');
    }

    hasCSS3DTransforms() {
        return CSS.supports('transform', 'translateZ(0)');
    }

    init() {
        this.addPlatformClasses();
        this.optimizeForPlatform();
        this.setupEventListeners();
        this.logPlatformInfo();
    }

    addPlatformClasses() {
        const classes = [];
        
        // Device type
        classes.push(`device-${this.device.type}`);
        if (this.device.mobile) classes.push('mobile-device');
        
        // OS
        classes.push(`os-${this.os.name.toLowerCase().replace(/\s+/g, '-')}`);
        
        // Browser
        classes.push(`browser-${this.browser.name.toLowerCase().replace(/\s+/g, '-')}`);
        classes.push(`engine-${this.browser.engine.toLowerCase()}`);
        
        // Features
        if (this.features.touch) classes.push('touch-enabled');
        if (!this.features.webGL) classes.push('no-webgl');
        if (!this.features.localStorage) classes.push('no-localstorage');
        if (!this.features.css.grid) classes.push('no-css-grid');
        if (!this.features.css.flexbox) classes.push('no-css-flexbox');
        
        document.documentElement.className += ' ' + classes.join(' ');
    }

    optimizeForPlatform() {
        // Mobile optimizations
        if (this.device.mobile) {
            this.optimizeForMobile();
        }
        
        // iOS specific optimizations
        if (this.os.name === 'iOS') {
            this.optimizeForIOS();
        }
        
        // Android specific optimizations
        if (this.os.name === 'Android') {
            this.optimizeForAndroid();
        }
        
        // Old browser optimizations
        if (this.browser.name === 'Internet Explorer') {
            this.optimizeForIE();
        }
    }

    optimizeForMobile() {
        // Prevent zoom on input focus
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                viewport.getAttribute('content') + ', maximum-scale=1.0, user-scalable=no');
        }
        
        // Add mobile-specific styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
            }
            .mobile-device input, .mobile-device textarea {
                font-size: 16px !important;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeForIOS() {
        // Fix iOS viewport issues
        const style = document.createElement('style');
        style.textContent = `
            .os-ios body {
                -webkit-overflow-scrolling: touch;
            }
            .os-ios .fixed-element {
                transform: translateZ(0);
            }
        `;
        document.head.appendChild(style);
    }

    optimizeForAndroid() {
        // Android-specific optimizations
        const style = document.createElement('style');
        style.textContent = `
            .os-android * {
                -webkit-font-smoothing: antialiased;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeForIE() {
        // IE-specific fixes
        document.documentElement.className += ' ie-browser';
        
        // Load IE-specific polyfills if needed
        if (parseInt(this.browser.version) < 11) {
            this.loadIEPolyfills();
        }
    }

    loadIEPolyfills() {
        // Additional polyfills for very old IE versions
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=default,es6';
        document.head.appendChild(script);
    }

    setupEventListeners() {
        // Orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Connection change handling
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
    }

    handleOrientationChange() {
        const orientation = window.orientation || 0;
        document.documentElement.className = 
            document.documentElement.className.replace(/orientation-\w+/g, '');
        
        if (Math.abs(orientation) === 90) {
            document.documentElement.className += ' orientation-landscape';
        } else {
            document.documentElement.className += ' orientation-portrait';
        }
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('platformOrientationChange', {
            detail: { orientation: orientation }
        }));
    }

    handleConnectionChange() {
        const connection = navigator.connection;
        const connectionClass = `connection-${connection.effectiveType}`;
        
        document.documentElement.className = 
            document.documentElement.className.replace(/connection-\w+/g, '');
        document.documentElement.className += ' ' + connectionClass;
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('platformConnectionChange', {
            detail: { 
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            }
        }));
    }

    logPlatformInfo() {
        console.group('Platform Detection Results');
        console.log('Device:', this.device);
        console.log('OS:', this.os);
        console.log('Browser:', this.browser);
        console.log('Features:', this.features);
        console.groupEnd();
    }

    // Public API
    getPlatformInfo() {
        return {
            device: this.device,
            os: this.os,
            browser: this.browser,
            features: this.features
        };
    }

    isMobile() {
        return this.device.mobile;
    }

    isTouch() {
        return this.features.touch;
    }

    supportsFeature(feature) {
        return this.features[feature] || false;
    }
}

// Initialize platform detector
const platformDetector = new PlatformDetector();

// Export for global use
if (typeof window !== 'undefined') {
    window.platformDetector = platformDetector;
}

// Export platform info for easy access
window.PLATFORM = platformDetector.getPlatformInfo();