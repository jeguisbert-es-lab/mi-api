from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import pg8000
import json
import os
from datetime import datetime
from urllib.parse import urlparse
import ssl
import time
import logging
import traceback

# Configurar logging detallado
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ✅ CONFIGURACIÓN DE BASE DE DATOS - VERSIÓN EXTRA ROBUSTA
class DatabaseManager:
    def __init__(self):
        self.connection_attempts = 0
        self.max_attempts = 3
        
    def get_connection(self):
        """Obtener conexión a PostgreSQL con múltiples estrategias de respaldo"""
        self.connection_attempts += 1
        
        # ESTRATEGIA 1: DATABASE_URL de Render
        database_url = os.environ.get('DATABASE_URL')
        if database_url:
            logger.info("🎯 Intentando conexión con DATABASE_URL de Render")
            conn = self._connect_via_url(database_url)
            if conn:
                return conn
        
        # ESTRATEGIA 2: Datos directos de Render PostgreSQL
        logger.info("🎯 Intentando conexión directa a Render PostgreSQL")
        conn = self._connect_direct()
        if conn:
            return conn
            
        # ESTRATEGIA 3: Conexión local de emergencia
        logger.info("🎯 Intentando conexión local de emergencia")
        conn = self._connect_local()
        if conn:
            return conn
            
        logger.error("❌ Todas las estrategias de conexión fallaron")
        return None
    
    def _connect_via_url(self, database_url):
        """Conectar usando DATABASE_URL"""
        try:
            logger.info(f"🔗 Parseando URL: {database_url}")
            result = urlparse(database_url)
            
            # Asegurar que el puerto esté definido
            port = result.port or 5432
            database = result.path[1:] if result.path else 'db_isla_del_sol'
            
            logger.info(f"📍 Host: {result.hostname}, Puerto: {port}, DB: {database}")
            
            # Configuración SSL
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            conn = pg8000.connect(
                host=result.hostname,
                database=database,
                user=result.username,
                password=result.password,
                port=port,
                ssl_context=ssl_context,
                timeout=20
            )
            logger.info("✅ Conexión vía URL exitosa")
            return conn
            
        except Exception as e:
            logger.error(f"❌ Error en conexión URL: {str(e)}")
            return None
    
    def _connect_direct(self):
        """Conectar usando datos directos de Render"""
        try:
            # DATOS EXACTOS DE TU RENDER POSTGRESQL
            config = {
                'host': 'dpg-d4fvdsufu37c739k369g-a',
                'database': 'db_isla_del_sol', 
                'user': 'db_isla_del_sol_user',
                'password': 'evcwph1e286cfjQJ8flkhkWo0OQNpQTi',
                'port': 5432
            }
            
            logger.info(f"📍 Conectando directamente a: {config['host']}:{config['port']}")
            
            # Configuración SSL
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            conn = pg8000.connect(
                host=config['host'],
                database=config['database'],
                user=config['user'],
                password=config['password'],
                port=config['port'],
                ssl_context=ssl_context,
                timeout=20
            )
            logger.info("✅ Conexión directa exitosa")
            return conn
            
        except Exception as e:
            logger.error(f"❌ Error en conexión directa: {str(e)}")
            return None
    
    def _connect_local(self):
        """Conexión local de emergencia"""
        try:
            config = {
                'host': os.environ.get('DB_HOST', 'localhost'),
                'database': os.environ.get('DB_NAME', 'isla_del_sol'),
                'user': os.environ.get('DB_USER', 'postgres'),
                'password': os.environ.get('DB_PASSWORD', 'password'),
                'port': int(os.environ.get('DB_PORT', '5432'))
            }
            
            logger.info("🔄 Intentando conexión local...")
            conn = pg8000.connect(**config)
            logger.info("✅ Conexión local exitosa")
            return conn
            
        except Exception as e:
            logger.error(f"❌ Error en conexión local: {str(e)}")
            return None

# Instancia global del administrador de base de datos
db_manager = DatabaseManager()

def get_db_connection():
    """Función principal para obtener conexión a la base de datos"""
    return db_manager.get_connection()

# ✅ ENDPOINT RAÍZ MEJORADO
@app.route('/')
def home():
    return jsonify({
        "message": "🚀 API Isla del Sol - SISTEMA COMPLETO CON DETALLES",
        "status": "active", 
        "version": "11.0 - DETALLES COMPLETOS",
        "timestamp": datetime.now().isoformat(),
        "database_status": "Conexión múltiple con respaldo",
        "endpoints": {
            "status": "/api/status",
            "capas": "/api/capas/{categoria}",
            "detalles": "/api/detalle/{tipo}/{id}",
            "debug": "/api/debug",
            "health": "/api/health"
        },
        "detalles_disponibles": [
            "restaurante", "hotel", "tienda_artesania", "lugar_turistico", 
            "mirador", "playa"
        ]
    })

