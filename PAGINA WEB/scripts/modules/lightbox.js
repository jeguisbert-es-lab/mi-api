/* ---------- LIGHTBOX CON ZOOM ---------- */
class Lightbox {
  constructor() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.lightboxCaption = document.getElementById('lightbox-caption');
    this.closeBtn = document.querySelector('.lightbox-close');
    this.zoomInBtn = document.getElementById('zoom-in');
    this.zoomOutBtn = document.getElementById('zoom-out');
    this.resetZoomBtn = document.getElementById('reset-zoom');
    this.zoomInfo = document.getElementById('zoom-info');

    this.currentScale = 1;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;

    this.init();
  }

  init() {
    this.setupGalleryEvents();
    this.setupLightboxEvents();
  }

  setupGalleryEvents() {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const imageSrc = e.currentTarget.getAttribute('data-image');
        const caption = e.currentTarget.getAttribute('data-caption');
        
        this.openLightbox(imageSrc, caption);
      });
    });
  }

  setupLightboxEvents() {
    // Event Listeners para botones de zoom
    this.zoomInBtn.addEventListener('click', () => this.zoomIn());
    this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
    this.resetZoomBtn.addEventListener('click', () => this.resetZoom());

    // Zoom con rueda del mouse
    this.lightboxImg.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    });

    // Zoom con doble click
    this.lightboxImg.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (this.currentScale === 1) {
        this.zoomIn();
      } else {
        this.resetZoom();
      }
    });

    // Drag image when zoomed: use pointer events and pointer capture so the image
    // only moves while the pointer is pressed and dragged on the image.
    this.lightboxImg.addEventListener('pointerdown', (e) => {
      if (this.currentScale <= 1) return;
      try { this.lightboxImg.setPointerCapture(e.pointerId); } catch (err) {}
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.initialTranslateX = this.translateX;
      this.initialTranslateY = this.translateY;
      this.lightboxImg.style.cursor = 'grabbing';
    });

    this.lightboxImg.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      this.translateX = this.initialTranslateX + dx;
      this.translateY = this.initialTranslateY + dy;

      // Limitar el arrastre
      const maxTranslate = 100 * (this.currentScale - 1);
      this.translateX = Math.max(Math.min(this.translateX, maxTranslate), -maxTranslate);
      this.translateY = Math.max(Math.min(this.translateY, maxTranslate), -maxTranslate);

      this.updateTransform();
    });

    this.lightboxImg.addEventListener('pointerup', (e) => {
      this.isDragging = false;
      try { this.lightboxImg.releasePointerCapture(e.pointerId); } catch (err) {}
      if (this.currentScale > 1) this.lightboxImg.style.cursor = 'grab';
    });

    this.lightboxImg.addEventListener('pointercancel', (e) => {
      this.isDragging = false;
      try { this.lightboxImg.releasePointerCapture(e.pointerId); } catch (err) {}
      if (this.currentScale > 1) this.lightboxImg.style.cursor = 'grab';
    });

    // Cerrar lightbox
    this.closeBtn.addEventListener('click', () => this.closeLightbox());

    // Cerrar al hacer click fuera de la imagen
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });

    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeLightbox();
      }
    });
  }

  openLightbox(imageSrc, caption) {
    this.lightbox.style.display = 'block';
    this.lightboxImg.src = imageSrc;
    this.lightboxCaption.textContent = caption;
    
    this.resetZoom();
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
    this.resetZoom();
  }

  zoomIn() {
    this.currentScale = Math.min(this.currentScale * 1.5, 5);
    this.updateTransform();
  }

  zoomOut() {
    this.currentScale = Math.max(this.currentScale / 1.5, 1);
    this.updateTransform();
  }

  resetZoom() {
    this.currentScale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateTransform();
    this.lightboxImg.classList.remove('zoomed');
  }

  updateTransform() {
    this.lightboxImg.style.transform = `scale(${this.currentScale}) translate(${this.translateX}px, ${this.translateY}px)`;
    
    if (this.currentScale > 1) {
      this.lightboxImg.classList.add('zoomed');
    } else {
      this.lightboxImg.classList.remove('zoomed');
    }
  }
}