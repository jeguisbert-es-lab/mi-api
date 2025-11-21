// scripts/modules/map.js - VERSIÓN CORREGIDA PARA TÁCTIL
class InteractiveMap {
    constructor() {
        this.map = null;
        this.capas = {};
        this.capasActivas = new Set();
        this.marcadoresAgrupados = null;
        this.contadorTotal = 0;
        this.API_BASE_URL = 'https://mi-api-6jmx.onrender.com/api';
        this.isMobile = window.innerWidth <= 768;
        this.isPanelOpen = false;
        
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

        // Configurar mapa para mejor experiencia táctil
        this.map = L.map('map', {
            center: [-16.0167, -69.1833],
            zoom: 13,
            zoomControl: false,
            attributionControl: true,
            tap: true, // Habilitar tap táctil
            touchZoom: true, // Habilitar zoom táctil
            dragging: true, // Habilitar arrastre
            tapTolerance: 15, // Tolerancia para taps
            preferCanvas: true // Mejor rendimiento en móvil
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        L.control.zoom({
            position: this.isMobile ? 'bottomright' : 'topright'
        }).addTo(this.map);

        console.log('✅ Mapa base inicializado con soporte táctil');
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

            <!-- OVERLAY PARA CERRAR PANEL -->
            <div class="mobile-overlay" id="mobileOverlay"></div>
        `;

        mapContainer.insertAdjacentHTML('beforeend', controlesHTML);
        this.agregarEstilosMovil();
    }

    agregarEstilosMovil() {
        const styles = `
            <style>
                /* ESTILOS MEJORADOS PARA TÁCTIL */
                * {
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                }

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
                    touch-action: manipulation;
                }

                .mobile-menu-btn:active {
                    transform: scale(0.95);
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

                /* PANEL MEJORADO PARA TÁCTIL */
                .mobile-panel {
                    position: fixed;
                    top: 0;
                    left: -100%;
                    width: 85%;
                    max-width: 400px;
                    height: 100vh;
                    background: rgba(15, 23, 42, 0.98);
                    backdrop-filter: blur(20px);
                    z-index: 2000;
                    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow-y: auto;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    -webkit-overflow-scrolling: touch; /* Scroll suave en iOS */
                    touch-action: pan-y; /* Permitir scroll vertical */
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
                    touch-action: none; /* Evitar scroll en el header */
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
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    touch-action: manipulation;
                }

                .mobile-close-btn:active {
                    background: rgba(255,255,255,0.3);
                    transform: scale(0.9);
                }

                .mobile-stats {
                    display: flex;
                    padding: 15px 20px;
                    background: rgba(255,255,255,0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    gap: 15px;
                    touch-action: none;
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
                    touch-action: none;
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
                    touch-action: manipulation;
                    min-height: 44px;
                }

                .quick-btn:active {
                    background: rgba(255,255,255,0.2);
                    transform: scale(0.95);
                }

                .quick-btn i {
                    font-size: 14px;
                }

                .mobile-layers-container {
                    padding: 15px 20px;
                    max-height: 50vh;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch; /* Scroll suave iOS */
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
                    touch-action: manipulation;
                    min-height: 44px;
                }

                .mobile-layer-item:active {
                    background: rgba(255,255,255,0.1);
                    transform: scale(0.98);
                }

                .mobile-layer-item.active {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: #6366f1;
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
                    touch-action: none;
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
                    touch-action: manipulation;
                    min-height: 44px;
                }

                .btn-3d-mobile:active {
                    transform: scale(0.95);
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
                    touch-action: pan-y; /* Permitir scroll a través del overlay */
                }

                .mobile-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                /* MEJORAS PARA SCROLL TÁCTIL */
                .mobile-layers-container {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE/Edge */
                }

                .mobile-layers-container::-webkit-scrollbar {
                    display: none; /* Chrome/Safari */
                }

                /* ANIMACIONES MEJORADAS */
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                @keyframes slideInFromLeft {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                @keyframes slideOutToLeft {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-100%);
                    }
                }

                /* RESPONSIVE MEJORADO */
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
                    width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .mobile-layer-text {
                        font-size: 11px;
                    }
                }

                /* GESTOS TÁCTILES ESPECÍFICOS */
                .mobile-panel {
                    /* Permitir scroll pero no gestos horizontales */
                    touch-action: pan-y;
                }

                .mobile-panel-header,
                .mobile-stats,
                .mobile-quick-controls,
                .mobile-legend {
                    /* Elementos que no deben scrollear */
                    touch-action: none;
                }

                /* MEJORA DE RENDIMIENTO PARA MÓVIL */
                .mobile-layer-item {
                    will-change: transform;
                    backface-visibility: hidden;
                }

                /* ESTADO DE CARGANDO MEJORADO */
                .map-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(15, 23, 42, 0.95);
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    color: white;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    configurarEventosInterfaz() {
        // Botón menú móvil - evento táctil mejorado
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.abrirPanelMovil();
            });

            // Soporte para touchstart para mejor respuesta
            menuBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                menuBtn.style.transform = 'scale(0.95)';
            });

            menuBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                menuBtn.style.transform = '';
                this.abrirPanelMovil();
            });
        }

        // Botón cerrar panel
        const closeBtn = document.getElementById('mobileCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.cerrarPanelMovil();
            });

            closeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                closeBtn.style.transform = 'scale(0.9)';
            });

            closeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                closeBtn.style.transform = '';
                this.cerrarPanelMovil();
            });
        }

        // Overlay para cerrar panel
        const overlay = document.getElementById('mobileOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.cerrarPanelMovil();
            });

            overlay.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.cerrarPanelMovil();
            });
        }

        // Controles rápidos con soporte táctil mejorado
        this.configurarBotonesTactiles();

        // Botón 3D
        const btn3D = document.getElementById('btn3DMobile');
        if (btn3D) {
            btn3D.addEventListener('click', (e) => {
                e.preventDefault();
                this.irAVista3D();
            });

            btn3D.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn3D.style.transform = 'scale(0.95)';
            });

            btn3D.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn3D.style.transform = '';
                this.irAVista3D();
            });
        }

        // Cerrar panel al hacer clic/tocar fuera
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen) {
                const panel = document.getElementById('mobilePanel');
                const menuBtn = document.getElementById('mobileMenuBtn');
                
                if (panel && !panel.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
                    this.cerrarPanelMovil();
                }
            }
        });

        // Soporte táctil para cerrar panel
        document.addEventListener('touchstart', (e) => {
            if (this.isPanelOpen) {
                const panel = document.getElementById('mobilePanel');
                const menuBtn = document.getElementById('mobileMenuBtn');
                
                if (panel && !panel.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
                    this.cerrarPanelMovil();
                }
            }
        });

        // Configurar gestos de deslizar para cerrar
        this.configurarGestosTactiles();
    }

    configurarBotonesTactiles() {
        const botones = [
            { id: 'btnAllOn', accion: () => { this.activarTodasLasCapas(); this.mostrarMensajeMovil('Todas las capas activadas ✅', 'success'); } },
            { id: 'btnAllOff', accion: () => { this.desactivarTodasLasCapas(); this.mostrarMensajeMovil('Todas las capas desactivadas ⚡', 'info'); } },
            { id: 'btnMyLocation', accion: () => { this.buscarMiUbicacion(); } }
        ];

        botones.forEach(boton => {
            const elemento = document.getElementById(boton.id);
            if (elemento) {
                // Evento click normal
                elemento.addEventListener('click', (e) => {
                    e.preventDefault();
                    boton.accion();
                });

                // Eventos táctiles mejorados
                elemento.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    elemento.style.transform = 'scale(0.95)';
                    elemento.style.background = 'rgba(255,255,255,0.2)';
                });

                elemento.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    elemento.style.transform = '';
                    elemento.style.background = '';
                    boton.accion();
                });

                elemento.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    elemento.style.transform = '';
                    elemento.style.background = '';
                });
            }
        });
    }

    configurarGestosTactiles() {
        const panel = document.getElementById('mobilePanel');
        if (!panel) return;

        let startX = 0;
        let currentX = 0;
        let isSwiping = false;

        panel.addEventListener('touchstart', (e) => {
            if (!this.isPanelOpen) return;
            
            startX = e.touches[0].clientX;
            currentX = startX;
            isSwiping = true;
            
            // Prevenir scroll mientras se desliza
            panel.style.overflowX = 'hidden';
        });

        panel.addEventListener('touchmove', (e) => {
            if (!isSwiping || !this.isPanelOpen) return;
            
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            // Solo permitir deslizar hacia la izquierda para cerrar
            if (diff > 0) {
                e.preventDefault();
                // Mover el panel mientras se desliza
                panel.style.transform = `translateX(-${diff}px)`;
            }
        });

        panel.addEventListener('touchend', (e) => {
            if (!isSwiping || !this.isPanelOpen) return;
            
            isSwiping = false;
            const diff = startX - currentX;
            const swipeThreshold = 50; // Mínimo de píxeles para cerrar
            
            // Restaurar transformación
            panel.style.transform = '';
            panel.style.overflowX = '';
            
            // Cerrar si se deslizó lo suficiente
            if (diff > swipeThreshold) {
                this.cerrarPanelMovil();
            }
        });

        panel.addEventListener('touchcancel', (e) => {
            isSwiping = false;
            panel.style.transform = '';
            panel.style.overflowX = '';
        });
    }

    abrirPanelMovil() {
        const panel = document.getElementById('mobilePanel');
        const overlay = document.getElementById('mobileOverlay');
        
        if (panel && overlay) {
            panel.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.isPanelOpen = true;
            
            console.log('📱 Panel móvil abierto');
        }
    }

    cerrarPanelMovil() {
        const panel = document.getElementById('mobilePanel');
        const overlay = document.getElementById('mobileOverlay');
        
        if (panel && overlay) {
            panel.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            this.isPanelOpen = false;
            
            console.log('📱 Panel móvil cerrado');
        }
    }

    // ... (el resto de los métodos se mantienen igual, solo mejorados los eventos táctiles)

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

        // Configurar eventos táctiles para las capas
        configCapas.forEach(capa => {
            const elemento = document.querySelector(`[data-capa="${capa.id}"]`);
            if (elemento) {
                // Evento click
                elemento.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleCapaMovil(capa.id, elemento);
                });

                // Eventos táctiles
                elemento.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    elemento.style.transform = 'scale(0.98)';
                });

                elemento.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    elemento.style.transform = '';
                    this.toggleCapaMovil(capa.id, elemento);
                });

                elemento.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    elemento.style.transform = '';
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

    // ... (los demás métodos se mantienen igual)

    mostrarMensajeMovil(mensaje, tipo = 'info') {
        // Crear notificación optimizada para táctil
        const notificacion = document.createElement('div');
        notificacion.className = `mobile-notification ${tipo}`;
        notificacion.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${tipo === 'success' ? 'check' : tipo === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
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
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 3000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            animation: slideInDown 0.3s ease;
            max-width: 90%;
            text-align: center;
            font-size: 14px;
            font-weight: 500;
            touch-action: none;
        `;

        document.body.appendChild(notificacion);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }

    // ... (el resto de métodos igual)
}

// AGREGAR ESTILOS DE ANIMACIÓN MEJORADOS
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
    
    @keyframes slideInFromLeft {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutToLeft {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-100%);
        }
    }

    /* MEJORAS DE RENDIMIENTO PARA ANIMACIONES */
    .mobile-panel {
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000;
    }
`;
document.head.appendChild(mobileAnimationStyles);

// INICIALIZACIÓN MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    // Forzar carga sin cache
    if (performance.navigation.type === 1) {
        console.log('🔄 Página recargada - limpiando cache móvil');
        localStorage.setItem('mobileForceReload', Date.now());
    }

    const lastMobileLoad = localStorage.getItem('mobileForceReload');
    const currentTime = Date.now();
    
    if (lastMobileLoad && (currentTime - parseInt(lastMobileLoad)) < 5000) {
        console.log('🔥 Forzando carga móvil sin cache');
        window.location.reload(true);
        return;
    }
    
    console.log('🚀 Inicializando mapa móvil con soporte táctil completo...');
    window.interactiveMap = new InteractiveMap();
    
    localStorage.setItem('mobileForceReload', Date.now());
});
