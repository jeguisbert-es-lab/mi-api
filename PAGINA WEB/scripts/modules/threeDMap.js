/* ---------- MAPA 3D CONTROLS ---------- */
class ThreeDMap {
  constructor() {
    this.iframe = document.getElementById('map3d-iframe');
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const fsBtn = document.getElementById('fullscreenBtn');
    const reloadBtn = document.getElementById('reload3dBtn');

    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => this.reloadIframe());
    }
  }

  toggleFullscreen() {
    if (!this.iframe) return;

    if (this.iframe.requestFullscreen) {
      this.iframe.requestFullscreen();
    } else if (this.iframe.msRequestFullscreen) {
      this.iframe.msRequestFullscreen();
    } else if (this.iframe.mozRequestFullScreen) {
      this.iframe.mozRequestFullScreen();
    } else if (this.iframe.webkitRequestFullscreen) {
      this.iframe.webkitRequestFullscreen();
    } else {
      // Fallback: abrir en nueva pestaña
      window.open(this.iframe.src, '_blank');
    }
  }

  reloadIframe() {
    if (!this.iframe) return;
    this.iframe.src = this.iframe.src;
  }
}