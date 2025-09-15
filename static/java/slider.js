document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slider .slide');
  const dots = document.querySelectorAll('.dots .dot');
  let currentSlide = 0;
  const slideIntervalTime = 5000; // 5 segundos
  let slideInterval;

  if (slides.length === 0 || dots.length === 0) return;

  // Función para mostrar un slide según índice
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  // Función para pasar al siguiente slide
  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  // Iniciar autoplay
  function startAutoplay() {
    stopAutoplay(); // asegurar que no haya intervalos duplicados
    slideInterval = setInterval(nextSlide, slideIntervalTime);
  }

  // Detener autoplay
  function stopAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
  }

  // Click en dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      showSlide(index);
      startAutoplay();
    });

    // Accesibilidad: activar con teclado
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const index = parseInt(dot.dataset.index);
        showSlide(index);
        startAutoplay();
      }
    });
  });

  // Pausar autoplay al hover o focus en el slider
  const slider = document.querySelector('.slider');
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', startAutoplay);

  // Iniciar slider
  showSlide(0);
  startAutoplay();
});
