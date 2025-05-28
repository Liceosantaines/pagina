document.addEventListener('DOMContentLoaded', () => {
  const galeriaItems = document.querySelectorAll('.galeria-item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-imagen');
  let indiceActual = 0;
  let touchStartX = 0;
  const imagenes = [];
  const SWIPE_THRESHOLD = 30;

  // Extraer URLs de las imágenes
  galeriaItems.forEach(item => {
    const bg = item.style.backgroundImage;
    imagenes.push(bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''));
  });

  // Funcionalidad del lightbox
  const preloadImage = (src) => {
    const img = new Image();
    img.src = src;
  };

  const actualizarContador = () => {
    document.querySelector('.lightbox-counter').textContent = 
      `${indiceActual + 1} / ${imagenes.length}`;
  };

// Función modificada para crear miniaturas
const crearMiniaturas = () => {
  const existingThumbs = document.querySelector('.lightbox-thumbs-bottom');
  if (existingThumbs) existingThumbs.remove();

  const thumbsContainer = document.createElement('div');
  thumbsContainer.className = 'lightbox-thumbs-bottom';
  
  imagenes.forEach((src, index) => {
    const thumb = document.createElement('div');
    thumb.className = `lightbox-thumb-bottom ${index === indiceActual ? 'active' : ''}`;
    thumb.style.backgroundImage = `url(${src})`;
    thumb.addEventListener('click', () => {
      indiceActual = index;
      lightboxImg.style.opacity = 0;
      setTimeout(() => {
        lightboxImg.src = src;
        lightboxImg.style.opacity = 1;
        actualizarContador();
        document.querySelectorAll('.lightbox-thumb-bottom').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        // Scroll automático a la miniatura activa
        thumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }, 300);
    });
    thumbsContainer.appendChild(thumb);
  });
  
  lightbox.appendChild(thumbsContainer);
};

const navegar = (direccion) => {
  indiceActual = (indiceActual + direccion + imagenes.length) % imagenes.length;
  lightboxImg.style.opacity = 0;
  
  setTimeout(() => {
    lightboxImg.src = imagenes[indiceActual];
    lightboxImg.style.opacity = 1;
    actualizarContador();
    
    // Actualizar miniaturas y scroll
    const activeThumb = document.querySelectorAll('.lightbox-thumb-bottom')[indiceActual];
    document.querySelectorAll('.lightbox-thumb-bottom').forEach(t => t.classList.remove('active'));
    activeThumb.classList.add('active');
    activeThumb.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }, 300);
};

  // Event listeners
  galeriaItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      indiceActual = index;
      lightbox.classList.add('mostrar');
      lightboxImg.src = imagenes[indiceActual];
      crearMiniaturas();
      actualizarContador();
    });
  });

  // Eventos táctiles
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      deltaX > 0 ? navegar(-1) : navegar(1);
    }
  };

  lightbox.addEventListener('touchstart', handleTouchStart);
  lightbox.addEventListener('touchend', handleTouchEnd);
  lightbox.addEventListener('touchmove', (e) => e.preventDefault());

  document.querySelector('.lightbox-prev').addEventListener('click', () => navegar(-1));
  document.querySelector('.lightbox-next').addEventListener('click', () => navegar(1));
  document.querySelector('.lightbox-cerrar').addEventListener('click', () => {
    lightbox.classList.remove('mostrar');
    document.querySelector('.lightbox-thumbs')?.remove();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('mostrar');
      document.querySelector('.lightbox-thumbs')?.remove();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('mostrar')) {
      if(e.key === 'Escape') {
        lightbox.classList.remove('mostrar');
        document.querySelector('.lightbox-thumbs')?.remove();
      }
      if(e.key === 'ArrowLeft') navegar(-1);
      if(e.key === 'ArrowRight') navegar(1);
    }
  });
});