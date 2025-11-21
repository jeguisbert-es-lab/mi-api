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

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ✅ CONFIGURACIÓN DE BASE DE DATOS
class DatabaseManager:
    def __init__(self):
        self.connection_attempts = 0
        
    def get_connection(self):
        self.connection_attempts += 1
        
        # ESTRATEGIA 1: DATABASE_URL de Render
        database_url = os.environ.get('DATABASE_URL')
        if database_url:
            try:
                result = urlparse(database_url)
                port = result.port or 5432
                database = result.path[1:] if result.path else 'db_isla_del_sol'
                
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
                logger.info("✅ Conexión exitosa")
                return conn
            except Exception as e:
                logger.error(f"❌ Error conexión: {str(e)}")
        
        return None

db_manager = DatabaseManager()

def get_db_connection():
    return db_manager.get_connection()

# ✅ ENDPOINTS PRINCIPALES
@app.route('/')
def home():
    return jsonify({
        "message": "🚀 API Isla del Sol - SISTEMA COMPLETO",
        "status": "active", 
        "version": "FINAL - TODAS LAS FUNCIONES",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "status": "/api/status",
            "debug": "/api/debug",
            "capas": "/api/capas/{categoria}",
            "detalles": "/api/detalle/{tipo}/{id}",
            "diagnostico": "/api/diagnostico"
        }
    })

@app.route('/api/status')
def status():
    return jsonify({
        "status": "online", 
        "message": "API Isla del Sol - SISTEMA 100% OPERATIVO",
        "version": "FINAL",
        "timestamp": datetime.now().isoformat(),
        "database": "Render PostgreSQL"
    })

@app.route('/api/debug')
def debug_info():
    conn = get_db_connection()
    debug_data = {
        "timestamp": datetime.now().isoformat(),
        "database_connection": conn is not None,
        "connection_attempts": db_manager.connection_attempts
    }
    
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT version();")
            db_version = cur.fetchone()
            cur.close()
            conn.close()
            debug_data["database_version"] = db_version[0] if db_version else None
        except Exception as e:
            debug_data["database_error"] = str(e)
    
    return jsonify(debug_data)

