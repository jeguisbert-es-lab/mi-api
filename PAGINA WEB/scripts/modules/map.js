// scripts/modules/map.js - VERSIÓN COMPLETA OPTIMIZADA PARA CELULAR
class InteractiveMap {
    constructor() {
        this.map = null;
        this.capas = {};
        this.capasActivas = new Set();
        this.marcadoresAgrupados = null;
        this.contadorTotal = 0;
        this.API_BASE_URL = 'https://mi-api-6jmx.onrender.com/api';
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }

    init() {
        console.log('🗺️ Inicializando mapa interactivo para celular...');
        this.inicializarMapa();
        this.crearInterfazMovil();
        this.configurarEventosInterfaz();
        this.inicializarCluster();
        this.cargarTodasLasCapas();
    }

    inicializarMapa() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('❌ No se encontró el contenedor del mapa');
            return;
        }

        this.ocultarLoading();

        this.map = L.map('map', {
            center: [-16.0167, -69.1833],
            zoom: 13,
            zoomControl: false,
            attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        L.control.zoom({
            position: this.isMobile ? 'bottomright' : 'topright'
        }).addTo(this.map);

        console.log('✅ Mapa base inicializado');
    }

    crearInterfazMovil() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        const controlesHTML = `
            <!-- BOTÓN FLOTANTE PRINCIPAL MÓVIL -->
            <div class="mobile-main-control">
                <button class="mobile-menu-btn" id="mobileMenuBtn">
                    <i class="fas fa-layer-group"></i>
                    <span class="badge-mobile" id="mobileBadge">0</span>
                </button>
            </div>

            <!-- PANEL DESLIZANTE MÓVIL -->
            <div class="mobile-panel" id="mobilePanel">
                <div class="mobile-panel-header">
                    <h3>🗺️ Capas del Mapa</h3>
                    <button class="mobile-close-btn" id="mobileCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="mobile-stats">
                    <div class="stat-item">
                        <i class="fas fa-layer-group"></i>
                        <span id="mobileTotal">0 elementos</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-eye"></i>
                        <span id="mobileActive">0 activas</span>
                    </div>
                </div>

                <div class="mobile-quick-controls">
                    <button class="quick-btn" id="btnAllOn">
                        <i class="fas fa-toggle-on"></i>
                        Todas
                    </button>
                    <button class="quick-btn" id="btnAllOff">
                        <i class="fas fa-toggle-off"></i>
                        Ninguna
                    </button>
                    <button class="quick-btn" id="btnMyLocation">
                        <i class="fas fa-location-crosshairs"></i>
                        Mi Ubicación
                    </button>
                </div>

                <div class="mobile-layers-container">
                    <div class="mobile-layers-grid" id="mobileLayersList">
                        <!-- Las capas se generarán dinámicamente -->
                    </div>
                </div>

                <div class="mobile-legend">
                    <h4>📊 Leyenda</h4>
                    <div class="legend-grid-mobile">
                        <div class="legend-item-mobile">
                            <span class="legend-color" style="background: #e53e3e"></span>
                            <span>Turismo</span>
                        </div>
                        <div class="legend-item-mobile">
                            <span class="legend-color" style="background: #3182ce"></span>
                            <span>Servicios</span>
                        </div>
                        <div class="legend-item-mobile">
                            <span class="legend-color" style="background: #38a169"></span>
                            <span>Naturaleza</span>
                        </div>
                        <div class="legend-item-mobile">
                            <span class="legend-color" style="background: #718096"></span>
                            <span>Ambiente</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BOTÓN 3D FLOTANTE -->
            <div class="mobile-3d-btn">
                <button class="btn-3d-mobile" id="btn3DMobile" title="Ver en 3D">
                    <i class="fas fa-cube"></i>
                    <span>3D</span>
                </button>
            </div>

            <!-- OVERLAY -->
            <div class="mobile-overlay" id="mobileOverlay"></div>
        `;

        mapContainer.insertAdjacentHTML('beforeend', controlesHTML);
        this.agregarEstilosMovil();
    }

    agregarEstilosMovil() {
        const styles = `
            <style>
                .mobile-main-control {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .mobile-menu-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
                }

                .badge-mobile {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ef4444;
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    font-size: 12px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                    animation: pulse 2s infinite;
                }

                .mobile-panel {
                    position: fixed;
                    top: 0;
                    left: -100%;
                    width: 85%;
                    max-width: 400px;
                    height: 100vh;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px);
                    z-index: 2000;
                    transition: left 0.3s ease;
                    overflow-y: auto;
                    border-right: 1px solid rgba(255,255,255,0.1);
                }

                .mobile-panel.active {
                    left: 0;
                }

                .mobile-panel-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .mobile-panel-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .mobile-close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .mobile-close-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: rotate(90deg);
                }

                .mobile-stats {
                    display: flex;
                    padding: 15px 20px;
                    background: rgba(255,255,255,0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    gap: 15px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #e2e8f0;
                    font-size: 12px;
                    font-weight: 500;
                }

                .stat-item i {
                    color: #6366f1;
                    font-size: 14px;
                }

                .mobile-quick-controls {
                    padding: 15px 20px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .quick-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #e2e8f0;
                    padding: 12px 8px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    transition: all 0.3s ease;
                }

                .quick-btn:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateY(-2px);
                }

                .quick-btn i {
                    font-size: 14px;
                }

                .mobile-layers-container {
                    padding: 15px 20px;
                    max-height: 50vh;
                    overflow-y: auto;
                }

                .mobile-layers-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .mobile-layer-item {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .mobile-layer-item.active {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: #6366f1;
                }

                .mobile-layer-item:hover {
                    background: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                }

                .mobile-layer-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .mobile-layer-emoji {
                    font-size: 18px;
                    width: 24px;
                    text-align: center;
                }

                .mobile-layer-text {
                    flex: 1;
                    color: #e2e8f0;
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 1.3;
                }

                .mobile-layer-count {
                    background: rgba(30, 41, 59, 0.8);
                    color: #e2e8f0;
                    padding: 4px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: bold;
                    min-width: 20px;
                    text-align: center;
                }

                .mobile-layer-item.active .mobile-layer-count {
                    background: #10b981;
                    color: white;
                }

                .mobile-legend {
                    padding: 15px 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.03);
                }

                .mobile-legend h4 {
                    color: #e2e8f0;
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: 600;
                }

                .legend-grid-mobile {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .legend-item-mobile {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: #cbd5e0;
                }

                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.3);
                }

                .mobile-3d-btn {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }

                .btn-3d-mobile {
                    background: linear-gradient(135deg, #06b6d4, #6366f1);
                    border: none;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
                    transition: all 0.3s ease;
                }

                .btn-3d-mobile:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 30px rgba(6, 182, 212, 0.6);
                }

                .mobile-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(5px);
                    z-index: 1999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                .mobile-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                @media (max-width: 480px) {
                    .mobile-panel {
                        width: 90%;
                    }
                    .mobile-layers-grid {
                        grid-template-columns: 1fr;
                    }
                    .mobile-quick-controls {
                        grid-template-columns: 1fr;
                    }
                    .mobile-stats {
                        flex-direction: column;
                        gap: 10px;
                    }
                    .legend-grid-mobile {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 360px) {
                    .mobile-panel {
                        width: 95%;
                    }
                    .mobile-layer-content {
                        flex-direction: column;
                        text-align: center;
                        gap: 5px;
                    }
                    .mobile-layer-emoji {
                        font-size: 16px;
                    }
                    .mobile-layer-text {
                        font-size: 11px;
                    }
                }

                @media (hover: none) and (pointer: coarse) {
                    .mobile-menu-btn,
                    .quick-btn,
                    .mobile-layer-item,
                    .btn-3d-mobile {
                        min-height: 44px;
                    }
                    .mobile-layer-item {
                        padding: 15px 12px;
                    }
                }

                .mobile-layers-container::-webkit-scrollbar {
                    width: 4px;
                }
                .mobile-layers-container::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.05);
                    border-radius: 2px;
                }
                .mobile-layers-container::-webkit-scrollbar-thumb {
                    background: #6366f1;
                    border-radius: 2px;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    configurarEventosInterfaz() {
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            this.abrirPanelMovil();
        });

        document.getElementById('mobileCloseBtn')?.addEventListener('click', () => {
            this.cerrarPanelMovil();
        });

        document.getElementById('mobileOverlay')?.addEventListener('click', () => {
            this.cerrarPanelMovil();
        });

        document.getElementById('btnAllOn')?.addEventListener('click', () => {
            this.activarTodasLasCapas();
            this.mostrarMensajeMovil('Todas las capas activadas ✅', 'success');
        });

        document.getElementById('btnAllOff')?.addEventListener('click', () => {
            this.desactivarTodasLasCapas();
            this.mostrarMensajeMovil('Todas las capas desactivadas ⚡', 'info');
        });

        document.getElementById('btnMyLocation')?.addEventListener('click', () => {
            this.buscarMiUbicacion();
        });

        document.getElementById('btn3DMobile')?.addEventListener('click', () => {
            this.irAVista3D();
        });

        document.addEventListener('click', (e) => {
            const panel = document.getElementById('mobilePanel');
            const menuBtn = document.getElementById('mobileMenuBtn');
            
            if (panel?.classList.contains('active') && 
                !panel.contains(e.target) && 
                !menuBtn?.contains(e.target)) {
                this.cerrarPanelMovil();
            }
        });

        this.configurarGestosTactiles();
    }

    configurarGestosTactiles() {
        let startX = 0;
        const panel = document.getElementById('mobilePanel');
        
        panel?.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        panel?.addEventListener('touchmove', (e) => {
            if (!startX) return;
            
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (diff > 50) {
                this.cerrarPanelMovil();
                startX = 0;
            }
        });
    }

    abrirPanelMovil() {
        const panel = document.getElementById('mobilePanel');
        const overlay = document.getElementById('mobileOverlay');
        
        panel?.classList.add('active');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    cerrarPanelMovil() {
        const panel = document.getElementById('mobilePanel');
        const overlay = document.getElementById('mobileOverlay');
        
        panel?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    generarListaCapasMovil() {
        const listaCapas = document.getElementById('mobileLayersList');
        if (!listaCapas) return;

        const configCapas = [
            { id: 'puntos_turisticos', nombre: 'Puntos Turísticos', emoji: '📍', categoria: 'turismo' },
            { id: 'miradores', nombre: 'Miradores', emoji: '🔭', categoria: 'turismo' },
            { id: 'playas', nombre: 'Playas', emoji: '🏖️', categoria: 'turismo' },
            { id: 'tiendas_artesania', nombre: 'Artesanía', emoji: '🎨', categoria: 'comercio' },
            { id: 'restaurantes', nombre: 'Restaurantes', emoji: '🍽️', categoria: 'servicios' },
            { id: 'hoteles', nombre: 'Hoteles', emoji: '🏨', categoria: 'servicios' },
            { id: 'rutas', nombre: 'Rutas', emoji: '🗺️', categoria: 'rutas' },
            { id: 'comunidades', nombre: 'Comunidades', emoji: '🏘️', categoria: 'comunidad' },
            { id: 'viviendas', nombre: 'Viviendas', emoji: '🏠', categoria: 'comunidad' },
            { id: 'areas_verdes', nombre: 'Áreas Verdes', emoji: '🌳', categoria: 'naturaleza' },
            { id: 'sembradios', nombre: 'Sembradíos', emoji: '🌾', categoria: 'naturaleza' },
            { id: 'basura', nombre: 'Basura', emoji: '🗑️', categoria: 'medio_ambiente' },
            { id: 'puntos_basura', nombre: 'Zonas Basura', emoji: '🚯', categoria: 'medio_ambiente' },
            { id: 'aguas_contaminadas', nombre: 'Agua Contaminada', emoji: '⚠️', categoria: 'medio_ambiente' }
        ];

        listaCapas.innerHTML = configCapas.map(capa => `
            <div class="mobile-layer-item" data-capa="${capa.id}" data-categoria="${capa.categoria}">
                <div class="mobile-layer-content">
                    <span class="mobile-layer-emoji">${capa.emoji}</span>
                    <span class="mobile-layer-text">${capa.nombre}</span>
                    <span class="mobile-layer-count" id="mobile-count-${capa.id}">0</span>
                </div>
            </div>
        `).join('');

        configCapas.forEach(capa => {
            const elemento = document.querySelector(`[data-capa="${capa.id}"]`);
            if (elemento) {
                elemento.addEventListener('click', () => {
                    this.toggleCapaMovil(capa.id, elemento);
                });
            }
        });
    }

    toggleCapaMovil(nombreCapa, elemento) {
        const estaActiva = this.capasActivas.has(nombreCapa);
        
        if (estaActiva) {
            this.desactivarCapa(nombreCapa);
            elemento.classList.remove('active');
        } else {
            this.activarCapa(nombreCapa);
            elemento.classList.add('active');
        }
        
        this.actualizarEstadisticasMovil();
    }

    actualizarEstadisticasMovil() {
        const totalElementos = this.contadorTotal;
        const capasActivas = this.capasActivas.size;
        
        const badge = document.getElementById('mobileBadge');
        if (badge) {
            badge.textContent = capasActivas;
            badge.style.background = capasActivas > 0 ? '#10b981' : '#ef4444';
        }
        
        const totalElement = document.getElementById('mobileTotal');
        const activeElement = document.getElementById('mobileActive');
        
        if (totalElement) totalElement.textContent = `${totalElementos} elementos`;
        if (activeElement) activeElement.textContent = `${capasActivas} activas`;
    }

    actualizarContadorCapaMovil(nombreCapa, cantidad) {
        const contador = document.getElementById(`mobile-count-${nombreCapa}`);
        if (contador) {
            contador.textContent = cantidad;
            
            const elemento = document.querySelector(`[data-capa="${nombreCapa}"]`);
            if (elemento && cantidad > 0) {
                contador.style.background = '#10b981';
            } else {
                contador.style.background = '#4a5568';
            }
        }
    }

    mostrarMensajeMovil(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `mobile-notification ${tipo}`;
        notificacion.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${tipo === 'success' ? 'check' : 'info'}-circle"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 3000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            animation: slideInDown 0.3s ease;
            max-width: 90%;
            text-align: center;
            font-size: 14px;
            font-weight: 500;
        `;

        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }

    irAVista3D() {
        this.mostrarMensajeMovil('Redirigiendo a vista 3D...', 'info');
        
        const seccion3D = document.getElementById('map3dSection');
        if (seccion3D) {
            seccion3D.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        this.cerrarPanelMovil();
    }

    // MÉTODOS EXISTENTES DEL MAPA
    ocultarLoading() {
        const loading = document.querySelector('.map-loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }

    inicializarCluster() {
        this.marcadoresAgrupados = L.layerGroup().addTo(this.map);
    }

    async cargarTodasLasCapas() {
        console.log('🔄 Cargando TODAS las capas desde Render (Móvil)...');
        
        try {
            const timestamp = new Date().getTime();
            const statusResponse = await fetch(`${this.API_BASE_URL}/status?t=${timestamp}`);
            
            if (!statusResponse.ok) {
                throw new Error('API no responde');
            }
            
            const todasLasCapas = [
                'puntos_turisticos', 'miradores', 'playas', 'tiendas_artesania',
                'restaurantes', 'hoteles', 'rutas', 'comunidades', 'viviendas',
                'areas_verdes', 'sembradios', 'basura', 'puntos_basura', 'aguas_contaminadas'
            ];
            
            this.generarListaCapasMovil();
            
            for (const capa of todasLasCapas) {
                await this.cargarCapa(capa);
                
                const capasPrincipales = ['puntos_turisticos', 'comunidades', 'rutas'];
                if (capasPrincipales.includes(capa)) {
                    this.activarCapa(capa);
                    const elemento = document.querySelector(`[data-capa="${capa}"]`);
                    if (elemento) elemento.classList.add('active');
                }
            }
            
            console.log('✅ Todas las capas cargadas (Móvil)');
            this.actualizarEstadisticasMovil();
            this.mostrarMensajeMovil('Mapa cargado correctamente 🗺️', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando capas (Móvil):', error);
            this.mostrarMensajeMovil('Error al cargar el mapa ❌', 'error');
        }
    }

    async cargarCapa(nombreCapa) {
        if (this.capas[nombreCapa]) {
            return;
        }

        try {
            console.log(`🔄 Cargando capa: ${nombreCapa}`);
            
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.API_BASE_URL}/capas/${nombreCapa}?t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                this.agregarCapaAlMapa(nombreCapa, data);
                
                setTimeout(() => {
                    this.limpiarDuplicadosCapa(nombreCapa);
                }, 100);
                
                this.actualizarContadorCapa(nombreCapa, data.features.length);
                console.log(`✅ ${nombreCapa}: ${data.features.length} elementos`);
            } else {
                console.warn(`⚠️ ${nombreCapa}: Sin datos disponibles`);
                this.actualizarContadorCapa(nombreCapa, 0);
            }
        } catch (error) {
            console.error(`❌ Error cargando ${nombreCapa}:`, error);
            this.actualizarContadorCapa(nombreCapa, 0);
        }
    }

    agregarCapaAlMapa(nombreCapa, geojsonData) {
        if (this.capas[nombreCapa]) {
            console.log(`⚠️ Capa ${nombreCapa} ya existe, omitiendo...`);
            return;
        }

        const estilo = this.obtenerEstilo(nombreCapa);
        
        const capaGeoJSON = L.geoJSON(geojsonData, {
            style: estilo,
            pointToLayer: (feature, latlng) => {
                if (feature.geometry.type === 'Point') {
                    const icono = this.crearIconoPersonalizado(nombreCapa);
                    return L.marker(latlng, { icon: icono });
                } else if (estilo.radius) {
                    return L.circleMarker(latlng, estilo);
                }
                return L.marker(latlng);
            },
            onEachFeature: (feature, layer) => {
                this.agregarPopup(feature, layer, nombreCapa);
            }
        });

        this.capas[nombreCapa] = capaGeoJSON;
        console.log(`✅ Capa ${nombreCapa} creada con ${geojsonData.features?.length || 0} elementos`);
    }

    crearIconoPersonalizado(tipoCapa) {
        const iconosConfig = {
            'puntos_turisticos': { emoji: '📍', color: '#e53e3e' },
            'miradores': { emoji: '🔭', color: '#3182ce' },
            'playas': { emoji: '🏖️', color: '#38b2ac' },
            'tiendas_artesania': { emoji: '🎨', color: '#d69e2e' },
            'restaurantes': { emoji: '🍽️', color: '#dd6b20' },
            'hoteles': { emoji: '🏨', color: '#805ad5' },
            'comunidades': { emoji: '🏘️', color: '#4a5568' },
            'viviendas': { emoji: '🏠', color: '#2d3748' },
            'areas_verdes': { emoji: '🌳', color: '#38a169' },
            'sembradios': { emoji: '🌾', color: '#22543d' },
            'basura': { emoji: '🗑️', color: '#718096' },
            'puntos_basura': { emoji: '🚯', color: '#a0aec0' },
            'aguas_contaminadas': { emoji: '⚠️', color: '#e53e3e' }
        };

        const config = iconosConfig[tipoCapa] || { emoji: '📌', color: '#718096' };
        return L.divIcon({
            html: `
                <div style="
                    background: ${config.color};
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                    cursor: pointer;
                ">${config.emoji}</div>
            `,
            className: 'custom-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    }

    activarCapa(nombreCapa) {
        if (this.capas[nombreCapa] && !this.capasActivas.has(nombreCapa)) {
            this.capas[nombreCapa].addTo(this.map);
            this.capasActivas.add(nombreCapa);
            console.log(`✅ Capa activada: ${nombreCapa}`);
        } else if (!this.capas[nombreCapa]) {
            this.cargarCapa(nombreCapa).then(() => {
                this.activarCapa(nombreCapa);
            });
        }
    }

    desactivarCapa(nombreCapa) {
        if (this.capas[nombreCapa] && this.capasActivas.has(nombreCapa)) {
            this.map.removeLayer(this.capas[nombreCapa]);
            this.capasActivas.delete(nombreCapa);
            console.log(`❌ Capa desactivada: ${nombreCapa}`);
        }
    }

    activarTodasLasCapas() {
        Object.keys(this.capas).forEach(capaId => {
            this.activarCapa(capaId);
            const elemento = document.querySelector(`[data-capa="${capaId}"]`);
            if (elemento) elemento.classList.add('active');
        });
        this.actualizarContadores();
    }

    desactivarTodasLasCapas() {
        Object.keys(this.capas).forEach(capaId => {
            this.desactivarCapa(capaId);
            const elemento = document.querySelector(`[data-capa="${capaId}"]`);
            if (elemento) elemento.classList.remove('active');
        });
        this.actualizarContadores();
    }

    obtenerEstilo(tipoCapa) {
        const estilos = {
            puntos_turisticos: { 
                color: '#e53e3e', 
                radius: 8, 
                fillColor: '#fc8181',
                fillOpacity: 0.9,
                weight: 3
            },
            comunidades: { 
                color: '#3182ce', 
                fillColor: '#90cdf4', 
                fillOpacity: 0.4, 
                weight: 3 
            },
            rutas: { 
                color: '#dd6b20', 
                weight: 5, 
                opacity: 0.9,
                dashArray: '8, 8'
            },
            areas_verdes: { 
                color: '#38a169', 
                fillColor: '#9ae6b4', 
                fillOpacity: 0.6,
                weight: 2
            },
            sembradios: {
                color: '#22543d',
                fillColor: '#68d391',
                fillOpacity: 0.5,
                weight: 1
            },
            miradores: {
                color: '#3182ce',
                radius: 6,
                fillColor: '#90cdf4',
                fillOpacity: 0.8,
                weight: 2
            },
            playas: {
                color: '#38b2ac',
                radius: 6,
                fillColor: '#81e6d9',
                fillOpacity: 0.8,
                weight: 2
            },
            tiendas_artesania: {
                color: '#d69e2e',
                radius: 5,
                fillColor: '#faf089',
                fillOpacity: 0.8,
                weight: 2
            },
            restaurantes: {
                color: '#dd6b20',
                radius: 5,
                fillColor: '#fbd38d',
                fillOpacity: 0.8,
                weight: 2
            },
            hoteles: {
                color: '#805ad5',
                radius: 5,
                fillColor: '#d6bcfa',
                fillOpacity: 0.8,
                weight: 2
            },
            viviendas: {
                color: '#2d3748',
                radius: 4,
                fillColor: '#a0aec0',
                fillOpacity: 0.7,
                weight: 1
            },
            basura: {
                color: '#718096',
                radius: 6,
                fillColor: '#b82924ff',
                fillOpacity: 0.8,
                weight: 2
            },
            puntos_basura: {
                color: '#a0aec0',
                radius: 6,
                fillColor: '#cbd5e0',
                fillOpacity: 0.7,
                weight: 2
            },
            aguas_contaminadas: {
                color: '#e53e3e',
                radius: 7,
                fillColor: '#fc8181',
                fillOpacity: 0.7,
                weight: 3
            }
        };
        
        return estilos[tipoCapa] || { color: '#718096', radius: 6, fillOpacity: 0.8 };
    }

    async agregarPopup(feature, layer, tipoCapa) {
        if (feature.properties) {
            let contenido = `<div class="popup-isla-sol">`;
            
            const iconos = {
                'puntos_turisticos': '📍', 'miradores': '🔭', 'playas': '🏖️', 
                'tiendas_artesania': '🎨', 'restaurantes': '🍽️', 'hoteles': '🏨', 
                'comunidades': '🏘️', 'viviendas': '🏠', 'rutas': '🛣️',
                'areas_verdes': '🌳', 'sembradios': '🌾',
                'basura': '🗑️', 'puntos_basura': '🚯', 'aguas_contaminadas': '⚠️'
            };
            
            const icono = iconos[tipoCapa] || '📌';
            const nombre = feature.properties.nombre || this.obtenerNombrePorTipo(tipoCapa);
            const idLugar = feature.properties.id_lugar || this.extraerIdLugar(feature.properties.id);
            
            contenido += `
                <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
                    <h3>${icono} ${nombre}</h3>
                    <span style="color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">
                        ${this.obtenerCategoria(tipoCapa)}
                    </span>
                </div>
                
                <div id="loading-${idLugar}" style="text-align: center; padding: 20px;">
                    <div style="color: #3182ce; font-size: 14px;">
                        <i class="fas fa-spinner fa-spin"></i> Cargando información detallada...
                    </div>
                </div>
                
                <div id="detalles-${idLugar}" style="display: none;"></div>
            `;
            
            contenido += `</div>`;
            
            layer.bindPopup(contenido);
            
            layer.on('popupopen', async () => {
                await this.cargarInformacionDetallada(tipoCapa, idLugar, nombre);
            });
        }
    }

    async cargarInformacionDetallada(tipoCapa, idLugar, nombre) {
        const loadingElement = document.getElementById(`loading-${idLugar}`);
        const detallesElement = document.getElementById(`detalles-${idLugar}`);
        
        if (!loadingElement || !detallesElement) return;
        
        try {
            let endpoint = '';
            let tipoDetalle = '';
            
            switch(tipoCapa) {
                case 'restaurantes':
                    endpoint = `detalle/restaurante/${idLugar}`;
                    tipoDetalle = 'restaurante';
                    break;
                case 'hoteles':
                    endpoint = `detalle/hotel/${idLugar}`;
                    tipoDetalle = 'hotel';
                    break;
                case 'tiendas_artesania':
                    endpoint = `detalle/tienda_artesania/${idLugar}`;
                    tipoDetalle = 'tienda_artesania';
                    break;
                case 'puntos_turisticos':
                    endpoint = `detalle/lugar_turistico/${idLugar}`;
                    tipoDetalle = 'lugar_turistico';
                    break;
                case 'miradores':
                    endpoint = `detalle/mirador/${idLugar}`;
                    tipoDetalle = 'mirador';
                    break;
                case 'playas':
                    endpoint = `detalle/playa/${idLugar}`;
                    tipoDetalle = 'playa';
                    break;
                default:
                    detallesElement.innerHTML = this.generarContenidoBasico(tipoCapa, nombre);
                    loadingElement.style.display = 'none';
                    detallesElement.style.display = 'block';
                    return;
            }
            
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.API_BASE_URL}/${endpoint}?t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            let contenidoDetallado = '';
            switch(tipoDetalle) {
                case 'restaurante':
                    contenidoDetallado = this.generarContenidoRestaurante(data);
                    break;
                case 'hotel':
                    contenidoDetallado = this.generarContenidoHotel(data);
                    break;
                case 'tienda_artesania':
                    contenidoDetallado = this.generarContenidoTiendaArtesania(data);
                    break;
                case 'lugar_turistico':
                    contenidoDetallado = this.generarContenidoLugarTuristico(data);
                    break;
                case 'mirador':
                    contenidoDetallado = this.generarContenidoMirador(data);
                    break;
                case 'playa':
                    contenidoDetallado = this.generarContenidoPlaya(data);
                    break;
            }
            
            loadingElement.style.display = 'none';
            detallesElement.innerHTML = contenidoDetallado;
            detallesElement.style.display = 'block';
            
        } catch (error) {
            console.error(`❌ Error cargando detalles para ${tipoCapa}:`, error);
            loadingElement.innerHTML = `
                <div style="color: #e53e3e; text-align: center; padding: 10px;">
                    <i class="fas fa-exclamation-triangle"></i> Error cargando información
                </div>
            `;
        }
    }

    generarContenidoRestaurante(data) {
        const restaurante = data.restaurante;
        const servicios = data.servicios;
        const menu = data.menu;
        
        let contenido = `
            <div style="margin-bottom: 15px;">
                <h4>🍽️ Información del Restaurante</h4>
                <div style="background: #f7fafc; padding: 12px; border-radius: 6px; font-size: 13px;">
                    <p style="margin: 4px 0;"><strong>🏷️ Tipo:</strong> ${restaurante.tipo || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>👥 Capacidad:</strong> ${restaurante.capacidad || 'N/A'} personas</p>
                    <p style="margin: 4px 0;"><strong>🕒 Horario:</strong> ${restaurante.horario || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>🎨 Estilo:</strong> ${restaurante.estilo || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>✅ Estado:</strong> ${restaurante.estado || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>🏘️ Comunidad:</strong> ${restaurante.comunidad || 'No especificada'}</p>
                </div>
            </div>
        `;
        
        if (servicios && servicios.length > 0) {
            contenido += `
                <div style="margin-bottom: 15px;">
                    <h4>⚡ Servicios</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${servicios.map(servicio => 
                            `<span style="background: #edf2f7; padding: 4px 8px; border-radius: 12px; font-size: 11px; color: #4a5568;">${servicio}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        if (menu && menu.length > 0) {
            const platosMostrar = menu.slice(0, 5);
            contenido += `
                <div style="margin-bottom: 10px;">
                    <h4>📋 Menú (${data.total_platos} platos)</h4>
                    <div style="max-height: 150px; overflow-y: auto; font-size: 12px;">
                        ${platosMostrar.map(plato => `
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                                <span>${plato.plato}</span>
                                <span style="color: #38a169; font-weight: bold;">Bs. ${plato.precio}</span>
                            </div>
                        `).join('')}
                        ${menu.length > 10 ? `<div style="text-align: center; padding: 8px; color: #718096; font-style: italic;">... y ${menu.length - 10} platos más</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        return contenido;
    }

    generarContenidoHotel(data) {
        const hotel = data.hotel;
        const servicios = data.servicios;
        const habitaciones = data.habitaciones;
        
        let contenido = `
            <div style="margin-bottom: 15px;">
                <h4>🏨 Información del Hotel</h4>
                <div style="background: #f7fafc; padding: 12px; border-radius: 6px; font-size: 13px;">
                    <p style="margin: 4px 0;"><strong>👥 Capacidad:</strong> ${hotel.capacidad_personas || 'N/A'} personas</p>
                    <p style="margin: 4px 0;"><strong>🛏️ Habitaciones:</strong> ${hotel.numero_habitaciones || 'N/A'}</p>
                    <p style="margin: 4px 0;"><strong>✅ Estado:</strong> ${hotel.estado || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>🏠 Tipo:</strong> ${hotel.tipo_hotel || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>🏘️ Comunidad:</strong> ${hotel.comunidad || 'No especificada'}</p>
                </div>
            </div>
        `;
        
        if (servicios && servicios.length > 0) {
            contenido += `
                <div style="margin-bottom: 15px;">
                    <h4>⚡ Servicios</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${servicios.map(servicio => 
                            `<span style="background: #edf2f7; padding: 4px 8px; border-radius: 12px; font-size: 11px; color: #4a5568;">${servicio}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        if (habitaciones && habitaciones.length > 0) {
            contenido += `
                <div style="margin-bottom: 10px;">
                    <h4>🛏️ Tipos de Habitación</h4>
                    <div style="font-size: 12px;">
                        ${habitaciones.map(hab => `
                            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e2e8f0;">
                                <span>${hab.tipo}</span>
                                <span style="color: #3182ce;">Capacidad: ${hab.capacidad}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return contenido;
    }

    generarContenidoTiendaArtesania(data) {
        const tienda = data.tienda;
        const productosPorCategoria = data.productos_por_categoria;
        
        let contenido = `
            <div style="margin-bottom: 15px;">
                <h4>🎨 Tienda de Artesanía</h4>
                <div style="background: #f7fafc; padding: 12px; border-radius: 6px; font-size: 13px;">
                    <p style="margin: 4px 0;"><strong>🏪 Nombre:</strong> ${tienda.nombre || 'Tienda de Artesanía'}</p>
                    <p style="margin: 4px 0;"><strong>✅ Estado:</strong> ${tienda.estado || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>🏘️ Comunidad:</strong> ${tienda.comunidad || 'No especificada'}</p>
                    <p style="margin: 4px 0;"><strong>📦 Total productos:</strong> ${data.total_productos} disponibles</p>
                </div>
            </div>
        `;
        
        if (productosPorCategoria && Object.keys(productosPorCategoria).length > 0) {
            contenido += `
                <div style="margin-bottom: 10px;">
                    <h4>🛍️ Productos Disponibles</h4>
            `;
            
            Object.entries(productosPorCategoria).forEach(([categoria, productos]) => {
                contenido += `
                    <div style="margin-bottom: 12px; background: #fff5f5; padding: 10px; border-radius: 6px;">
                        <h5 style="margin: 0 0 6px 0; color: #c53030; font-size: 12px; font-weight: bold;">${categoria}</h5>
                        <div style="font-size: 11px;">
                            ${productos.map(prod => `
                                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #fed7d7;">
                                    <span>${prod.producto}</span>
                                    <span style="color: #38a169; font-weight: bold;">Bs. ${prod.precio}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            
            contenido += `</div>`;
        }
        
        return contenido;
    }

    generarContenidoLugarTuristico(data) {
        const lugar = data.lugar_turistico;
        
        return `
            <div style="margin-bottom: 15px;">
                <h4>📍 Información Turística</h4>
                <div style="background: #f7fafc; padding: 12px; border-radius: 6px; font-size: 13px;">
                    <p style="margin: 4px 0;"><strong>🏷️ Tipo:</strong> ${lugar.tipo || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>♿ Accesibilidad:</strong> ${lugar.accesibilidad || 'No especificada'}</p>
                    <p style="margin: 4px 0;"><strong>👥 Afluencia:</strong> ${lugar.afluencia || 'No especificada'}</p>
                    <p style="margin: 4px 0;"><strong>🏘️ Comunidad:</strong> ${lugar.comunidad || 'No especificada'}</p>
                    ${lugar.descripcion ? `
                        <div style="margin-top: 8px; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #3182ce;">
                            <p style="margin: 0; color: #4a5568; font-style: italic; font-size: 12px;">${lugar.descripcion}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generarContenidoMirador(data) {
        const mirador = data.mirador;
        
        return `
            <div style="margin-bottom: 15px;">
                <h4>🔭 Información del Mirador</h4>
                <div style="background: #f7fafc; padding: 12px; border-radius: 6px; font-size: 13px;">
                    <p style="margin: 4px 0;"><strong>🚶 Dificultad acceso:</strong> ${mirador.dificultad_acceso || 'No especificada'}</p>
                    <p style="margin: 4px 0;"><strong>✅ Estado:</strong> ${mirador.estado || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>👥 Afluencia:</strong> ${mirador.afluencia || 'No especificada'}</p>
                    <p style="margin: 4px 0;"><strong>🏘️ Comunidad:</strong> ${mirador.comunidad || 'No especificada'}</p>
                    ${mirador.puntos_cercanos ? `
                        <p style="margin: 4px 0;"><strong>📍 Puntos cercanos:</strong> ${mirador.puntos_cercanos}</p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generarContenidoPlaya(data) {
        const playa = data.playa;
        
        return `
            <div style="margin-bottom: 15px;">
                <h4>🏖️ Información de la Playa</h4>
                <div style="background: #f7fafc; padding: 12px; border-radius: 6px; font-size: 13px;">
                    <p style="margin: 4px 0;"><strong>🚗 Acceso:</strong> ${playa.acceso || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>🚶 Dificultad acceso:</strong> ${playa.dificultad_acceso || 'No especificada'}</p>
                    <p style="margin: 4px 0;"><strong>🏝️ Tipo playa:</strong> ${playa.tipo_playa || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>✅ Estado:</strong> ${playa.estado || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>👥 Afluencia:</strong> ${playa.afluencia || 'No especificada'}</p>
                    <p style="margin: 4px 0;"><strong>🏘️ Comunidad:</strong> ${playa.comunidad || 'No especificada'}</p>
                    ${playa.puntos_cercanos ? `
                        <p style="margin: 4px 0;"><strong>📍 Puntos cercanos:</strong> ${playa.puntos_cercanos}</p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generarContenidoBasico(tipoCapa, nombre) {
        return `
            <div style="text-align: center; padding: 20px; color: #718096;">
                <i class="fas fa-info-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p style="margin: 0; font-size: 13px;">Información básica para ${nombre}</p>
                <p style="margin: 8px 0 0 0; font-size: 11px;">Tipo: ${tipoCapa}</p>
            </div>
        `;
    }

    extraerIdLugar(idString) {
        if (!idString) return null;
        const match = idString.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }

    obtenerNombrePorTipo(tipoCapa) {
        const nombres = {
            'viviendas': 'Vivienda',
            'sembradios': 'Sembradío',
            'areas_verdes': 'Área Verde',
            'tiendas_artesania': 'Tienda de Artesanía',
            'basura': 'Punto de Basura',
            'puntos_basura': 'Zona de Basura',
            'aguas_contaminadas': 'Zona de Agua Contaminada'
        };
        return nombres[tipoCapa] || tipoCapa.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    obtenerCategoria(tipoCapa) {
        const categorias = {
            'puntos_turisticos': 'Turismo', 'miradores': 'Turismo', 'playas': 'Turismo',
            'tiendas_artesania': 'Comercio', 'restaurantes': 'Servicio', 'hoteles': 'Servicio',
            'comunidades': 'Comunidad', 'viviendas': 'Residencial', 'rutas': 'Transporte',
            'areas_verdes': 'Naturaleza', 'sembradios': 'Agricultura',
            'basura': 'Medio Ambiente', 'puntos_basura': 'Medio Ambiente', 'aguas_contaminadas': 'Medio Ambiente'
        };
        return categorias[tipoCapa] || 'General';
    }

    actualizarContadores() {
        this.contadorTotal = 0;
        
        Object.entries(this.capas).forEach(([nombreCapa, capa]) => {
            if (this.capasActivas.has(nombreCapa)) {
                this.contadorTotal += capa.getLayers().length;
            }
        });
        
        this.actualizarEstadisticasMovil();
    }

    actualizarContadorCapa(nombreCapa, cantidad) {
        this.actualizarContadorCapaMovil(nombreCapa, cantidad);
    }

    limpiarDuplicadosCapa(nombreCapa) {
        if (!this.capas[nombreCapa]) return;
        
        const capa = this.capas[nombreCapa];
        const layers = capa.getLayers();
        const coordenadasUnicas = new Set();
        const layersUnicos = [];
        
        layers.forEach(layer => {
            const latlng = layer.getLatLng ? layer.getLatLng() : null;
            if (latlng) {
                const clave = `${latlng.lat.toFixed(6)},${latlng.lng.toFixed(6)}`;
                if (!coordenadasUnicas.has(clave)) {
                    coordenadasUnicas.add(clave);
                    layersUnicos.push(layer);
                }
            } else {
                layersUnicos.push(layer);
            }
        });
        
        if (layersUnicos.length < layers.length) {
            console.log(`🔄 Eliminando ${layers.length - layersUnicos.length} duplicados de ${nombreCapa}`);
            
            this.map.removeLayer(capa);
            
            const nuevaCapa = L.layerGroup(layersUnicos);
            this.capas[nombreCapa] = nuevaCapa;
            
            if (this.capasActivas.has(nombreCapa)) {
                nuevaCapa.addTo(this.map);
            }
            
            this.actualizarContadorCapa(nombreCapa, layersUnicos.length);
        }
    }

    buscarMiUbicacion() {
        if (!navigator.geolocation) {
            this.mostrarMensajeMovil('La geolocalización no es soportada', 'error');
            return;
        }

        this.mostrarMensajeMovil('Buscando tu ubicación...', 'info');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                const ubicacionIcon = L.divIcon({
                    html: `
                        <div style="
                            background: #4299e1;
                            width: 45px;
                            height: 45px;
                            border-radius: 50%;
                            border: 4px solid white;
                            box-shadow: 0 4px 20px rgba(66, 153, 225, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 20px;
                            color: white;
                            animation: pulse 1.5s infinite;
                        ">📍</div>
                    `,
                    className: 'ubicacion-marker',
                    iconSize: [45, 45],
                    iconAnchor: [22, 22]
                });

                L.marker([latitude, longitude], { icon: ubicacionIcon })
                    .addTo(this.map)
                    .bindPopup('<strong>¡Tu ubicación actual!</strong><br>Estás aquí en el mapa.')
                    .openPopup();

                this.map.flyTo([latitude, longitude], 15, {
                    duration: 2,
                    easeLinearity: 0.25
                });

                this.mostrarMensajeMovil('Ubicación encontrada ✅', 'success');
            },
            (error) => {
                let mensaje = 'Error al obtener la ubicación';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = 'Permiso de ubicación denegado';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje = 'Información de ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        mensaje = 'Tiempo de espera agotado';
                        break;
                }
                this.mostrarMensajeMovil(mensaje, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    limpiarCapas() {
        Object.values(this.capas).forEach(capa => {
            this.map.removeLayer(capa);
        });
        this.capas = {};
        this.capasActivas.clear();
        
        if (this.marcadoresAgrupados) {
            this.marcadoresAgrupados.clearLayers();
        }
        
        const elementos = document.querySelectorAll('.mobile-layer-item');
        elementos.forEach(elemento => {
            elemento.classList.remove('active');
        });
        
        console.log('🗑️ Todas las capas limpiadas');
        this.actualizarContadores();
        
        this.mostrarMensajeMovil('Todas las capas limpiadas', 'info');
        
        setTimeout(() => {
            this.cargarTodasLasCapas();
        }, 1000);
    }
}

// ESTILOS DE ANIMACIÓN ADICIONALES
const mobileAnimationStyles = document.createElement('style');
mobileAnimationStyles.textContent = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideOutUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px);
        }
    }
    
    @keyframes slideInLeft {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(mobileAnimationStyles);

// ✅ FORZAR CARGA SIN CACHE
if (performance.navigation.type === 1) {
    console.log('🔄 Página recargada - limpiando cache móvil');
    localStorage.setItem('mobileForceReload', Date.now());
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    const lastMobileLoad = localStorage.getItem('mobileForceReload');
    const currentTime = Date.now();
    
    if (lastMobileLoad && (currentTime - parseInt(lastMobileLoad)) < 5000) {
        console.log('🔥 Forzando carga móvil sin cache');
        window.location.reload(true);
        return;
    }
    
    console.log('🚀 Inicializando mapa móvil optimizado...');
    window.interactiveMap = new InteractiveMap();
    
    localStorage.setItem('mobileForceReload', Date.now());
});
