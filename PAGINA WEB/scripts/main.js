// Inicializar toda la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar módulos
  window.interactiveMap = new InteractiveMap();
  window.lightbox = new Lightbox();
  window.threeDMap = new ThreeDMap();

  console.log('🚀 Aplicación Isla del Sol inicializada correctamente');
});