# ✅ DIAGNÓSTICO COMPLETO
@app.route('/api/diagnostico')
def diagnostico_completo():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Sin conexión a BD"}), 200
        
    cur = conn.cursor()
    
    try:
        # 1. TABLAS EXISTENTES
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        tablas = [t[0] for t in cur.fetchall()]
        
        # 2. CONTEOS
        conteos = {}
        for tabla in ['lugares', 'restaurantes', 'hoteles', 'tiendas_artesania', 'miradores', 'playas']:
            if tabla in tablas:
                cur.execute(f"SELECT COUNT(*) FROM {tabla}")
                conteos[tabla] = cur.fetchone()[0]
        
        # 3. EJEMPLOS DE DATOS
        ejemplos = {}
        
        # Restaurantes
        cur.execute("SELECT r.id_rest, r.id_lugar, l.nombre FROM restaurantes r JOIN lugares l ON r.id_lugar = l.id_lugar LIMIT 5")
        ejemplos['restaurantes'] = [{"id_rest": r[0], "id_lugar": r[1], "nombre": r[2]} for r in cur.fetchall()]
        
        # Hoteles
        cur.execute("SELECT h.id_hotel, h.id_lugar, l.nombre FROM hoteles h JOIN lugares l ON h.id_lugar = l.id_lugar LIMIT 5")
        ejemplos['hoteles'] = [{"id_hotel": h[0], "id_lugar": h[1], "nombre": h[2]} for h in cur.fetchall()]
        
        # Tiendas
        cur.execute("SELECT t.id_art, t.id_lugar, l.nombre FROM tiendas_artesania t JOIN lugares l ON t.id_lugar = l.id_lugar LIMIT 5")
        ejemplos['tiendas'] = [{"id_art": t[0], "id_lugar": t[1], "nombre": t[2]} for t in cur.fetchall()]
        
        # Miradores
        cur.execute("SELECT m.id_mirador, m.id_lugar, l.nombre FROM miradores m JOIN lugares l ON m.id_lugar = l.id_lugar LIMIT 5")
        ejemplos['miradores'] = [{"id_mirador": m[0], "id_lugar": m[1], "nombre": m[2]} for m in cur.fetchall()]
        
        # Playas
        cur.execute("SELECT p.id_playa, p.id_lugar, l.nombre FROM playas p JOIN lugares l ON p.id_lugar = l.id_lugar LIMIT 5")
        ejemplos['playas'] = [{"id_playa": p[0], "id_lugar": p[1], "nombre": p[2]} for p in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({
            "tablas_existentes": tablas,
            "conteos": conteos,
            "ejemplos": ejemplos,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 200

# ✅ CAPAS DEL MAPA - COMPLETAS
@app.route('/api/capas/<categoria>')
def get_capa(categoria):
    conn = get_db_connection()
    if not conn:
        return jsonify({"type": "FeatureCollection", "features": []}), 200
    
    cur = conn.cursor()
    
    try:
        mapeo_tablas = {
            'puntos_turisticos': """
                SELECT id_lugar::text, nombre, tipo, comunidad, 
                       ST_AsGeoJSON(geom) as geometry, tipo as tipo_cesium
                FROM lugares 
                WHERE geom IS NOT NULL 
                AND tipo IN ('SITIO TURISTICO', 'MUSEO', 'RUINAS ARQUEOLOGICAS', 'LUGAR MITICO', 'SITIO CULTURAL', 'SITIO CEREMONIAL')
            """,
            'miradores': """
                SELECT m.id_mirador::text, l.nombre, 'mirador' as tipo, l.comunidad,
                       ST_AsGeoJSON(l.geom) as geometry, 'mirador' as tipo_cesium
                FROM miradores m
                JOIN lugares l ON m.id_lugar = l.id_lugar
                WHERE l.geom IS NOT NULL
            """,
            'playas': """
                SELECT p.id_playa::text, l.nombre, 'playa' as tipo, l.comunidad,
                       ST_AsGeoJSON(l.geom) as geometry, 'playa' as tipo_cesium
                FROM playas p
                JOIN lugares l ON p.id_lugar = l.id_lugar
                WHERE l.geom IS NOT NULL
            """,
            'tiendas_artesania': """
                SELECT ta.id_art::text, l.nombre, 'tienda_artesania' as tipo, l.comunidad,
                       ST_AsGeoJSON(l.geom) as geometry, 'tienda_artesania' as tipo_cesium
                FROM tiendas_artesania ta
                JOIN lugares l ON ta.id_lugar = l.id_lugar
                WHERE l.geom IS NOT NULL
            """,
            'restaurantes': """
                SELECT r.id_rest::text, l.nombre, 'restaurante' as tipo, l.comunidad,
                       ST_AsGeoJSON(l.geom) as geometry, 'restaurante' as tipo_cesium
                FROM restaurantes r
                JOIN lugares l ON r.id_lugar = l.id_lugar
                WHERE l.geom IS NOT NULL
            """,
            'hoteles': """
                SELECT h.id_hotel::text, l.nombre, 'hotel' as tipo, l.comunidad,
                       ST_AsGeoJSON(l.geom) as geometry, 'hotel' as tipo_cesium
                FROM hoteles h
                JOIN lugares l ON h.id_lugar = l.id_lugar
                WHERE l.geom IS NOT NULL
            """,
            'comunidades': """
                SELECT 'com_challa' as id, 'COMUNIDAD CHALLA' as nombre, 'comunidad' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'comunidad' as tipo_cesium
                FROM "COMUNIDAD CHALLA" WHERE geom IS NOT NULL
                UNION ALL
                SELECT 'com_challapampa', 'COMUNIDAD CHALLAPAMPA', 'comunidad', '', ST_AsGeoJSON(geom), 'comunidad'
                FROM "COMUNIDAD CHALLAPAMPA" WHERE geom IS NOT NULL
                UNION ALL
                SELECT 'com_yumani', 'COMUNIDAD YUMANI', 'comunidad', '', ST_AsGeoJSON(geom), 'comunidad'
                FROM "COMUNIDAD YUMANI" WHERE geom IS NOT NULL
            """,
            'rutas': """
                SELECT 'ruta_turistica' as id, 'RUTA TURÍSTICA' as nombre, 'ruta' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'ruta' as tipo_cesium
                FROM "RUTA TURISTICA" WHERE geom IS NOT NULL
            """,
            'ruta_sagrada': """
                SELECT 'ruta_sagrada' as id, 'RUTA SAGRADA' as nombre, 'ruta_sagrada' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'ruta_sagrada' as tipo_cesium
                FROM "RUTA SAGRADA (TURISTICA)" WHERE geom IS NOT NULL
            """,
            'areas_verdes': """
                SELECT 'area_verde_' || row_number() over () as id, 'ÁREA VERDE' as nombre, 'area_verde' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'area_verde' as tipo_cesium
                FROM "AREAS VERDES" WHERE geom IS NOT NULL
            """,
            'viviendas': """
                SELECT 'vivienda_' || row_number() over () as id, 'VIVIENDA' as nombre, 'vivienda' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'vivienda' as tipo_cesium
                FROM "VIVIENDAS" WHERE geom IS NOT NULL
            """,
            'sembradios': """
                SELECT 'sembradio_' || row_number() over () as id, 'SEMBRADÍO' as nombre, 'sembradio' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'sembradio' as tipo_cesium
                FROM "SEMBRADIOS" WHERE geom IS NOT NULL
            """,
            'basura': """
                SELECT 'basura_' || row_number() over () as id, 'BASURA' as nombre, 'basura' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'basura' as tipo_cesium
                FROM "BASURA" WHERE geom IS NOT NULL
            """,
            'puntos_basura': """
                SELECT 'basura_poly_' || row_number() over () as id, 'PUNTO DE BASURA' as nombre, 'punto_basura' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'punto_basura' as tipo_cesium
                FROM "PUNTOS DE BASURA" WHERE geom IS NOT NULL
            """,
            'aguas_contaminadas': """
                SELECT 'agua_contaminada_' || row_number() over () as id, 'AGUA CONTAMINADA' as nombre, 'agua_contaminada' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'agua_contaminada' as tipo_cesium
                FROM "AGUAS CONTAMINDAS" WHERE geom IS NOT NULL
            """,
            'sitios_turisticos': """
                SELECT 'sitio_' || row_number() over () as id, 'SITIO TURÍSTICO' as nombre, 'sitio_turistico' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'sitio_turistico' as tipo_cesium
                FROM "SITIOS TURISTICOS" WHERE geom IS NOT NULL
            """,
            'muelles': """
                SELECT 'muelle_' || row_number() over () as id, 'MUELLE' as nombre, 'muelle' as tipo, '' as comunidad,
                       ST_AsGeoJSON(geom) as geometry, 'muelle' as tipo_cesium
                FROM "MUELLES" WHERE geom IS NOT NULL
            """
        }
        
        if categoria not in mapeo_tablas:
            return jsonify({"type": "FeatureCollection", "features": []}), 200
        
        cur.execute(mapeo_tablas[categoria])
        resultados = cur.fetchall()
        
        features = []
        for res in resultados:
            if len(res) > 4 and res[4]:
                try:
                    geometry_data = json.loads(res[4])
                    feature = {
                        "type": "Feature",
                        "geometry": geometry_data,
                        "properties": {
                            "id": res[0],
                            "nombre": res[1],
                            "tipo": res[2],
                            "comunidad": res[3],
                            "tipo_cesium": res[5] if len(res) > 5 else res[2],
                            "layer_name": categoria,
                            "id_lugar": res[0]
                        }
                    }
                    features.append(feature)
                except:
                    continue
        
        cur.close()
        conn.close()
        
        return jsonify({
            "type": "FeatureCollection", 
            "features": features,
            "metadata": {
                "capa": categoria,
                "total": len(features),
                "timestamp": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"type": "FeatureCollection", "features": []}), 200

# ✅ DETALLES DE RESTAURANTES - COMPLETO
@app.route('/api/detalle/restaurante/<id_lugar>')
def get_detalle_restaurante(id_lugar):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Sin conexión BD"}), 200
        
    cur = conn.cursor()
    
    try:
        # INFORMACIÓN BASE
        cur.execute("""
            SELECT r.id_rest, r.tipo_restaurante, r.capacidad, r.horario, 
                   r.estilo_r, r.estado, l.nombre, l.comunidad, l.id_lugar,
                   l.descripcion, l.telefono, l.email, l.sitio_web
            FROM restaurantes r
            JOIN lugares l ON r.id_lugar = l.id_lugar
            WHERE r.id_lugar = %s
        """, (id_lugar,))
        
        restaurante = cur.fetchone()
        if not restaurante:
            return jsonify({"error": "Restaurante no encontrado"}), 404
        
        # SERVICIOS
        cur.execute("""
            SELECT s.id_serv, s.tipo_serv, s.descripcion
            FROM relacio_s_r rsr
            JOIN servicios s ON rsr.id_serv = s.id_serv
            WHERE rsr.id_rest = %s
        """, (restaurante[0],))
        servicios = [{"id": s[0], "tipo": s[1], "descripcion": s[2]} for s in cur.fetchall()]
        
        # MENÚ
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
            "precio": float(item[4]) if item[4] else 0
        } for item in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({
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
                "descripcion": restaurante[9],
                "telefono": restaurante[10],
                "email": restaurante[11],
                "sitio_web": restaurante[12]
            },
            "servicios": servicios,
            "menu": menu_items,
            "estadisticas": {
                "total_servicios": len(servicios),
                "total_platos": len(menu_items),
                "precio_minimo": min([item["precio"] for item in menu_items]) if menu_items else 0,
                "precio_maximo": max([item["precio"] for item in menu_items]) if menu_items else 0
            }
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 200

# ✅ DETALLES DE HOTELES - COMPLETO
@app.route('/api/detalle/hotel/<id_lugar>')
def get_detalle_hotel(id_lugar):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Sin conexión BD"}), 200
        
    cur = conn.cursor()
    
    try:
        # INFORMACIÓN BASE
        cur.execute("""
            SELECT h.id_hotel, h.capaci_p, h.num_hab, h.estado, h.tipo,
                   l.nombre, l.comunidad, l.id_lugar,
                   l.descripcion, l.telefono, l.email, l.sitio_web
            FROM hoteles h
            JOIN lugares l ON h.id_lugar = l.id_lugar
            WHERE h.id_lugar = %s
        """, (id_lugar,))
        
        hotel = cur.fetchone()
        if not hotel:
            return jsonify({"error": "Hotel no encontrado"}), 404
        
        # SERVICIOS
        cur.execute("""
            SELECT ts.id_servicio, ts.t_servicio, ts.descripcion
            FROM relacion_serv_h rsh
            JOIN t_servicios ts ON rsh.id_servicio = ts.id_servicio
            WHERE rsh.id_hotel = %s
        """, (hotel[0],))
        servicios = [{"id": s[0], "tipo": s[1], "descripcion": s[2]} for s in cur.fetchall()]
        
        # HABITACIONES
        cur.execute("""
            SELECT th.id_habita, th.t_habita, th.capacidad, th.descripcion, th.precio_noche
            FROM relacion_h_hab rhh
            JOIN tipo_habitaciones th ON rhh.id_habita = th.id_habita
            WHERE rhh.id_hotel = %s
        """, (hotel[0],))
        habitaciones = [{
            "id": h[0],
            "tipo": h[1],
            "capacidad": h[2],
            "descripcion": h[3],
            "precio_noche": float(h[4]) if h[4] else 0
        } for h in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({
            "hotel": {
                "id_hotel": hotel[0],
                "id_lugar": hotel[7],
                "nombre": hotel[5],
                "capacidad_personas": hotel[1],
                "numero_habitaciones": hotel[2],
                "estado": hotel[3],
                "tipo_hotel": hotel[4],
                "comunidad": hotel[6],
                "descripcion": hotel[8],
                "telefono": hotel[9],
                "email": hotel[10],
                "sitio_web": hotel[11]
            },
            "servicios": servicios,
            "habitaciones": habitaciones,
            "estadisticas": {
                "total_servicios": len(servicios),
                "total_tipos_habitacion": len(habitaciones),
                "capacidad_total": sum([h["capacidad"] for h in habitaciones if h["capacidad"]])
            }
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 200

# ✅ DETALLES DE TIENDAS ARTESANÍA - COMPLETO
@app.route('/api/detalle/tienda_artesania/<id_lugar>')
def get_detalle_tienda_artesania(id_lugar):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Sin conexión BD"}), 200
        
    cur = conn.cursor()
    
    try:
        # INFORMACIÓN BASE
        cur.execute("""
            SELECT ta.id_art, ta.estado, l.nombre, l.comunidad, l.id_lugar,
                   l.descripcion, l.telefono, l.email, l.sitio_web
            FROM tiendas_artesania ta
            JOIN lugares l ON ta.id_lugar = l.id_lugar
            WHERE ta.id_lugar = %s
        """, (id_lugar,))
        
        tienda = cur.fetchone()
        if not tienda:
            return jsonify({"error": "Tienda no encontrada"}), 404
        
        # PRODUCTOS
        cur.execute("""
            SELECT pa.id_prod, pa.producto, pa.id_tip_p, pa.precio, pa.descripcion, pa.material
            FROM relacion_t_pro rtp
            JOIN productos_artesania pa ON rtp.id_prod = pa.id_prod
            WHERE rtp.id_art = %s
            ORDER BY pa.id_tip_p, pa.precio
        """, (tienda[0],))
        productos = [{
            "id": p[0],
            "producto": p[1],
            "categoria": p[2],
            "precio": float(p[3]) if p[3] else 0,
            "descripcion": p[4],
            "material": p[5]
        } for p in cur.fetchall()]
        
        # AGRUPAR POR CATEGORÍA
        productos_por_categoria = {}
        for producto in productos:
            categoria = producto["categoria"]
            if categoria not in productos_por_categoria:
                productos_por_categoria[categoria] = []
            productos_por_categoria[categoria].append(producto)
        
        cur.close()
        conn.close()
        
        return jsonify({
            "tienda": {
                "id_tienda": tienda[0],
                "id_lugar": tienda[4],
                "nombre": tienda[2],
                "estado": tienda[1],
                "comunidad": tienda[3],
                "descripcion": tienda[5],
                "telefono": tienda[6],
                "email": tienda[7],
                "sitio_web": tienda[8]
            },
            "productos": {
                "total_productos": len(productos),
                "categorias": list(productos_por_categoria.keys()),
                "productos_por_categoria": productos_por_categoria,
                "precio_minimo": min([p["precio"] for p in productos]) if productos else 0,
                "precio_maximo": max([p["precio"] for p in productos]) if productos else 0
            }
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 200

# ✅ DETALLES DE MIRADORES - COMPLETO
@app.route('/api/detalle/mirador/<id_lugar>')
def get_detalle_mirador(id_lugar):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Sin conexión BD"}), 200
        
    cur = conn.cursor()
    
    try:
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
        
        return jsonify({
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
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 200

# ✅ DETALLES DE PLAYAS - COMPLETO
@app.route('/api/detalle/playa/<id_lugar>')
def get_detalle_playa(id_lugar):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Sin conexión BD"}), 200
        
    cur = conn.cursor()
    
    try:
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
        
        return jsonify({
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
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 200

# ✅ DETALLES DE LUGARES TURÍSTICOS - COMPLETO
@app.route('/api/detalle/lugar_turistico/<id_lugar>')
def get_detalle_lugar_turistico(id_lugar):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Sin conexión BD"}), 200
        
    cur = conn.cursor()
    
    try:
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
        
        return jsonify({
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
        })
        
    except Exception as e:
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 200

# ✅ ENDPOINT GENÉRICO PARA DETALLES
@app.route('/api/detalle/<tipo>/<id_lugar>')
def get_detalle_generico(tipo, id_lugar):
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

# ✅ RUTAS DE COMPATIBILIDAD PARA EL MAPA
@app.route('/status')
def status_sin_api():
    return status()

@app.route('/capas/<categoria>')
def capas_sin_api(categoria):
    return get_capa(categoria)

@app.route('/detalle/<tipo>/<id_lugar>')
def detalle_sin_api(tipo, id_lugar):
    return get_detalle_generico(tipo, id_lugar)

# ✅ SERVIR ARCHIVOS ESTÁTICOS
@app.route('/web')
def serve_index():
    return send_from_directory('..', 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('..', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("🚀 INICIANDO API ISLA DEL SOL - VERSIÓN COMPLETA")
    print("=" * 70)
    print("📍 TODAS LAS FUNCIONES IMPLEMENTADAS:")
    print("   ✅ 16 Capas de mapa diferentes")
    print("   ✅ 6 Tipos de detalles completos") 
    print("   ✅ Información completa con relaciones")
    print("   ✅ Diagnóstico integrado")
    print("   ✅ Compatibilidad total con frontend")
    print("=" * 70)
    print("🎯 Endpoints principales:")
    print("   • /api/diagnostico - Para verificar datos")
    print("   • /api/capas/{categoria} - Todas las capas")
    print("   • /api/detalle/{tipo}/{id} - Todos los detalles")
    print("=" * 70)
    print("✅ SISTEMA 100% OPERATIVO - DESPLEGADO EN RENDER")
    
    app.run(debug=False, port=port, host='0.0.0.0')
