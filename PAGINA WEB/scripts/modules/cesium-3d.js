// assets/scripts/modules/cesium-3d-simple.js - VERSIÓN COMPLETA CORREGIDA
class Cesium3DMap {
    constructor() {
        this.viewer = null;
        this.dataSources = new Map();
        this.capasConfig = new Map();
        this.infoPanel = null;
        this.isMobile = window.innerWidth <= 768;
        
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
                        ${this.createLayerItem('puntos_turisticos', '📍', 'Puntos Turísticos', '#1fb57a')}
                        ${this.createLayerItem('miradores', '🔭', 'Miradores', '#1fb57a')}
                        ${this.createLayerItem('playas', '🏖️', 'Playas', '#1fb57a')}
                    </div>

                    <div class="category-section">
                        <h4>🏘️ Servicios</h4>
                        ${this.createLayerItem('tiendas_artesania', '🎨', 'Artesanía', '#16a34a')}
                        ${this.createLayerItem('restaurantes', '🍽️', 'Restaurantes', '#16a34a')}
                        ${this.createLayerItem('hoteles', '🏨', 'Hoteles', '#16a34a')}
                    </div>

                    <div class="category-section">
                        <h4>🗺️ Rutas y Comunidades</h4>
                        ${this.createLayerItem('rutas', '🛣️', 'Rutas Turísticas', '#16a34a')}
                        ${this.createLayerItem('comunidades', '🏘️', 'Comunidades', '#16a34a')}
                    </div>

                    <div class="category-section">
                        <h4>🌳 Áreas y Viviendas</h4>
                        ${this.createLayerItem('areas_verdes', '🌳', 'Áreas Verdes', '#10b981')}
                        ${this.createLayerItem('sembradios', '🌾', 'Sembradíos', '#10b981')}
                        ${this.createLayerItem('viviendas', '🏠', 'Viviendas', '#10b981')}
                    </div>

                    <div class="category-section">
                        <h4>🗑️ Medio Ambiente</h4>
                        ${this.createLayerItem('basura', '🗑️', 'Puntos Basura', '#94a3b8')}
                        ${this.createLayerItem('puntos_basura', '🚯', 'Zonas Basura', '#94a3b8')}
                        ${this.createLayerItem('aguas_contaminadas', '⚠️', 'Agua Contaminada', '#f43f5e')}
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
        this.addCorrectedStyles();
    }

