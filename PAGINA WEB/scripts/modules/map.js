class InteractiveMap {
    constructor() {
        this.map = null;
        this.capas = {};
        this.capasActivas = new Set();
        this.marcadoresAgrupados = null;
        this.contadorTotal = 0;
        
        // ✅ URL DE TU API EN RENDER - ACTUALIZADA
        this.API_BASE_URL = 'https://mi-api-6jmx.onrender.com';
        
        this.init();
    }

    init() {
        // Ocultar loading inmediatamente
        this.ocultarLoading();
        
        // Inicializar mapa con mejor configuración
        this.map = L.map('map', {
            zoomControl: false,
            fadeAnimation: true,
            markerZoomAnimation: true,
            preferCanvas: true
        }).setView([-16.0167, -69.1833], 13);

        // ✅ CORREGIDO: URL correcta del tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
            detectRetina: true
        }).addTo(this.map);

        // Agregar control de zoom personalizado
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);

        // Crear interfaz unificada
        this.crearInterfazUnificada();
        
        // Inicializar agrupación de marcadores
        this.inicializarCluster();
        
        // Cargar capas automáticamente
        this.cargarTodasLasCapas();

        console.log('✅ Mapa 2D Isla del Sol - Conectado a Render');
    }

    ocultarLoading() {
        const loading = document.querySelector('.map-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    crearInterfazUnificada() {
        const container = document.querySelector('.map-controls-container');
        if (!container) return;

        container.innerHTML = `
            <!-- Panel de Control Principal - DISEÑO MEJORADO -->
            <div class="control-panel-unified">
                <div class="panel-header">
                    <h3><i class="fas fa-map-marked-alt"></i> Control de Capas</h3>
                    <div class="contador-global" id="contador-global">
                        <i class="fas fa-layer-group"></i> 0 elementos
                    </div>
                </div>
                
                <!-- Controles Rápidos - DISEÑO MEJORADO -->
                <div class="controles-rapidos">
                    <button class="btn-rapido btn-primary" id="btn-activar-todas">
                        <i class="fas fa-layer-group"></i>
                        Activar Todas
                    </button>
                    <button class="btn-rapido btn-secondary" id="btn-desactivar-todas">
                        <i class="fas fa-eye-slash"></i>
                        Ocultar Todas
                    </button>
                    <button class="btn-rapido btn-accent" id="btn-mi-ubicacion">
                        <i class="fas fa-location-crosshairs"></i>
                        Mi Ubicación
                    </button>
                </div>
                
                <!-- Lista de Capas - DISEÑO MEJORADO -->
                <div class="lista-capas" id="lista-capas">
                    <!-- Las capas se generarán dinámicamente -->
                </div>
            </div>
            
            <!-- ✅ LEYENDA INDEPENDIENTE - DISEÑO MEJORADO -->
            <div class="leyenda-independiente">
                <h4><i class="fas fa-palette"></i> Leyenda del Mapa</h4>
                <div class="leyenda-grid">
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #e53e3e;"></span>
                        <span class="leyenda-texto">Puntos Turísticos</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #3182ce;"></span>
                        <span class="leyenda-texto">Comunidades</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #dd6b20;"></span>
                        <span class="leyenda-texto">Rutas</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #38a169;"></span>
                        <span class="leyenda-texto">Áreas Verdes</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #805ad5;"></span>
                        <span class="leyenda-texto">Servicios</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #d69e2e;"></span>
                        <span class="leyenda-texto">Comercio</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #718096;"></span>
                        <span class="leyenda-texto">Puntos Basura</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background: #e53e3e;"></span>
                        <span class="leyenda-texto">Agua Contaminada</span>
                    </div>
                </div>
            </div>
        `;

        // Controles Inferiores - DISEÑO MEJORADO
        const controlesInferiores = document.createElement('div');
        controlesInferiores.className = 'controles-inferiores';
        controlesInferiores.innerHTML = `
            <button class="btn-control-inferior btn-info" id="btn-reset-view">
                <i class="fas fa-location-arrow"></i>
                Centrar Mapa
            </button>
            <button class="btn-control-inferior btn-warning" id="btn-limpiar-capas">
                <i class="fas fa-trash-alt"></i>
                Limpiar Capas
            </button>
            <a href="3D.html" class="btn-control-inferior btn-3d">
                <i class="fas fa-cube"></i>
                Ver en 3D
            </a>
        `;
        container.appendChild(controlesInferiores);

        // Agregar estilos CSS mejorados
        this.agregarEstilosMejorados();

        // Configurar eventos
        this.configurarEventosInterfaz();
        
        // Generar lista de capas
        this.generarListaCapas();
    }

    agregarEstilosMejorados() {
        const styles = `
            <style>
                /* ===== ESTILOS MEJORADOS ===== */
                .map-controls-container {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    max-width: 380px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                /* Panel de Control Principal */
                .control-panel-unified {
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    padding: 24px;
                    color: white;
                    border: 1px solid #4a5568;
                    backdrop-filter: blur(15px);
                    transition: all 0.3s ease;
                }

                .control-panel-unified:hover {
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #4a5568;
                }

                .panel-header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #f7fafc;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .contador-global {
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Controles Rápidos */
                .controles-rapidos {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .btn-rapido {
                    border: none;
                    padding: 14px 12px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                    color: white;
                }

                .btn-primary:hover {
                    background: linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
                }

                .btn-secondary {
                    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                    color: white;
                }

                .btn-secondary:hover {
                    background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
                }

                .btn-accent {
                    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                    color: white;
                }

                .btn-accent:hover {
                    background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(237, 137, 54, 0.4);
                }

                /* Lista de Capas */
                .lista-capas {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 5px;
                }

                .lista-capas::-webkit-scrollbar {
                    width: 6px;
                }

                .lista-capas::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .lista-capas::-webkit-scrollbar-thumb {
                    background: #4299e1;
                    border-radius: 3px;
                }

                .capa-item-mejorado {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    background: rgba(74, 85, 104, 0.3);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                    backdrop-filter: blur(5px);
                }

                .capa-item-mejorado:hover {
                    background: rgba(74, 85, 104, 0.5);
                    border-color: #4299e1;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .capa-item-mejorado input[type="checkbox"] {
                    margin-right: 16px;
                    transform: scale(1.4);
                    accent-color: #4299e1;
                }

                .capa-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-grow: 1;
                }

                .capa-emoji {
                    font-size: 20px;
                    margin-right: 14px;
                    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
                }

                .capa-texto {
                    flex-grow: 1;
                    font-size: 15px;
                    color: #f7fafc;
                    font-weight: 500;
                }

                .capa-contador {
                    background: rgba(26, 32, 44, 0.7);
                    color: #cbd5e0;
                    padding: 6px 12px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: bold;
                    min-width: 35px;
                    text-align: center;
                    border: 1px solid #4a5568;
                    transition: all 0.3s ease;
                }

                .capa-contador.activo {
                    background: #48bb78;
                    color: white;
                    border-color: #38a169;
                }

                /* Leyenda */
                .leyenda-independiente {
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    padding: 24px;
                    color: white;
                    border: 1px solid #4a5568;
                    backdrop-filter: blur(15px);
                }

                .leyenda-independiente h4 {
                    margin: 0 0 20px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #f7fafc;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .leyenda-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .leyenda-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    background: rgba(74, 85, 104, 0.3);
                    border-radius: 8px;
                    border: 1px solid #4a5568;
                    transition: all 0.2s ease;
                }

                .leyenda-item:hover {
                    background: rgba(74, 85, 104, 0.5);
                    transform: translateY(-1px);
                }

                .leyenda-color {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    flex-shrink: 0;
                }

                .leyenda-texto {
                    font-size: 13px;
                    color: #f7fafc;
                    font-weight: 500;
                }

                /* Controles Inferiores */
                .controles-inferiores {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .btn-control-inferior {
                    border: none;
                    padding: 16px 12px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-decoration: none;
                    color: white;
                }

                .btn-info {
                    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                }

                .btn-info:hover {
                    background: linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
                }

                .btn-warning {
                    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                }

                .btn-warning:hover {
                    background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(237, 137, 54, 0.4);
                }

                .btn-3d {
                    background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
                    grid-column: span 2;
                }

                .btn-3d:hover {
                    background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(159, 122, 234, 0.4);
                }

                /* Mensajes Temporales Mejorados */
                .map-mensaje-temporal {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 16px 24px;
                    border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                    z-index: 1000;
                    max-width: 350px;
                    text-align: center;
                    font-weight: 600;
                    animation: slideDown 0.4s ease;
                    color: white;
                    font-size: 15px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                /* Popup Mejorado */
                .popup-isla-sol {
                    max-width: 350px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .popup-isla-sol h3 {
                    color: #2d3748;
                    margin-bottom: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .popup-isla-sol h4 {
                    color: #4299e1;
                    margin: 15px 0 8px 0;
                    font-size: 14px;
                    font-weight: 600;
                }

                /* Animaciones */
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-30px);
                    }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .map-controls-container {
                        max-width: 320px;
                        left: 10px;
                        top: 10px;
                    }
                    
                    .controles-rapidos, .controles-inferiores {
                        grid-template-columns: 1fr;
                    }
                    
                    .btn-3d {
                        grid-column: span 1;
                    }
                    
                    .leyenda-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    configurarEventosInterfaz() {
        // Controles rápidos
        document.getElementById('btn-activar-todas')?.addEventListener('click', () => {
            this.activarTodasLasCapas();
        });
        document.getElementById('btn-desactivar-todas')?.addEventListener('click', () => {
            this.desactivarTodasLasCapas();
        });

        document.getElementById('btn-mi-ubicacion')?.addEventListener('click', () => {
            this.buscarMiUbicacion();
        });
        
        // Controles inferiores
        document.getElementById('btn-reset-view')?.addEventListener('click', () => {
            this.map.flyTo([-16.0167, -69.1833], 13, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        });

        document.getElementById('btn-limpiar-capas')?.addEventListener('click', () => {
            this.limpiarCapas();
        });
    }

    generarListaCapas() {
        const listaCapas = document.getElementById('lista-capas');
        if (!listaCapas) return;

        const configCapas = [
            { id: 'puntos_turisticos', nombre: 'Puntos Turísticos', emoji: '📍', categoria: 'turismo' },
            { id: 'miradores', nombre: 'Miradores', emoji: '🔭', categoria: 'turismo' },
            { id: 'playas', nombre: 'Playas', emoji: '🏖️', categoria: 'turismo' },
            { id: 'tiendas_artesania', nombre: 'Artesanía', emoji: '🎨', categoria: 'comercio' },
            { id: 'restaurantes', nombre: 'Restaurantes', emoji: '🍽️', categoria: 'servicios' },
            { id: 'hoteles', nombre: 'Hoteles', emoji: '🏨', categoria: 'servicios' },
            { id: 'rutas', nombre: 'Rutas Turísticas', emoji: '🗺️', categoria: 'rutas' },
            { id: 'comunidades', nombre: 'Comunidades', emoji: '🏘️', categoria: 'comunidad' },
            { id: 'viviendas', nombre: 'Viviendas', emoji: '🏠', categoria: 'comunidad' },
            { id: 'areas_verdes', nombre: 'Áreas Verdes', emoji: '🌳', categoria: 'naturaleza' },
            { id: 'sembradios', nombre: 'Sembradíos', emoji: '🌾', categoria: 'naturaleza' },
            { id: 'basura', nombre: 'Puntos de Basura', emoji: '🗑️', categoria: 'medio_ambiente' },
            { id: 'puntos_basura', nombre: 'Zonas de Basura', emoji: '🚯', categoria: 'medio_ambiente' },
            { id: 'aguas_contaminadas', nombre: 'Agua Contaminada', emoji: '⚠️', categoria: 'medio_ambiente' }
        ];

        listaCapas.innerHTML = configCapas.map(capa => `
            <label class="capa-item-mejorado" data-capa="${capa.id}">
                <input type="checkbox" id="capa-${capa.id}">
                <div class="capa-info">
                    <span class="capa-emoji">${capa.emoji}</span>
                    <span class="capa-texto">${capa.nombre}</span>
                    <span class="capa-contador" id="contador-${capa.id}">0</span>
                </div>
            </label>
        `).join('');

        // Configurar eventos de checkboxes
        configCapas.forEach(capa => {
            const checkbox = document.getElementById(`capa-${capa.id}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.activarCapa(capa.id);
                    } else {
                        this.desactivarCapa(capa.id);
                    }
                    this.actualizarContadores();
                });
            }
        });
    }

    inicializarCluster() {
        this.marcadoresAgrupados = L.layerGroup().addTo(this.map);
    }

    async cargarTodasLasCapas() {
        console.log('🔄 Cargando TODAS las capas del mapa 2D desde Render...');
        
        try {
            // ✅ PRIMERO VERIFICAR QUE LA API ESTÉ FUNCIONANDO
            const statusResponse = await fetch(`${this.API_BASE_URL}/status`);
            if (!statusResponse.ok) {
                throw new Error('API no responde');
            }
            
            const statusData = await statusResponse.json();
            console.log('✅ API Status:', statusData);

            // ✅ CARGAR TODAS LAS CAPAS
            const todasLasCapas = [
                'puntos_turisticos', 'miradores', 'playas', 'tiendas_artesania',
                'restaurantes', 'hoteles', 'rutas', 'comunidades', 'viviendas',
                'areas_verdes', 'sembradios', 'basura', 'puntos_basura', 'aguas_contaminadas'
            ];
            
            // Cargar todas las capas pero solo activar las principales
            for (const capa of todasLasCapas) {
                await this.cargarCapa(capa);
                
                // Activar solo las capas principales inicialmente
                const capasPrincipales = ['puntos_turisticos', 'comunidades', 'rutas'];
                if (capasPrincipales.includes(capa)) {
                    this.activarCapa(capa);
                    const checkbox = document.getElementById(`capa-${capa}`);
                    if (checkbox) checkbox.checked = true;
                }
            }
            
            console.log('✅ Todas las capas cargadas desde Render');
            this.actualizarContadores();
            this.mostrarMensaje('Mapa cargado correctamente desde Render', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando capas:', error);
            this.mostrarError('Error al conectar con la API en Render');
        } finally {
            // ✅ SIEMPRE OCULTAR LOADING
            this.ocultarLoading();
        }
    }

    async cargarCapa(nombreCapa) {
        if (this.capas[nombreCapa]) {
            return;
        }

        try {
            console.log(`🔄 Cargando capa: ${nombreCapa}`);
            
            // ✅ URL CORRECTA CON /api/ INCLUIDO
            const response = await fetch(`${this.API_BASE_URL}/capas/${nombreCapa}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                this.agregarCapaAlMapa(nombreCapa, data);
                
                // ✅ LIMPIAR DUPLICADOS DESPUÉS DE CARGAR
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
            this.mostrarError(`Error cargando ${nombreCapa}`);
            this.actualizarContadorCapa(nombreCapa, 0);
        }
    }

    agregarCapaAlMapa(nombreCapa, geojsonData) {
        // ✅ VERIFICAR SI LA CAPA YA EXISTE
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
            
            // Actualizar contador visual
            const contador = document.getElementById(`contador-${nombreCapa}`);
            if (contador) {
                contador.classList.add('activo');
            }
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
            
            // Actualizar contador visual
            const contador = document.getElementById(`contador-${nombreCapa}`);
            if (contador) {
                contador.classList.remove('activo');
            }
        }
    }

    activarTodasLasCapas() {
        const checkboxes = document.querySelectorAll('.capa-item-mejorado input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            const capaId = checkbox.id.replace('capa-', '');
            this.activarCapa(capaId);
        });
        this.actualizarContadores();
        this.mostrarMensaje('Todas las capas activadas', 'success');
    }

    desactivarTodasLasCapas() {
        const checkboxes = document.querySelectorAll('.capa-item-mejorado input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const capaId = checkbox.id.replace('capa-', '');
            this.desactivarCapa(capaId);
        });
        this.actualizarContadores();
        this.mostrarMensaje('Todas las capas desactivadas', 'info');
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
                
                <!-- Loading para detalles -->
                <div id="loading-${idLugar}" style="text-align: center; padding: 20px;">
                    <div style="color: #3182ce; font-size: 14px;">
                        <i class="fas fa-spinner fa-spin"></i> Cargando información detallada...
                    </div>
                </div>
                
                <!-- Contenedor para detalles -->
                <div id="detalles-${idLugar}" style="display: none;"></div>
            `;
            
            contenido += `</div>`;
            
            layer.bindPopup(contenido);
            
            // ✅ CARGAR INFORMACIÓN DETALLADA AL ABRIR EL POPUP
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
            
            // Determinar el endpoint según el tipo de capa
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
                    // Para otros tipos, mostrar información básica
                    detallesElement.innerHTML = this.generarContenidoBasico(tipoCapa, nombre);
                    loadingElement.style.display = 'none';
                    detallesElement.style.display = 'block';
                    return;
            }
            
            // ✅ URL CORRECTA CON /api/ INCLUIDO
            const response = await fetch(`${this.API_BASE_URL}/${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Generar contenido según el tipo
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
            
            // Mostrar contenido
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
        
        // Servicios
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
        
        // Menú (mostrar solo los primeros 5 platos)
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
        
        // Servicios
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
        
        // Habitaciones
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
        
        // Productos por categoría
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
        
        // Extraer número del ID (ej: "rest_1" -> 1, "hotel_21" -> 21)
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
        
        const contadorGlobal = document.getElementById('contador-global');
        if (contadorGlobal) {
            contadorGlobal.innerHTML = `<i class="fas fa-layer-group"></i> ${this.contadorTotal} elementos`;
            contadorGlobal.style.background = this.contadorTotal > 0 ? 
                'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 
                'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
        }
    }

    actualizarContadorCapa(nombreCapa, cantidad) {
        const contador = document.getElementById(`contador-${nombreCapa}`);
        if (contador) {
            contador.textContent = cantidad;
            if (cantidad > 0) {
                contador.classList.add('activo');
            } else {
                contador.classList.remove('activo');
            }
        }
    }

    limpiarDuplicadosCapa(nombreCapa) {
        if (!this.capas[nombreCapa]) return;
        
        const capa = this.capas[nombreCapa];
        const layers = capa.getLayers();
        const coordenadasUnicas = new Set();
        const layersUnicos = [];
        
        // Filtrar duplicados por coordenadas
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
        
        // Recrear la capa sin duplicados
        if (layersUnicos.length < layers.length) {
            console.log(`🔄 Eliminando ${layers.length - layersUnicos.length} duplicados de ${nombreCapa}`);
            
            // Remover capa actual
            this.map.removeLayer(capa);
            
            // Crear nueva capa sin duplicados
            const nuevaCapa = L.layerGroup(layersUnicos);
            this.capas[nombreCapa] = nuevaCapa;
            
            // Reactivar si estaba activa
            if (this.capasActivas.has(nombreCapa)) {
                nuevaCapa.addTo(this.map);
            }
            
            this.actualizarContadorCapa(nombreCapa, layersUnicos.length);
        }
    }

    buscarMiUbicacion() {
        if (!navigator.geolocation) {
            this.mostrarError('La geolocalización no es soportada por este navegador');
            return;
        }

        this.mostrarMensaje('Buscando tu ubicación...', 'info');

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

                this.mostrarMensaje('Ubicación encontrada ✅', 'success');
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
                this.mostrarError(mensaje);
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
        
        // Resetear checkboxes
        const checkboxes = document.querySelectorAll('.capa-item-mejorado input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        console.log('🗑️ Todas las capas limpiadas');
        this.actualizarContadores();
        
        this.mostrarMensaje('Todas las capas limpiadas', 'info');
        
        // Recargar capas principales después de un tiempo
        setTimeout(() => {
            this.cargarTodasLasCapas();
        }, 1000);
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        const colores = {
            error: '#e53e3e',
            success: '#38a169',
            info: '#4299e1'
        };

        // Remover mensajes existentes
        const mensajesExistentes = document.querySelectorAll('.map-mensaje-temporal');
        mensajesExistentes.forEach(msg => msg.remove());

        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'map-mensaje-temporal';
        mensajeDiv.style.background = colores[tipo];
        mensajeDiv.innerHTML = `${tipo === 'error' ? '❌' : tipo === 'success' ? '✅' : 'ℹ️'} ${mensaje}`;
        
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.appendChild(mensajeDiv);
            
            setTimeout(() => {
                if (mensajeDiv.parentNode) {
                    mensajeDiv.style.animation = 'slideUp 0.3s ease';
                    setTimeout(() => {
                        if (mensajeDiv.parentNode) {
                            mensajeDiv.parentNode.removeChild(mensajeDiv);
                        }
                    }, 300);
                }
            }, 4000);
        }
    }
}

// Agregar estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// Inicializar mapa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.interactiveMap = new InteractiveMap();
});