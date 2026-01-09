/**
 * Location Picker - Interactive Map for Project Location Selection
 * StoneBeam-NH Construction Management
 */

class LocationPicker {
    constructor() {
        this.map = null;
        this.marker = null;
        this.selectedLocation = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupMap();
            this.setupEventListeners();
        });
    }
    
    setupMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;
        
        // Create a simple interactive map using HTML5 Canvas
        this.createInteractiveMap(mapContainer);
        this.isInitialized = true;
    }
    
    createInteractiveMap(container) {
        // Clear existing content
        container.innerHTML = '';
        
        // Create map canvas
        const canvas = document.createElement('canvas');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.cursor = 'crosshair';
        
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Draw initial map
        this.drawMap();
        
        // Add click event listener
        canvas.addEventListener('click', (e) => {
            this.handleMapClick(e);
        });
        
        // Add grid overlay
        this.addGridOverlay(container);
    }
    
    drawMap() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#2a2a2a';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        \n        // Draw some basic map features (roads, areas)\n        this.drawMapFeatures(ctx, canvas);\n        \n        // Draw marker if location is selected\n        if (this.selectedLocation) {\n            this.drawMarker(ctx, this.selectedLocation.x, this.selectedLocation.y);\n        }\n    }\n    \n    drawMapFeatures(ctx, canvas) {\n        // Draw some roads\n        ctx.strokeStyle = '#555';\n        ctx.lineWidth = 3;\n        \n        // Horizontal roads\n        for (let i = 1; i < 6; i++) {\n            const y = (canvas.height / 6) * i;\n            ctx.beginPath();\n            ctx.moveTo(0, y);\n            ctx.lineTo(canvas.width, y);\n            ctx.stroke();\n        }\n        \n        // Vertical roads\n        for (let i = 1; i < 8; i++) {\n            const x = (canvas.width / 8) * i;\n            ctx.beginPath();\n            ctx.moveTo(x, 0);\n            ctx.lineTo(x, canvas.height);\n            ctx.stroke();\n        }\n        \n        // Draw some areas/blocks\n        ctx.fillStyle = 'rgba(165, 105, 189, 0.1)';\n        \n        // Commercial area\n        ctx.fillRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.3, canvas.height * 0.2);\n        \n        // Residential area\n        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';\n        ctx.fillRect(canvas.width * 0.6, canvas.height * 0.3, canvas.width * 0.3, canvas.height * 0.4);\n        \n        // Industrial area\n        ctx.fillStyle = 'rgba(230, 126, 34, 0.1)';\n        ctx.fillRect(canvas.width * 0.1, canvas.height * 0.7, canvas.width * 0.4, canvas.height * 0.2);\n        \n        // Add area labels\n        ctx.fillStyle = '#ccc';\n        ctx.font = '12px Arial';\n        ctx.fillText('Commercial', canvas.width * 0.15, canvas.height * 0.18);\n        ctx.fillText('Residential', canvas.width * 0.65, canvas.height * 0.45);\n        ctx.fillText('Industrial', canvas.width * 0.15, canvas.height * 0.82);\n    }\n    \n    drawMarker(ctx, x, y) {\n        // Draw marker pin\n        ctx.fillStyle = '#e74c3c';\n        ctx.beginPath();\n        ctx.arc(x, y, 8, 0, 2 * Math.PI);\n        ctx.fill();\n        \n        // Draw marker border\n        ctx.strokeStyle = '#fff';\n        ctx.lineWidth = 2;\n        ctx.stroke();\n        \n        // Add pulsing effect\n        ctx.strokeStyle = 'rgba(231, 76, 60, 0.5)';\n        ctx.lineWidth = 1;\n        ctx.beginPath();\n        ctx.arc(x, y, 15, 0, 2 * Math.PI);\n        ctx.stroke();\n    }\n    \n    addGridOverlay(container) {\n        const gridOverlay = document.createElement('div');\n        gridOverlay.className = 'map-grid';\n        gridOverlay.style.position = 'absolute';\n        gridOverlay.style.top = '0';\n        gridOverlay.style.left = '0';\n        gridOverlay.style.width = '100%';\n        gridOverlay.style.height = '100%';\n        gridOverlay.style.pointerEvents = 'none';\n        gridOverlay.style.backgroundImage = `\n            linear-gradient(rgba(165, 105, 189, 0.1) 1px, transparent 1px),\n            linear-gradient(90deg, rgba(165, 105, 189, 0.1) 1px, transparent 1px)\n        `;\n        gridOverlay.style.backgroundSize = '20px 20px';\n        \n        container.appendChild(gridOverlay);\n    }\n    \n    handleMapClick(event) {\n        const rect = this.canvas.getBoundingClientRect();\n        const x = event.clientX - rect.left;\n        const y = event.clientY - rect.top;\n        \n        // Scale coordinates to canvas size\n        const canvasX = (x / rect.width) * this.canvas.width;\n        const canvasY = (y / rect.height) * this.canvas.height;\n        \n        // Set selected location\n        this.selectedLocation = { x: canvasX, y: canvasY };\n        \n        // Convert to approximate lat/lng (this is simplified)\n        const lat = 23.0225 + (canvasY / this.canvas.height) * 0.5; // Approximate Gujarat coordinates\n        const lng = 72.5714 + (canvasX / this.canvas.width) * 0.5;\n        \n        // Update hidden inputs\n        const latInput = document.getElementById('latitude');\n        const lngInput = document.getElementById('longitude');\n        \n        if (latInput) latInput.value = lat.toFixed(6);\n        if (lngInput) lngInput.value = lng.toFixed(6);\n        \n        // Update location info\n        this.updateLocationInfo(lat, lng);\n        \n        // Redraw map with marker\n        this.drawMap();\n    }\n    \n    updateLocationInfo(lat, lng) {\n        const locationInfo = document.getElementById('locationInfo');\n        if (!locationInfo) return;\n        \n        // Simulate reverse geocoding\n        const areas = [\n            'Ahmedabad, Gujarat',\n            'Gandhinagar, Gujarat',\n            'Vadodara, Gujarat',\n            'Surat, Gujarat',\n            'Rajkot, Gujarat'\n        ];\n        \n        const randomArea = areas[Math.floor(Math.random() * areas.length)];\n        \n        locationInfo.innerHTML = `\n            <i class=\"fa-solid fa-map-marker-alt\"></i>\n            <span>Selected: ${randomArea} (${lat.toFixed(4)}, ${lng.toFixed(4)})</span>\n        `;\n    }\n    \n    setupEventListeners() {\n        // Get current location button\n        const getCurrentLocationBtn = document.getElementById('getCurrentLocation');\n        if (getCurrentLocationBtn) {\n            getCurrentLocationBtn.addEventListener('click', () => {\n                this.getCurrentLocation();\n            });\n        }\n        \n        // Clear location button\n        const clearLocationBtn = document.getElementById('clearLocation');\n        if (clearLocationBtn) {\n            clearLocationBtn.addEventListener('click', () => {\n                this.clearLocation();\n            });\n        }\n        \n        // Handle window resize\n        window.addEventListener('resize', () => {\n            if (this.isInitialized) {\n                setTimeout(() => {\n                    this.resizeMap();\n                }, 100);\n            }\n        });\n    }\n    \n    getCurrentLocation() {\n        if (!navigator.geolocation) {\n            alert('Geolocation is not supported by this browser.');\n            return;\n        }\n        \n        const button = document.getElementById('getCurrentLocation');\n        const originalText = button.innerHTML;\n        button.innerHTML = '<i class=\"fa-solid fa-spinner fa-spin\"></i> Getting Location...';\n        button.disabled = true;\n        \n        navigator.geolocation.getCurrentPosition(\n            (position) => {\n                const lat = position.coords.latitude;\n                const lng = position.coords.longitude;\n                \n                // Update inputs\n                const latInput = document.getElementById('latitude');\n                const lngInput = document.getElementById('longitude');\n                \n                if (latInput) latInput.value = lat.toFixed(6);\n                if (lngInput) lngInput.value = lng.toFixed(6);\n                \n                // Set marker at center of map (representing current location)\n                this.selectedLocation = {\n                    x: this.canvas.width / 2,\n                    y: this.canvas.height / 2\n                };\n                \n                this.updateLocationInfo(lat, lng);\n                this.drawMap();\n                \n                button.innerHTML = originalText;\n                button.disabled = false;\n            },\n            (error) => {\n                console.error('Error getting location:', error);\n                alert('Unable to get your current location. Please select manually on the map.');\n                button.innerHTML = originalText;\n                button.disabled = false;\n            },\n            {\n                enableHighAccuracy: true,\n                timeout: 10000,\n                maximumAge: 60000\n            }\n        );\n    }\n    \n    clearLocation() {\n        this.selectedLocation = null;\n        \n        // Clear inputs\n        const latInput = document.getElementById('latitude');\n        const lngInput = document.getElementById('longitude');\n        \n        if (latInput) latInput.value = '';\n        if (lngInput) lngInput.value = '';\n        \n        // Reset location info\n        const locationInfo = document.getElementById('locationInfo');\n        if (locationInfo) {\n            locationInfo.innerHTML = `\n                <i class=\"fa-solid fa-info-circle\"></i>\n                <span>Click on the map to set project location</span>\n            `;\n        }\n        \n        // Redraw map without marker\n        this.drawMap();\n    }\n    \n    resizeMap() {\n        const mapContainer = document.getElementById('map');\n        if (!mapContainer || !this.canvas) return;\n        \n        // Update canvas size\n        this.canvas.width = mapContainer.offsetWidth;\n        this.canvas.height = mapContainer.offsetHeight;\n        \n        // Redraw map\n        this.drawMap();\n    }\n    \n    // Get selected coordinates\n    getSelectedCoordinates() {\n        const latInput = document.getElementById('latitude');\n        const lngInput = document.getElementById('longitude');\n        \n        if (latInput && lngInput && latInput.value && lngInput.value) {\n            return {\n                latitude: parseFloat(latInput.value),\n                longitude: parseFloat(lngInput.value)\n            };\n        }\n        \n        return null;\n    }\n    \n    // Set location programmatically\n    setLocation(lat, lng) {\n        const latInput = document.getElementById('latitude');\n        const lngInput = document.getElementById('longitude');\n        \n        if (latInput) latInput.value = lat.toFixed(6);\n        if (lngInput) lngInput.value = lng.toFixed(6);\n        \n        // Set marker position (simplified mapping)\n        this.selectedLocation = {\n            x: this.canvas.width * 0.5,\n            y: this.canvas.height * 0.5\n        };\n        \n        this.updateLocationInfo(lat, lng);\n        this.drawMap();\n    }\n}\n\n// Initialize location picker\nconst locationPicker = new LocationPicker();\n\n// Export for use in other modules\nif (typeof window !== 'undefined') {\n    window.locationPicker = locationPicker;\n}\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = LocationPicker;\n}