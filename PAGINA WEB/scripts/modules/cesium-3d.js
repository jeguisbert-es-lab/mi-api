// assets/scripts/modules/cesium-3d-simple.js - VERSIÓN COMPLETA MEJORADA
class Cesium3DMap {
    constructor() {
        this.viewer = null;
        this.dataSources = new Map();
        this.capasConfig = new Map();
        this.infoPanel = null;
        this.isMobile = window.innerWidth <= 768;
        
        // ✅ URL CORREGIDA - IGUAL QUE EN MAP.JS
        this.API_BASE_URL = 'https://mi-api-6jmx.onrender.com/api';
        
        this.init();
    }

    init() {
        console.log('🚀 Iniciando Cesium 3D - Conectado a Render');
        
        if (typeof Cesium === 'undefined') {
            console.error('❌ Cesium no está cargado');
            this.showGlobalError('Cesium no se cargó correctamente. Recarga la página.');
            return;
        }
        
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlOGZhY2E5Zi1jNDAxLTQxOTAtOTg3YS1iMTM5NWMzNmYyZmYiLCJpZCI6MzU1MjUzLCJpYXQiOjE3NjE3NTQwOTR9.PQdsBEyu4XlpTMW_VaGqL-3U4DusHriIAmj9Ne5l4p8';

        try {
            this.viewer = new Cesium.Viewer('cesiumContainer', {
                terrainProvider: Cesium.createWorldTerrain(),
                animation: false,
                timeline: false,
                homeButton: false,
                sceneModePicker: !this.isMobile,
                baseLayerPicker: !this.isMobile,
                geocoder: false,
                fullscreenButton: true,
                infoBox: false
            });

            this.setupMap();
            this.createControlPanel();
            this.createInfoPanel();
            this.setupEventHandlers();
            this.loadAllLayers();

            window.addEventListener('resize', () => this.handleResize());

        } catch (error) {
            console.error('❌ Error inicializando Cesium:', error);
            this.showError('Error inicializando mapa 3D');
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            this.adjustLayoutForScreenSize();
        }
    }

    adjustLayoutForScreenSize() {
        const controlPanel = document.querySelector('.cesium-control-panel');
        const infoPanel = document.querySelector('.cesium-info-panel');
        
        if (this.isMobile) {
            if (controlPanel) {
                controlPanel.style.width = '280px';
                controlPanel.style.top = '10px';
                controlPanel.style.left = '10px';
            }
            if (infoPanel) {
                infoPanel.style.width = '300px';
                infoPanel.style.top = '10px';
                infoPanel.style.right = '10px';
            }
        } else {
            if (controlPanel) {
                controlPanel.style.width = '320px';
                controlPanel.style.top = '20px';
                controlPanel.style.left = '20px';
            }
            if (infoPanel) {
                infoPanel.style.width = '350px';
                infoPanel.style.top = '20px';
                infoPanel.style.right = '20px';
            }
        }
    }

