from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import pg8000
import json
import os
from datetime import datetime
from urllib.parse import urlparse
import ssl
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ✅ CONFIGURACIÓN DE BASE DE DATOS - VERSIÓN SIMPLIFICADA
def get_db_connection():
    try:
        database_url = os.environ.get('DATABASE_URL')
        if database_url:
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

# ✅ ENDPOINTS PRINCIPALES - IDÉNTICOS A TU API LOCAL
@app.route('/')
def home():
    return jsonify({
        "message": "🚀 API Isla del Sol - RENDER",
        "status": "active", 
        "version": "RENDER - IDÉNTICO A LOCAL",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/status')
def status():
    return jsonify({
        "status": "online", 
        "message": "API Isla del Sol - RENDER",
        "version": "1.0",
        "timestamp": datetime.now().isoformat(),
        "capas_disponibles": [
            "puntos_turisticos", "miradores", "playas", "tiendas_artesania",
            "restaurantes", "hoteles", "rutas", "comunidades", "areas_verdes", 
            "viviendas", "sembradios", "basura", "puntos_basura", "aguas_contaminadas"
        ]
    })

# ✅ ENDPOINT PARA CAPAS - EXACTAMENTE IGUAL A TU API LOCAL
@app.route('/api/capas/<categoria>')
def get_capa(categoria):
    """Endpoint principal para cargar capas del mapa - IDÉNTICO A LOCAL"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        logger.info(f"🎯 Cargando capa: {categoria}")
        
        # CONFIGURACIÓN EXACTA DE TU API LOCAL
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
            """
        }
        
        if categoria not in mapeo_tablas:
            return jsonify({
                "type": "FeatureCollection", 
                "features": [],
                "metadata": {"capa": categoria, "total": 0, "message": "Capa no configurada"}
            })
        
        consulta = mapeo_tablas[categoria]
        
        # Ejecutar consulta
        cur.execute(consulta)
        resultados = cur.fetchall()
        
        features = []
        for res in resultados:
            if res[4]:  # Si tiene geometría
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
                            "tipo_cesium": res[5],
                            "layer_name": categoria,
                            "id_lugar": res[0]  # Para los detalles
                        }
                    }
                    features.append(feature)
                except json.JSONDecodeError as e:
                    logger.warning(f"Error geometría: {e}")
                    continue
        
        cur.close()
        conn.close()
        
        logger.info(f"✅ {categoria}: {len(features)} elementos")
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
        logger.error(f"❌ Error en {categoria}: {str(e)}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({
            "type": "FeatureCollection", 
            "features": [],
            "metadata": {
                "capa": categoria,
                "total": 0,
                "error": str(e)
            }
        })

