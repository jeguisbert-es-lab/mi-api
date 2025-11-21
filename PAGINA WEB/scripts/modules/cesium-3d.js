// assets/scripts/modules/cesium-3d-simple.js - VERSIÓN PREMIUM NEGRO Y VERDE DORADO
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
        console.log('🚀 Iniciando Cesium 3D Premium - Conectado a Render');
        
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
                <div class="header-content">
                    <div class="header-icon">🌍</div>
                    <div class="header-text">
                        <h3>Control de Capas</h3>
                        <span class="header-subtitle">Sistema Turístico Premium</span>
                    </div>
                </div>
                <button class="btn-mobile-toggle" id="mobileTogglePanel">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            
            <div class="panel-content">
                <div class="control-actions">
                    <button id="toggleAllLayers" class="btn-action btn-action-primary">
                        <i class="fas fa-layer-group"></i>
                        <span>Todas</span>
                    </button>
                    <button id="clearAllLayers" class="btn-action btn-action-secondary">
                        <i class="fas fa-broom"></i>
                        <span>Limpiar</span>
                    </button>
                </div>

                <div class="layers-list" id="cesiumLayersList">
                    <div class="category-section">
                        <div class="category-header">
                            <i class="fas fa-mountain"></i>
                            <h4>PUNTOS TURÍSTICOS</h4>
                        </div>
                        ${this.createLayerItem('puntos_turisticos', '📍', 'Puntos Turísticos', '#10b981')}
                        ${this.createLayerItem('miradores', '🔭', 'Miradores', '#10b981')}
                        ${this.createLayerItem('playas', '🏖️', 'Playas', '#10b981')}
                    </div>

                    <div class="category-section">
                        <div class="category-header">
                            <i class="fas fa-concierge-bell"></i>
                            <h4>SERVICIOS</h4>
                        </div>
                        ${this.createLayerItem('tiendas_artesania', '🎨', 'Artesanía', '#d4af37')}
                        ${this.createLayerItem('restaurantes', '🍽️', 'Restaurantes', '#d4af37')}
                        ${this.createLayerItem('hoteles', '🏨', 'Hoteles', '#d4af37')}
                    </div>

                    <div class="category-section">
                        <div class="category-header">
                            <i class="fas fa-route"></i>
                            <h4>RUTAS Y COMUNIDADES</h4>
                        </div>
                        ${this.createLayerItem('rutas', '🛣️', 'Rutas Turísticas', '#34d399')}
                        ${this.createLayerItem('comunidades', '🏘️', 'Comunidades', '#34d399')}
                    </div>

                    <div class="category-section">
                        <div class="category-header">
                            <i class="fas fa-tree"></i>
                            <h4>ÁREAS Y VIVIENDAS</h4>
                        </div>
                        ${this.createLayerItem('areas_verdes', '🌳', 'Áreas Verdes', '#059669')}
                        ${this.createLayerItem('sembradios', '🌾', 'Sembradíos', '#059669')}
                        ${this.createLayerItem('viviendas', '🏠', 'Viviendas', '#059669')}
                    </div>

                    <div class="category-section">
                        <div class="category-header">
                            <i class="fas fa-recycle"></i>
                            <h4>MEDIO AMBIENTE</h4>
                        </div>
                        ${this.createLayerItem('basura', '🗑️', 'Puntos Basura', '#94a3b8')}
                        ${this.createLayerItem('puntos_basura', '🚯', 'Zonas Basura', '#94a3b8')}
                        ${this.createLayerItem('aguas_contaminadas', '⚠️', 'Agua Contaminada', '#ef4444')}
                    </div>
                </div>

                <div class="panel-footer">
                    <div class="system-stats">
                        <div class="stat-item">
                            <i class="fas fa-cube"></i>
                            <span id="totalElements">0 elementos</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-layer-group"></i>
                            <span id="activeLayers">0 capas</span>
                        </div>
                    </div>
                    <div class="system-status">
                        <div class="status-indicator active"></div>
                        <span>Sistema Online</span>
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
                    <div class="layer-indicator">
                        <div class="layer-checkbox">
                            <div class="checkbox-inner"></div>
                        </div>
                        <span class="layer-emoji">${emoji}</span>
                        <span class="layer-text">${label}</span>
                    </div>
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
                <div class="info-header-content">
                    <i class="fas fa-info-circle"></i>
                    <h3>Información Detallada</h3>
                </div>
                <div class="info-header-controls">
                    <button id="mobileToggleInfo" class="btn-mobile-toggle">
                        <i class="fas fa-mobile-alt"></i>
                    </button>
                    <button id="closeInfo" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="info-content" id="cesiumInfoContent">
                <div class="no-selection">
                    <div class="no-selection-icon">
                        <i class="fas fa-mouse-pointer"></i>
                    </div>
                    <h4>Explora el Mapa</h4>
                    <p>Haz clic en cualquier punto del mapa para ver información detallada</p>
                </div>
            </div>
        `;
        container.appendChild(this.infoPanel);
        this.addPremiumStyles();
    }

    addPremiumStyles() {
        const styles = `
            <style>
                /* ESTILOS PREMIUM - TEMA NEGRO Y VERDE DORADO LUXE */
                :root {
                    --bg-dark: #0a0a0a;
                    --panel-dark: rgba(15, 23, 18, 0.97);
                    --panel-light: rgba(25, 35, 28, 0.95);
                    --emerald-primary: #10b981;
                    --emerald-secondary: #059669;
                    --emerald-accent: #34d399;
                    --gold-primary: #d4af37;
                    --gold-secondary: #b8941f;
                    --gold-accent: #f7e98e;
                    --text-primary: #f0fdf4;
                    --text-secondary: #d1fae5;
                    --text-muted: #9ca3af;
                    --border-dark: rgba(255,255,255,0.08);
                    --border-light: rgba(212, 175, 55, 0.3);
                    --shadow-premium: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                    --gradient-emerald: linear-gradient(135deg, #10b981, #34d399);
                    --gradient-gold: linear-gradient(135deg, #d4af37, #f7e98e);
                    --gradient-panel: linear-gradient(160deg, rgba(15,23,18,0.98), rgba(10,15,12,0.95));
                }

                .cesium-control-panel {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 340px;
                    background: var(--gradient-panel);
                    border-radius: 20px;
                    box-shadow: var(--shadow-premium), 
                                inset 0 1px 0 var(--border-light),
                                0 0 0 1px rgba(0,0,0,0.3);
                    padding: 0;
                    color: var(--text-primary);
                    border: 1px solid var(--border-dark);
                    backdrop-filter: blur(20px) saturate(1.8);
                    z-index: 1000;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    transform: translateZ(0);
                }

                .cesium-control-panel.mobile-collapsed {
                    height: 70px;
                    width: 70px !important;
                    overflow: hidden;
                }

                .control-header {
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(212,175,55,0.1));
                    border-bottom: 1px solid var(--border-dark);
                    position: relative;
                    overflow: hidden;
                }

                .control-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: var(--gradient-gold);
                    opacity: 0.6;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .header-icon {
                    font-size: 24px;
                    background: var(--gradient-emerald);
                    border-radius: 12px;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
                }

                .header-text h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    background: var(--gradient-gold);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.02em;
                }

                .header-subtitle {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .btn-mobile-toggle {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border-dark);
                    color: var(--gold-primary);
                    padding: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .btn-mobile-toggle:hover {
                    background: rgba(212,175,55,0.1);
                    transform: scale(1.05);
                }

                .panel-content {
                    display: flex;
                    flex-direction: column;
                    height: calc(100% - 90px);
                }

                .control-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    padding: 20px 24px 16px;
                    border-bottom: 1px solid var(--border-dark);
                }

                .btn-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .btn-action-primary {
                    background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1));
                    color: var(--emerald-accent);
                    border: 1px solid rgba(16,185,129,0.3);
                }

                .btn-action-secondary {
                    background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));
                    color: var(--gold-primary);
                    border: 1px solid rgba(212,175,55,0.2);
                }

                .btn-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(16,185,129,0.2);
                }

                .layers-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 24px;
                    max-height: calc(70vh - 200px);
                }

                .category-section {
                    margin-bottom: 24px;
                }

                .category-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                    padding: 12px 16px;
                    background: linear-gradient(90deg, rgba(16,185,129,0.1), transparent);
                    border-radius: 12px;
                    border-left: 3px solid var(--emerald-primary);
                }

                .category-header i {
                    color: var(--emerald-primary);
                    font-size: 14px;
                }

                .category-header h4 {
                    margin: 0;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
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
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.1));
                    border-radius: 14px;
                    cursor: pointer;
                    border: 1px solid var(--border-dark);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .layer-label::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent);
                    transition: left 0.6s ease;
                }

                .layer-label:hover::before {
                    left: 100%;
                }

                .layer-label:hover {
                    transform: translateY(-2px);
                    border-color: var(--border-light);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
                }

                .layer-indicator {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .layer-checkbox {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border-dark);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .checkbox-inner {
                    width: 10px;
                    height: 10px;
                    background: var(--gradient-emerald);
                    border-radius: 2px;
                    transform: scale(0);
                    transition: transform 0.3s ease;
                }

                input[type="checkbox"]:checked + .layer-label .checkbox-inner {
                    transform: scale(1);
                }

                input[type="checkbox"]:checked + .layer-label .layer-checkbox {
                    border-color: var(--emerald-primary);
                    background: rgba(16,185,129,0.1);
                }

                .layer-emoji {
                    font-size: 16px;
                    width: 24px;
                    text-align: center;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                }

                .layer-text {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    letter-spacing: -0.01em;
                }

                .layer-count {
                    background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(212,175,55,0.1));
                    color: var(--text-primary);
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    min-width: 32px;
                    text-align: center;
                    border: 1px solid var(--border-dark);
                    backdrop-filter: blur(10px);
                }

                .panel-footer {
                    padding: 20px 24px;
                    border-top: 1px solid var(--border-dark);
                    background: linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.4));
                }

                .system-stats {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .stat-item i {
                    color: var(--emerald-accent);
                    font-size: 10px;
                }

                .system-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--emerald-primary);
                    position: relative;
                }

                .status-indicator.active::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: var(--emerald-primary);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(2); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }

                /* PANEL DE INFORMACIÓN PREMIUM */
                .cesium-info-panel {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 400px;
                    background: var(--gradient-panel);
                    border-radius: 20px;
                    box-shadow: var(--shadow-premium),
                                inset 0 1px 0 var(--border-light),
                                0 0 0 1px rgba(0,0,0,0.3);
                    color: var(--text-primary);
                    border: 1px solid var(--border-dark);
                    backdrop-filter: blur(20px) saturate(1.8);
                    z-index: 1000;
                    transform: translateX(420px);
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    overflow: hidden;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    transform: translateZ(0);
                }

                .cesium-info-panel.visible {
                    transform: translateX(0);
                }

                .cesium-info-panel.mobile-fullscreen {
                    width: calc(100vw - 40px) !important;
                    height: calc(100vh - 40px) !important;
                    max-height: none !important;
                }

                .info-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(212,175,55,0.1));
                    border-bottom: 1px solid var(--border-dark);
                    position: relative;
                }

                .info-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: var(--gradient-gold);
                    opacity: 0.6;
                }

                .info-header-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .info-header-content i {
                    color: var(--emerald-primary);
                    font-size: 20px;
                }

                .info-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    background: var(--gradient-gold);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .info-header-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .btn-close {
                    background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1));
                    border: 1px solid rgba(239,68,68,0.3);
                    color: #ef4444;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 10px;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .btn-close:hover {
                    transform: scale(1.05);
                    background: linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.2));
                }

                .info-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                    background: linear-gradient(180deg, rgba(10,15,12,0.6), rgba(5,8,6,0.4));
                }

                .no-selection {
                    text-align: center;
                    padding: 80px 40px;
                    color: var(--text-muted);
                }

                .no-selection-icon {
                    font-size: 48px;
                    color: var(--emerald-primary);
                    margin-bottom: 20px;
                    opacity: 0.7;
                }

                .no-selection h4 {
                    margin: 0 0 12px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .no-selection p {
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.5;
                    opacity: 0.8;
                }

                /* CONTENIDO DE INFORMACIÓN DETALLADA - PREMIUM */
                .entity-info-detailed {
                    color: var(--text-primary);
                    padding: 0;
                    background: transparent;
                }

                .info-header-detailed {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px;
                    background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(212,175,55,0.05));
                    border-bottom: 1px solid var(--border-dark);
                }

                .info-icon {
                    font-size: 32px;
                    width: 64px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(212,175,55,0.1));
                    border-radius: 16px;
                    color: var(--text-primary);
                    border: 1px solid var(--border-light);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                }

                .info-header-detailed h3 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--text-primary);
                    flex: 1;
                    word-wrap: break-word;
                    line-height: 1.3;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }

                .info-details {
                    font-size: 14px;
                    padding: 24px;
                    background: transparent;
                }

                .info-section {
                    margin-bottom: 24px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15));
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid var(--border-dark);
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }

                .info-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--gradient-emerald);
                }

                .info-section h4 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--emerald-accent);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-left: 12px;
                }

                .info-section h4 i {
                    font-size: 14px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 0;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-label {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 700;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .info-label i {
                    font-size: 10px;
                    color: var(--emerald-primary);
                }

                .info-value {
                    font-size: 14px;
                    color: var(--text-primary);
                    font-weight: 600;
                    line-height: 1.5;
                    word-wrap: break-word;
                    word-break: break-word;
                    background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.1));
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid var(--border-dark);
                    min-height: 24px;
                    overflow: visible;
                    white-space: normal;
                    backdrop-filter: blur(5px);
                }

                .services-list, .menu-list, .rooms-list, .products-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .service-tag {
                    background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05));
                    color: var(--emerald-accent);
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 13px;
                    border: 1px solid rgba(16,185,129,0.2);
                    text-align: center;
                    font-weight: 600;
                    word-wrap: break-word;
                    backdrop-filter: blur(5px);
                }

                .menu-item, .room-item, .product-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.1));
                    border-radius: 12px;
                    border: 1px solid var(--border-dark);
                    transition: all 0.3s ease;
                }

                .menu-item:hover, .room-item:hover, .product-item:hover {
                    transform: translateX(4px);
                    border-color: var(--border-light);
                }

                .dish-name, .room-type, .product-name {
                    color: var(--text-primary);
                    font-weight: 600;
                    flex: 1;
                    word-wrap: break-word;
                }

                .dish-price, .room-capacity, .product-price {
                    color: var(--gold-primary);
                    font-weight: 700;
                    font-size: 14px;
                    background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05));
                    padding: 8px 12px;
                    border-radius: 8px;
                    white-space: nowrap;
                    margin-left: 12px;
                    border: 1px solid rgba(212,175,55,0.2);
                }

                .menu-more {
                    text-align: center;
                    padding: 14px;
                    color: var(--text-muted);
                    font-style: italic;
                    font-size: 13px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.01), rgba(0,0,0,0.08));
                    border-radius: 10px;
                    border: 1px dashed var(--border-dark);
                }

                .info-note {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05));
                    border-radius: 12px;
                    border: 1px solid rgba(212,175,55,0.2);
                    color: var(--gold-accent);
                    font-size: 13px;
                    margin-top: 16px;
                }

                .info-note i {
                    color: var(--gold-primary);
                    font-size: 14px;
                }

                .entity-info-loading {
                    text-align: center;
                    padding: 80px 40px;
                    background: transparent;
                }

                .loading-spinner {
                    color: var(--emerald-primary);
                }

                .loading-spinner i {
                    font-size: 36px;
                    margin-bottom: 20px;
                    animation: spin 1.5s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-spinner p {
                    margin: 0;
                    font-size: 14px;
                    color: var(--text-muted);
                }

                /* ESTILOS RESPONSIVOS */
                @media (max-width: 768px) {
                    .cesium-control-panel {
                        width: 300px !important;
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
                        gap: 14px;
                    }

                    .info-header-detailed {
                        padding: 20px;
                        flex-direction: column;
                        text-align: center;
                        gap: 12px;
                    }

                    .info-header-detailed h3 {
                        font-size: 20px;
                        text-align: center;
                    }

                    .info-details {
                        padding: 20px;
                    }

                    .info-section {
                        margin-bottom: 20px;
                        padding: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .cesium-info-panel {
                        width: calc(100vw - 20px) !important;
                        right: 10px !important;
                    }

                    .info-header-detailed {
                        padding: 16px;
                    }

                    .info-details {
                        padding: 16px;
                    }

                    .info-value {
                        padding: 10px 12px;
                        font-size: 13px;
                    }
                }

                /* SCROLLBAR PREMIUM */
                .info-content::-webkit-scrollbar {
                    width: 8px;
                }

                .info-content::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                    margin: 4px;
                }

                .info-content::-webkit-scrollbar-thumb {
                    background: var(--gradient-emerald);
                    border-radius: 10px;
                    border: 2px solid rgba(0,0,0,0.2);
                }

                .info-content::-webkit-scrollbar-thumb:hover {
                    background: var(--gradient-gold);
                }

                .layers-list::-webkit-scrollbar {
                    width: 6px;
                }

                .layers-list::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }

                .layers-list::-webkit-scrollbar-thumb {
                    background: var(--gradient-emerald);
                    border-radius: 10px;
                }

                /* GARANTIZAR VISIBILIDAD DEL TEXTO */
                .info-value {
                    overflow: visible !important;
                    white-space: normal !important;
                    text-overflow: unset !important;
                    min-height: auto !important;
                    line-height: 1.5 !important;
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
        console.log('🗺️ Cargando capas 3D Premium desde Render...');
        
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
        console.log(`🎉 Carga 3D Premium completada: ${loadedCount}/${totalLayers} capas`);
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
            'puntos_turisticos': { emoji: '📍', color: '#10b981' },
            'miradores': { emoji: '🔭', color: '#10b981' },
            'playas': { emoji: '🏖️', color: '#10b981' },
            'tiendas_artesania': { emoji: '🎨', color: '#d4af37' },
            'restaurantes': { emoji: '🍽️', color: '#d4af37' },
            'hoteles': { emoji: '🏨', color: '#d4af37' },
            'rutas': { emoji: '🛣️', color: '#34d399' },
            'comunidades': { emoji: '🏘️', color: '#34d399' },
            'viviendas': { emoji: '🏠', color: '#059669' },
            'areas_verdes': { emoji: '🌳', color: '#059669' },
            'sembradios': { emoji: '🌾', color: '#059669' },
            'basura': { emoji: '🗑️', color: '#94a3b8' },
            'puntos_basura': { emoji: '🚯', color: '#94a3b8' },
            'aguas_contaminadas': { emoji: '⚠️', color: '#ef4444' }
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
        
        // Fondo con gradiente premium
        const gradient = ctx.createRadialGradient(24, 24, 0, 24, 24, 18);
        gradient.addColorStop(0, config.color);
        gradient.addColorStop(1, this.darkenColor(config.color, 0.3));
        
        ctx.beginPath();
        ctx.arc(24, 24, 18, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Borde dorado
        ctx.beginPath();
        ctx.arc(24, 24, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Sombra interior
        ctx.beginPath();
        ctx.arc(24, 24, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.font = '20px "Segoe UI Emoji"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(config.emoji, 24, 24);
        
        return canvas.toDataURL();
    }

    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const amt = Math.round(2.55 * factor * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
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
                        <i class="fas fa-spinner"></i>
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
                        <h4><i class="fas fa-info-circle"></i>Información Básica</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label"><i class="fas fa-tag"></i>Tipo</span>
                                <span class="info-value">${entity.basicInfo.tipo}</span>
                            </div>
                            ${entity.basicInfo.comunidad ? `
                            <div class="info-item">
                                <span class="info-label"><i class="fas fa-users"></i>Comunidad</span>
                                <span class="info-value">${entity.basicInfo.comunidad}</span>
                            </div>` : ''}
                        </div>
                        ${entity.basicInfo.descripcion ? `
                        <div class="info-item full-width">
                            <span class="info-label"><i class="fas fa-align-left"></i>Descripción</span>
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
                    <h4><i class="fas fa-utensils"></i>Información del Restaurante</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-tag"></i>Tipo</span>
                            <span class="info-value">${restaurante.tipo_restaurante || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-users"></i>Capacidad</span>
                            <span class="info-value">${restaurante.capacidad || 'N/A'} personas</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-clock"></i>Horario</span>
                            <span class="info-value">${restaurante.horario || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-star"></i>Estilo</span>
                            <span class="info-value">${restaurante.estilo_culinario || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-circle"></i>Estado</span>
                            <span class="info-value">${restaurante.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-map-marker-alt"></i>Comunidad</span>
                            <span class="info-value">${restaurante.comunidad || 'No especificada'}</span>
                        </div>
                    </div>
                </div>

                ${servicios.length > 0 ? `
                <div class="info-section">
                    <h4><i class="fas fa-concierge-bell"></i>Servicios</h4>
                    <div class="services-list">
                        ${servicios.map(servicio => `<span class="service-tag">${servicio.tipo}</span>`).join('')}
                    </div>
                </div>` : ''}

                ${menu.length > 0 ? `
                <div class="info-section">
                    <h4><i class="fas fa-utensil-spoon"></i>Menú (${data.total_platos || 0} platos)</h4>
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
                    <h4><i class="fas fa-hotel"></i>Información del Hotel</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-users"></i>Capacidad</span>
                            <span class="info-value">${hotel.capacidad_personas || 'N/A'} personas</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-door-closed"></i>Habitaciones</span>
                            <span class="info-value">${hotel.numero_habitaciones || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-circle"></i>Estado</span>
                            <span class="info-value">${hotel.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-tag"></i>Tipo</span>
                            <span class="info-value">${hotel.tipo_hotel || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-map-marker-alt"></i>Comunidad</span>
                            <span class="info-value">${hotel.comunidad || 'No especificada'}</span>
                        </div>
                    </div>
                </div>

                ${servicios.length > 0 ? `
                <div class="info-section">
                    <h4><i class="fas fa-concierge-bell"></i>Servicios</h4>
                    <div class="services-list">
                        ${servicios.map(servicio => `<span class="service-tag">${servicio.tipo}</span>`).join('')}
                    </div>
                </div>` : ''}

                ${habitaciones.length > 0 ? `
                <div class="info-section">
                    <h4><i class="fas fa-bed"></i>Tipos de Habitación</h4>
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
                    <h4><i class="fas fa-palette"></i>Tienda de Artesanía</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-circle"></i>Estado</span>
                            <span class="info-value">${tienda.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-map-marker-alt"></i>Comunidad</span>
                            <span class="info-value">${tienda.comunidad || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-cube"></i>Productos</span>
                            <span class="info-value">${data.total_productos || 0} disponibles</span>
                        </div>
                    </div>
                </div>

                ${Object.keys(productosPorCategoria).length > 0 ? `
                <div class="info-section">
                    <h4><i class="fas fa-shopping-bag"></i>Productos por Categoría</h4>
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
                    <h4><i class="fas fa-binoculars"></i>Información del Mirador</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-hiking"></i>Dificultad acceso</span>
                            <span class="info-value">${mirador.dificultad_acceso || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-circle"></i>Estado</span>
                            <span class="info-value">${mirador.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-users"></i>Afluencia</span>
                            <span class="info-value">${mirador.afluencia || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-map-marker-alt"></i>Comunidad</span>
                            <span class="info-value">${mirador.comunidad || 'No especificada'}</span>
                        </div>
                        ${mirador.puntos_cercanos ? `
                        <div class="info-item full-width">
                            <span class="info-label"><i class="fas fa-map-pin"></i>Puntos cercanos</span>
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
                    <h4><i class="fas fa-umbrella-beach"></i>Información de la Playa</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-road"></i>Acceso</span>
                            <span class="info-value">${playa.acceso || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-hiking"></i>Dificultad acceso</span>
                            <span class="info-value">${playa.dificultad_acceso || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-tag"></i>Tipo playa</span>
                            <span class="info-value">${playa.tipo_playa || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-circle"></i>Estado</span>
                            <span class="info-value">${playa.estado || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-users"></i>Afluencia</span>
                            <span class="info-value">${playa.afluencia || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-map-marker-alt"></i>Comunidad</span>
                            <span class="info-value">${playa.comunidad || 'No especificada'}</span>
                        </div>
                        ${playa.puntos_cercanos ? `
                        <div class="info-item full-width">
                            <span class="info-label"><i class="fas fa-map-pin"></i>Puntos cercanos</span>
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
                    <h4><i class="fas fa-map-marker-alt"></i>Información Turística</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-tag"></i>Tipo</span>
                            <span class="info-value">${lugar.tipo || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-wheelchair"></i>Accesibilidad</span>
                            <span class="info-value">${lugar.accesibilidad || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-users"></i>Afluencia</span>
                            <span class="info-value">${lugar.afluencia || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fas fa-map-marker-alt"></i>Comunidad</span>
                            <span class="info-value">${lugar.comunidad || 'No especificada'}</span>
                        </div>
                        ${lugar.descripcion ? `
                        <div class="info-item full-width">
                            <span class="info-label"><i class="fas fa-align-left"></i>Descripción</span>
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
        
        if (totalElementsEl) totalElementsEl.textContent = `${totalElements} elementos`;
        if (activeLayersEl) activeLayersEl.textContent = `${activeLayers} capas`;
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
            background: linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.9));
            color: white; padding: 16px 20px; border-radius: 14px; 
            z-index: 10000; max-width: 400px; border: 1px solid rgba(239,68,68,0.3);
            backdrop-filter: blur(20px); font-weight: 600; box-shadow: var(--shadow-premium);
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>Error:</strong> ${message}`;
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