    addCorrectedStyles() {
        const styles = `
            <style>
                /* ESTILOS PREMIUM - TEMA NEGRO Y VERDE */
                :root {
                    --bg-dark: #060606;
                    --panel-dark: rgba(8, 12, 10, 0.9);
                    --panel-soft: rgba(12, 18, 15, 0.75);
                    --emerald-500: #10b981;
                    --emerald-600: #059669;
                    --emerald-400: #34d399;
                    --muted: #9ca3af;
                    --gold: #c9a84d;
                    --glass-border: rgba(255,255,255,0.04);
                }

                .cesium-control-panel {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 320px;
                    background: linear-gradient(180deg, rgba(4,6,4,0.95) 0%, rgba(10,14,12,0.9) 100%);
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.02);
                    padding: 0;
                    color: #e6fffa;
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(8px) saturate(1.1);
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

                .control-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px;
                    background: linear-gradient(90deg, rgba(0,0,0,0.25), rgba(20, 24, 22, 0.35));
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                }

                .control-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--emerald-400);
                    text-shadow: 0 2px 12px rgba(16,185,129,0.08);
                    letter-spacing: 0.2px;
                }

                .btn-mobile-toggle {
                    display: none;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.04);
                    color: var(--muted);
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                }

                .control-buttons {
                    display: flex;
                    gap: 8px;
                }

                .btn-control {
                    background: linear-gradient(180deg, rgba(16,185,129,0.09), rgba(16,185,129,0.03));
                    border: 1px solid rgba(16,185,129,0.14);
                    color: var(--emerald-400);
                    padding: 8px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                    box-shadow: 0 6px 18px rgba(16,185,129,0.03), inset 0 -1px 0 rgba(255,255,255,0.02);
                }

                .panel-content {
                    max-height: 70vh;
                    display: flex;
                    flex-direction: column;
                }

                .layers-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 18px 18px 18px;
                    max-height: calc(70vh - 120px);
                }

                .category-section {
                    margin-bottom: 16px;
                }

                .category-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--emerald-400);
                    padding-left: 12px;
                    border-left: 3px solid rgba(16,185,129,0.12);
                    background: linear-gradient(90deg, rgba(16,185,129,0.02), transparent);
                    padding: 8px 12px;
                    border-radius: 0 8px 8px 0;
                }

                .layer-item {
                    margin-bottom: 10px;
                }

                .layer-item input[type="checkbox"] {
                    display: none;
                }

                .layer-label {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15));
                    border-radius: 12px;
                    cursor: pointer;
                    border: 1px solid rgba(255,255,255,0.02);
                    transition: transform 0.12s ease, box-shadow 0.12s ease;
                }

                .layer-label:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 30px rgba(2,6,2,0.6);
                }

                .layer-color {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    margin-right: 12px;
                    border: 2px solid rgba(0,0,0,0.5);
                    box-shadow: 0 2px 8px rgba(16,185,129,0.12);
                }

                .layer-emoji {
                    font-size: 16px;
                    margin-right: 10px;
                    width: 26px;
                    text-align: center;
                }

                .layer-text {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 600;
                    color: #e6fff5;
                }

                .layer-count {
                    background: rgba(0,0,0,0.5);
                    color: var(--emerald-400);
                    padding: 6px 10px;
                    border-radius: 14px;
                    font-size: 11px;
                    font-weight: 700;
                    min-width: 34px;
                    text-align: center;
                    border: 1px solid rgba(16,185,129,0.08);
                }

                .panel-footer {
                    border-top: 1px solid rgba(255,255,255,0.02);
                    padding: 14px 18px;
                    background: linear-gradient(180deg, rgba(0,0,0,0.14), rgba(0,0,0,0.06));
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .system-stats {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    font-size: 12px;
                    color: var(--muted);
                    width: 100%;
                }

                /* PANEL DE INFORMACIÓN PREMIUM */
                .cesium-info-panel {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 380px; /* Aumentado para más espacio */
                    background: linear-gradient(180deg, rgba(5,7,5,0.96) 0%, rgba(12,14,12,0.92) 100%);
                    border-radius: 16px;
                    box-shadow: 0 30px 90px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.02);
                    color: #e6fff5;
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(10px) saturate(1.1);
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

                .info-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                    background: linear-gradient(90deg, rgba(0,0,0,0.25), rgba(0,0,0,0.12));
                }

                .info-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--emerald-400);
                }

                .info-header-controls {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .btn-close {
                    background: linear-gradient(180deg, rgba(196,147,61,0.06), rgba(196,147,61,0.02));
                    border: 1px solid rgba(201,168,77,0.08);
                    color: var(--gold);
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: transform 0.12s ease;
                }

                .btn-close:hover { transform: scale(1.05); }

                .info-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                    background: linear-gradient(180deg, rgba(8,10,8,0.6), rgba(4,6,4,0.4));
                }

                .no-selection {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--muted);
                }

                /* CONTENIDO DE INFORMACIÓN - PREMIUM */
                .entity-info-detailed {
                    color: #e6fff5;
                    padding: 0;
                    background: transparent;
                }

                .info-header-detailed {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 0;
                    padding: 22px;
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                    background: linear-gradient(90deg, rgba(16,24,20,0.2), transparent);
                }

                .info-icon {
                    font-size: 28px;
                    width: 54px;
                    height: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(180deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06));
                    border-radius: 12px;
                    color: #e6fff5;
                    border: 1px solid rgba(16,185,129,0.06);
                }

                .info-header-detailed h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #e6fff5;
                    flex: 1;
                    word-wrap: break-word;
                    line-height: 1.25;
                }

                .info-details {
                    font-size: 14px;
                    padding: 20px;
                    background: transparent;
                }

                .info-section {
                    margin-bottom: 18px;
                    background: linear-gradient(180deg, rgba(8,10,8,0.35), rgba(12,14,12,0.25));
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid rgba(255,255,255,0.02);
                }

                .info-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--emerald-400);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed rgba(255,255,255,0.02);
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 0;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    min-width: 0; /* Permite que el texto se ajuste */
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-label {
                    font-size: 12px;
                    color: var(--muted);
                    font-weight: 700;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                }

                .info-value {
                    font-size: 14px;
                    color: #e6fff5;
                    font-weight: 600;
                    line-height: 1.4;
                    word-wrap: break-word;
                    word-break: break-word;
                    background: linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.12));
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(16,185,129,0.04);
                    min-height: 20px;
                    overflow: visible;
                    white-space: normal;
                }

                .services-list, .menu-list, .rooms-list, .products-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .service-tag {
                    background: linear-gradient(180deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02));
                    color: var(--emerald-400);
                    padding: 10px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    border: 1px solid rgba(16,185,129,0.06);
                    text-align: center;
                    font-weight: 700;
                    word-wrap: break-word;
                }

                .menu-item, .room-item, .product-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12));
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.02);
                }

                .dish-name, .room-type, .product-name {
                    color: #e6fff5;
                    font-weight: 600;
                    flex: 1;
                    word-wrap: break-word;
                }

                .dish-price, .room-capacity, .product-price {
                    color: var(--emerald-400);
                    font-weight: 800;
                    font-size: 13px;
                    background: rgba(16,185,129,0.06);
                    padding: 6px 10px;
                    border-radius: 6px;
                    white-space: nowrap;
                    margin-left: 10px;
                    border: 1px solid rgba(16,185,129,0.06);
                }

                .menu-more {
                    text-align: center;
                    padding: 12px;
                    color: var(--muted);
                    font-style: italic;
                    font-size: 12px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.08));
                    border-radius: 8px;
                }

                .info-note {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: linear-gradient(90deg, rgba(201,168,77,0.06), rgba(0,0,0,0.06));
                    border-radius: 8px;
                    border: 1px solid rgba(201,168,77,0.06);
                    color: #ffe8b3;
                    font-size: 13px;
                    margin-top: 12px;
                }

                .entity-info-loading {
                    text-align: center;
                    padding: 60px 20px;
                    background: transparent;
                }

                .loading-spinner {
                    color: var(--emerald-400);
                }

                .loading-spinner i {
                    font-size: 32px;
                    margin-bottom: 15px;
                }

                .loading-spinner p {
                    margin: 0;
                    font-size: 14px;
                    color: var(--muted);
                }

                /* ESTILOS RESPONSIVOS */
                @media (max-width: 768px) {
                    .cesium-control-panel {
                        width: 280px !important;
                        top: 10px !important;
                        left: 10px !important;
                    }

                    .cesium-info-panel {
                        width: 320px !important;
                        top: 10px !important;
                        right: 10px !important;
                        max-height: 70vh;
                    }

                    .btn-mobile-toggle {
                        display: block;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .info-header-detailed {
                        padding: 16px;
                        flex-direction: column;
                        text-align: center;
                        gap: 10px;
                    }

                    .info-header-detailed h3 {
                        font-size: 18px;
                        text-align: center;
                    }

                    .info-details {
                        padding: 16px;
                    }

                    .info-section {
                        margin-bottom: 14px;
                        padding: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .cesium-info-panel {
                        width: calc(100vw - 20px) !important;
                        right: 10px !important;
                    }

                    .info-header-detailed {
                        padding: 12px;
                    }

                    .info-details {
                        padding: 12px;
                    }

                    .info-value {
                        padding: 8px 10px;
                        font-size: 13px;
                    }
                }

                /* SCROLL */
                .info-content::-webkit-scrollbar {
                    width: 8px;
                }

                .info-content::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.18);
                    border-radius: 8px;
                }

                .info-content::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, var(--emerald-600), var(--emerald-500));
                    border-radius: 8px;
                    border: 2px solid rgba(0,0,0,0.2);
                }

                /* GARANTIZAR VISIBILIDAD */
                .info-value {
                    overflow: visible !important;
                    white-space: normal !important;
                    text-overflow: unset !important;
                    min-height: auto !important;
                    line-height: 1.4 !important;
                }

                .info-label {
                    white-space: normal !important;
                    overflow: visible !important;
                    text-overflow: unset !important;
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
            'puntos_turisticos': { emoji: '📍', color: '#1fb57a' },
            'miradores': { emoji: '🔭', color: '#1fb57a' },
            'playas': { emoji: '🏖️', color: '#1fb57a' },
            'tiendas_artesania': { emoji: '🎨', color: '#16a34a' },
            'restaurantes': { emoji: '🍽️', color: '#16a34a' },
            'hoteles': { emoji: '🏨', color: '#16a34a' },
            'rutas': { emoji: '🛣️', color: '#16a34a' },
            'comunidades': { emoji: '🏘️', color: '#16a34a' },
            'viviendas': { emoji: '🏠', color: '#10b981' },
            'areas_verdes': { emoji: '🌳', color: '#10b981' },
            'sembradios': { emoji: '🌾', color: '#10b981' },
            'basura': { emoji: '🗑️', color: '#94a3b8' },
            'puntos_basura': { emoji: '🚯', color: '#94a3b8' },
            'aguas_contaminadas': { emoji: '⚠️', color: '#f43f5e' }
        };
        
        return configs[layerName] || { emoji: '📍', color: '#10b981' };
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
        ctx.strokeStyle = '#0b0b0b';
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
                        <div class="category-products">
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
            max-width: 400px;
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