# ✅ ENDPOINT DE DEBUGGING
@app.route('/api/debug')
def debug_info():
    """Endpoint para debugging completo"""
    database_url = os.environ.get('DATABASE_URL')
    debug_data = {
        "timestamp": datetime.now().isoformat(),
        "environment_variables": {
            "DATABASE_URL_exists": bool(database_url),
            "DATABASE_URL_length": len(database_url) if database_url else 0,
            "PORT": os.environ.get('PORT'),
            "PYTHON_VERSION": os.environ.get('PYTHON_VERSION')
        },
        "database_connection_attempts": db_manager.connection_attempts
    }
    
    if database_url:
        result = urlparse(database_url)
        debug_data["parsed_database_url"] = {
            "hostname": result.hostname,
            "port": result.port,
            "database": result.path[1:] if result.path else None,
            "username": result.username,
            "password_length": len(result.password) if result.password else 0
        }
    
    # Probar conexión
    conn = get_db_connection()
    debug_data["database_test"] = {
        "connection_successful": conn is not None,
        "connection_type": str(type(conn)) if conn else None
    }
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT version();")
            db_version = cur.fetchone()
            cur.close()
            conn.close()
            debug_data["database_test"]["version"] = db_version[0] if db_version else None
        except Exception as e:
            debug_data["database_test"]["error"] = str(e)
    
    return jsonify(debug_data)

# ✅ ENDPOINT DE HEALTH CHECK
@app.route('/api/health')
def health_check():
    """Health check simplificado"""
    conn = get_db_connection()
    status = "healthy" if conn else "unhealthy"
    
    if conn:
        conn.close()
    
    return jsonify({
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "database": "connected" if conn else "disconnected"
    })

# ✅ ENDPOINT STATUS MEJORADO
@app.route('/api/status')
def status():
    conn = get_db_connection()
    db_status = "connected" if conn else "disconnected"
    
    if conn:
        conn.close()
    
    return jsonify({
        "status": "online", 
        "message": "API Isla del Sol - DETALLES COMPLETOS ACTIVADOS",
        "version": "11.0",
        "timestamp": datetime.now().isoformat(),
        "database": f"Render PostgreSQL - {db_status}",
        "connection_attempts": db_manager.connection_attempts,
        "detalles_disponibles": [
            "restaurante", "hotel", "tienda_artesania", "lugar_turistico", 
            "mirador", "playa"
        ]
    })

