// assets/scripts/modules/cesium-3d-simple.js - VERSIÓN PRODUCCIÓN
class Cesium3DMap {
    constructor() {
        this.viewer = null;
        this.dataSources = new Map();
        this.capasConfig = new Map();
        this.infoPanel = null;
        
        // ✅ URL DE API PARA PRODUCCIÓN - CAMBIAR POR TU URL DE RENDER
        this.API_BASE_URL = 'https://mi-api-6jmx.onrender.com';
        
        this.init();
    }

    init() {
        console.log('🚀 Iniciando Cesium 3D - Interfaz Mejorada - PRODUCCIÓN');
        
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
                sceneModePicker: true,
                baseLayerPicker: true,
                geocoder: false,
                fullscreenButton: true,
                infoBox: false
            });

            this.setupMap();
            this.createControlPanel();
            this.createInfoPanel();
            this.setupEventHandlers();
            this.loadAllLayers();

        } catch (error) {
            console.error('❌ Error inicializando Cesium:', error);
            this.showError('Error inicializando mapa 3D');
        }
    }

    setupMap() {
        // Vista inicial centrada en la Isla del Sol
        this.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(-69.1833, -16.0167, 2800),
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
                <h3>🎯 Control de Capas</h3>
                <div class="control-buttons">
                    <button id="toggleAllLayers" class="btn-control">📁 Todas</button>
                    <button id="clearAllLayers" class="btn-control">🗑️ Limpiar</button>
                </div>
            </div>
            
            <div class="layers-list" id="cesiumLayersList">
                <div class="category-section">
                    <h4>🏞️ Puntos Turísticos</h4>
                    ${this.createLayerItem('miradores', '🔭', 'Miradores', '#FF6B35')}
                    ${this.createLayerItem('playas', '🏖️', 'Playas', '#4ECDC4')}
                    ${this.createLayerItem('tiendas_artesania', '🎨', 'Tiendas Artesanía', '#FF9800')}
                </div>

                <div class="category-section">
                    <h4>🏘️ Servicios</h4>
                    ${this.createLayerItem('restaurantes', '🍽️', 'Restaurantes', '#E91E63')}
                    ${this.createLayerItem('hoteles', '🏨', 'Hoteles', '#2196F3')}
                </div>

                <div class="category-section">
                    <h4>🗺️ Rutas</h4>
                    ${this.createLayerItem('rutas', '🛣️', 'Todas las Rutas', '#FFEB3B')}
                </div>

                <div class="category-section">
                    <h4>🏘️ Comunidades</h4>
                    ${this.createLayerItem('comunidades', '🏘️', 'Todas las Comunidades', '#795548')}
                </div>

                <div class="category-section">
                    <h4>🌳 Áreas Verdes</h4>
                    ${this.createLayerItem('areas_verdes', '🌳', 'Áreas Verdes', '#4CAF50')}
                    ${this.createLayerItem('sembradios', '🌾', 'Sembradíos', '#8BC34A')}
                </div>
            </div>

            <div class="panel-footer">
                <div class="system-stats">
                    <span id="totalElements">Total: 0 elementos</span>
                    <span id="activeLayers">Activas: 0 capas</span>
                </div>
            </div>
        `;
        container.appendChild(controlPanel);
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
                <button id="closeInfo" class="btn-close">×</button>
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
        
        // Agregar estilos CSS mejorados
        this.addImprovedStyles();
    }

    addImprovedStyles() {
        // ... (los mismos estilos que en tu archivo original)
        // Se mantienen iguales, solo cambian las URLs de API
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

        this.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
            const pickedObject = this.viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                await this.showEntityInfo(pickedObject.id);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    async loadAllLayers() {
        console.log('🗺️ Cargando capas corregidas...');
        
        const apiAvailable = await this.checkAPIStatus();
        if (!apiAvailable) {
            this.showError('No se puede conectar con el servidor API');
            this.hideLoading();
            return;
        }

        // ✅ LISTA CORREGIDA - Solo capas unificadas
        const finalLayers = [
            // PUNTOS TURÍSTICOS
            'miradores',
            'playas', 
            'tiendas_artesania',
            
            // SERVICIOS
            'restaurantes',
            'hoteles',
            
            // RUTAS (UNIFICADA) - SOLO UNA CAPA
            'rutas',
            
            // COMUNIDADES (UNIFICADA)
            'comunidades',
            
            // ÁREAS VERDES
            'areas_verdes',
            'sembradios'
        ];

        let loadedCount = 0;
        const totalLayers = finalLayers.length;
        
        console.log(`🎯 Cargando ${totalLayers} capas unificadas...`);

        for (const layerName of finalLayers) {
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
        console.log(`🎉 Carga completada: ${loadedCount}/${totalLayers} capas`);
    }

    async loadLayer(layerName) {
        try {
            console.log(`🔄 Cargando: ${layerName}`);
            
            // ✅ URL DE PRODUCCIÓN - CAMBIAR POR TU URL DE RENDER
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
        else if (layerName === 'comunidades') {
            return {
                stroke: baseColor,
                fill: baseColor.withAlpha(0.15),
                strokeWidth: 3,
                clampToGround: true,
                material: new Cesium.ColorMaterialProperty(baseColor.withAlpha(0.15))
            };
        }
        else if (layerName === 'areas_verdes' || layerName === 'sembradios') {
            return {
                stroke: baseColor,
                fill: baseColor.withAlpha(0.3),
                strokeWidth: 2,
                clampToGround: true,
                material: new Cesium.ColorMaterialProperty(baseColor.withAlpha(0.3))
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
            'miradores': { emoji: '🔭', color: '#FF6B35' },
            'playas': { emoji: '🏖️', color: '#4ECDC4' },
            'tiendas_artesania': { emoji: '🎨', color: '#FF9800' },
            'restaurantes': { emoji: '🍽️', color: '#E91E63' },
            'hoteles': { emoji: '🏨', color: '#2196F3' },
            'rutas': { emoji: '🛣️', color: '#FF6B35' }, // Color unificado para todas las rutas
            'comunidades': { emoji: '🏘️', color: '#795548' },
            'areas_verdes': { emoji: '🌳', color: '#4CAF50' },
            'sembradios': { emoji: '🌾', color: '#8BC34A' }
        };
        
        return configs[layerName] || { emoji: '📍', color: '#3498DB' };
    }

    processEntities(dataSource, layerName) {
        const config = this.getMarkerConfig(layerName);
        
        dataSource.entities.values.forEach((entity) => {
            if (entity.position && entity.properties) {
                const nombre = entity.properties.nombre?.getValue?.() || this.getDefaultName(layerName);
                const tipo = entity.properties.tipo?.getValue?.() || '';
                const idLugar = entity.properties.id?.getValue?.() || '';
                
                let entityColor = config.color;
                
                if (layerName === 'rutas') {
                    // Para rutas, usar colores diferentes según el tipo
                    const tipoRuta = tipo.toLowerCase();
                    if (tipoRuta.includes('sagrad') || tipoRuta.includes('espiritual')) {
                        entityColor = '#9C27B0'; // Púrpura para rutas sagradas
                    } else if (tipoRuta.includes('turístic') || tipoRuta.includes('recreativa')) {
                        entityColor = '#FF9800'; // Naranja para rutas turísticas
                    } else if (tipoRuta.includes('corta') || tipoRuta.includes('fácil')) {
                        entityColor = '#4CAF50'; // Verde para rutas fáciles
                    } else if (tipoRuta.includes('larga') || tipoRuta.includes('difícil')) {
                        entityColor = '#F44336'; // Rojo para rutas difíciles
                    } else {
                        entityColor = '#FF6B35'; // Color por defecto
                    }
                    
                    if (entity.polyline) {
                        entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
                            glowPower: 0.8,
                            color: Cesium.Color.fromCssColorString(entityColor),
                            taperPower: 0.7
                        });
                        entity.polyline.width = 8;
                    }

                    // Agregar información de la ruta
                    entity.basicInfo = {
                        nombre: nombre,
                        tipo: tipo,
                        descripcion: entity.properties.descripcion?.getValue?.() || '',
                        duracion: entity.properties.duracion?.getValue?.() || '',
                        distancia: entity.properties.distancia?.getValue?.() || '',
                        dificultad: entity.properties.dificultad?.getValue?.() || ''
                    };
                }
                else if (layerName === 'comunidades') {
                    const comunidad = entity.properties.comunidad?.getValue?.() || '';
                    if (comunidad.includes('Challa')) {
                        entityColor = '#795548';
                    } else if (comunidad.includes('Challapampa')) {
                        entityColor = '#8D6E63';
                    } else if (comunidad.includes('Yumani')) {
                        entityColor = '#A1887F';
                    } else {
                        entityColor = '#5D4037';
                    }
                    
                    if (entity.polygon) {
                        entity.polygon.material = Cesium.Color.fromCssColorString(entityColor).withAlpha(0.15);
                        entity.polygon.outlineColor = Cesium.Color.fromCssColorString(entityColor);
                    }
                }
                else if (layerName === 'areas_verdes' || layerName === 'sembradios') {
                    if (entity.polygon) {
                        entity.polygon.material = Cesium.Color.fromCssColorString(entityColor).withAlpha(0.3);
                        entity.polygon.outlineColor = Cesium.Color.fromCssColorString(entityColor);
                        entity.polygon.outlineWidth = 2;
                        entity.polygon.clampToGround = true;
                    }
                }
                
                // Crear marcadores para puntos (no rutas, comunidades ni áreas)
                if (!layerName.includes('ruta') && 
                    !layerName.includes('comunidad') && 
                    !layerName.includes('area_verde') &&
                    !layerName.includes('sembrad')) {
                    
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
                entity.entityId = idLugar;
                
                // Solo establecer basicInfo si no se estableció anteriormente (para rutas)
                if (!entity.basicInfo) {
                    entity.basicInfo = {
                        nombre: nombre,
                        tipo: tipo,
                        comunidad: entity.properties.comunidad?.getValue?.() || '',
                        descripcion: entity.properties.descripcion?.getValue?.() || ''
                    };
                }
            }
        });
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

    // ✅ MÉTODO MEJORADO CON INTERFAZ VISUAL MEJORADA
    async showEntityInfo(entity) {
        const infoContent = document.getElementById('cesiumInfoContent');
        
        infoContent.innerHTML = this.createLoadingInfo(entity);
        this.infoPanel.classList.add('visible');

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
        
        // Información especial para rutas
        if (entity.layerType === 'rutas') {
            return `
                <div class="entity-info-detailed">
                    <div class="info-header-detailed">
                        <span class="info-icon">${config.emoji}</span>
                        <h3>${entity.basicInfo.nombre}</h3>
                    </div>
                    <div class="info-details">
                        <div class="info-section">
                            <h4>🛣️ Información de la Ruta</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Tipo</span>
                                    <span class="info-value">${entity.basicInfo.tipo}</span>
                                </div>
                                ${entity.basicInfo.duracion ? `
                                <div class="info-item">
                                    <span class="info-label">Duración</span>
                                    <span class="info-value">${entity.basicInfo.duracion}</span>
                                </div>` : ''}
                                ${entity.basicInfo.distancia ? `
                                <div class="info-item">
                                    <span class="info-label">Distancia</span>
                                    <span class="info-value">${entity.basicInfo.distancia}</span>
                                </div>` : ''}
                                ${entity.basicInfo.dificultad ? `
                                <div class="info-item">
                                    <span class="info-label">Dificultad</span>
                                    <span class="info-value">${entity.basicInfo.dificultad}</span>
                                </div>` : ''}
                            </div>
                            ${entity.basicInfo.descripcion ? `
                            <div class="info-item full-width">
                                <span class="info-label">Descripción</span>
                                <span class="info-value">${entity.basicInfo.descripcion}</span>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

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
            case 'rutas':
                contenido += this.createRouteInfo(detailedData);
                break;
            default:
                contenido += this.createGenericInfo(detailedData);
        }

        contenido += `</div>`;
        return contenido;
    }

    createRouteInfo(data) {
        const ruta = data.ruta || {};
        return `
            <div class="info-details">
                <div class="info-section">
                    <h4>🛣️ Información Detallada de la Ruta</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Tipo</span>
                            <span class="info-value">${ruta.tipo || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Dificultad</span>
                            <span class="info-value">${ruta.dificultad || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Duración</span>
                            <span class="info-value">${ruta.duracion || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Distancia</span>
                            <span class="info-value">${ruta.distancia || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Elevación</span>
                            <span class="info-value">${ruta.elevacion || 'No especificada'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado</span>
                            <span class="info-value">${ruta.estado || 'No especificado'}</span>
                        </div>
                    </div>
                    ${ruta.descripcion ? `
                    <div class="info-item full-width">
                        <span class="info-label">Descripción</span>
                        <span class="info-value">${ruta.descripcion}</span>
                    </div>` : ''}
                    ${ruta.puntos_interes ? `
                    <div class="info-item full-width">
                        <span class="info-label">Puntos de Interés</span>
                        <span class="info-value">${ruta.puntos_interes}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
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
                            <span class="info-value">${restaurante.tipo || 'No especificado'}</span>
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
                            <span class="info-value">${restaurante.estilo || 'No especificado'}</span>
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
                        ${servicios.map(servicio => `<span class="service-tag">${servicio}</span>`).join('')}
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
                        ${servicios.map(servicio => `<span class="service-tag">${servicio}</span>`).join('')}
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
                case 'rutas':
                    endpoint = `detalle/ruta/${entityId}`;
                    break;
                case 'puntos_turisticos':
                    endpoint = `detalle/lugar_turistico/${entityId}`;
                    break;
                default:
                    return null;
            }

            // ✅ URL DE PRODUCCIÓN - CAMBIAR POR TU URL DE RENDER
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

    // Resto de métodos se mantienen igual...
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
            // ✅ URL DE PRODUCCIÓN - CAMBIAR POR TU URL DE RENDER
            const response = await fetch(`${this.API_BASE_URL}/status`);
            return response.ok;
        } catch (error) {
            console.error('❌ Error conectando con API:', error);
            return false;
        }
    }

    getDefaultName(layerType) {
        const names = {
            'miradores': 'Mirador',
            'playas': 'Playa',
            'tiendas_artesania': 'Tienda de Artesanía',
            'restaurantes': 'Restaurante',
            'hoteles': 'Hotel',
            'rutas': 'Ruta',
            'comunidades': 'Comunidad',
            'areas_verdes': 'Área Verde',
            'sembradios': 'Sembradío'
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

// Inicialización
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