// Funciones de utilidad general
const Helpers = {
  // Debounce para optimizar eventos
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Detectar si es móvil
  isMobile: () => window.innerWidth <= 768,

  // Formatear coordenadas
  formatCoords: (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};