# Servir archivos estáticos
@app.route('/web')
def serve_index():
    return send_from_directory('..', 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('..', path)

# ✅ RUTAS DE COMPATIBILIDAD (SIN /api/) - PARA EL MAPA.JS
@app.route('/status')
def status_sin_api():
    """Ruta de compatibilidad sin /api/ para el mapa"""
    return status()

@app.route('/capas/<categoria>')
def capas_sin_api(categoria):
    """Ruta de compatibilidad sin /api/ para el mapa"""
    return get_capa(categoria)

# ✅ ENDPOINT PARA CAPAS - VERSIÓN ULTRA ROBUSTA
@app.route('/api/capas/<categoria>')
def get_capa(categoria):
    """Endpoint principal para cargar capas del mapa - CON MANEJO DE ERRORES MEJORADO"""
    start_time = time.time()
    logger.info(f"🎯 SOLICITUD DE CAPA: {categoria}")
    
    # Primero intentar conectar a la base de datos
    conn = get_db_connection()
    if not conn:
        logger.error(f"❌ No se pudo conectar a la base de datos para capa: {categoria}")
        return jsonify({
            "type": "FeatureCollection", 
            "features": [],
            "metadata": {
                "capa": categoria,
                "total": 0,
                "error": "No se pudo conectar a la base de datos",
                "fallback_data": True,
                "timestamp": datetime.now().isoformat()
            }
        }), 200
    
    cur = conn.cursor()
    
    try:
        logger.info(f"🔄 Procesando capa: {categoria}")
        
        # CONFIGURACIÓN COMPLETA DE CAPAS
        mapeo_tablas = {
            'puntos_turisticos': {
                'consulta': "SELECT id_lugar::text, nombre, tipo, comunidad, ST_AsGeoJSON(geom) as geometry, tipo as tipo_cesium FROM lugares WHERE geom IS NOT NULL AND tipo IN ('SITIO TURISTICO', 'MUSEO', 'RUINAS ARQUEOLOGICAS', 'LUGAR MITICO', 'SITIO CULTURAL', 'SITIO CEREMONIAL')",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1833, -16.0167]}, "properties": {"id": "1", "nombre": "Templo del Sol", "tipo": "SITIO TURISTICO", "comunidad": "Isla del Sol"}}]
            },
            'miradores': {
                'consulta': "SELECT m.id_mirador::text, l.nombre, 'mirador' as tipo, l.comunidad, ST_AsGeoJSON(l.geom) as geometry, 'mirador' as tipo_cesium FROM miradores m JOIN lugares l ON m.id_lugar = l.id_lugar WHERE l.geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1800, -16.0200]}, "properties": {"id": "1", "nombre": "Mirador Principal", "tipo": "mirador", "comunidad": "Isla del Sol"}}]
            },
            'playas': {
                'consulta': "SELECT p.id_playa::text, l.nombre, 'playa' as tipo, l.comunidad, ST_AsGeoJSON(l.geom) as geometry, 'playa' as tipo_cesium FROM playas p JOIN lugares l ON p.id_lugar = l.id_lugar WHERE l.geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1850, -16.0150]}, "properties": {"id": "1", "nombre": "Playa Principal", "tipo": "playa", "comunidad": "Isla del Sol"}}]
            },
            'tiendas_artesania': {
                'consulta': "SELECT ta.id_art::text, l.nombre, 'tienda_artesania' as tipo, l.comunidad, ST_AsGeoJSON(l.geom) as geometry, 'tienda_artesania' as tipo_cesium FROM tiendas_artesania ta JOIN lugares l ON ta.id_lugar = l.id_lugar WHERE l.geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1820, -16.0180]}, "properties": {"id": "1", "nombre": "Tienda de Artesanía", "tipo": "tienda_artesania", "comunidad": "Isla del Sol"}}]
            },
            'restaurantes': {
                'consulta': "SELECT r.id_rest::text, l.nombre, 'restaurante' as tipo, l.comunidad, ST_AsGeoJSON(l.geom) as geometry, 'restaurante' as tipo_cesium FROM restaurantes r JOIN lugares l ON r.id_lugar = l.id_lugar WHERE l.geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1810, -16.0170]}, "properties": {"id": "1", "nombre": "Restaurante Local", "tipo": "restaurante", "comunidad": "Isla del Sol"}}]
            },
            'hoteles': {
                'consulta': "SELECT h.id_hotel::text, l.nombre, 'hotel' as tipo, l.comunidad, ST_AsGeoJSON(l.geom) as geometry, 'hotel' as tipo_cesium FROM hoteles h JOIN lugares l ON h.id_lugar = l.id_lugar WHERE l.geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1790, -16.0190]}, "properties": {"id": "1", "nombre": "Hotel Isla del Sol", "tipo": "hotel", "comunidad": "Isla del Sol"}}]
            },
            'comunidades': {
                'consulta': """
                    SELECT 'com_challa' as id, 'COMUNIDAD CHALLA' as nombre, 'comunidad' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'comunidad' as tipo_cesium FROM "COMUNIDAD CHALLA" WHERE geom IS NOT NULL
                    UNION ALL SELECT 'com_challapampa', 'COMUNIDAD CHALLAPAMPA', 'comunidad', '', ST_AsGeoJSON(geom), 'comunidad' FROM "COMUNIDAD CHALLAPAMPA" WHERE geom IS NOT NULL
                    UNION ALL SELECT 'com_yumani', 'COMUNIDAD YUMANI', 'comunidad', '', ST_AsGeoJSON(geom), 'comunidad' FROM "COMUNIDAD YUMANI" WHERE geom IS NOT NULL
                """,
                'fallback': [
                    {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1840, -16.0140]}, "properties": {"id": "com_challa", "nombre": "COMUNIDAD CHALLA", "tipo": "comunidad", "comunidad": ""}},
                    {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1780, -16.0220]}, "properties": {"id": "com_challapampa", "nombre": "COMUNIDAD CHALLAPAMPA", "tipo": "comunidad", "comunidad": ""}}
                ]
            },
            'rutas': {
                'consulta': "SELECT 'ruta_turistica' as id, 'RUTA TURÍSTICA' as nombre, 'ruta' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'ruta' as tipo_cesium FROM \"RUTA TURISTICA\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-69.1850, -16.0150], [-69.1800, -16.0200], [-69.1750, -16.0250]]}, "properties": {"id": "ruta_turistica", "nombre": "RUTA TURÍSTICA", "tipo": "ruta", "comunidad": ""}}]
            },
            'ruta_sagrada': {
                'consulta': "SELECT 'ruta_sagrada' as id, 'RUTA SAGRADA' as nombre, 'ruta_sagrada' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'ruta_sagrada' as tipo_cesium FROM \"RUTA SAGRADA (TURISTICA)\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-69.1860, -16.0130], [-69.1820, -16.0180], [-69.1780, -16.0230]]}, "properties": {"id": "ruta_sagrada", "nombre": "RUTA SAGRADA", "tipo": "ruta_sagrada", "comunidad": ""}}]
            },
            'areas_verdes': {
                'consulta': "SELECT 'area_verde_' || row_number() over () as id, 'ÁREA VERDE' as nombre, 'area_verde' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'area_verde' as tipo_cesium FROM \"AREAS VERDES\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[-69.1830, -16.0160], [-69.1820, -16.0160], [-69.1820, -16.0150], [-69.1830, -16.0150], [-69.1830, -16.0160]]]}, "properties": {"id": "area_verde_1", "nombre": "ÁREA VERDE", "tipo": "area_verde", "comunidad": ""}}]
            },
            'viviendas': {
                'consulta': "SELECT 'vivienda_' || row_number() over () as id, 'VIVIENDA' as nombre, 'vivienda' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'vivienda' as tipo_cesium FROM \"VIVIENDAS\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1825, -16.0175]}, "properties": {"id": "vivienda_1", "nombre": "VIVIENDA", "tipo": "vivienda", "comunidad": ""}}]
            },
            'sembradios': {
                'consulta': "SELECT 'sembradio_' || row_number() over () as id, 'SEMBRADÍO' as nombre, 'sembradio' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'sembradio' as tipo_cesium FROM \"SEMBRADIOS\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[-69.1810, -16.0140], [-69.1800, -16.0140], [-69.1800, -16.0130], [-69.1810, -16.0130], [-69.1810, -16.0140]]]}, "properties": {"id": "sembradio_1", "nombre": "SEMBRADÍO", "tipo": "sembradio", "comunidad": ""}}]
            },
            'basura': {
                'consulta': "SELECT 'basura_' || row_number() over () as id, 'BASURA' as nombre, 'basura' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'basura' as tipo_cesium FROM \"BASURA\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1860, -16.0130]}, "properties": {"id": "basura_1", "nombre": "BASURA", "tipo": "basura", "comunidad": ""}}]
            },
            'puntos_basura': {
                'consulta': "SELECT 'basura_poly_' || row_number() over () as id, 'PUNTO DE BASURA' as nombre, 'punto_basura' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'punto_basura' as tipo_cesium FROM \"PUNTOS DE BASURA\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1870, -16.0120]}, "properties": {"id": "basura_poly_1", "nombre": "PUNTO DE BASURA", "tipo": "punto_basura", "comunidad": ""}}]
            },
            'aguas_contaminadas': {
                'consulta': "SELECT 'agua_contaminada_' || row_number() over () as id, 'AGUA CONTAMINADA' as nombre, 'agua_contaminada' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'agua_contaminada' as tipo_cesium FROM \"AGUAS CONTAMINDAS\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[-69.1880, -16.0110], [-69.1870, -16.0110], [-69.1870, -16.0100], [-69.1880, -16.0100], [-69.1880, -16.0110]]]}, "properties": {"id": "agua_contaminada_1", "nombre": "AGUA CONTAMINADA", "tipo": "agua_contaminada", "comunidad": ""}}]
            },
            'sitios_turisticos': {
                'consulta': "SELECT 'sitio_' || row_number() over () as id, 'SITIO TURÍSTICO' as nombre, 'sitio_turistico' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'sitio_turistico' as tipo_cesium FROM \"SITIOS TURISTICOS\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1845, -16.0165]}, "properties": {"id": "sitio_1", "nombre": "SITIO TURÍSTICO", "tipo": "sitio_turistico", "comunidad": ""}}]
            },
            'muelles': {
                'consulta': "SELECT 'muelle_' || row_number() over () as id, 'MUELLE' as nombre, 'muelle' as tipo, '' as comunidad, ST_AsGeoJSON(geom) as geometry, 'muelle' as tipo_cesium FROM \"MUELLES\" WHERE geom IS NOT NULL",
                'fallback': [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-69.1890, -16.0090]}, "properties": {"id": "muelle_1", "nombre": "MUELLE", "tipo": "muelle", "comunidad": ""}}]
            }
        }
        
        if categoria not in mapeo_tablas:
            logger.warning(f"⚠️ Capa no configurada: {categoria}")
            return jsonify({
                "type": "FeatureCollection", 
                "features": [],
                "metadata": {
                    "capa": categoria, 
                    "total": 0, 
                    "message": "Capa no configurada",
                    "timestamp": datetime.now().isoformat()
                }
            })
        
        consulta = mapeo_tablas[categoria]['consulta']
        fallback_data = mapeo_tablas[categoria]['fallback']
        
        # Ejecutar consulta con manejo de errores
        try:
            logger.info(f"📊 Ejecutando consulta para: {categoria}")
            cur.execute(consulta)
            resultados = cur.fetchall()
            logger.info(f"📊 Resultados obtenidos: {len(resultados)}")
            
        except Exception as query_error:
            logger.error(f"❌ Error en consulta SQL para {categoria}: {str(query_error)}")
            # Usar datos de respaldo
            resultados = []
        
        features = []
        
        if resultados:
            # Procesar resultados reales de la base de datos
            for res in resultados:
                if len(res) > 4 and res[4]:  # Si tiene geometría
                    try:
                        geometry_data = json.loads(res[4])
                        feature = {
                            "type": "Feature",
                            "geometry": geometry_data,
                            "properties": {
                                "id": res[0],
                                "nombre": res[1],
                                "tipo": res[2],
                                "comunidad": res[3] if len(res) > 3 else "",
                                "tipo_cesium": res[5] if len(res) > 5 else res[2],
                                "layer_name": categoria,
                                "id_lugar": res[0],
                                "source": "database"
                            }
                        }
                        features.append(feature)
                    except json.JSONDecodeError as e:
                        logger.warning(f"⚠️ Error decodificando geometría: {e}")
                        continue
        else:
            # Usar datos de respaldo
            logger.info(f"🔄 Usando datos de respaldo para: {categoria}")
            features = fallback_data
            for feature in features:
                feature['properties']['source'] = 'fallback'
        
        cur.close()
        conn.close()
        
        processing_time = time.time() - start_time
        logger.info(f"✅ {categoria}: {len(features)} elementos en {processing_time:.2f}s")
        
        return jsonify({
            "type": "FeatureCollection", 
            "features": features,
            "metadata": {
                "capa": categoria,
                "total": len(features),
                "processing_time": f"{processing_time:.2f}s",
                "data_source": "fallback" if not resultados else "database",
                "timestamp": datetime.now().isoformat(),
                "message": "Datos de respaldo" if not resultados else "Datos reales"
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error crítico en {categoria}: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            try:
                cur.close()
                conn.close()
            except:
                pass
        
        # ✅ NUNCA devolver error 500 - siempre devolver datos válidos
        return jsonify({
            "type": "FeatureCollection", 
            "features": [],
            "metadata": {
                "capa": categoria,
                "total": 0,
                "error": str(e),
                "fallback_activated": True,
                "timestamp": datetime.now().isoformat(),
                "message": "Sistema de respaldo activado"
            }
        })

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE RESTAURANTES
@app.route('/api/detalle/restaurante/<int:id_lugar>')
def get_detalle_restaurante(id_lugar):
    """Obtiene información detallada de un restaurante con todas las relaciones"""
    conn = get_db_connection()
    if not conn:
        return jsonify({
            "error": "No se pudo conectar a la base de datos",
            "fallback": True,
            "message": "Modo de respaldo activado"
        }), 200
        
    cur = conn.cursor()
    
    try:
        logger.info(f"🍽️ Obteniendo detalles del restaurante ID: {id_lugar}")
        
        # 1. INFORMACIÓN BÁSICA DEL RESTAURANTE
        cur.execute("""
            SELECT r.id_rest, r.tipo_restaurante, r.capacidad, r.horario, 
                   r.estilo_r, r.estado, l.nombre, l.comunidad, l.id_lugar
            FROM restaurantes r
            JOIN lugares l ON r.id_lugar = l.id_lugar
            WHERE r.id_lugar = %s
        """, (id_lugar,))
        
        restaurante = cur.fetchone()
        if not restaurante:
            return jsonify({"error": "Restaurante no encontrado"}), 404
        
        # 2. SERVICIOS DEL RESTAURANTE (relacio_s_r)
        cur.execute("""
            SELECT s.id_serv, s.tipo_serv, s.descripcion
            FROM relacio_s_r rsr
            JOIN servicios s ON rsr.id_serv = s.id_serv
            WHERE rsr.id_rest = %s
        """, (restaurante[0],))
        servicios = [{"id": serv[0], "tipo": serv[1], "descripcion": serv[2]} for serv in cur.fetchall()]
        
        # 3. MENÚ DEL RESTAURANTE (relacion_r_m)
        cur.execute("""
            SELECT m.id_menu, m.t_plato, m.descripcion, m.categoria, rm.precio
            FROM relacion_r_m rm
            JOIN menu m ON rm.id_menu = m.id_menu
            WHERE rm.id_rest = %s
            ORDER BY rm.precio ASC
        """, (restaurante[0],))
        menu_items = [{
            "id": item[0], 
            "plato": item[1], 
            "descripcion": item[2],
            "categoria": item[3],
            "precio": float(item[4])
        } for item in cur.fetchall()]
        
        # 4. INFORMACIÓN ADICIONAL DEL LUGAR
        cur.execute("""
            SELECT descripcion, telefono, email, sitio_web
            FROM lugares 
            WHERE id_lugar = %s
        """, (id_lugar,))
        lugar_info = cur.fetchone()
        
        lugar_data = {
            "descripcion": lugar_info[0] if lugar_info else None,
            "telefono": lugar_info[1] if lugar_info else None,
            "email": lugar_info[2] if lugar_info else None,
            "sitio_web": lugar_info[3] if lugar_info else None
        }
        
        cur.close()
        conn.close()
        
        # ESTRUCTURA COMPLETA DE RESPUESTA
        response_data = {
            "restaurante": {
                "id_restaurante": restaurante[0],
                "id_lugar": restaurante[8],
                "nombre": restaurante[6],
                "tipo_restaurante": restaurante[1],
                "capacidad": restaurante[2],
                "horario": restaurante[3],
                "estilo_culinario": restaurante[4],
                "estado": restaurante[5],
                "comunidad": restaurante[7],
                **lugar_data
            },
            "servicios": {
                "total": len(servicios),
                "items": servicios
            },
            "menu": {
                "total_platos": len(menu_items),
                "items": menu_items,
                "precio_minimo": min([item["precio"] for item in menu_items]) if menu_items else 0,
                "precio_maximo": max([item["precio"] for item in menu_items]) if menu_items else 0
            },
            "estadisticas": {
                "total_servicios": len(servicios),
                "total_platos": len(menu_items),
                "categorias_platos": list(set([item["categoria"] for item in menu_items if item["categoria"]]))
            }
        }
        
        logger.info(f"✅ Detalles de restaurante obtenidos: {len(servicios)} servicios, {len(menu_items)} platos")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle restaurante: {e}")
        logger.error(traceback.format_exc())
        if conn:
            try:
                cur.close()
                conn.close()
            except:
                pass
        return jsonify({
            "error": str(e),
            "fallback": True,
            "message": "Error en detalles del restaurante"
        }), 200

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE HOTELES
@app.route('/api/detalle/hotel/<int:id_lugar>')
def get_detalle_hotel(id_lugar):
    """Obtiene información detallada de un hotel con todas las relaciones"""
    conn = get_db_connection()
    if not conn:
        return jsonify({
            "error": "No se pudo conectar a la base de datos",
            "fallback": True,
            "message": "Modo de respaldo activado"
        }), 200
        
    cur = conn.cursor()
    
    try:
        logger.info(f"🏨 Obteniendo detalles del hotel ID: {id_lugar}")
        
        # 1. INFORMACIÓN BÁSICA DEL HOTEL
        cur.execute("""
            SELECT h.id_hotel, h.capaci_p, h.num_hab, h.estado, h.tipo,
                   l.nombre, l.comunidad, l.id_lugar
            FROM hoteles h
            JOIN lugares l ON h.id_lugar = l.id_lugar
            WHERE h.id_lugar = %s
        """, (id_lugar,))
        
        hotel = cur.fetchone()
        if not hotel:
            return jsonify({"error": "Hotel no encontrado"}), 404
        
        # 2. SERVICIOS DEL HOTEL (relacion_serv_h)
        cur.execute("""
            SELECT ts.id_servicio, ts.t_servicio, ts.descripcion
            FROM relacion_serv_h rsh
            JOIN t_servicios ts ON rsh.id_servicio = ts.id_servicio
            WHERE rsh.id_hotel = %s
        """, (hotel[0],))
        servicios = [{"id": serv[0], "tipo": serv[1], "descripcion": serv[2]} for serv in cur.fetchall()]
        
        # 3. HABITACIONES DEL HOTEL (relacion_h_hab)
        cur.execute("""
            SELECT th.id_habita, th.t_habita, th.capacidad, th.descripcion, th.precio_noche
            FROM relacion_h_hab rhh
            JOIN tipo_habitaciones th ON rhh.id_habita = th.id_habita
            WHERE rhh.id_hotel = %s
        """, (hotel[0],))
        habitaciones = [{
            "id": hab[0],
            "tipo": hab[1],
            "capacidad": hab[2],
            "descripcion": hab[3],
            "precio_noche": float(hab[4]) if hab[4] else None
        } for hab in cur.fetchall()]
        
        # 4. INFORMACIÓN ADICIONAL DEL LUGAR
        cur.execute("""
            SELECT descripcion, telefono, email, sitio_web
            FROM lugares 
            WHERE id_lugar = %s
        """, (id_lugar,))
        lugar_info = cur.fetchone()
        
        lugar_data = {
            "descripcion": lugar_info[0] if lugar_info else None,
            "telefono": lugar_info[1] if lugar_info else None,
            "email": lugar_info[2] if lugar_info else None,
            "sitio_web": lugar_info[3] if lugar_info else None
        }
        
        cur.close()
        conn.close()
        
        # ESTRUCTURA COMPLETA DE RESPUESTA
        response_data = {
            "hotel": {
                "id_hotel": hotel[0],
                "id_lugar": hotel[7],
                "nombre": hotel[5],
                "capacidad_personas": hotel[1],
                "numero_habitaciones": hotel[2],
                "estado": hotel[3],
                "tipo_hotel": hotel[4],
                "comunidad": hotel[6],
                **lugar_data
            },
            "servicios": {
                "total": len(servicios),
                "items": servicios
            },
            "habitaciones": {
                "total_tipos": len(habitaciones),
                "items": habitaciones,
                "capacidad_total": sum([hab["capacidad"] for hab in habitaciones if hab["capacidad"]])
            },
            "estadisticas": {
                "total_servicios": len(servicios),
                "total_tipos_habitacion": len(habitaciones),
                "capacidad_total_personas": hotel[1]
            }
        }
        
        logger.info(f"✅ Detalles de hotel obtenidos: {len(servicios)} servicios, {len(habitaciones)} tipos de habitación")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle hotel: {e}")
        logger.error(traceback.format_exc())
        if conn:
            try:
                cur.close()
                conn.close()
            except:
                pass
        return jsonify({
            "error": str(e),
            "fallback": True,
            "message": "Error en detalles del hotel"
        }), 200

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE TIENDAS DE ARTESANÍA
@app.route('/api/detalle/tienda_artesania/<int:id_lugar>')
def get_detalle_tienda_artesania(id_lugar):
    """Obtiene información detallada de una tienda de artesanía con productos"""
    conn = get_db_connection()
    if not conn:
        return jsonify({
            "error": "No se pudo conectar a la base de datos",
            "fallback": True,
            "message": "Modo de respaldo activado"
        }), 200
        
    cur = conn.cursor()
    
    try:
        logger.info(f"🎨 Obteniendo detalles de tienda de artesanía ID: {id_lugar}")
        
        # 1. INFORMACIÓN BÁSICA DE LA TIENDA
        cur.execute("""
            SELECT ta.id_art, ta.estado, l.nombre, l.comunidad, l.id_lugar
            FROM tiendas_artesania ta
            JOIN lugares l ON ta.id_lugar = l.id_lugar
            WHERE ta.id_lugar = %s
        """, (id_lugar,))
        
        tienda = cur.fetchone()
        if not tienda:
            return jsonify({"error": "Tienda no encontrada"}), 404
        
        # 2. PRODUCTOS DE LA TIENDA (relacion_t_pro)
        cur.execute("""
            SELECT pa.id_prod, pa.producto, pa.id_tip_p, pa.precio, pa.descripcion, pa.material
            FROM relacion_t_pro rtp
            JOIN productos_artesania pa ON rtp.id_prod = pa.id_prod
            WHERE rtp.id_art = %s
            ORDER BY pa.id_tip_p, pa.precio
        """, (tienda[0],))
        productos = [{
            "id": prod[0],
            "producto": prod[1],
            "categoria": prod[2],
            "precio": float(prod[3]),
            "descripcion": prod[4],
            "material": prod[5]
        } for prod in cur.fetchall()]
        
        # 3. INFORMACIÓN ADICIONAL DEL LUGAR
        cur.execute("""
            SELECT descripcion, telefono, email, sitio_web
            FROM lugares 
            WHERE id_lugar = %s
        """, (id_lugar,))
        lugar_info = cur.fetchone()
        
        lugar_data = {
            "descripcion": lugar_info[0] if lugar_info else None,
            "telefono": lugar_info[1] if lugar_info else None,
            "email": lugar_info[2] if lugar_info else None,
            "sitio_web": lugar_info[3] if lugar_info else None
        }
        
        # 4. AGRUPAR PRODUCTOS POR CATEGORÍA
        productos_por_categoria = {}
        for producto in productos:
            categoria = producto["categoria"]
            if categoria not in productos_por_categoria:
                productos_por_categoria[categoria] = []
            productos_por_categoria[categoria].append(producto)
        
        cur.close()
        conn.close()
        
        # ESTRUCTURA COMPLETA DE RESPUESTA
        response_data = {
            "tienda": {
                "id_tienda": tienda[0],
                "id_lugar": tienda[4],
                "nombre": tienda[2],
                "estado": tienda[1],
                "comunidad": tienda[3],
                **lugar_data
            },
            "productos": {
                "total_productos": len(productos),
                "categorias": list(productos_por_categoria.keys()),
                "productos_por_categoria": productos_por_categoria,
                "precio_minimo": min([prod["precio"] for prod in productos]) if productos else 0,
                "precio_maximo": max([prod["precio"] for prod in productos]) if productos else 0
            },
            "estadisticas": {
                "total_productos": len(productos),
                "total_categorias": len(productos_por_categoria),
                "materiales": list(set([prod["material"] for prod in productos if prod["material"]]))
            }
        }
        
        logger.info(f"✅ Detalles de tienda obtenidos: {len(productos)} productos en {len(productos_por_categoria)} categorías")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle tienda: {e}")
        logger.error(traceback.format_exc())
        if conn:
            try:
                cur.close()
                conn.close()
            except:
                pass
        return jsonify({
            "error": str(e),
            "fallback": True,
            "message": "Error en detalles de la tienda"
        }), 200

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE LUGARES TURÍSTICOS
@app.route('/api/detalle/lugar_turistico/<int:id_lugar>')
def get_detalle_lugar_turistico(id_lugar):
    """Obtiene información detallada de un lugar turístico"""
    conn = get_db_connection()
    if not conn:
        return jsonify({
            "error": "No se pudo conectar a la base de datos",
            "fallback": True,
            "message": "Modo de respaldo activado"
        }), 200
        
    cur = conn.cursor()
    
    try:
        logger.info(f"📍 Obteniendo detalles de lugar turístico ID: {id_lugar}")
        
        # INFORMACIÓN DEL LUGAR TURÍSTICO
        cur.execute("""
            SELECT lt.nombre, lt.tipo, lt.accesibilidad, lt.afluencia, 
                   lt.descripcion, l.comunidad, l.id_lugar,
                   l.descripcion as descripcion_lugar, l.telefono, l.email, l.sitio_web
            FROM lugares_turisticos lt
            JOIN lugares l ON lt.id_lugar = l.id_lugar
            WHERE lt.id_lugar = %s
        """, (id_lugar,))
        
        lugar = cur.fetchone()
        if not lugar:
            return jsonify({"error": "Lugar turístico no encontrado"}), 404
        
        cur.close()
        conn.close()
        
        # ESTRUCTURA COMPLETA DE RESPUESTA
        response_data = {
            "lugar_turistico": {
                "id_lugar": lugar[6],
                "nombre": lugar[0],
                "tipo": lugar[1],
                "accesibilidad": lugar[2],
                "afluencia": lugar[3],
                "descripcion_especifica": lugar[4],
                "comunidad": lugar[5],
                "descripcion_general": lugar[7],
                "telefono": lugar[8],
                "email": lugar[9],
                "sitio_web": lugar[10]
            }
        }
        
        logger.info(f"✅ Detalles de lugar turístico obtenidos: {lugar[0]}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle lugar turístico: {e}")
        logger.error(traceback.format_exc())
        if conn:
            try:
                cur.close()
                conn.close()
            except:
                pass
        return jsonify({
            "error": str(e),
            "fallback": True,
            "message": "Error en detalles del lugar turístico"
        }), 200

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE MIRADORES
@app.route('/api/detalle/mirador/<int:id_lugar>')
def get_detalle_mirador(id_lugar):
    """Obtiene información detallada de un mirador"""
    conn = get_db_connection()
    if not conn:
        return jsonify({
            "error": "No se pudo conectar a la base de datos",
            "fallback": True,
            "message": "Modo de respaldo activado"
        }), 200
        
    cur = conn.cursor()
    
    try:
        logger.info(f"🔭 Obteniendo detalles del mirador ID: {id_lugar}")
        
        cur.execute("""
            SELECT m.d_acceso, m.estado, m.afluencia, m.p_cercano,
                   l.nombre, l.comunidad, l.id_lugar,
                   l.descripcion, l.telefono, l.email, l.sitio_web
            FROM miradores m
            JOIN lugares l ON m.id_lugar = l.id_lugar
            WHERE m.id_lugar = %s
        """, (id_lugar,))
        
        mirador = cur.fetchone()
        if not mirador:
            return jsonify({"error": "Mirador no encontrado"}), 404
        
        cur.close()
        conn.close()
        
        # ESTRUCTURA COMPLETA DE RESPUESTA
        response_data = {
            "mirador": {
                "id_lugar": mirador[6],
                "nombre": mirador[4],
                "dificultad_acceso": mirador[0],
                "estado": mirador[1],
                "afluencia": mirador[2],
                "puntos_cercanos": mirador[3],
                "comunidad": mirador[5],
                "descripcion": mirador[7],
                "telefono": mirador[8],
                "email": mirador[9],
                "sitio_web": mirador[10]
            }
        }
        
        logger.info(f"✅ Detalles de mirador obtenidos: {mirador[4]}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle mirador: {e}")
        logger.error(traceback.format_exc())
        if conn:
            try:
                cur.close()
                conn.close()
            except:
                pass
        return jsonify({
            "error": str(e),
            "fallback": True,
            "message": "Error en detalles del mirador"
        }), 200

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE PLAYAS
@app.route('/api/detalle/playa/<int:id_lugar>')
def get_detalle_playa(id_lugar):
    """Obtiene información detallada de una playa"""
    conn = get_db_connection()
    if not conn:
        return jsonify({
            "error": "No se pudo conectar a la base de datos",
            "fallback": True,
            "message": "Modo de respaldo activado"
        }), 200
        
    cur = conn.cursor()
    
    try:
        logger.info(f"🏖️ Obteniendo detalles de la playa ID: {id_lugar}")
        
        cur.execute("""
            SELECT p.acceso, p.d_acceso, p.tipo, p.estado, p.afluencia, p.p_cercano,
                   l.nombre, l.comunidad, l.id_lugar,
                   l.descripcion, l.telefono, l.email, l.sitio_web
            FROM playas p
            JOIN lugares l ON p.id_lugar = l.id_lugar
            WHERE p.id_lugar = %s
        """, (id_lugar,))
        
        playa = cur.fetchone()
        if not playa:
            return jsonify({"error": "Playa no encontrada"}), 404
        
        cur.close()
        conn.close()
        
        # ESTRUCTURA COMPLETA DE RESPUESTA
        response_data = {
            "playa": {
                "id_lugar": playa[8],
                "nombre": playa[6],
                "acceso": playa[0],
                "dificultad_acceso": playa[1],
                "tipo_playa": playa[2],
                "estado": playa[3],
                "afluencia": playa[4],
                "puntos_cercanos": playa[5],
                "comunidad": playa[7],
                "descripcion": playa[9],
                "telefono": playa[10],
                "email": playa[11],
                "sitio_web": playa[12]
            }
        }
        
        logger.info(f"✅ Detalles de playa obtenidos: {playa[6]}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle playa: {e}")
        logger.error(traceback.format_exc())
        if conn:
            try:
                cur.close()
                conn.close()
            except:
                pass
        return jsonify({
            "error": str(e),
            "fallback": True,
            "message": "Error en detalles de la playa"
        }), 200

# ✅ ENDPOINT MEJORADO PARA DETALLES GENÉRICOS
@app.route('/api/detalle/<tipo>/<int:id_lugar>')
def get_detalle_generico(tipo, id_lugar):
    """Endpoint genérico para obtener detalles de cualquier tipo"""
    endpoints = {
        'restaurante': get_detalle_restaurante,
        'hotel': get_detalle_hotel,
        'tienda_artesania': get_detalle_tienda_artesania,
        'lugar_turistico': get_detalle_lugar_turistico,
        'mirador': get_detalle_mirador,
        'playa': get_detalle_playa
    }
    
    if tipo in endpoints:
        return endpoints[tipo](id_lugar)
    else:
        return jsonify({"error": f"Tipo {tipo} no soportado"}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("🚀 INICIANDO API ISLA DEL SOL - VERSIÓN 11.0 DETALLES COMPLETOS")
    print("=" * 70)
    print("📍 SISTEMA DE CONEXIÓN MÚLTIPLE ACTIVADO")
    print("📍 DETALLES COMPLETOS CON RELACIONES")
    print("📍 MANEJO DE ERRORES ROBUSTO")
    print("📊 Endpoints de detalles disponibles:")
    print(f"   • Restaurantes: /api/detalle/restaurante/1")
    print(f"   • Hoteles: /api/detalle/hotel/1") 
    print(f"   • Tiendas: /api/detalle/tienda_artesania/1")
    print(f"   • Lugares turísticos: /api/detalle/lugar_turistico/1")
    print(f"   • Miradores: /api/detalle/mirador/1")
    print(f"   • Playas: /api/detalle/playa/1")
    print("=" * 70)
    print("🎯 INFORMACIÓN INCLUIDA:")
    print("   ✅ Datos básicos + relaciones completas")
    print("   ✅ Servicios, menús, habitaciones, productos")
    print("   ✅ Información de contacto y descripciones")
    print("   ✅ Estadísticas y agrupaciones")
    print("=" * 70)
    print("✅ EL SISTEMA ESTÁ 100% LISTO - DETALLES COMPLETOS ACTIVADOS")

    app.run(debug=False, port=port, host='0.0.0.0')