    setupMap() {
        this.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(-69.1833, -16.0167, this.isMobile ? 3500 : 2800),
            orientation: {
                heading: 0.0,
                pitch: -0.9,
                roll: 0.0
            }
        });

        this.viewer.scene.globe.maximumScreenSpaceError = 0.5;
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        
        setTimeout(() => this.hideLoading(), 3000);
    }

    createControlPanel() {
        const container = this.viewer.container;
        const controlPanel = document.createElement('div');
        controlPanel.className = 'cesium-control-panel';
        controlPanel.innerHTML = `
            <div class="control-header">
                <h3>🎯 Control de Capas 3D</h3>
                <button class="btn-mobile-toggle" id="mobileTogglePanel">☰</button>
                <div class="control-buttons">
                    <button id="toggleAllLayers" class="btn-control">📁 Todas</button>
                    <button id="clearAllLayers" class="btn-control">🗑️ Limpiar</button>
                </div>
            </div>
            
            <div class="panel-content">
                <div class="layers-list" id="cesiumLayersList">
                    <div class="category-section">
                        <h4>🏞️ Puntos Turísticos</h4>
                        ${this.createLayerItem('puntos_turisticos', '📍', 'Puntos Turísticos', '#e53e3e')}
                        ${this.createLayerItem('miradores', '🔭', 'Miradores', '#3182ce')}
                        ${this.createLayerItem('playas', '🏖️', 'Playas', '#38b2ac')}
                    </div>

                    <div class="category-section">
                        <h4>🏘️ Servicios</h4>
                        ${this.createLayerItem('tiendas_artesania', '🎨', 'Artesanía', '#d69e2e')}
                        ${this.createLayerItem('restaurantes', '🍽️', 'Restaurantes', '#dd6b20')}
                        ${this.createLayerItem('hoteles', '🏨', 'Hoteles', '#805ad5')}
                    </div>

                    <div class="category-section">
                        <h4>🗺️ Rutas y Comunidades</h4>
                        ${this.createLayerItem('rutas', '🛣️', 'Rutas Turísticas', '#dd6b20')}
                        ${this.createLayerItem('comunidades', '🏘️', 'Comunidades', '#4a5568')}
                    </div>

                    <div class="category-section">
                        <h4>🌳 Áreas y Viviendas</h4>
                        ${this.createLayerItem('areas_verdes', '🌳', 'Áreas Verdes', '#38a169')}
                        ${this.createLayerItem('sembradios', '🌾', 'Sembradíos', '#22543d')}
                        ${this.createLayerItem('viviendas', '🏠', 'Viviendas', '#2d3748')}
                    </div>

                    <div class="category-section">
                        <h4>🗑️ Medio Ambiente</h4>
                        ${this.createLayerItem('basura', '🗑️', 'Puntos Basura', '#718096')}
                        ${this.createLayerItem('puntos_basura', '🚯', 'Zonas Basura', '#a0aec0')}
                        ${this.createLayerItem('aguas_contaminadas', '⚠️', 'Agua Contaminada', '#e53e3e')}
                    </div>
                </div>

                <div class="panel-footer">
                    <div class="system-stats">
                        <span id="totalElements">Total: 0 elementos</span>
                        <span id="activeLayers">Activas: 0 capas</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(controlPanel);
        this.adjustLayoutForScreenSize();
    }

    createLayerItem(layerName, emoji, label, color) {
        return `
            <div class="layer-item">
                <input type="checkbox" id="layer-${layerName}" checked data-layer="${layerName}">
                <label for="layer-${layerName}" class="layer-label">
                    <span class="layer-color" style="background:${color}"></span>
                    <span class="layer-emoji">${emoji}</span>
                    <span class="layer-text">${label}</span>
                    <span class="layer-count" id="count-${layerName}">0</span>
                </label>
            </div>
        `;
    }

    createInfoPanel() {
        const container = this.viewer.container;
        this.infoPanel = document.createElement('div');
        this.infoPanel.className = 'cesium-info-panel';
        this.infoPanel.innerHTML = `
            <div class="info-header">
                <h3>📊 Información Detallada</h3>
                <div class="info-header-controls">
                    <button id="mobileToggleInfo" class="btn-mobile-toggle">📱</button>
                    <button id="closeInfo" class="btn-close">×</button>
                </div>
            </div>
            <div class="info-content" id="cesiumInfoContent">
                <div class="no-selection">
                    <div class="no-selection-icon">
                        <i class="fas fa-mouse-pointer"></i>
                    </div>
                    <p>Haz clic en cualquier punto del mapa para ver información detallada</p>
                </div>
            </div>
        `;
        container.appendChild(this.infoPanel);
        this.addImprovedResponsiveStyles();
    }

    addImprovedResponsiveStyles() {
        const styles = `
            <style>
                .cesium-control-panel {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 320px;
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    padding: 0;
                    color: white;
                    border: 1px solid #4a5568;
                    backdrop-filter: blur(20px);
                    z-index: 1000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    transition: all 0.3s ease;
                    overflow: hidden;
                }

                .cesium-control-panel.mobile-collapsed {
                    height: 60px;
                    width: 60px !important;
                    overflow: hidden;
                }

                .cesium-control-panel.mobile-collapsed .panel-content {
                    display: none;
                }

                .cesium-control-panel.mobile-collapsed .control-header {
                    padding: 15px;
                    justify-content: center;
                }

                .cesium-control-panel.mobile-collapsed .control-header h3,
                .cesium-control-panel.mobile-collapsed .control-buttons {
                    display: none;
                }

                .control-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.3);
                    border-bottom: 1px solid #4a5568;
                    position: relative;
                }

                .control-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #f7fafc;
                }

                .btn-mobile-toggle {
                    display: none;
                    background: rgba(74, 85, 104, 0.5);
                    border: 1px solid #4a5568;
                    color: white;
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s ease;
                }

                .control-buttons {
                    display: flex;
                    gap: 8px;
                }

                .btn-control {
                    background: rgba(74, 85, 104, 0.5);
                    border: 1px solid #4a5568;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                }

                .btn-control:hover {
                    background: rgba(74, 85, 104, 0.8);
                    transform: translateY(-1px);
                }

                .panel-content {
                    max-height: 70vh;
                    display: flex;
                    flex-direction: column;
                }

                .layers-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 20px;
                    max-height: calc(70vh - 120px);
                }

                .layers-list::-webkit-scrollbar {
                    width: 6px;
                }

                .layers-list::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .layers-list::-webkit-scrollbar-thumb {
                    background: #4299e1;
                    border-radius: 3px;
                }

                .category-section {
                    margin-bottom: 20px;
                }

                .category-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #cbd5e0;
                    padding-left: 12px;
                    border-left: 3px solid #4299e1;
                    background: rgba(66, 153, 225, 0.1);
                    padding: 8px 12px;
                    border-radius: 0 8px 8px 0;
                }

                .layer-item {
                    margin-bottom: 8px;
                }

                .layer-item input[type="checkbox"] {
                    display: none;
                }

                .layer-label {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: rgba(74, 85, 104, 0.3);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }

                .layer-label:hover {
                    background: rgba(74, 85, 104, 0.5);
                    border-color: #4299e1;
                    transform: translateY(-1px);
                }

                input[type="checkbox"]:checked + .layer-label {
                    background: rgba(66, 153, 225, 0.2);
                    border-color: #4299e1;
                    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
                }

                .layer-color {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    margin-right: 12px;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .layer-emoji {
                    font-size: 16px;
                    margin-right: 10px;
                    width: 24px;
                    text-align: center;
                }

                .layer-text {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 500;
                    color: #f7fafc;
                }

                .layer-count {
                    background: rgba(26, 32, 44, 0.7);
                    color: #cbd5e0;
                    padding: 6px 10px;
                    border-radius: 15px;
                    font-size: 11px;
                    font-weight: bold;
                    min-width: 30px;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                input[type="checkbox"]:checked + .layer-label .layer-count {
                    background: #48bb78;
                    color: white;
                    box-shadow: 0 2px 8px rgba(72, 187, 120, 0.4);
                }

                .panel-footer {
                    border-top: 1px solid #4a5568;
                    padding: 15px 20px;
                    background: rgba(0, 0, 0, 0.2);
                }

                .system-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #cbd5e0;
                }

                .cesium-info-panel {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 350px;
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    color: white;
                    border: 1px solid #4a5568;
                    backdrop-filter: blur(20px);
                    z-index: 1000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    overflow: hidden;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                }

                .cesium-info-panel.visible {
                    transform: translateX(0);
                }

                .cesium-info-panel.mobile-fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    border-radius: 0;
                    z-index: 10000;
                }

                .info-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #4a5568;
                    background: rgba(0, 0, 0, 0.3);
                }

                .info-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #f7fafc;
                }

                .info-header-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .btn-close {
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #feb2b2;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .btn-close:hover {
                    background: rgba(239, 68, 68, 0.4);
                    color: #fed7d7;
                    transform: scale(1.1);
                }

                .info-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                }

                .no-selection {
                    text-align: center;
                    padding: 60px 20px;
                    color: #cbd5e0;
                }

                .no-selection-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                    opacity: 0.3;
                }

                .no-selection p {
                    margin: 0;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #a0aec0;
                }

                .entity-info-detailed {
                    color: #f7fafc;
                    padding: 0;
                }

                .info-header-detailed {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 0;
                    padding: 25px;
                    border-bottom: 1px solid #4a5568;
                    background: rgba(0, 0, 0, 0.2);
                }

                .info-icon {
                    font-size: 28px;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                }

                .info-header-detailed h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #f7fafc;
                    flex: 1;
                    word-wrap: break-word;
                }

                .info-details {
                    font-size: 14px;
                    padding: 25px;
                }

                .info-section {
                    margin-bottom: 25px;
                }

                .info-section h4 {
                    margin: 0 0 15px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #cbd5e0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #4a5568;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 15px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-label {
                    font-size: 12px;
                    color: #a0aec0;
                    font-weight: 600;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 14px;
                    color: #f7fafc;
                    font-weight: 500;
                    line-height: 1.4;
                    word-wrap: break-word;
                }

                .services-list, .menu-list, .rooms-list, .products-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .service-tag {
                    background: rgba(66, 153, 225, 0.2);
                    color: #90cdf4;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    border: 1px solid rgba(66, 153, 225, 0.3);
                    text-align: center;
                }

                .menu-item, .room-item, .product-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: rgba(74, 85, 104, 0.3);
                    border-radius: 8px;
                    border: 1px solid #4a5568;
                    transition: all 0.3s ease;
                }

                .menu-item:hover, .room-item:hover, .product-item:hover {
                    background: rgba(74, 85, 104, 0.5);
                    transform: translateX(4px);
                }

                .dish-name, .room-type, .product-name {
                    color: #f7fafc;
                    font-weight: 500;
                    flex: 1;
                }

                .dish-price, .room-capacity, .product-price {
                    color: #48bb78;
                    font-weight: bold;
                    font-size: 14px;
                }

                .menu-more {
                    text-align: center;
                    padding: 12px;
                    color: #a0aec0;
                    font-style: italic;
                    font-size: 12px;
                    background: rgba(74, 85, 104, 0.2);
                    border-radius: 8px;
                }

                .category-section h5 {
                    margin: 15px 0 10px 0;
                    font-size: 14px;
                    color: #e53e3e;
                    font-weight: 600;
                    padding-left: 8px;
                    border-left: 3px solid #e53e3e;
                }

                .info-note {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background: rgba(237, 137, 54, 0.1);
                    border-radius: 8px;
                    border: 1px solid rgba(237, 137, 54, 0.3);
                    color: #fbd38d;
                    font-size: 13px;
                    margin-top: 20px;
                }

                .entity-info-loading {
                    text-align: center;
                    padding: 60px 20px;
                }

                .loading-details {
                    margin-top: 30px;
                }

                .loading-spinner {
                    color: #4299e1;
                }

                .loading-spinner i {
                    font-size: 32px;
                    margin-bottom: 15px;
                }

                .loading-spinner p {
                    margin: 0;
                    font-size: 14px;
                    color: #cbd5e0;
                }

                @media (max-width: 768px) {
                    .cesium-control-panel {
                        width: 280px !important;
                        top: 10px !important;
                        left: 10px !important;
                    }

                    .cesium-info-panel {
                        width: 300px !important;
                        top: 10px !important;
                        right: 10px !important;
                        max-height: 70vh;
                    }

                    .cesium-info-panel.mobile-fullscreen {
                        width: 100% !important;
                        height: 100%;
                        top: 0;
                        right: 0;
                        border-radius: 0;
                    }

                    .btn-mobile-toggle {
                        display: block;
                    }

                    .control-header h3 {
                        font-size: 16px;
                    }

                    .info-header h3 {
                        font-size: 16px;
                    }

                    .layers-list {
                        max-height: 50vh;
                        padding: 0 15px;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }

                    .info-header-detailed {
                        padding: 20px;
                        flex-direction: column;
                        text-align: center;
                        gap: 12px;
                    }

                    .info-header-detailed h3 {
                        font-size: 18px;
                        text-align: center;
                    }

                    .info-details {
                        padding: 20px;
                    }

                    .info-section {
                        margin-bottom: 20px;
                    }
                    
                    .info-section h4 {
                        font-size: 15px;
                    }

                    .layer-label {
                        padding: 10px;
                    }

                    .layer-text {
                        font-size: 13px;
                    }

                    .layer-emoji {
                        font-size: 14px;
                        margin-right: 8px;
                    }

                    .no-selection {
                        padding: 40px 20px;
                    }

                    .no-selection-icon {
                        font-size: 48px;
                    }

                    .no-selection p {
                        font-size: 14px;
                    }
                }

                @media (max-width: 480px) {
                    .cesium-control-panel {
                        width: calc(100vw - 20px) !important;
                        left: 10px !important;
                        right: 10px !important;
                    }

                    .cesium-control-panel.mobile-collapsed {
                        width: 60px !important;
                    }

                    .cesium-info-panel {
                        width: calc(100vw - 20px) !important;
                        right: 10px !important;
                    }

                    .control-buttons {
                        flex-direction: column;
                        gap: 4px;
                    }

                    .btn-control {
                        padding: 6px 10px;
                        font-size: 11px;
                    }

                    .category-section h4 {
                        font-size: 13px;
                        padding: 6px 10px;
                    }

                    .info-header-detailed {
                        padding: 15px;
                    }

                    .info-details {
                        padding: 15px;
                    }

                    .menu-item, .room-item, .product-item {
                        padding: 10px;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }

                    .dish-price, .room-capacity, .product-price {
                        align-self: flex-end;
                    }
                }

                .info-content::-webkit-scrollbar {
                    width: 4px;
                }

                .info-content::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                }

                .info-content::-webkit-scrollbar-thumb {
                    background: #4299e1;
                    border-radius: 2px;
                }

                .cesium-control-panel,
                .cesium-info-panel {
                    animation: slideInUp 0.3s ease-out;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .layer-label,
                .btn-control,
                .btn-close,
                .menu-item,
                .room-item,
                .product-item {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .info-value {
                    line-height: 1.5;
                }

                .service-tag {
                    line-height: 1.3;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventHandlers() {
        document.querySelectorAll('input[data-layer]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const layerName = e.target.getAttribute('data-layer');
                const isVisible = e.target.checked;
                this.toggleLayer(layerName, isVisible);
                this.updateSystemStats();
            });
        });

        document.getElementById('toggleAllLayers').addEventListener('click', () => this.toggleAllLayers());
        document.getElementById('clearAllLayers').addEventListener('click', () => this.clearAllLayers());
        document.getElementById('closeInfo').addEventListener('click', () => this.hideInfoPanel());

        const mobileTogglePanel = document.getElementById('mobileTogglePanel');
        const mobileToggleInfo = document.getElementById('mobileToggleInfo');
        
        if (mobileTogglePanel) {
            mobileTogglePanel.addEventListener('click', () => this.toggleMobilePanel());
        }
        
        if (mobileToggleInfo) {
            mobileToggleInfo.addEventListener('click', () => this.toggleMobileInfoPanel());
        }

        this.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
            const pickedObject = this.viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                await this.showEntityInfo(pickedObject.id);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    toggleMobilePanel() {
        const controlPanel = document.querySelector('.cesium-control-panel');
        controlPanel.classList.toggle('mobile-collapsed');
    }

    toggleMobileInfoPanel() {
        this.infoPanel.classList.toggle('mobile-fullscreen');
    }

    async loadAllLayers() {
        console.log('🗺️ Cargando capas 3D desde Render...');
        
        const apiAvailable = await this.checkAPIStatus();
        if (!apiAvailable) {
            this.showError('No se puede conectar con el servidor API');
            this.hideLoading();
            return;
        }

        const todasLasCapas = [
            'puntos_turisticos', 'miradores', 'playas', 'tiendas_artesania',
            'restaurantes', 'hoteles', 'rutas', 'comunidades', 'viviendas',
            'areas_verdes', 'sembradios', 'basura', 'puntos_basura', 'aguas_contaminadas'
        ];

        let loadedCount = 0;
        const totalLayers = todasLasCapas.length;
        
        console.log(`🎯 Cargando ${totalLayers} capas 3D...`);

        for (const layerName of todasLasCapas) {
            try {
                await this.loadLayer(layerName);
                loadedCount++;
                console.log(`✅ ${layerName} cargado (${loadedCount}/${totalLayers})`);
            } catch (error) {
                console.error(`❌ Error cargando ${layerName}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.hideLoading();
        this.updateSystemStats();
        console.log(`🎉 Carga 3D completada: ${loadedCount}/${totalLayers} capas`);
    }

    async loadLayer(layerName) {
        try {
            console.log(`🔄 Cargando capa 3D: ${layerName}`);
            
            const response = await fetch(`${this.API_BASE_URL}/capas/${layerName}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.features || data.features.length === 0) {
                console.warn(`⚠️ ${layerName}: Sin datos disponibles`);
                this.updateLayerCount(layerName, 0);
                return;
            }

            const elementCount = data.features.length;
            console.log(`✅ ${layerName}: ${elementCount} elementos encontrados`);
            this.updateLayerCount(layerName, elementCount);

            const estilo = this.getLayerStyle(layerName);
            const dataSource = await Cesium.GeoJsonDataSource.load(data, estilo);

            this.viewer.dataSources.add(dataSource);
            this.dataSources.set(layerName, dataSource);
            this.capasConfig.set(layerName, { 
                visible: true, 
                dataSource,
                count: elementCount
            });

            this.processEntities(dataSource, layerName);
            
        } catch (error) {
            console.error(`❌ Error cargando ${layerName}:`, error);
            this.updateLayerCount(layerName, 0);
            throw error;
        }
    }

    getLayerStyle(layerName) {
        const config = this.getMarkerConfig(layerName);
        const baseColor = Cesium.Color.fromCssColorString(config.color);
        
        if (layerName === 'rutas') {
            return {
                stroke: baseColor,
                strokeWidth: 8,
                clampToGround: true,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.8,
                    color: baseColor,
                    taperPower: 0.7
                })
            };
        } 
        else if (layerName === 'comunidades' || layerName === 'areas_verdes' || 
                 layerName === 'sembradios' || layerName === 'aguas_contaminadas') {
            return {
                stroke: baseColor,
                fill: baseColor.withAlpha(0.15),
                strokeWidth: 3,
                clampToGround: true,
                material: new Cesium.ColorMaterialProperty(baseColor.withAlpha(0.15))
            };
        } else {
            return {
                pixelSize: 1,
                color: Cesium.Color.TRANSPARENT,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            };
        }
    }

    getMarkerConfig(layerName) {
        const configs = {
            'puntos_turisticos': { emoji: '📍', color: '#e53e3e' },
            'miradores': { emoji: '🔭', color: '#3182ce' },
            'playas': { emoji: '🏖️', color: '#38b2ac' },
            'tiendas_artesania': { emoji: '🎨', color: '#d69e2e' },
            'restaurantes': { emoji: '🍽️', color: '#dd6b20' },
            'hoteles': { emoji: '🏨', color: '#805ad5' },
            'rutas': { emoji: '🛣️', color: '#dd6b20' },
            'comunidades': { emoji: '🏘️', color: '#4a5568' },
            'viviendas': { emoji: '🏠', color: '#2d3748' },
            'areas_verdes': { emoji: '🌳', color: '#38a169' },
            'sembradios': { emoji: '🌾', color: '#22543d' },
            'basura': { emoji: '🗑️', color: '#718096' },
            'puntos_basura': { emoji: '🚯', color: '#a0aec0' },
            'aguas_contaminadas': { emoji: '⚠️', color: '#e53e3e' }
        };
        
        return configs[layerName] || { emoji: '📍', color: '#3498DB' };
    }

    processEntities(dataSource, layerName) {
        const config = this.getMarkerConfig(layerName);
        
        dataSource.entities.values.forEach((entity) => {
            if (entity.position && entity.properties) {
                const nombre = entity.properties.nombre?.getValue?.() || this.getDefaultName(layerName);
                const tipo = entity.properties.tipo?.getValue?.() || '';
                const idLugar = entity.properties.id_lugar?.getValue?.() || entity.properties.id?.getValue?.() || '';
                
                const idLugarFinal = this.extractIdLugar(idLugar);
                
                if (!layerName.includes('ruta') && 
                    !layerName.includes('comunidad') && 
                    !layerName.includes('area_verde') &&
                    !layerName.includes('sembrad') &&
                    !layerName.includes('agua_contaminada')) {
                    
                    entity.point = null;
                    
                    entity.billboard = new Cesium.BillboardGraphics({
                        image: this.createCustomMarkerSVG(config),
                        scale: 1.0,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        scaleByDistance: new Cesium.NearFarScalar(50, 1.2, 1000, 0.6)
                    });
                    
                    entity.label = new Cesium.LabelGraphics({
                        text: nombre,
                        font: '12px "Segoe UI", sans-serif',
                        pixelOffset: new Cesium.Cartesian2(0, -30),
                        fillColor: Cesium.Color.WHITE,
                        backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
                        backgroundPadding: new Cesium.Cartesian2(8, 4),
                        show: true
                    });
                }

                entity.layerType = layerName;
                entity.entityId = idLugarFinal;
                
                entity.basicInfo = {
                    nombre: nombre,
                    tipo: tipo,
                    comunidad: entity.properties.comunidad?.getValue?.() || '',
                    descripcion: entity.properties.descripcion?.getValue?.() || ''
                };
            }
        });
    }

    extractIdLugar(idString) {
        if (!idString) return null;
        const match = idString.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }

    createCustomMarkerSVG(config) {
        const size = 48;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.arc(24, 24, 18, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(24, 24, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.font = '20px "Segoe UI Emoji"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(config.emoji, 24, 24);
        
        return canvas.toDataURL();
    }

    async showEntityInfo(entity) {
        const infoContent = document.getElementById('cesiumInfoContent');
        
        infoContent.innerHTML = this.createLoadingInfo(entity);
        this.infoPanel.classList.add('visible');

        if (this.isMobile) {
            this.infoPanel.classList.add('mobile-fullscreen');
        }

        try {
            const detailedInfo = await this.loadDetailedInfo(entity.layerType, entity.entityId);
            
            if (detailedInfo) {
                infoContent.innerHTML = this.createDetailedInfo(entity, detailedInfo);
            } else {
                infoContent.innerHTML = this.createBasicInfo(entity);
            }
        } catch (error) {
            console.error('Error cargando información detallada:', error);
            infoContent.innerHTML = this.createBasicInfo(entity);
        }
    }

    createLoadingInfo(entity) {
        const config = this.getMarkerConfig(entity.layerType);
        return `
            <div class="entity-info-loading">
                <div class="info-header-detailed">
                    <span class="info-icon">${config.emoji}</span>
                    <h3>${entity.basicInfo.nombre}</h3>
                </div>
                <div class="loading-details">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Cargando información detallada...</p>
                    </div>
                </div>
            </div>
        `;
    }

    createBasicInfo(entity) {
        const config = this.getMarkerConfig(entity.layerType);
        
        return `
            <div class="entity-info-detailed">
                <div class="info-header-detailed">
                    <span class="info-icon">${config.emoji}</span>
                    <h3>${entity.basicInfo.nombre}</h3>
                </div>
                <div class="info-details">
                    <div class="info-section">
                        <h4>Información Básica</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Tipo</span>
                                <span class="info-value">${entity.basicInfo.tipo}</span>
                            </div>
                            ${entity.basicInfo.comunidad ? `
                            <div class="info-item">
                                <span class="info-label">Comunidad</span>
                                <span class="info-value">${entity.basicInfo.comunidad}</span>
                            </div>` : ''}
                        </div>
                        ${entity.basicInfo.descripcion ? `
                        <div class="info-item full-width">
                            <span class="info-label">Descripción</span>
                            <span class="info-value">${entity.basicInfo.descripcion}</span>
                        </div>` : ''}
                    </div>
                    <div class="info-note">
                        <i class="fas fa-info-circle"></i>
                        <span>Información básica - No hay datos detallados disponibles</span>
                    </div>
                </div>
            </div>
        `;
    }

    createDetailedInfo(entity, detailedData) {
        const config = this.getMarkerConfig(entity.layerType);
        let contenido = `
            <div class="entity-info-detailed">
                <div class="info-header-detailed">
                    <span class="info-icon">${config.emoji}</span>
                    <h3>${entity.basicInfo.nombre}</h3>
                </div>
        `;

        switch(entity.layerType) {
            case 'restaurantes':
                contenido += this.createRestaurantInfo(detailedData);
                break;
            case 'hoteles':
                contenido += this.createHotelInfo(detailedData);
                break;
            case 'tiendas_artesania':
                contenido += this.createStoreInfo(detailedData);
                break;
            case 'miradores':
                contenido += this.createMiradorInfo(detailedData);
                break;
            case 'playas':
                contenido += this.createBeachInfo(detailedData);
                break;
            case 'puntos_turisticos':
                contenido += this.createGenericInfo(detailedData);
                break;
            default:
                contenido += this.createBasicInfo(entity);
        }

        contenido += `</div>`;
        return contenido;
    }

    createRestaurantInfo(data) {
        const restaurante = data.restaurante || {};
        const servicios = data.servicios || [];
        const menu = data.menu || [];
        
        return `
            <div class="info-details">
                <div class="info-section">
                    <h4>🍽️ Información del Restaurante</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Tipo</span>
                            <span class="info-value">${restaurante.tipo_restaurante || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Capacidad</span>
                            <span class="info-value">${restaurante.capacidad || 'N/A'} personas</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Horario</span>
                            <span class="info-value">${restaurante.horario || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estilo</span>
                            <span class="info-value">${restaurante.estilo_culinario || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado</span>
                            <span class="info-value">${restaurante.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Comunidad</span>
                            <span class="info-value">${restaurante.comunidad || 'No especificada'}</span>
                        </div>
                    </div>
                </div>

                ${servicios.length > 0 ? `
                <div class="info-section">
                    <h4>⚡ Servicios</h4>
                    <div class="services-list">
                        ${servicios.map(servicio => `<span class="service-tag">${servicio.tipo}</span>`).join('')}
                    </div>
                </div>` : ''}

                ${menu.length > 0 ? `
                <div class="info-section">
                    <h4>📋 Menú (${data.total_platos || 0} platos)</h4>
                    <div class="menu-list">
                        ${menu.slice(0, 5).map(plato => `
                            <div class="menu-item">
                                <span class="dish-name">${plato.plato}</span>
                                <span class="dish-price">Bs. ${plato.precio}</span>
                            </div>
                        `).join('')}
                        ${menu.length > 5 ? `<div class="menu-more">... y ${menu.length - 5} platos más</div>` : ''}
                    </div>
                </div>` : ''}
            </div>
        `;
    }

    createHotelInfo(data) {
        const hotel = data.hotel || {};
        const servicios = data.servicios || [];
        const habitaciones = data.habitaciones || [];
        
        return `
            <div class="info-details">
                <div class="info-section">
                    <h4>🏨 Información del Hotel</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Capacidad</span>
                            <span class="info-value">${hotel.capacidad_personas || 'N/A'} personas</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Habitaciones</span>
                            <span class="info-value">${hotel.numero_habitaciones || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado</span>
                            <span class="info-value">${hotel.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tipo</span>
                            <span class="info-value">${hotel.tipo_hotel || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Comunidad</span>
                            <span class="info-value">${hotel.comunidad || 'No especificada'}</span>
                        </div>
                    </div>
                </div>

                ${servicios.length > 0 ? `
                <div class="info-section">
                    <h4>⚡ Servicios</h4>
                    <div class="services-list">
                        ${servicios.map(servicio => `<span class="service-tag">${servicio.tipo}</span>`).join('')}
                    </div>
                </div>` : ''}

                ${habitaciones.length > 0 ? `
                <div class="info-section">
                    <h4>🛏️ Tipos de Habitación</h4>
                    <div class="rooms-list">
                        ${habitaciones.map(hab => `
                            <div class="room-item">
                                <span class="room-type">${hab.tipo}</span>
                                <span class="room-capacity">Capacidad: ${hab.capacidad}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;
    }

    createStoreInfo(data) {
        const tienda = data.tienda || {};
        const productosPorCategoria = data.productos_por_categoria || {};
        
        return `
            <div class="info-details">
                <div class="info-section">
                    <h4>🎨 Tienda de Artesanía</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Estado</span>
                            <span class="info-value">${tienda.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Comunidad</span>
                            <span class="info-value">${tienda.comunidad || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Productos</span>
                            <span class="info-value">${data.total_productos || 0} disponibles</span>
                        </div>
                    </div>
                </div>

                ${Object.keys(productosPorCategoria).length > 0 ? `
                <div class="info-section">
                    <h4>🛍️ Productos por Categoría</h4>
                    ${Object.entries(productosPorCategoria).map(([categoria, productos]) => `
                        <div class="category-section">
                            <h5>${categoria}</h5>
                            <div class="products-list">
                                ${productos.map(prod => `
                                    <div class="product-item">
                                        <span class="product-name">${prod.producto}</span>
                                        <span class="product-price">Bs. ${prod.precio}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>` : ''}
            </div>
        `;
    }

    createMiradorInfo(data) {
        const mirador = data.mirador || {};
        return `
            <div class="info-details">
                <div class="info-section">
                    <h4>🔭 Información del Mirador</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Dificultad acceso</span>
                            <span class="info-value">${mirador.dificultad_acceso || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado</span>
                            <span class="info-value">${mirador.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Afluencia</span>
                            <span class="info-value">${mirador.afluencia || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Comunidad</span>
                            <span class="info-value">${mirador.comunidad || 'No especificada'}</span>
                        </div>
                        ${mirador.puntos_cercanos ? `
                        <div class="info-item full-width">
                            <span class="info-label">Puntos cercanos</span>
                            <span class="info-value">${mirador.puntos_cercanos}</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createBeachInfo(data) {
        const playa = data.playa || {};
        return `
            <div class="info-details">
                <div class="info-section">
                    <h4>🏖️ Información de la Playa</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Acceso</span>
                            <span class="info-value">${playa.acceso || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Dificultad acceso</span>
                            <span class="info-value">${playa.dificultad_acceso || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tipo playa</span>
                            <span class="info-value">${playa.tipo_playa || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado</span>
                            <span class="info-value">${playa.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Afluencia</span>
                            <span class="info-value">${playa.afluencia || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Comunidad</span>
                            <span class="info-value">${playa.comunidad || 'No especificada'}</span>
                        </div>
                        ${playa.puntos_cercanos ? `
                        <div class="info-item full-width">
                            <span class="info-label">Puntos cercanos</span>
                            <span class="info-value">${playa.puntos_cercanos}</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createGenericInfo(data) {
        const lugar = data.lugar_turistico || {};
        return `
            <div class="info-details">
                <div class="info-section">
                    <h4>📍 Información Turística</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Tipo</span>
                            <span class="info-value">${lugar.tipo || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Accesibilidad</span>
                            <span class="info-value">${lugar.accesibilidad || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Afluencia</span>
                            <span class="info-value">${lugar.afluencia || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Comunidad</span>
                            <span class="info-value">${lugar.comunidad || 'No especificada'}</span>
                        </div>
                        ${lugar.descripcion ? `
                        <div class="info-item full-width">
                            <span class="info-label">Descripción</span>
                            <span class="info-value">${lugar.descripcion}</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async loadDetailedInfo(layerType, entityId) {
        if (!entityId) return null;

        try {
            let endpoint = '';
            
            switch(layerType) {
                case 'restaurantes':
                    endpoint = `detalle/restaurante/${entityId}`;
                    break;
                case 'hoteles':
                    endpoint = `detalle/hotel/${entityId}`;
                    break;
                case 'tiendas_artesania':
                    endpoint = `detalle/tienda_artesania/${entityId}`;
                    break;
                case 'miradores':
                    endpoint = `detalle/mirador/${entityId}`;
                    break;
                case 'playas':
                    endpoint = `detalle/playa/${entityId}`;
                    break;
                case 'puntos_turisticos':
                    endpoint = `detalle/lugar_turistico/${entityId}`;
                    break;
                default:
                    return null;
            }

            const response = await fetch(`${this.API_BASE_URL}/${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error cargando detalles para ${layerType}:`, error);
            return null;
        }
    }

    toggleLayer(layerName, visible) {
        const config = this.capasConfig.get(layerName);
        if (config) {
            config.visible = visible;
            config.dataSource.show = visible;
            console.log(`🔘 ${layerName}: ${visible ? 'Activado' : 'Desactivado'}`);
        }
    }

    toggleAllLayers() {
        const checkboxes = document.querySelectorAll('input[data-layer]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
            const layerName = checkbox.getAttribute('data-layer');
            this.toggleLayer(layerName, !allChecked);
        });
        
        this.updateSystemStats();
    }

    clearAllLayers() {
        this.dataSources.forEach((dataSource, layerName) => {
            dataSource.show = false;
        });
        document.querySelectorAll('input[data-layer]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSystemStats();
        console.log('🗑️ Todas las capas limpiadas');
    }

    updateSystemStats() {
        let totalElements = 0;
        let activeLayers = 0;
        
        this.capasConfig.forEach((config, layerName) => {
            if (config.visible && config.count) {
                totalElements += config.count;
                activeLayers++;
            }
        });
        
        const totalElementsEl = document.getElementById('totalElements');
        const activeLayersEl = document.getElementById('activeLayers');
        
        if (totalElementsEl) totalElementsEl.textContent = `Total: ${totalElements} elementos`;
        if (activeLayersEl) activeLayersEl.textContent = `Activas: ${activeLayers} capas`;
    }

    updateLayerCount(layerName, count) {
        const countElement = document.getElementById(`count-${layerName}`);
        if (countElement) {
            countElement.textContent = count;
            countElement.style.color = count === 0 ? '#ef4444' : '#22c55e';
        }
    }

    hideInfoPanel() {
        this.infoPanel.classList.remove('visible');
        this.infoPanel.classList.remove('mobile-fullscreen');
    }

    hideLoading() {
        const loading = document.querySelector('.cesium-loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }

    async checkAPIStatus() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/status`);
            return response.ok;
        } catch (error) {
            console.error('❌ Error conectando con API:', error);
            return false;
        }
    }

    getDefaultName(layerType) {
        const names = {
            'puntos_turisticos': 'Punto Turístico',
            'miradores': 'Mirador',
            'playas': 'Playa',
            'tiendas_artesania': 'Tienda de Artesanía',
            'restaurantes': 'Restaurante',
            'hoteles': 'Hotel',
            'rutas': 'Ruta',
            'comunidades': 'Comunidad',
            'viviendas': 'Vivienda',
            'areas_verdes': 'Área Verde',
            'sembradios': 'Sembradío',
            'basura': 'Punto de Basura',
            'puntos_basura': 'Zona de Basura',
            'aguas_contaminadas': 'Agua Contaminada'
        };
        return names[layerType] || 'Elemento';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: absolute; top: 20px; left: 20px;
            background: rgba(239,68,68,0.95); color: white;
            padding: 15px; border-radius: 8px; z-index: 10000;
            max-width: 400px; backdrop-filter: blur(10px);
        `;
        errorDiv.innerHTML = `<strong>❌ Error:</strong> ${message}`;
        this.viewer.container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showGlobalError(message) {
        alert(`Error: ${message}\n\nRecarga la página para intentar nuevamente.`);
    }
}

function initCesium3D() {
    if (typeof Cesium === 'undefined') {
        setTimeout(initCesium3D, 500);
        return;
    }
    
    if (document.getElementById('cesiumContainer') && !window.cesium3D) {
        window.cesium3D = new Cesium3DMap();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCesium3D);
} else {
    setTimeout(initCesium3D, 1000);
}