# ✅ ENDPOINT PARA DETALLES DE RESTAURANTES - EXACTO A TU API LOCAL
@app.route('/api/detalle/restaurante/<id_lugar>')
def get_detalle_restaurante(id_lugar):
    """Obtiene información detallada de un restaurante con relaciones - IDÉNTICO A LOCAL"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        # Información básica del restaurante - EXACTA A TU LOCAL
        cur.execute("""
            SELECT r.id_rest, r.tipo_restaurante, r.capacidad, r.horario, 
                   r.estilo_r, r.estado, l.nombre, l.comunidad
            FROM restaurantes r
            JOIN lugares l ON r.id_lugar = l.id_lugar
            WHERE r.id_lugar = %s
        """, (id_lugar,))
        
        restaurante = cur.fetchone()
        if not restaurante:
            return jsonify({"error": "Restaurante no encontrado"}), 404
        
        # Servicios del restaurante - EXACTO
        cur.execute("""
            SELECT s.tipo_serv
            FROM relacio_s_r rsr
            JOIN servicios s ON rsr.id_serv = s.id_serv
            WHERE rsr.id_rest = %s
        """, (restaurante[0],))
        servicios = [servicio[0] for servicio in cur.fetchall()]
        
        # Menú del restaurante - EXACTO  
        cur.execute("""
            SELECT m.t_plato, rm.precio
            FROM relacion_r_m rm
            JOIN menu m ON rm.id_menu = m.id_menu
            WHERE rm.id_rest = %s
            ORDER BY rm.precio ASC
        """, (restaurante[0],))
        menu_items = [{"plato": item[0], "precio": float(item[1])} for item in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({
            "restaurante": {
                "id": restaurante[0],
                "tipo": restaurante[1],
                "capacidad": restaurante[2],
                "horario": restaurante[3],
                "estilo": restaurante[4],
                "estado": restaurante[5],
                "nombre": restaurante[6],
                "comunidad": restaurante[7]
            },
            "servicios": servicios,
            "menu": menu_items,
            "total_platos": len(menu_items)
        })
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle restaurante: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT PARA DETALLES DE HOTELES - EXACTO A TU API LOCAL
@app.route('/api/detalle/hotel/<id_lugar>')
def get_detalle_hotel(id_lugar):
    """Obtiene información detallada de un hotel con relaciones - IDÉNTICO A LOCAL"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        # Información básica del hotel - EXACTA
        cur.execute("""
            SELECT h.id_hotel, h.capaci_p, h.num_hab, h.estado, h.tipo,
                   l.nombre, l.comunidad
            FROM hoteles h
            JOIN lugares l ON h.id_lugar = l.id_lugar
            WHERE h.id_lugar = %s
        """, (id_lugar,))
        
        hotel = cur.fetchone()
        if not hotel:
            return jsonify({"error": "Hotel no encontrado"}), 404
        
        # Servicios del hotel - EXACTO
        cur.execute("""
            SELECT ts.t_servicio
            FROM relacion_serv_h rsh
            JOIN t_servicios ts ON rsh.id_servicio = ts.id_servicio
            WHERE rsh.id_hotel = %s
        """, (hotel[0],))
        servicios = [servicio[0] for servicio in cur.fetchall()]
        
        # Tipos de habitaciones - EXACTO
        cur.execute("""
            SELECT th.t_habita, th.capacidad
            FROM relacion_h_hab rhh
            JOIN tipo_habitaciones th ON rhh.id_habita = th.id_habita
            WHERE rhh.id_hotel = %s
        """, (hotel[0],))
        habitaciones = [{"tipo": hab[0], "capacidad": hab[1]} for hab in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({
            "hotel": {
                "id": hotel[0],
                "capacidad_personas": hotel[1],
                "numero_habitaciones": hotel[2],
                "estado": hotel[3],
                "tipo_hotel": hotel[4],
                "nombre": hotel[5],
                "comunidad": hotel[6]
            },
            "servicios": servicios,
            "habitaciones": habitaciones,
            "total_habitaciones": len(habitaciones)
        })
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle hotel: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT PARA DETALLES DE TIENDAS - EXACTO A TU API LOCAL
@app.route('/api/detalle/tienda_artesania/<id_lugar>')
def get_detalle_tienda_artesania(id_lugar):
    """Obtiene información detallada de una tienda de artesanía con productos - IDÉNTICO A LOCAL"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        # Información básica de la tienda - EXACTA
        cur.execute("""
            SELECT ta.id_art, ta.estado, l.nombre, l.comunidad
            FROM tiendas_artesania ta
            JOIN lugares l ON ta.id_lugar = l.id_lugar
            WHERE ta.id_lugar = %s
        """, (id_lugar,))
        
        tienda = cur.fetchone()
        if not tienda:
            return jsonify({"error": "Tienda no encontrada"}), 404
        
        # Productos de la tienda - EXACTO
        cur.execute("""
            SELECT pa.producto, pa.id_tip_p, pa.precio
            FROM relacion_t_pro rtp
            JOIN productos_artesania pa ON rtp.id_prod = pa.id_prod
            WHERE rtp.id_art = %s
            ORDER BY pa.id_tip_p, pa.precio
        """, (tienda[0],))
        productos = [{"producto": prod[0], "categoria": prod[1], "precio": float(prod[2])} for prod in cur.fetchall()]
        
        # Agrupar productos por categoría - EXACTO
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
                "id": tienda[0],
                "estado": tienda[1],
                "nombre": tienda[2],
                "comunidad": tienda[3]
            },
            "productos": productos,
            "productos_por_categoria": productos_por_categoria,
            "total_productos": len(productos),
            "categorias": list(productos_por_categoria.keys())
        })
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle tienda: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT PARA DETALLES DE MIRADORES - EXACTO A TU API LOCAL
@app.route('/api/detalle/mirador/<id_lugar>')
def get_detalle_mirador(id_lugar):
    """Obtiene información detallada de un mirador - IDÉNTICO A LOCAL"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT m.d_acceso, m.estado, m.afluencia, m.p_cercano,
                   l.nombre, l.comunidad
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
                "nombre": mirador[4],
                "dificultad_acceso": mirador[0],
                "estado": mirador[1],
                "afluencia": mirador[2],
                "puntos_cercanos": mirador[3],
                "comunidad": mirador[5]
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle mirador: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT PARA DETALLES DE PLAYAS - EXACTO A TU API LOCAL
@app.route('/api/detalle/playa/<id_lugar>')
def get_detalle_playa(id_lugar):
    """Obtiene información detallada de una playa - IDÉNTICO A LOCAL"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT p.acceso, p.d_acceso, p.tipo, p.estado, p.afluencia, p.p_cercano,
                   l.nombre, l.comunidad
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
                "nombre": playa[6],
                "acceso": playa[0],
                "dificultad_acceso": playa[1],
                "tipo_playa": playa[2],
                "estado": playa[3],
                "afluencia": playa[4],
                "puntos_cercanos": playa[5],
                "comunidad": playa[7]
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo detalle playa: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT GENÉRICO PARA DETALLES - EXACTO A TU API LOCAL
@app.route('/api/detalle/<tipo>/<id_lugar>')
def get_detalle_generico(tipo, id_lugar):
    """Endpoint genérico para obtener detalles de cualquier tipo - IDÉNTICO A LOCAL"""
    endpoints = {
        'restaurante': get_detalle_restaurante,
        'hotel': get_detalle_hotel,
        'tienda_artesania': get_detalle_tienda_artesania,
        'mirador': get_detalle_mirador,
        'playa': get_detalle_playa
    }
    
    if tipo in endpoints:
        return endpoints[tipo](id_lugar)
    else:
        return jsonify({"error": f"Tipo {tipo} no soportado"}), 400

# ✅ RUTAS DE COMPATIBILIDAD - EXACTAS A TU API LOCAL
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
    print("🚀 INICIANDO API ISLA DEL SOL - RENDER (IDÉNTICO A LOCAL)")
    print("=" * 60)
    print("📍 Web: https://tu-app.onrender.com")
    print("📊 Status: /api/status")
    print("🗺️ Capas: /api/capas/puntos_turisticos") 
    print("🔍 Detalles: /api/detalle/restaurante/1")
    print("=" * 60)
    print("✅ ESTRUCTURA IDÉNTICA A TU API LOCAL")
    print("✅ MISMAS CONSULTAS SQL")
    print("✅ MISMA ESTRUCTURA DE RESPUESTAS")
    
    app.run(debug=False, port=port, host='0.0.0.0')
