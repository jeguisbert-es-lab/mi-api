from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# CONFIGURACIÓN
DB_CONFIG = {
    'host': 'localhost',
    'database': 'BASE DE DATOS ISLA DEL SOL',
    'user': 'postgres',
    'password': 'YATRA777',
    'port': '5566'
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Conexión a PostgreSQL exitosa")
        return conn
    except Exception as e:
        print(f"❌ Error conectando a PostgreSQL: {e}")
        return None

# Servir archivos estáticos
@app.route('/')
def serve_index():
    return send_from_directory('..', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('..', path)

# ✅ ENDPOINT STATUS
@app.route('/api/status')
def status():
    return jsonify({
        "status": "online", 
        "message": "API Isla del Sol - CON BASURA COMO PUNTOS",
        "version": "7.1",
        "timestamp": datetime.now().isoformat(),
        "capas_disponibles": [
            "puntos_turisticos", "miradores", "playas", "tiendas_artesania",
            "restaurantes", "hoteles", "rutas", "comunidades", "areas_verdes", 
            "viviendas", "sembradios", "basura", "puntos_basura", "aguas_contaminadas"
        ]
    })

# ✅ ENDPOINT PARA CAPAS (PRINCIPAL - PARA CARGAR EL MAPA)
@app.route('/api/capas/<categoria>')
def get_capa(categoria):
    """Endpoint principal para cargar capas del mapa"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        print(f"🎯 Cargando capa: {categoria}")
        
        # CONFIGURACIÓN SIMPLIFICADA DE CAPAS
        mapeo_tablas = {
            'puntos_turisticos': {
                'consulta': """
                    SELECT id_lugar::text, nombre, tipo, comunidad, 
                           ST_AsGeoJSON(geom) as geometry, tipo as tipo_cesium
                    FROM lugares 
                    WHERE geom IS NOT NULL 
                    AND tipo IN ('SITIO TURISTICO', 'MUSEO', 'RUINAS ARQUEOLOGICAS', 'LUGAR MITICO', 'SITIO CULTURAL', 'SITIO CEREMONIAL')
                """
            },
            'miradores': {
                'consulta': """
                    SELECT m.id_mirador::text, l.nombre, 'mirador' as tipo, l.comunidad,
                           ST_AsGeoJSON(l.geom) as geometry, 'mirador' as tipo_cesium
                    FROM miradores m
                    JOIN lugares l ON m.id_lugar = l.id_lugar
                    WHERE l.geom IS NOT NULL
                """
            },
            'playas': {
                'consulta': """
                    SELECT p.id_playa::text, l.nombre, 'playa' as tipo, l.comunidad,
                           ST_AsGeoJSON(l.geom) as geometry, 'playa' as tipo_cesium
                    FROM playas p
                    JOIN lugares l ON p.id_lugar = l.id_lugar
                    WHERE l.geom IS NOT NULL
                """
            },
            'tiendas_artesania': {
                'consulta': """
                    SELECT ta.id_art::text, l.nombre, 'tienda_artesania' as tipo, l.comunidad,
                           ST_AsGeoJSON(l.geom) as geometry, 'tienda_artesania' as tipo_cesium
                    FROM tiendas_artesania ta
                    JOIN lugares l ON ta.id_lugar = l.id_lugar
                    WHERE l.geom IS NOT NULL
                """
            },
            'restaurantes': {
                'consulta': """
                    SELECT r.id_rest::text, l.nombre, 'restaurante' as tipo, l.comunidad,
                           ST_AsGeoJSON(l.geom) as geometry, 'restaurante' as tipo_cesium
                    FROM restaurantes r
                    JOIN lugares l ON r.id_lugar = l.id_lugar
                    WHERE l.geom IS NOT NULL
                """
            },
            'hoteles': {
                'consulta': """
                    SELECT h.id_hotel::text, l.nombre, 'hotel' as tipo, l.comunidad,
                           ST_AsGeoJSON(l.geom) as geometry, 'hotel' as tipo_cesium
                    FROM hoteles h
                    JOIN lugares l ON h.id_lugar = l.id_lugar
                    WHERE l.geom IS NOT NULL
                """
            },
            'comunidades': {
                'consulta': """
                    SELECT 'com_challa' as id, 'COMUNIDAD CHALLA' as nombre, 'comunidad' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'comunidad' as tipo_cesium
                    FROM "COMUNIDAD CHALLA" WHERE geom IS NOT NULL
                    UNION ALL
                    SELECT 'com_challapampa', 'COMUNIDAD CHALLAPAMPA', 'comunidad', '', ST_AsGeoJSON(geom), 'comunidad'
                    FROM "COMUNIDAD CHALLAPAMPA" WHERE geom IS NOT NULL
                    UNION ALL
                    SELECT 'com_yumani', 'COMUNIDAD YUMANI', 'comunidad', '', ST_AsGeoJSON(geom), 'comunidad'
                    FROM "COMUNIDAD YUMANI" WHERE geom IS NOT NULL
                """
            },
            'rutas': {
                'consulta': """
                    SELECT 'ruta_turistica' as id, 'RUTA TURÍSTICA' as nombre, 'ruta' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'ruta' as tipo_cesium
                    FROM "RUTA TURISTICA" WHERE geom IS NOT NULL
                """
            },
            'areas_verdes': {
                'consulta': """
                    SELECT 'area_verde_' || row_number() over () as id, 'ÁREA VERDE' as nombre, 'area_verde' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'area_verde' as tipo_cesium
                    FROM "AREAS VERDES" WHERE geom IS NOT NULL
                """
            },
            'viviendas': {
                'consulta': """
                    SELECT 'vivienda_' || row_number() over () as id, 'VIVIENDA' as nombre, 'vivienda' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'vivienda' as tipo_cesium
                    FROM "VIVIENDAS" WHERE geom IS NOT NULL
                """
            },
            'sembradios': {
                'consulta': """
                    SELECT 'sembradio_' || row_number() over () as id, 'SEMBRADÍO' as nombre, 'sembradio' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'sembradio' as tipo_cesium
                    FROM "SEMBRADIOS" WHERE geom IS NOT NULL
                """
            },
            # ✅ CAPA BASURA (PUNTOS) - NUEVA
            'basura': {
                'consulta': """
                    SELECT 'basura_' || row_number() over () as id, 'BASURA' as nombre, 'basura' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'basura' as tipo_cesium
                    FROM "BASURA" WHERE geom IS NOT NULL
                """
            },
            # ✅ MANTENER PUNTOS_DE_BASURA (POLÍGONOS) POR SI ACASO
            'puntos_basura': {
                'consulta': """
                    SELECT 'basura_poly_' || row_number() over () as id, 'PUNTO DE BASURA' as nombre, 'punto_basura' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'punto_basura' as tipo_cesium
                    FROM "PUNTOS DE BASURA" WHERE geom IS NOT NULL
                """
            },
            'aguas_contaminadas': {
                'consulta': """
                    SELECT 'agua_contaminada_' || row_number() over () as id, 'AGUA CONTAMINADA' as nombre, 'agua_contaminada' as tipo, '' as comunidad,
                           ST_AsGeoJSON(geom) as geometry, 'agua_contaminada' as tipo_cesium
                    FROM "AGUAS CONTAMINDAS" WHERE geom IS NOT NULL
                """
            }
        }
        
        if categoria not in mapeo_tablas:
            return jsonify({
                "type": "FeatureCollection", 
                "features": [],
                "metadata": {"capa": categoria, "total": 0, "message": "Capa no configurada"}
            })
        
        consulta = mapeo_tablas[categoria]['consulta']
        
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
                    print(f"❌ Error decodificando geometría: {e}")
                    continue
        
        cur.close()
        conn.close()
        
        print(f"✅ {categoria}: {len(features)} elementos")
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
        print(f"❌ Error en {categoria}: {str(e)}")
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

# ✅ NUEVO ENDPOINT PARA INFORMACIÓN DETALLADA DE RESTAURANTES
@app.route('/api/detalle/restaurante/<int:id_lugar>')
def get_detalle_restaurante(id_lugar):
    """Obtiene información detallada de un restaurante con relaciones"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        # Información básica del restaurante
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
        
        # Servicios del restaurante
        cur.execute("""
            SELECT s.tipo_serv
            FROM relacio_s_r rsr
            JOIN servicios s ON rsr.id_serv = s.id_serv
            WHERE rsr.id_rest = %s
        """, (restaurante[0],))
        servicios = [servicio[0] for servicio in cur.fetchall()]
        
        # Menú del restaurante
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
        print(f"❌ Error obteniendo detalle restaurante: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ NUEVO ENDPOINT PARA INFORMACIÓN DETALLADA DE HOTELES
@app.route('/api/detalle/hotel/<int:id_lugar>')
def get_detalle_hotel(id_lugar):
    """Obtiene información detallada de un hotel con relaciones"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        # Información básica del hotel
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
        
        # Servicios del hotel
        cur.execute("""
            SELECT ts.t_servicio
            FROM relacion_serv_h rsh
            JOIN t_servicios ts ON rsh.id_servicio = ts.id_servicio
            WHERE rsh.id_hotel = %s
        """, (hotel[0],))
        servicios = [servicio[0] for servicio in cur.fetchall()]
        
        # Tipos de habitaciones
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
        print(f"❌ Error obteniendo detalle hotel: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ NUEVO ENDPOINT PARA INFORMACIÓN DETALLADA DE TIENDAS DE ARTESANÍA
@app.route('/api/detalle/tienda_artesania/<int:id_lugar>')
def get_detalle_tienda_artesania(id_lugar):
    """Obtiene información detallada de una tienda de artesanía con productos"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        # Información básica de la tienda
        cur.execute("""
            SELECT ta.id_art, ta.estado, l.nombre, l.comunidad
            FROM tiendas_artesania ta
            JOIN lugares l ON ta.id_lugar = l.id_lugar
            WHERE ta.id_lugar = %s
        """, (id_lugar,))
        
        tienda = cur.fetchone()
        if not tienda:
            return jsonify({"error": "Tienda no encontrada"}), 404
        
        # Productos de la tienda
        cur.execute("""
            SELECT pa.producto, pa.id_tip_p, pa.precio
            FROM relacion_t_pro rtp
            JOIN productos_artesania pa ON rtp.id_prod = pa.id_prod
            WHERE rtp.id_art = %s
            ORDER BY pa.id_tip_p, pa.precio
        """, (tienda[0],))
        productos = [{"producto": prod[0], "categoria": prod[1], "precio": float(prod[2])} for prod in cur.fetchall()]
        
        # Agrupar productos por categoría
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
        print(f"❌ Error obteniendo detalle tienda: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE LUGARES TURÍSTICOS
@app.route('/api/detalle/lugar_turistico/<int:id_lugar>')
def get_detalle_lugar_turistico(id_lugar):
    """Obtiene información detallada de un lugar turístico"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
        
    cur = conn.cursor()
    
    try:
        # Información del lugar turístico
        cur.execute("""
            SELECT lt.nombre, lt.tipo, lt.accesibilidad, lt.afluencia, 
                   lt.descripcion, l.comunidad
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
                "nombre": lugar[0],
                "tipo": lugar[1],
                "accesibilidad": lugar[2],
                "afluencia": lugar[3],
                "descripcion": lugar[4],
                "comunidad": lugar[5]
            }
        })
        
    except Exception as e:
        print(f"❌ Error obteniendo detalle lugar turístico: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE MIRADORES
@app.route('/api/detalle/mirador/<int:id_lugar>')
def get_detalle_mirador(id_lugar):
    """Obtiene información detallada de un mirador"""
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
        print(f"❌ Error obteniendo detalle mirador: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

# ✅ ENDPOINT PARA INFORMACIÓN DETALLADA DE PLAYAS
@app.route('/api/detalle/playa/<int:id_lugar>')
def get_detalle_playa(id_lugar):
    """Obtiene información detallada de una playa"""
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
        print(f"❌ Error obteniendo detalle playa: {e}")
        if conn:
            cur.close()
            conn.close()
        return jsonify({"error": str(e)}), 500

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
    print("🚀 INICIANDO API ISLA DEL SOL - CON BASURA COMO PUNTOS")
    print("=" * 60)
    print("📍 Web: http://localhost:5000")
    print("📊 Status: http://localhost:5000/api/status")
    print("🗑️ Nueva capa BASURA: http://localhost:5000/api/capas/basura")
    print("🗺️ Capas: http://localhost:5000/api/capas/puntos_turisticos")
    print("🔍 Detalles: http://localhost:5000/api/detalle/restaurante/1")
    print("=" * 60)
    app.run(debug=True, port=5000, host='0.0.0.0')