import sys
import os

# Agregar la carpeta api al path para poder importar
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

print("🔧 Configurando entorno...")
print(f"📁 Directorio actual: {os.getcwd()}")
print(f"📁 Carpeta API: {os.path.join(os.path.dirname(__file__), 'api')}")

try:
    from app import app
    print("✅ Módulo 'app' importado correctamente")
except ImportError as e:
    print(f"❌ Error importando módulo: {e}")
    print("🔍 Verificando archivos...")
    
    # Verificar si la carpeta api existe
    api_path = os.path.join(os.path.dirname(__file__), 'api')
    if not os.path.exists(api_path):
        print(f"❌ La carpeta 'api' no existe en: {api_path}")
    else:
        print(f"✅ Carpeta 'api' encontrada")
        # Listar archivos en la carpeta api
        archivos = os.listdir(api_path)
        print(f"📄 Archivos en carpeta api: {archivos}")
        
        if 'app.py' not in archivos:
            print("❌ El archivo 'app.py' no está en la carpeta api")
        else:
            print("✅ Archivo 'app.py' encontrado")
    
    sys.exit(1)

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 INICIANDO SERVIDOR ISLA DEL SOL - POPUPS MEJORADOS")
    print("="*50)
    print("📍 Tu web estará en: http://localhost:5000")
    print("🗺️  Mapa interactivo con INFORMACIÓN DETALLADA")
    print("📊 API REST disponible en:")
    print("   • http://localhost:5000/api/status")
    print("   • http://localhost:5000/api/detalle/restaurante/1")
    print("   • http://localhost:5000/api/detalle/hotel/21")
    print("   • http://localhost:5000/api/detalle/tienda_artesania/101")
    print("⏹️  Presiona Ctrl + C para detener el servidor")
    print("="*50)
    
    try:
        app.run(debug=True, port=5000, host='0.0.0.0')
    except Exception as e:
        print(f"❌ Error iniciando servidor: {e}")
        print("💡 Posibles soluciones:")
        print("   - Verifica que el puerto 5000 no esté en uso")
        print("   - Ejecuta: netstat -ano | findstr :5000")
        print("   - O usa otro puerto: python run.py --port 5001")